const { Pool } = require('pg');

class AutoNotificationService {
  constructor(pool) {
    this.pool = pool;
  }

  // Créer une notification automatique pour une nouvelle demande
  async createRequestNotification(requestData) {
    try {
      const { 
        request_id, 
        employee_id, 
        request_type, 
        title, 
        description,
        priority = 'normal',
        approver_id = null 
      } = requestData;

      // Déterminer les destinataires selon le type de demande
      let recipients = [];
      
      switch (request_type) {
        case 'leave_request':
        case 'conge':
          // Notifier les RH et le responsable direct
          recipients = await this.getHRAndManagerRecipients(employee_id);
          break;
        case 'absence':
          // Notifier les RH
          recipients = await this.getHRRecipients();
          break;
        case 'contract_renewal':
          // Notifier les RH et la direction
          recipients = await this.getHRAndManagementRecipients();
          break;
        case 'document_request':
          // Notifier les RH
          recipients = await this.getHRRecipients();
          break;
        default:
          // Notifier les RH par défaut
          recipients = await this.getHRRecipients();
      }

      // Créer les notifications pour chaque destinataire
      const notifications = [];
      for (const recipient of recipients) {
        const notification = await this.createNotification({
          user_id: recipient.id,
          user_type: recipient.type,
          notification_type: 'request_received',
          title: `Nouvelle demande: ${title}`,
          message: this.generateRequestMessage(request_type, title, description),
          priority: priority,
          data: {
            request_id: request_id,
            request_type: request_type,
            employee_id: employee_id,
            approver_id: approver_id,
            timestamp: new Date().toISOString()
          }
        });
        notifications.push(notification);
      }

      console.log(`📢 ${notifications.length} notifications créées pour la demande ${request_id}`);
      return notifications;

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification de demande:', error);
      throw error;
    }
  }

