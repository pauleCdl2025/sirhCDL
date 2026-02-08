const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Récupérer toutes les notifications d'un employé
    router.get('/employee/:employeeId', async (req, res) => {
        try {
            const { employeeId } = req.params;
            const { unread_only = false } = req.query;

            let query = `
                SELECT * FROM employee_notifications 
                WHERE employee_id = $1
            `;
            let values = [employeeId];

            if (unread_only === 'true') {
                query += ' AND is_read = false';
            }

            query += ' ORDER BY created_at DESC';

            const result = await pool.query(query, values);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching employee notifications:', err);
            res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
        }
    });

    // Marquer une notification comme lue
    router.put('/:notificationId/read', async (req, res) => {
        try {
            const { notificationId } = req.params;
            
            const query = `
                UPDATE employee_notifications 
                SET is_read = true, read_at = $1
                WHERE id = $2 
                RETURNING *
            `;
            
            const result = await pool.query(query, [new Date().toISOString(), notificationId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Error marking notification as read:', err);
            res.status(500).json({ error: 'Failed to mark notification as read', details: err.message });
        }
    });

    // Marquer toutes les notifications d'un employé comme lues
    router.put('/employee/:employeeId/read-all', async (req, res) => {
        try {
            const { employeeId } = req.params;
            
            const query = `
                UPDATE employee_notifications 
                SET is_read = true, read_at = $1
                WHERE employee_id = $2 AND is_read = false
                RETURNING *
            `;
            
            const result = await pool.query(query, [new Date().toISOString(), employeeId]);
            
            res.json({
                message: `${result.rows.length} notifications marquées comme lues`,
                count: result.rows.length
            });
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            res.status(500).json({ error: 'Failed to mark notifications as read', details: err.message });
        }
    });

    // Créer une nouvelle notification
    router.post('/', async (req, res) => {
        try {
            const { employee_id, type, title, message, data } = req.body;
            
            // Validation
            if (!employee_id || !type || !title) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const query = `
                INSERT INTO employee_notifications 
                (employee_id, type, title, message, data) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *
            `;
            
            const values = [employee_id, type, title, message || '', data || {}];
            const result = await pool.query(query, values);
            
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating notification:', err);
            res.status(500).json({ error: 'Failed to create notification', details: err.message });
        }
    });

    // Supprimer une notification
    router.delete('/:notificationId', async (req, res) => {
        try {
            const { notificationId } = req.params;
            
            const query = 'DELETE FROM employee_notifications WHERE id = $1 RETURNING *';
            const result = await pool.query(query, [notificationId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            
            res.json({ message: 'Notification deleted successfully' });
        } catch (err) {
            console.error('Error deleting notification:', err);
            res.status(500).json({ error: 'Failed to delete notification', details: err.message });
        }
    });

    // Compter les notifications non lues d'un employé
    router.get('/employee/:employeeId/unread-count', async (req, res) => {
        try {
            const { employeeId } = req.params;
            
            const query = `
                SELECT COUNT(*) as count 
                FROM employee_notifications 
                WHERE employee_id = $1 AND is_read = false
            `;
            
            const result = await pool.query(query, [employeeId]);
            
            res.json({ unread_count: parseInt(result.rows[0].count) });
        } catch (err) {
            console.error('Error counting unread notifications:', err);
            res.status(500).json({ error: 'Failed to count unread notifications', details: err.message });
        }
    });

    return router;
};











