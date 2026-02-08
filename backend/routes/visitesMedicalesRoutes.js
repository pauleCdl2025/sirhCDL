const express = require('express');
const { normalizeEntity } = require('../utils/textNormalizer');

module.exports = (pool) => {
    const router = express.Router();

    // Récupérer toutes les visites médicales
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT * FROM visites_medicales 
                ORDER BY date_prochaine_visite ASC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'visiteMedicale'));
        } catch (err) {
            console.error('Error fetching visites médicales:', err);
            res.status(500).json({ error: 'Failed to fetch visites médicales', details: err.message });
        }
    });

    // Rechercher des visites médicales avec filtres
    router.get('/search', async (req, res) => {
        try {
            const { search, poste, periode, statut } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            // Recherche par nom ou prénom
            if (search) {
                conditions.push(`(LOWER(nom) LIKE $${paramIndex} OR LOWER(prenom) LIKE $${paramIndex})`);
                values.push(`%${search.toLowerCase()}%`);
                paramIndex++;
            }
            
            // Filtre par poste
            if (poste) {
                conditions.push(`poste = $${paramIndex}`);
                values.push(poste);
                paramIndex++;
            }
            
            // Filtre par statut
            if (statut) {
                conditions.push(`statut = $${paramIndex}`);
                values.push(statut);
                paramIndex++;
            }
            
            // Filtre par période
            if (periode) {
                const today = new Date().toISOString().split('T')[0];
                
                switch (periode) {
                    case 'overdue':
                        conditions.push(`date_prochaine_visite < $${paramIndex} AND statut = 'À venir'`);
                        values.push(today);
                        break;
                    case '30days':
                        conditions.push(`date_prochaine_visite >= $${paramIndex} AND date_prochaine_visite <= ($${paramIndex}::date + INTERVAL '30 days') AND statut = 'À venir'`);
                        values.push(today);
                        break;
                    case '60days':
                        conditions.push(`date_prochaine_visite >= $${paramIndex} AND date_prochaine_visite <= ($${paramIndex}::date + INTERVAL '60 days') AND statut = 'À venir'`);
                        values.push(today);
                        break;
                    case '90days':
                        conditions.push(`date_prochaine_visite >= $${paramIndex} AND date_prochaine_visite <= ($${paramIndex}::date + INTERVAL '90 days') AND statut = 'À venir'`);
                        values.push(today);
                        break;
                }
                paramIndex++;
            }
            
            // Construire la requête
            let query = 'SELECT * FROM visites_medicales';
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY date_prochaine_visite ASC';
            
            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows, 'visiteMedicale'));
        } catch (err) {
            console.error('Error searching visites médicales:', err);
            res.status(500).json({ error: 'Failed to search visites médicales', details: err.message });
        }
    });

   // Dans la route pour récupérer toutes les visites médicales
