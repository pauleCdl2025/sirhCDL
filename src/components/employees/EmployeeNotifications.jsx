import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './EmployeeNotifications.css';

const EmployeeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les notifications de l'employé
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/notifications/employee/${user.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      
      // Compter les notifications non lues
      const unread = data.filter(notif => !notif.is_read).length;
      setUnreadCount(unread);
      
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/employee/${user.id}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      
      // Réinitialiser le compteur
      setUnreadCount(0);
      
    } catch (err) {
      console.error('Erreur lors du marquage de toutes comme lues:', err);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  // Récupérer les notifications au chargement
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  // Actualiser toutes les 30 secondes
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <div className="loading-spinner">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <div className="error-message">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3>
          Notifications 
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h3>
        
        {unreadCount > 0 && (
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={markAllAsRead}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>Aucune notification pour le moment</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'contract' && '📄'}
                {notification.type === 'message' && '💬'}
                {notification.type === 'alert' && '⚠️'}
                {!['contract', 'message', 'alert'].includes(notification.type) && '📢'}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  {!notification.is_read && <span className="unread-indicator">●</span>}
                </div>
                
                <div className="notification-message">
                  {notification.message}
                </div>
                
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatDate(notification.created_at)}
                  </span>
                  
                  {notification.data && notification.data.contrat_id && (
                    <span className="notification-contract">
                      Contrat #{notification.data.contrat_id}
                    </span>
                  )}
                </div>
              </div>
              
              {!notification.is_read && (
                <button 
                  className="btn btn-sm btn-outline-success mark-read-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  Marquer comme lu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNotifications;