  // Créer une notification automatique pour un nouveau message
  async createMessageNotification(messageData) {
    try {
      const { 
        message_id,
        sender_id, 
        receiver_id, 
        message_content,
        thread_id = null 
      } = messageData;

      // Créer la notification pour le destinataire
      const notification = await this.createNotification({
        user_id: receiver_id,
        user_type: 'employee',
        notification_type: 'new_message',
        title: 'Nouveau message reçu',
        message: this.generateMessagePreview(message_content),
        priority: 'normal',
        data: {
          message_id: message_id,
          sender_id: sender_id,
          thread_id: thread_id,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`💬 Notification de message créée pour l'utilisateur ${receiver_id}`);
      return notification;

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification de message:', error);
      throw error;
    }
  }

  // Créer une notification automatique pour l'approbation d'une demande
  async createApprovalNotification(approvalData) {
    try {
      const { 
        request_id,
        employee_id, 
        approver_id,
        status, // 'approved' ou 'rejected'
        request_type,
        title 
      } = approvalData;

      const notification = await this.createNotification({
        user_id: employee_id,
        user_type: 'employee',
        notification_type: 'request_approved',
        title: status === 'approved' ? 'Demande approuvée' : 'Demande refusée',
        message: this.generateApprovalMessage(status, request_type, title),
        priority: 'normal',
        data: {
          request_id: request_id,
          status: status,
          approver_id: approver_id,
          request_type: request_type,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`✅ Notification d'approbation créée pour l'utilisateur ${employee_id}`);
      return notification;

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification d\'approbation:', error);
      throw error;
    }
  }

  // Créer une notification dans la base de données
  async createNotification(notificationData) {
    try {
      const { 
        user_id, 
        user_type, 
        notification_type, 
        title, 
        message, 
        priority = 'normal',
        data = {} 
      } = notificationData;

      const query = `
        INSERT INTO real_time_notifications 
        (user_id, user_type, notification_type, title, message, priority, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await this.pool.query(query, [
        user_id,
        user_type,
        notification_type,
        title,
        message,
        priority,
        JSON.stringify(data)
      ]);

      const notification = result.rows[0];

      // Envoyer la notification en temps réel via WebSocket
      if (global.wsServer) {
        try {
          await global.wsServer.sendRealTimeNotification({
            user_id,
            user_type,
            notification_type,
            title,
            message,
            priority,
            data
          });
        } catch (wsError) {
          console.error('❌ Erreur WebSocket lors de l\'envoi de notification:', wsError);
        }
      }

      return notification;

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification:', error);
      throw error;
    }
  }

  // Obtenir les destinataires RH
  async getHRRecipients() {
    try {
      const result = await this.pool.query(`
        SELECT id, nom_prenom, email, 'rh' as type
        FROM employees 
        WHERE poste_actuel ILIKE '%rh%' 
           OR poste_actuel ILIKE '%ressources humaines%'
           OR poste_actuel ILIKE '%hr%'
        LIMIT 5
      `);
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des RH:', error);
      return [];
    }
  }

  // Obtenir les RH et responsables
  async getHRAndManagerRecipients(employeeId) {
    try {
      const result = await this.pool.query(`
        SELECT DISTINCT e.id, e.nom_prenom, e.email, 'rh' as type
        FROM employees e
        WHERE e.poste_actuel ILIKE '%rh%' 
           OR e.poste_actuel ILIKE '%ressources humaines%'
           OR e.poste_actuel ILIKE '%hr%'
           OR e.poste_actuel ILIKE '%directeur%'
           OR e.poste_actuel ILIKE '%manager%'
           OR e.poste_actuel ILIKE '%chef%'
        LIMIT 10
      `);
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des RH et responsables:', error);
      return [];
    }
  }

  // Obtenir les RH et la direction
  async getHRAndManagementRecipients() {
    try {
      const result = await this.pool.query(`
        SELECT DISTINCT e.id, e.nom_prenom, e.email, 'rh' as type
        FROM employees e
        WHERE e.poste_actuel ILIKE '%rh%' 
           OR e.poste_actuel ILIKE '%ressources humaines%'
           OR e.poste_actuel ILIKE '%hr%'
           OR e.poste_actuel ILIKE '%directeur%'
           OR e.poste_actuel ILIKE '%manager%'
           OR e.poste_actuel ILIKE '%chef%'
        LIMIT 10
      `);
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des RH et direction:', error);
      return [];
    }
  }

  // Générer le message de demande
  generateRequestMessage(requestType, title, description) {
    const typeNames = {
      'leave_request': 'Demande de congé',
      'conge': 'Demande de congé',
      'absence': 'Demande d\'absence',
      'contract_renewal': 'Renouvellement de contrat',
      'document_request': 'Demande de document'
    };

    const typeName = typeNames[requestType] || 'Demande';
    const preview = description ? description.substring(0, 100) + '...' : '';

    return `${typeName}: ${title}${preview ? '\n' + preview : ''}`;
  }

  // Générer le message d'approbation
  generateApprovalMessage(status, requestType, title) {
    const typeNames = {
      'leave_request': 'votre demande de congé',
      'conge': 'votre demande de congé',
      'absence': 'votre demande d\'absence',
      'contract_renewal': 'votre demande de renouvellement',
      'document_request': 'votre demande de document'
    };

    const typeName = typeNames[requestType] || 'votre demande';
    const action = status === 'approved' ? 'approuvée' : 'refusée';

    return `${typeName} "${title}" a été ${action}.`;
  }

  // Générer l'aperçu du message
  generateMessagePreview(messageContent) {
    if (messageContent.length > 50) {
      return messageContent.substring(0, 50) + '...';
    }
    return messageContent;
  }

  // Créer une notification de rappel
  async createReminderNotification(reminderData) {
    try {
      const { 
        user_id, 
        reminder_type, 
        title, 
        message,
        priority = 'normal' 
      } = reminderData;

      const notification = await this.createNotification({
        user_id,
        user_type: 'employee',
        notification_type: 'reminder',
        title: `Rappel: ${title}`,
        message: message,
        priority: priority,
        data: {
          reminder_type: reminder_type,
          timestamp: new Date().toISOString()
        }
      });

      console.log(`⏰ Notification de rappel créée pour l'utilisateur ${user_id}`);
      return notification;

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification de rappel:', error);
      throw error;
    }
  }
}

module.exports = AutoNotificationService;
