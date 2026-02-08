const express = require('express');
const { normalizeEntity } = require('../utils/textNormalizer');

// Exportez une fonction qui prend l'objet pool comme argument
module.exports = (pool) => {
    const router = express.Router();

    // Récupérer toutes les sanctions
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT * FROM sanctions_table ORDER BY date DESC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'sanction'));
        } catch (err) {
            console.error('Error fetching sanctions:', err);
            res.status(500).json({ error: 'Failed to fetch sanctions', details: err.message });
        }
    });

    // Créer une nouvelle sanction
    router.post('/', async (req, res) => {
        try {
            const { 
                nom_employe, 
                type_sanction, 
                contenu_sanction, 
                date,
                statut = 'En cours'
            } = req.body;

            const query = `
                INSERT INTO sanctions_table 
                (nom_employe, type_sanction, contenu_sanction, date, statut) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;

            const values = [
                nom_employe, 
                type_sanction, 
                contenu_sanction, 
                date,
                statut
            ];

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating sanction:', err);
            res.status(500).json({ error: 'Failed to create sanction', details: err.message });
        }
    });

    // Récupérer une sanction par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM sanctions_table WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Sanction not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'sanction'));
        } catch (err) {
            console.error('Error fetching sanction:', err);
            res.status(500).json({ error: 'Failed to fetch sanction', details: err.message });
        }
    });

    // Récupérer les sanctions d'un employé par son nom
    router.get('/employe/:nom', async (req, res) => {
        try {
            const { nom } = req.params;
            const query = 'SELECT * FROM sanctions_table WHERE nom_employe = $1 ORDER BY date DESC';
            const result = await pool.query(query, [nom]);
            res.json(normalizeEntity(result.rows, 'sanction'));
        } catch (err) {
            console.error('Error fetching sanctions by employee name:', err);
            res.status(500).json({ error: 'Failed to fetch sanctions', details: err.message });
        }
    });

    // Mettre à jour une sanction
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nom_employe, 
                type_sanction, 
                contenu_sanction, 
                date,
                statut
            } = req.body;

            // Récupérer la sanction actuelle pour préserver les valeurs non fournies
            const currentQuery = 'SELECT * FROM sanctions_table WHERE id = $1';
            const currentResult = await pool.query(currentQuery, [id]);
            
            if (currentResult.rows.length === 0) {
                return res.status(404).json({ error: 'Sanction not found' });
            }
            
            const current = currentResult.rows[0];

            // Utiliser les nouvelles valeurs si fournies, sinon garder les valeurs actuelles
            const updateQuery = `
                UPDATE sanctions_table 
                SET nom_employe = COALESCE($1, nom_employe), 
                    type_sanction = COALESCE($2, type_sanction), 
                    contenu_sanction = COALESCE($3, contenu_sanction), 
                    date = COALESCE($4, date),
                    statut = COALESCE($5, statut),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $6 
                RETURNING *
            `;

            const values = [
                nom_employe || current.nom_employe, 
                type_sanction || current.type_sanction, 
                contenu_sanction || current.contenu_sanction, 
                date || current.date,
                statut || current.statut,
                id
            ];

            const result = await pool.query(updateQuery, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Sanction not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'sanction'));
        } catch (err) {
            console.error('Error updating sanction:', err);
            res.status(500).json({ error: 'Failed to update sanction', details: err.message });
        }
    });

    // Annuler une sanction
   // Annuler une sanction
router.put('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { motif_annulation } = req.body;
        
        console.log(`Annulation de la sanction ${id} avec motif: ${motif_annulation}`);
        
        // Récupérer d'abord la sanction existante
        const getQuery = 'SELECT * FROM sanctions_table WHERE id = $1';
        const getResult = await pool.query(getQuery, [id]);
        
        if (getResult.rows.length === 0) {
            console.log(`Sanction ${id} non trouvée`);
            return res.status(404).json({ error: 'Sanction not found' });
        }
        
        // Construire le nouveau contenu avec le motif d'annulation
        const currentContent = getResult.rows[0].contenu_sanction;
        const motif = motif_annulation || 'Non spécifié';
        const newContent = `${currentContent}\n\nAnnulée pour la raison suivante: ${motif}`;
        
        // Mettre à jour le statut et le contenu
        const updateQuery = `
            UPDATE sanctions_table 
            SET statut = 'Annulée', 
                contenu_sanction = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 
            RETURNING *
        `;
        
        const updateResult = await pool.query(updateQuery, [newContent, id]);
        
        console.log(`Résultat de l'annulation:`, updateResult.rows[0]);
        
        if (updateResult.rows.length === 0) {
            console.log(`Échec de la mise à jour pour la sanction ${id}`);
            return res.status(500).json({ error: 'Failed to update sanction' });
        }
        
        res.json(updateResult.rows[0]);
    } catch (err) {
        console.error('Error canceling sanction:', err);
        res.status(500).json({ 
            error: 'Failed to cancel sanction', 
            details: err.message, 
            stack: err.stack 
        });
    }
});
    // Supprimer une sanction
    router.delete('/:id', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            // Récupérer les infos de la sanction avant suppression
            const sanctionInfoQuery = 'SELECT * FROM sanctions_table WHERE id = $1';
            const sanctionInfoResult = await client.query(sanctionInfoQuery, [id]);
            
            if (sanctionInfoResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Sanction not found' });
            }
            
            const sanction = sanctionInfoResult.rows[0];
            const entityName = `Sanction - ${sanction.nom_employe || 'Employé inconnu'} (${sanction.type_sanction || 'N/A'})`;
            
            // Récupérer l'utilisateur qui effectue la suppression
            const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
            const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
            const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            
            // Sauvegarder dans audit_logs avant suppression
            await client.query(`
                INSERT INTO audit_logs (
                    action_type, entity_type, entity_id, entity_name,
                    user_type, user_id, user_email, description, ip_address, user_agent, status,
                    changes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                'delete',
                'sanction',
                id.toString(),
                entityName,
                userType,
                userId,
                userEmail,
                `Sanction supprimée: ${entityName}`,
                ipAddress,
                userAgent,
                'success',
                JSON.stringify({
                    nom_employe: sanction.nom_employe,
                    type_sanction: sanction.type_sanction,
                    date_sanction: sanction.date_sanction,
                    motif: sanction.motif,
                    statut: sanction.statut
                })
            ]);
            
            // Supprimer la sanction
            const query = 'DELETE FROM sanctions_table WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);
            
            await client.query('COMMIT');
            
            console.log(`✅ Sanction supprimée (ID: ${id}) et tracée dans audit_logs`);
            res.json({ message: 'Sanction deleted successfully', sanction: result.rows[0] });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error deleting sanction:', err);
            res.status(500).json({ error: 'Failed to delete sanction', details: err.message });
        } finally {
            client.release();
        }
    });

    // Rechercher des sanctions avec filtres
    router.get('/search/filter', async (req, res) => {
        try {
            const { nom, type, statut, dateDebut, dateFin } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (nom) {
                conditions.push(`nom_employe ILIKE $${paramIndex}`);
                values.push(`%${nom}%`);
                paramIndex++;
            }
            
            if (type) {
                conditions.push(`type_sanction = $${paramIndex}`);
                values.push(type);
                paramIndex++;
            }
            
            if (statut) {
                conditions.push(`statut = $${paramIndex}`);
                values.push(statut);
                paramIndex++;
            }
            
            if (dateDebut) {
                conditions.push(`date >= $${paramIndex}`);
                values.push(dateDebut);
                paramIndex++;
            }
            
            if (dateFin) {
                conditions.push(`date <= $${paramIndex}`);
                values.push(dateFin);
                paramIndex++;
            }
            
            let query = 'SELECT * FROM sanctions_table';
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY date DESC';
            
            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows, 'sanction'));
        } catch (err) {
            console.error('Error searching sanctions:', err);
            res.status(500).json({ error: 'Failed to search sanctions', details: err.message });
        }
    });

    return router;
};






