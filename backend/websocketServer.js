// Charger les variables d'environnement
require('dotenv').config();

const { Server } = require('socket.io');
const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'Cdl@2025',
  port: parseInt(process.env.DB_PORT) || 5432,
  options: '-c client_encoding=UTF8'
});

class WebSocketServer {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId

    this.setupEventHandlers();
    console.log('🚀 WebSocket Server initialisé');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📱 Nouvelle connexion WebSocket: ${socket.id}`);

      // Authentification de l'utilisateur
      socket.on('authenticate', async (data) => {
        try {
          const { userId, userType } = data;
          
          if (!userId || !userType) {
            socket.emit('auth_error', { message: 'Données d\'authentification manquantes' });
            return;
          }

          // Vérifier que l'utilisateur existe dans la base de données
          const userResult = await pool.query(
            'SELECT id, nom_prenom, email FROM employees WHERE id = $1',
            [userId]
          );

          if (userResult.rows.length === 0) {
            socket.emit('auth_error', { message: 'Utilisateur non trouvé' });
            return;
          }

          const user = userResult.rows[0];
          
          // Enregistrer la connexion
          this.connectedUsers.set(userId, socket.id);
          this.userSockets.set(socket.id, userId);
          
          socket.userId = userId;
          socket.userType = userType;
          socket.user = user;

          // Rejoindre la room de l'utilisateur
          socket.join(`user_${userId}`);
          
          console.log(`✅ Utilisateur authentifié: ${user.nom_prenom} (ID: ${userId})`);
          
          socket.emit('authenticated', {
            message: 'Authentification réussie',
            user: user
          });

          // Envoyer les notifications non lues
          this.sendUnreadNotifications(userId, userType);

        } catch (error) {
          console.error('❌ Erreur d\'authentification WebSocket:', error);
          socket.emit('auth_error', { message: 'Erreur d\'authentification' });
        }
      });

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log(`📱 Déconnexion WebSocket: ${socket.id}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          this.userSockets.delete(socket.id);
          console.log(`👋 Utilisateur déconnecté: ${socket.userId}`);
        }
      });

      // Écouter les demandes de notifications
      socket.on('get_notifications', async () => {
        if (socket.userId) {
          await this.sendUnreadNotifications(socket.userId, socket.userType);
        }
      });

      // Écouter les demandes de messages
      socket.on('get_messages', async () => {
        if (socket.userId) {
          await this.sendUnreadMessages(socket.userId, socket.userType);
        }
      });

      // Marquer une notification comme lue
      socket.on('mark_notification_read', async (data) => {
        if (socket.userId && data.notificationId) {
          await this.markNotificationAsRead(data.notificationId, socket.userId);
        }
      });

      // Marquer un message comme lu
      socket.on('mark_message_read', async (data) => {
        if (socket.userId && data.messageId) {
          await this.markMessageAsRead(data.messageId, socket.userId);
        }
      });
    });
  }

  // Envoyer les notifications non lues à un utilisateur
  async sendUnreadNotifications(userId, userType) {
    try {
      const result = await pool.query(`
        SELECT * FROM real_time_notifications 
        WHERE user_id = $1 AND user_type = $2 AND is_read = false
        ORDER BY created_at DESC
        LIMIT 10
      `, [userId, userType]);

      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.io.to(socketId).emit('notifications_update', {
          notifications: result.rows,
          unreadCount: result.rows.length
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    }
  }

  // Envoyer les messages non lus à un utilisateur
  async sendUnreadMessages(userId, userType) {
    try {
      const result = await pool.query(`
        SELECT m.*, s.nom_prenom as sender_name, s.email as sender_email
        FROM messages m
        LEFT JOIN employees s ON m.sender_id = s.id AND m.sender_type = 'employee'
        WHERE m.receiver_id = $1 AND m.receiver_type = $2 AND m.is_read = false
        ORDER BY m.created_at DESC
        LIMIT 10
      `, [userId, userType]);

      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.io.to(socketId).emit('messages_update', {
          messages: result.rows,
          unreadCount: result.rows.length
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des messages:', error);
    }
  }

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId, userId) {
    try {
      await pool.query(`
        UPDATE real_time_notifications 
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND user_id = $2
      `, [notificationId, userId]);

      // Envoyer la mise à jour
      await this.sendUnreadNotifications(userId, 'employee');
    } catch (error) {
      console.error('❌ Erreur lors du marquage de notification:', error);
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId, userId) {
    try {
      await pool.query(`
        UPDATE messages 
        SET is_read = true, read_at = NOW()
        WHERE id = $1 AND receiver_id = $2
      `, [messageId, userId]);

      // Envoyer la mise à jour
      await this.sendUnreadMessages(userId, 'employee');
    } catch (error) {
      console.error('❌ Erreur lors du marquage de message:', error);
    }
  }

  // Envoyer une nouvelle notification en temps réel
  async sendRealTimeNotification(notificationData) {
    try {
      const { user_id, user_type, notification_type, title, message, priority = 'normal', data = {} } = notificationData;

      // Insérer la notification dans la base de données
      const result = await pool.query(`
        INSERT INTO real_time_notifications 
        (user_id, user_type, notification_type, title, message, priority, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [user_id, user_type, notification_type, title, message, priority, JSON.stringify(data)]);

      const notification = result.rows[0];

      // Envoyer en temps réel à l'utilisateur connecté
      const socketId = this.connectedUsers.get(user_id);
      if (socketId) {
        this.io.to(socketId).emit('new_notification', notification);
        console.log(`📢 Notification envoyée en temps réel à l'utilisateur ${user_id}: ${title}`);
      }

      return notification;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de notification temps réel:', error);
      throw error;
    }
  }

  // Envoyer un nouveau message en temps réel
  async sendRealTimeMessage(messageData) {
    try {
      const { sender_id, sender_type, receiver_id, receiver_type, message, thread_id = null, priority = 'normal' } = messageData;

      // Générer un thread_id si nécessaire
      let finalThreadId = thread_id;
      if (!finalThreadId) {
        const threadResult = await pool.query('SELECT generate_thread_id() as thread_id');
        finalThreadId = threadResult.rows[0].thread_id;
      }

      // Insérer le message dans la base de données
      const result = await pool.query(`
        INSERT INTO messages 
        (sender_id, sender_type, receiver_id, receiver_type, message, thread_id, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [sender_id, sender_type, receiver_id, receiver_type, message, finalThreadId, priority]);

      const newMessage = result.rows[0];

      // Envoyer en temps réel au destinataire connecté
      const receiverSocketId = this.connectedUsers.get(receiver_id);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('new_message', newMessage);
        console.log(`💬 Message envoyé en temps réel à l'utilisateur ${receiver_id}`);
      }

      return newMessage;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de message temps réel:', error);
      throw error;
    }
  }

  // Envoyer une notification à tous les utilisateurs connectés
  async broadcastNotification(notificationData) {
    try {
      const { notification_type, title, message, priority = 'normal', data = {} } = notificationData;

      // Récupérer tous les utilisateurs connectés
      const connectedUserIds = Array.from(this.connectedUsers.keys());

      if (connectedUserIds.length === 0) {
        console.log('📢 Aucun utilisateur connecté pour la notification broadcast');
        return;
      }

      // Créer une notification pour chaque utilisateur connecté
      for (const userId of connectedUserIds) {
        await this.sendRealTimeNotification({
          user_id: userId,
          user_type: 'employee',
          notification_type,
          title,
          message,
          priority,
          data
        });
      }

      console.log(`📢 Notification broadcast envoyée à ${connectedUserIds.length} utilisateurs`);
    } catch (error) {
      console.error('❌ Erreur lors du broadcast de notification:', error);
    }
  }

  // Obtenir les statistiques des connexions
  getConnectionStats() {
    return {
      totalConnections: this.io.engine.clientsCount,
      authenticatedUsers: this.connectedUsers.size,
      connectedUserIds: Array.from(this.connectedUsers.keys())
    };
  }
}

module.exports = WebSocketServer;
