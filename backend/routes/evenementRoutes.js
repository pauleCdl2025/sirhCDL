const express = require('express');
const { normalizeEntity } = require('../utils/textNormalizer');

module.exports = (pool) => {
    const router = express.Router();

    // Récupérer tous les événements
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
                FROM evenements
                ORDER BY date ASC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'evenement'));
        } catch (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'Failed to fetch events', details: err.message });
        }
    });

    // Récupérer les événements à venir
    router.get('/upcoming', async (req, res) => {
        try {
            const query = `
                SELECT 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
                FROM evenements
                WHERE date >= CURRENT_DATE
                ORDER BY date ASC
                LIMIT 10
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'evenement'));
        } catch (err) {
            console.error('Error fetching upcoming events:', err);
            res.status(500).json({ error: 'Failed to fetch upcoming events', details: err.message });
        }
    });

    // Récupérer un événement par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
                FROM evenements
                WHERE id = $1
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'evenement'));
        } catch (err) {
            console.error('Error fetching event:', err);
            res.status(500).json({ error: 'Failed to fetch event', details: err.message });
        }
    });

    // Créer un nouvel événement
    router.post('/', async (req, res) => {
        try {
            const { name, date, location, description } = req.body;

            const query = `
                INSERT INTO evenements 
                (name, date, location, description) 
                VALUES ($1, $2, $3, $4) 
                RETURNING 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
            `;

            const values = [name, date, location, description];
            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating event:', err);
            res.status(500).json({ error: 'Failed to create event', details: err.message });
        }
    });

    // Mettre à jour un événement
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, date, location, description } = req.body;

            const query = `
                UPDATE evenements 
                SET 
                    name = $1, 
                    date = $2, 
                    location = $3, 
                    description = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 
                RETURNING 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
            `;

            const values = [name, date, location, description, id];
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'evenement'));
        } catch (err) {
            console.error('Error updating event:', err);
            res.status(500).json({ error: 'Failed to update event', details: err.message });
        }
    });

    // Supprimer un événement
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'DELETE FROM evenements WHERE id = $1 RETURNING id';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json({ message: 'Event deleted successfully', id: result.rows[0].id });
        } catch (err) {
            console.error('Error deleting event:', err);
            res.status(500).json({ error: 'Failed to delete event', details: err.message });
        }
    });

    // Rechercher des événements par date ou mot-clé
    router.get('/search/filter', async (req, res) => {
        try {
            const { keyword, startDate, endDate } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (keyword) {
                conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`);
                values.push(`%${keyword}%`);
                paramIndex++;
            }
            
            if (startDate) {
                conditions.push(`date >= $${paramIndex}`);
                values.push(startDate);
                paramIndex++;
            }
            
            if (endDate) {
                conditions.push(`date <= $${paramIndex}`);
                values.push(endDate);
                paramIndex++;
            }
            
            let query = `
                SELECT 
                    id, 
                    name, 
                    date, 
                    location, 
                    description,
                    TO_CHAR(date, 'DD/MM/YYYY') as formatted_date,
                    created_at,
                    updated_at
                FROM evenements
            `;
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY date ASC';
            
            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows, 'evenement'));
        } catch (err) {
            console.error('Error searching events:', err);
            res.status(500).json({ error: 'Failed to search events', details: err.message });
        }
    });

    return router;
};