router.get('/', async (req, res) => {
    try {
        console.log('API: Récupération de toutes les visites médicales');
        
        // Vérifier d'abord la connexion à la base de données
        const testQuery = 'SELECT 1 as test';
        const testResult = await pool.query(testQuery);
        console.log('API: Test de connexion à la base de données:', testResult.rows);
        
        // Compter le nombre total de visites
        const countQuery = 'SELECT COUNT(*) FROM visites_medicales';
        const countResult = await pool.query(countQuery);
        console.log('API: Nombre total de visites en base de données:', countResult.rows[0].count);
        
        const query = `
            SELECT * FROM visites_medicales 
            ORDER BY date_prochaine_visite ASC
        `;
        const result = await pool.query(query);
        
        console.log('API: Visites récupérées de la base de données:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('API: Premier enregistrement:', result.rows[0]);
            
            // Vérifier les statuts distincts
            const statuts = [...new Set(result.rows.map(r => r.statut))];
            console.log('API: Statuts présents dans les données:', statuts);
        }
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching visites médicales:', err);
        res.status(500).json({ error: 'Failed to fetch visites médicales', details: err.message });
    }
});
    // Créer une nouvelle visite médicale
    router.post('/', async (req, res) => {
        try {
            const { 
                nom, 
                prenom, 
                poste, 
                date_derniere_visite, 
                date_prochaine_visite, 
                statut = 'À venir',
                notes 
            } = req.body;

            const query = `
                INSERT INTO visites_medicales 
                (nom, prenom, poste, date_derniere_visite, date_prochaine_visite, statut, notes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *
            `;

            const values = [
                nom, 
                prenom, 
                poste, 
                date_derniere_visite, 
                date_prochaine_visite, 
                statut,
                notes
            ];

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating visite médicale:', err);
            res.status(500).json({ error: 'Failed to create visite médicale', details: err.message });
        }
    });

    // Mettre à jour une visite médicale
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nom, 
                prenom, 
                poste, 
                date_derniere_visite, 
                date_prochaine_visite, 
                statut,
                notes 
            } = req.body;

            const query = `
                UPDATE visites_medicales 
                SET nom = $1, 
                    prenom = $2, 
                    poste = $3, 
                    date_derniere_visite = $4, 
                    date_prochaine_visite = $5, 
                    statut = $6,
                    notes = $7,
                    date_modification = CURRENT_TIMESTAMP
                WHERE id = $8 
                RETURNING *
            `;

            const values = [
                nom, 
                prenom, 
                poste, 
                date_derniere_visite, 
                date_prochaine_visite, 
                statut,
                notes,
                id
            ];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Visite médicale not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'visiteMedicale'));
        } catch (err) {
            console.error(`Error updating visite médicale ${id}:`, err);
            res.status(500).json({ error: 'Failed to update visite médicale', details: err.message });
        }
    });

    // Mettre à jour le statut d'une visite médicale
    router.put('/:id/status', async (req, res) => {
        try {
            const { id } = req.params;
            const { statut, notes } = req.body;

            const query = `
                UPDATE visites_medicales 
                SET statut = $1,
                    notes = CASE WHEN $2 IS NOT NULL THEN $2 ELSE notes END,
                    date_modification = CURRENT_TIMESTAMP
                WHERE id = $3 
                RETURNING *
            `;

            const values = [statut, notes, id];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Visite médicale not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'visiteMedicale'));
        } catch (err) {
            console.error(`Error updating visite médicale status ${id}:`, err);
            res.status(500).json({ error: 'Failed to update visite médicale status', details: err.message });
        }
    });

    // Supprimer une visite médicale
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'DELETE FROM visites_medicales WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Visite médicale not found' });
            }

            res.json({ message: 'Visite médicale deleted successfully', visite: result.rows[0] });
        } catch (err) {
            console.error(`Error deleting visite médicale ${id}:`, err);
            res.status(500).json({ error: 'Failed to delete visite médicale', details: err.message });
        }
    });

  // Dans la route des statistiques, ajoutez également des logs détaillés
