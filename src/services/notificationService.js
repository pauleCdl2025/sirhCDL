import api from './api';

const NOTIFICATION_API_BASE = '/api/notifications';

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId, userType, options = {}) {
    try {
      const { unread_only = false, limit = 20 } = options;
      const response = await api.get(`${NOTIFICATION_API_BASE}/user/${userId}/${userType}`, {
        params: { unread_only, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(userId, userType) {
    try {
      const response = await api.get(`${NOTIFICATION_API_BASE}/unread-count/${userId}/${userType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`${NOTIFICATION_API_BASE}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllAsRead(userId, userType) {
    try {
      const response = await api.put(`${NOTIFICATION_API_BASE}/user/${userId}/${userType}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Créer une nouvelle notification
  async createNotification(notificationData) {
    try {
      const response = await api.post(`${NOTIFICATION_API_BASE}/`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Créer des notifications pour plusieurs utilisateurs
  async createBulkNotifications(notificationData) {
    try {
      const response = await api.post(`${NOTIFICATION_API_BASE}/bulk`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`${NOTIFICATION_API_BASE}/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Créer une notification de test (pour les données de démonstration)
  createTestNotification(userId, userType, type, title, message, priority = 'normal') {
    return {
      user_id: userId,
      user_type: userType,
      notification_type: type,
      title,
      message,
      priority,
      data: {
        timestamp: new Date().toISOString(),
        category: type.includes('leave') ? 'leave' : type.includes('contract') ? 'contract' : 'general'
      }
    };
  },

  // Types de notifications prédéfinis
  notificationTypes: {
    LEAVE_REQUEST: 'leave_request',
    CONTRACT_RENEWAL: 'contract_renewal',
    SYSTEM_MAINTENANCE: 'system_maintenance',
    MEETING_REMINDER: 'meeting_reminder',
    REPORT_READY: 'report_ready',
    TRAINING_AVAILABLE: 'training_available',
    PERFORMANCE_REVIEW: 'performance_review',
    BIRTHDAY_WISH: 'birthday_wish',
    TASK_ASSIGNED: 'task_assigned',
    TASK_COMPLETED: 'task_completed',
    DOCUMENT_UPLOADED: 'document_uploaded',
    APPROVAL_REQUIRED: 'approval_required'
  },

  // Priorités de notifications
  priorities: {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent'
  }
};

export default notificationService;







