const express = require('express');
const router = express.Router();
const db = require('../db');
const { normalizeEntity } = require('../utils/textNormalizer');

// GET - Récupérer tous les entretiens
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM interviews 
            ORDER BY interview_date DESC, interview_time ASC
        `);
        res.json(normalizeEntity(result.rows, 'interview'));
    } catch (error) {
        console.error('Erreur lors de la récupération des entretiens:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Récupérer un entretien par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM interviews WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entretien non trouvé' });
        }
        
        res.json(normalizeEntity(result.rows[0], 'interview'));
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'entretien:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Créer un nouvel entretien
router.post('/', async (req, res) => {
    try {
        const {
            candidate_name,
            position,
            interviewer,
            interview_date,
            interview_time,
            duration,
            interview_type,
            status,
            notes,
            location,
            department
        } = req.body;

        const result = await db.query(`
            INSERT INTO interviews (
                candidate_name, position, interviewer, interview_date, 
                interview_time, duration, interview_type, status, 
                notes, location, department
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [
            candidate_name, position, interviewer, interview_date,
            interview_time, duration, interview_type, status,
            notes, location, department
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la création de l\'entretien:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT - Mettre à jour un entretien
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            candidate_name,
            position,
            interviewer,
            interview_date,
            interview_time,
            duration,
            interview_type,
            status,
            notes,
            location,
            department
        } = req.body;

        const result = await db.query(`
            UPDATE interviews SET 
                candidate_name = $1, position = $2, interviewer = $3, 
                interview_date = $4, interview_time = $5, duration = $6, 
                interview_type = $7, status = $8, notes = $9, 
                location = $10, department = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
        `, [
            candidate_name, position, interviewer, interview_date,
            interview_time, duration, interview_type, status, notes,
            location, department, id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entretien non trouvé' });
        }

        res.json(normalizeEntity(result.rows[0], 'interview'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'entretien:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE - Supprimer un entretien
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM interviews WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entretien non trouvé' });
        }

        res.json({ message: 'Entretien supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'entretien:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH - Mettre à jour le statut d'un entretien
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(`
            UPDATE interviews SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entretien non trouvé' });
        }

        res.json(normalizeEntity(result.rows[0], 'interview'));
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;







