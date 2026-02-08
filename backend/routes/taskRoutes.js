const express = require('express');
const router = express.Router();
const db = require('../db');
const { normalizeEntity } = require('../utils/textNormalizer');

// GET - Récupérer toutes les tâches
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM tasks 
            ORDER BY due_date ASC, created_at DESC
        `);
        res.json(normalizeEntity(result.rows, 'task'));
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Récupérer une tâche par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        
        res.json(normalizeEntity(result.rows[0], 'task'));
    } catch (error) {
        console.error('Erreur lors de la récupération de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Créer une nouvelle tâche
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            assignee,
            priority,
            status,
            due_date,
            category,
            estimated_hours,
            progress,
            notes
        } = req.body;

        const result = await db.query(`
            INSERT INTO tasks (
                title, description, assignee, priority, status, 
                due_date, category, estimated_hours, progress, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            title, description, assignee, priority, status,
            due_date, category, estimated_hours, progress || 0, notes
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT - Mettre à jour une tâche
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            assignee,
            priority,
            status,
            due_date,
            category,
            estimated_hours,
            progress,
            notes
        } = req.body;

        const result = await db.query(`
            UPDATE tasks SET 
                title = $1, description = $2, assignee = $3, priority = $4,
                status = $5, due_date = $6, category = $7, estimated_hours = $8,
                progress = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id = $11
            RETURNING *
        `, [
            title, description, assignee, priority, status, due_date,
            category, estimated_hours, progress, notes, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        res.json(normalizeEntity(result.rows[0], 'task'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE - Supprimer une tâche
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        res.json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH - Mettre à jour le statut d'une tâche
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(`
            UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        res.json(normalizeEntity(result.rows[0], 'task'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH - Mettre à jour la progression d'une tâche
router.patch('/:id/progress', async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;

        const result = await db.query(`
            UPDATE tasks SET progress = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [progress, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }

        res.json(normalizeEntity(result.rows[0], 'task'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Statistiques des tâches
router.get('/stats/overview', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue
            FROM tasks
        `);
        
        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;







