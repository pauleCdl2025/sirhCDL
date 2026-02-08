const express = require('express');
const WebSocket = require('ws');
const { Pool } = require('pg');

module.exports = (pool) => {
  const router = express.Router();
  
  // Créer la table des messages si elle n'existe pas
  const createMessagesTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER NOT NULL,
          sender_name VARCHAR(255) NOT NULL,
          sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('rh', 'employee')),
          receiver_id INTEGER NOT NULL,
          receiver_name VARCHAR(255) NOT NULL,
          receiver_type VARCHAR(50) NOT NULL CHECK (receiver_type IN ('rh', 'employee')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Créer des index pour améliorer les performances
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type)
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type)
      `);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)
      `);
      
      console.log('✅ Table des messages créée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création de la table des messages:', error);
    }
  };

  // Initialiser la table
  createMessagesTable();

  // WebSocket pour les notifications en temps réel
  const wss = new WebSocket.Server({ port: 5002 });
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    console.log('🔌 Nouvelle connexion WebSocket pour la messagerie');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'register') {
          const clientKey = `${message.userType}_${message.userId}`;
          clients.set(clientKey, ws);
          console.log(`📝 Client enregistré: ${clientKey}`);
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message WebSocket:', error);
      }
    });

    ws.on('close', () => {
      // Supprimer le client de la liste
      for (const [key, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(key);
          console.log(`📝 Client déconnecté: ${key}`);
          break;
        }
      }
    });
  });

  // Fonction pour envoyer une notification WebSocket
  const sendWebSocketNotification = (userType, userId, notification) => {
    const clientKey = `${userType}_${userId}`;
    const client = clients.get(clientKey);
    
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
      console.log(`📤 Notification envoyée à ${clientKey}`);
    }
  };

  // Route pour envoyer un message
  router.post('/', async (req, res) => {
    try {
      const {
        senderId,
        senderName,
        senderType,
        receiverId,
        receiverName,
        receiverType,
        content
      } = req.body;

      // Validation des données
      if (!senderId || !senderName || !senderType || !receiverId || !receiverName || !receiverType || !content) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Insérer le message dans la base de données
      const insertQuery = `
        INSERT INTO messages (
          sender_id, sender_name, sender_type,
          receiver_id, receiver_name, receiver_type,
          content, timestamp, is_read
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, FALSE)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        senderId, senderName, senderType,
        receiverId, receiverName, receiverType,
        content
      ]);

      const newMessage = result.rows[0];

      // Envoyer une notification WebSocket au destinataire
      sendWebSocketNotification(receiverType, receiverId, {
        type: 'new_message',
        message: newMessage
      });

      res.json({
        success: true,
        message: 'Message envoyé avec succès',
        data: newMessage
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message'
      });
    }
  });

  // Route pour récupérer les messages d'un utilisateur
  router.get('/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;

      // Récupérer tous les messages où l'utilisateur est expéditeur ou destinataire
      const getMessagesQuery = `
        SELECT * FROM messages 
        WHERE (sender_id = $1 AND sender_type = $2) 
           OR (receiver_id = $1 AND receiver_type = $2)
        ORDER BY timestamp DESC
        LIMIT 100
      `;

      const result = await pool.query(getMessagesQuery, [userId, userType]);
      
      // Compter les messages non lus
      const unreadCountQuery = `
        SELECT COUNT(*) as count FROM messages 
        WHERE receiver_id = $1 AND receiver_type = $2 AND is_read = FALSE
      `;

      const unreadResult = await pool.query(unreadCountQuery, [userId, userType]);

      res.json({
        success: true,
        messages: result.rows,
        unreadCount: parseInt(unreadResult.rows[0].count)
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des messages'
      });
    }
  });

  // Route pour marquer des messages comme lus
  router.post('/mark-read', async (req, res) => {
    try {
      const { messageIds } = req.body;

      if (!messageIds || !Array.isArray(messageIds)) {
        return res.status(400).json({
          success: false,
          message: 'IDs des messages requis'
        });
      }

      // Marquer les messages comme lus
      const updateQuery = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE id = ANY($1)
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [messageIds]);

      res.json({
        success: true,
        message: 'Messages marqués comme lus',
        updatedCount: result.rowCount
      });

    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du marquage des messages'
      });
    }
  });

  // Route pour récupérer la conversation entre deux utilisateurs
  router.get('/conversation/:userType1/:userId1/:userType2/:userId2', async (req, res) => {
    try {
      const { userType1, userId1, userType2, userId2 } = req.params;

      const conversationQuery = `
        SELECT * FROM messages 
        WHERE ((sender_id = $1 AND sender_type = $2 AND receiver_id = $3 AND receiver_type = $4)
            OR (sender_id = $3 AND sender_type = $4 AND receiver_id = $1 AND receiver_type = $2))
        ORDER BY timestamp ASC
      `;

      const result = await pool.query(conversationQuery, [userId1, userType1, userId2, userType2]);

      res.json({
        success: true,
        conversation: result.rows
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la conversation'
      });
    }
  });

  // Route pour récupérer les statistiques de messagerie
  router.get('/stats/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;

      // Statistiques générales
      const statsQuery = `
        SELECT 
          COUNT(*) as total_messages,
          COUNT(CASE WHEN sender_id = $1 AND sender_type = $2 THEN 1 END) as sent_messages,
          COUNT(CASE WHEN receiver_id = $1 AND receiver_type = $2 THEN 1 END) as received_messages,
          COUNT(CASE WHEN receiver_id = $1 AND receiver_type = $2 AND is_read = FALSE THEN 1 END) as unread_messages
        FROM messages 
        WHERE sender_id = $1 AND sender_type = $2 
           OR receiver_id = $1 AND receiver_type = $2
      `;

      const result = await pool.query(statsQuery, [userId, userType]);

      // Messages récents (derniers 7 jours)
      const recentQuery = `
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM messages 
        WHERE (sender_id = $1 AND sender_type = $2) 
           OR (receiver_id = $1 AND receiver_type = $2)
        AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;

      const recentResult = await pool.query(recentQuery, [userId, userType]);

      res.json({
        success: true,
        stats: result.rows[0],
        recentActivity: recentResult.rows
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  });

  // Route pour supprimer un message
  router.delete('/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;

      const deleteQuery = 'DELETE FROM messages WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [messageId]);

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Message non trouvé'
        });
      }

      res.json({
        success: true,
        message: 'Message supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du message'
      });
    }
  });

  return router;
};




