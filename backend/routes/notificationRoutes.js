const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Récupérer les notifications d'un utilisateur
    router.get('/user/:userId/:userType', async (req, res) => {
        try {
            const { userId, userType } = req.params;
            const { unread_only = false, limit = 20 } = req.query;

            let query = `
                SELECT * FROM real_time_notifications 
                WHERE user_id = $1 AND user_type = $2
            `;
            let values = [userId, userType];

            if (unread_only === 'true') {
                query += ' AND is_read = false';
            }

            query += ' ORDER BY created_at DESC LIMIT $3';
            values.push(parseInt(limit));

            const result = await pool.query(query, values);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
        }
    });

    // Récupérer le nombre de notifications non lues
    router.get('/unread-count/:userId/:userType', async (req, res) => {
        try {
            const { userId, userType } = req.params;

            const query = `
                SELECT COUNT(*) as unread_count
                FROM real_time_notifications 
                WHERE user_id = $1 AND user_type = $2 AND is_read = false
            `;

            const result = await pool.query(query, [userId, userType]);
            res.json({ unread_count: parseInt(result.rows[0].unread_count) });
        } catch (err) {
            console.error('Error fetching unread count:', err);
            res.status(500).json({ error: 'Failed to fetch unread count', details: err.message });
        }
    });

    // Marquer une notification comme lue
    router.put('/:notificationId/read', async (req, res) => {
        try {
            const { notificationId } = req.params;

            const query = `
                UPDATE real_time_notifications 
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

    // Marquer toutes les notifications d'un utilisateur comme lues
    router.put('/user/:userId/:userType/read-all', async (req, res) => {
        try {
            const { userId, userType } = req.params;

            const query = `
                UPDATE real_time_notifications 
                SET is_read = true, read_at = $1
                WHERE user_id = $2 AND user_type = $3 AND is_read = false
                RETURNING *
            `;

            const result = await pool.query(query, [new Date().toISOString(), userId, userType]);

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
      const { 
        user_id, 
        user_type, 
        notification_type, 
        title, 
        message, 
        data = {}, 
        priority = 'normal',
        action_url = null,
        action_text = null,
        expires_at = null
      } = req.body;

      // Validation
      if (!user_id || !user_type || !notification_type || !title) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const query = `
        INSERT INTO real_time_notifications 
        (user_id, user_type, notification_type, title, message, data, priority, action_url, action_text, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        user_id, 
        user_type, 
        notification_type, 
        title, 
        message || '', 
        JSON.stringify(data), 
        priority,
        action_url,
        action_text,
        expires_at
      ];

      const result = await pool.query(query, values);
      const notification = result.rows[0];

      // Envoyer la notification en temps réel via WebSocket
      if (global.wsServer) {
        try {
          await global.wsServer.sendRealTimeNotification({
            user_id,
            user_type,
            notification_type,
            title,
            message: message || '',
            priority,
            data
          });
        } catch (wsError) {
          console.error('❌ Erreur WebSocket lors de l\'envoi de notification:', wsError);
          // Ne pas faire échouer la requête si WebSocket échoue
        }
      }

      res.json(notification);
    } catch (err) {
      console.error('Error creating notification:', err);
      res.status(500).json({ error: 'Failed to create notification', details: err.message });
    }
  });

    // Créer des notifications pour plusieurs utilisateurs
    router.post('/bulk', async (req, res) => {
        try {
            const { 
                user_ids, 
                user_type, 
                notification_type, 
                title, 
                message, 
                data = {}, 
                priority = 'normal',
                action_url = null,
                action_text = null,
                expires_at = null
            } = req.body;

            // Validation
            if (!user_ids || !Array.isArray(user_ids) || !user_type || !notification_type || !title) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const notifications = [];
            for (const user_id of user_ids) {
                const query = `
                    INSERT INTO real_time_notifications 
                    (user_id, user_type, notification_type, title, message, data, priority, action_url, action_text, expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *
                `;

                const values = [
                    user_id, 
                    user_type, 
                    notification_type, 
                    title, 
                    message || '', 
                    JSON.stringify(data), 
                    priority,
                    action_url,
                    action_text,
                    expires_at
                ];

                const result = await pool.query(query, values);
                notifications.push(result.rows[0]);
            }

            res.json({
                message: `${notifications.length} notifications créées`,
                notifications: notifications
            });
        } catch (err) {
            console.error('Error creating bulk notifications:', err);
            res.status(500).json({ error: 'Failed to create bulk notifications', details: err.message });
        }
    });

    // Supprimer une notification
    router.delete('/:notificationId', async (req, res) => {
        try {
            const { notificationId } = req.params;

            const query = `
                DELETE FROM real_time_notifications 
                WHERE id = $1 
                RETURNING *
            `;

            const result = await pool.query(query, [notificationId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.json({ message: 'Notification supprimée avec succès' });
        } catch (err) {
            console.error('Error deleting notification:', err);
            res.status(500).json({ error: 'Failed to delete notification', details: err.message });
        }
    });

    // Supprimer les notifications expirées
    router.delete('/cleanup/expired', async (req, res) => {
        try {
            const query = `
                DELETE FROM real_time_notifications 
                WHERE expires_at IS NOT NULL AND expires_at < NOW()
                RETURNING *
            `;

            const result = await pool.query(query);

            res.json({
                message: `${result.rows.length} notifications expirées supprimées`,
                count: result.rows.length
            });
        } catch (err) {
            console.error('Error cleaning up expired notifications:', err);
            res.status(500).json({ error: 'Failed to cleanup expired notifications', details: err.message });
        }
    });

    return router;
};
