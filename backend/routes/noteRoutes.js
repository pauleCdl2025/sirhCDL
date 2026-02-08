const express = require('express');
const { normalizeEntity } = require('../utils/textNormalizer');

// Exportez une fonction qui prend l'objet pool comme argument
module.exports = (pool) => {
    const router = express.Router();

    // Récupérer toutes les notes de service
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT * FROM notes
                ORDER BY created_at DESC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'note'));
        } catch (err) {
            console.error('Error fetching notes:', err);
            res.status(500).json({ error: 'Failed to fetch notes', details: err.message });
        }
    });

    // Récupérer les notes de service publiques (pour le portail employé)
    router.get('/public', async (req, res) => {
        try {
            const query = `
                SELECT * FROM notes 
                WHERE is_public = true
                ORDER BY created_at DESC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'note'));
        } catch (err) {
            console.error('Error fetching public notes:', err);
            res.status(500).json({ error: 'Failed to fetch public notes', details: err.message });
        }
    });

    // Créer une nouvelle note de service
    router.post('/', async (req, res) => {
        try {
            const { 
                category,
                title,
                content,
                is_public
            } = req.body;

            // Générer un numéro de note de service (NS-YEAR-NUMBER)
            const year = new Date().getFullYear();
            
            // Récupérer le nombre actuel de notes pour cette année
            const countQuery = `
                SELECT COUNT(*) FROM notes 
                WHERE full_note_number LIKE $1
            `;
            const countResult = await pool.query(countQuery, [`NS-${year}-%`]);
            const count = parseInt(countResult.rows[0].count) + 1;
            
            // Créer le numéro de note formaté (ex: NS-2025-001)
            const noteNumber = `NS-${year}-${count.toString().padStart(3, '0')}`;

            const query = `
                INSERT INTO notes 
                (full_note_number, category, title, content, is_public, created_by) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *
            `;

            // Utiliser l'ID de l'utilisateur connecté si disponible
            const createdBy = req.user ? req.user.name : 'Admin RH';

            const values = [
                noteNumber,
                category,
                title,
                content,
                is_public || false,
                createdBy
            ];

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating note:', err);
            res.status(500).json({ error: 'Failed to create note', details: err.message });
        }
    });

    // Récupérer une note par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM notes WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Note not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'note'));
        } catch (err) {
            console.error('Error fetching note:', err);
            res.status(500).json({ error: 'Failed to fetch note', details: err.message });
        }
    });

    // Mettre à jour une note
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                category,
                title,
                content,
                is_public
            } = req.body;

            const query = `
                UPDATE notes 
                SET category = $1, 
                    title = $2, 
                    content = $3,
                    is_public = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 
                RETURNING *
            `;

            const values = [
                category,
                title,
                content,
                is_public || false,
                id
            ];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Note not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'note'));
        } catch (err) {
            console.error('Error updating note:', err);
            res.status(500).json({ error: 'Failed to update note', details: err.message });
        }
    });

    // Supprimer une note
    router.delete('/:id', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            // Récupérer les infos de la note avant suppression
            const noteInfoQuery = 'SELECT * FROM notes WHERE id = $1';
            const noteInfoResult = await client.query(noteInfoQuery, [id]);
            
            if (noteInfoResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Note not found' });
            }
            
            const note = noteInfoResult.rows[0];
            const entityName = `Note: ${note.title || note.full_note_number || 'Note sans titre'}`;
            
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
                'note',
                id.toString(),
                entityName,
                userType,
                userId,
                userEmail,
                `Note supprimée: ${entityName}`,
                ipAddress,
                userAgent,
                'success',
                JSON.stringify({
                    full_note_number: note.full_note_number,
                    title: note.title,
                    category: note.category,
                    is_public: note.is_public,
                    created_by: note.created_by
                })
            ]);
            
            // Supprimer la note
            const query = 'DELETE FROM notes WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);
            
            await client.query('COMMIT');
            
            console.log(`✅ Note supprimée (ID: ${id}) et tracée dans audit_logs`);
            res.json({ message: 'Note deleted successfully', note: result.rows[0] });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error deleting note:', err);
            res.status(500).json({ error: 'Failed to delete note', details: err.message });
        } finally {
            client.release();
        }
    });

    // Publier/Dépublier une note
    router.put('/:id/toggle-public', async (req, res) => {
        try {
            const { id } = req.params;
            
            // D'abord, récupérer l'état actuel
            const getQuery = 'SELECT is_public FROM notes WHERE id = $1';
            const getResult = await pool.query(getQuery, [id]);
            
            if (getResult.rows.length === 0) {
                return res.status(404).json({ error: 'Note not found' });
            }
            
            const currentState = getResult.rows[0].is_public;
            
            // Ensuite, inverser l'état
            const updateQuery = `
                UPDATE notes 
                SET is_public = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 
                RETURNING *
            `;
            
            const updateResult = await pool.query(updateQuery, [!currentState, id]);
            
            res.json({
                message: !currentState ? 'Note published successfully' : 'Note unpublished successfully',
                note: updateResult.rows[0]
            });
        } catch (err) {
            console.error('Error toggling note public status:', err);
            res.status(500).json({ error: 'Failed to update note status', details: err.message });
        }
    });

    // Rechercher des notes
    router.get('/search/filter', async (req, res) => {
        try {
            const { category, query, isPublic } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (category) {
                conditions.push(`category = $${paramIndex}`);
                values.push(category);
                paramIndex++;
            }
            
            if (query) {
                conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
                values.push(`%${query}%`);
                paramIndex++;
            }
            
            if (isPublic !== undefined) {
                conditions.push(`is_public = $${paramIndex}`);
                values.push(isPublic === 'true');
                paramIndex++;
            }
            
            let queryText = 'SELECT * FROM notes';
            
            if (conditions.length > 0) {
                queryText += ' WHERE ' + conditions.join(' AND ');
            }
            
            queryText += ' ORDER BY created_at DESC';
            
            const result = await pool.query(queryText, values);
            res.json(normalizeEntity(result.rows, 'note'));
        } catch (err) {
            console.error('Error searching notes:', err);
            res.status(500).json({ error: 'Failed to search notes', details: err.message });
        }
    });

    return router;
};