router.get('/stats/overview', async (req, res) => {
    try {
        console.log('API: Calcul des statistiques');
        const today = new Date().toISOString().split('T')[0];
        console.log('API: Date utilisée pour les calculs:', today);
        
        // Version alternative utilisant des requêtes séparées pour éviter les problèmes de performance
        const overdueQuery = `
            SELECT COUNT(*) AS count 
            FROM visites_medicales 
            WHERE date_prochaine_visite < $1 AND statut = 'À venir'
        `;
        
        const days30Query = `
            SELECT COUNT(*) AS count 
            FROM visites_medicales 
            WHERE date_prochaine_visite >= $1 
            AND date_prochaine_visite <= ($1::date + INTERVAL '30 days') 
            AND statut = 'À venir'
        `;
        
        const days90Query = `
            SELECT COUNT(*) AS count 
            FROM visites_medicales 
            WHERE date_prochaine_visite >= $1 
            AND date_prochaine_visite <= ($1::date + INTERVAL '90 days') 
            AND statut = 'À venir'
        `;
        
        const completedQuery = `
            SELECT COUNT(*) AS count 
            FROM visites_medicales 
            WHERE statut = 'Complété'
        `;
        
        // Exécuter les requêtes en parallèle
        const [overdueResult, days30Result, days90Result, completedResult] = await Promise.all([
            pool.query(overdueQuery, [today]),
            pool.query(days30Query, [today]),
            pool.query(days90Query, [today]),
            pool.query(completedQuery)
        ]);
        
        // Log les résultats bruts
        console.log('API: Requête des visites en retard:', overdueResult.rows);
        console.log('API: Requête des visites dans 30 jours:', days30Result.rows);
        console.log('API: Requête des visites dans 90 jours:', days90Result.rows);
        console.log('API: Requête des visites complétées:', completedResult.rows);
        
        // Construire l'objet de statistiques
        const stats = {
            overdueCount: parseInt(overdueResult.rows[0].count, 10),
            days30Count: parseInt(days30Result.rows[0].count, 10),
            days90Count: parseInt(days90Result.rows[0].count, 10),
            completedCount: parseInt(completedResult.rows[0].count, 10)
        };
        
        console.log('API: Statistiques calculées:', stats);
        
        res.json(stats);
    } catch (err) {
        console.error('Error fetching visite médicale statistics:', err);
        res.status(500).json({ error: 'Failed to fetch visite médicale statistics', details: err.message });
    }
});
router.get('/diagnostic', async (req, res) => {
    try {
        const result = {};
        
        // Vérifier la connexion à la base de données
        const testQuery = 'SELECT 1 as test';
        const testResult = await pool.query(testQuery);
        result.connectionTest = testResult.rows[0].test === 1 ? 'OK' : 'FAIL';
        
        // Vérifier si la table existe
        const tableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'visites_medicales'
            ) as exists
        `;
        const tableResult = await pool.query(tableQuery);
        result.tableExists = tableResult.rows[0].exists;
        
        // Si la table existe, récupérer les informations
        if (result.tableExists) {
            // Compter le nombre total d'enregistrements
            const countQuery = 'SELECT COUNT(*) FROM visites_medicales';
            const countResult = await pool.query(countQuery);
            result.totalRecords = parseInt(countResult.rows[0].count, 10);
            
            // Vérifier les statuts présents
            const statusQuery = 'SELECT statut, COUNT(*) FROM visites_medicales GROUP BY statut';
            const statusResult = await pool.query(statusQuery);
            result.statusCounts = statusResult.rows;
            
            // Calculer les statistiques directement en base
            const today = new Date().toISOString().split('T')[0];
            
            // Visites en retard
            const overdueQuery = `
                SELECT COUNT(*) FROM visites_medicales 
                WHERE date_prochaine_visite < $1 AND statut = 'À venir'
            `;
            const overdueResult = await pool.query(overdueQuery, [today]);
            result.overdueCount = parseInt(overdueResult.rows[0].count, 10);
            
            // Visites dans les 30 jours
            const days30Query = `
                SELECT COUNT(*) FROM visites_medicales 
                WHERE date_prochaine_visite >= $1 
                AND date_prochaine_visite <= ($1::date + INTERVAL '30 days') 
                AND statut = 'À venir'
            `;
            const days30Result = await pool.query(days30Query, [today]);
            result.days30Count = parseInt(days30Result.rows[0].count, 10);
            
            // Visites dans les 90 jours
            const days90Query = `
                SELECT COUNT(*) FROM visites_medicales 
                WHERE date_prochaine_visite >= $1 
                AND date_prochaine_visite <= ($1::date + INTERVAL '90 days') 
                AND statut = 'À venir'
            `;
            const days90Result = await pool.query(days90Query, [today]);
            result.days90Count = parseInt(days90Result.rows[0].count, 10);
            
            // Visites complétées
            const completedQuery = `
                SELECT COUNT(*) FROM visites_medicales 
                WHERE statut = 'Complété'
            `;
            const completedResult = await pool.query(completedQuery);
            result.completedCount = parseInt(completedResult.rows[0].count, 10);
            
            // Récupérer quelques exemples de données
            const samplesQuery = 'SELECT * FROM visites_medicales LIMIT 3';
            const samplesResult = await pool.query(samplesQuery);
            result.sampleRecords = samplesResult.rows;
        }
        
        res.json(result);
    } catch (err) {
        console.error('Error in diagnostic endpoint:', err);
        res.status(500).json({ 
            error: 'Failed to run diagnostic', 
            details: err.message,
            stack: err.stack
        });
    }
});

    return router;
};