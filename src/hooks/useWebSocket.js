import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/webSocketService';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    reconnectAttempts: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    messages: 0
  });

  // Connexion WebSocket
  const connect = useCallback(() => {
    // Utiliser l'ID si disponible, sinon utiliser l'email comme identifiant
    const userId = user?.id || user?.email;
    const userType = (user?.role === 'admin' || user?.role === 'rh') ? 'rh' : 'employee';
    
    if (user && userId && isAuthenticated) {
      console.log('🔌 Connexion WebSocket pour l\'utilisateur:', userId, 'type:', userType);
      webSocketService.connect(userId, userType);
    } else {
      console.log('🔌 WebSocket: Utilisateur non disponible ou non authentifié', { user, userId, isAuthenticated });
    }
  }, [user, isAuthenticated]);

  // Déconnexion WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Déconnexion WebSocket');
    webSocketService.disconnect();
  }, []);

  // Gestionnaire de statut de connexion
  const handleConnectionStatus = useCallback((data) => {
    setConnectionStatus(prev => ({
      ...prev,
      connected: data.connected,
      socketId: data.socketId,
      reason: data.reason
    }));
  }, []);

  // Gestionnaire d'authentification
  const handleAuthenticated = useCallback((data) => {
    console.log('🔐 WebSocket authentifié:', data.user);
    setConnectionStatus(prev => ({
      ...prev,
      connected: true,
      socketId: webSocketService.socket?.id
    }));
  }, []);

  // Gestionnaire d'erreur d'authentification
  const handleAuthError = useCallback((error) => {
    console.error('❌ Erreur d\'authentification WebSocket:', error);
  }, []);

  // Gestionnaire de nouvelle notification
  const handleNewNotification = useCallback((notification) => {
    console.log('📢 Nouvelle notification reçue:', notification.title);
    
    // Ajouter la notification à la liste
    setNotifications(prev => [notification, ...prev]);
    
    // Mettre à jour le compteur
    setUnreadCounts(prev => ({
      ...prev,
      notifications: prev.notifications + 1
    }));

    // Notification toast (optionnel)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification_${notification.id}`
      });
    }
  }, []);

  // Gestionnaire de mise à jour des notifications
  const handleNotificationsUpdate = useCallback((data) => {
    console.log('📋 Mise à jour des notifications:', data.unreadCount, 'non lues');
    setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    setUnreadCounts(prev => ({
      ...prev,
      notifications: data.unreadCount
    }));
  }, []);

  // Gestionnaire de nouveau message
  const handleNewMessage = useCallback((message) => {
    console.log('💬 Nouveau message reçu:', message.message);
    
    // Ajouter le message à la liste
    setMessages(prev => [message, ...prev]);
    
    // Mettre à jour le compteur
    setUnreadCounts(prev => ({
      ...prev,
      messages: prev.messages + 1
    }));

    // Notification toast (optionnel)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouveau message', {
        body: message.message,
        icon: '/favicon.ico',
        tag: `message_${message.id}`
      });
    }
  }, []);

  // Gestionnaire de mise à jour des messages
  const handleMessagesUpdate = useCallback((data) => {
    console.log('📨 Mise à jour des messages:', data.unreadCount, 'non lus');
    setMessages(Array.isArray(data.messages) ? data.messages : []);
    setUnreadCounts(prev => ({
      ...prev,
      messages: data.unreadCount
    }));
  }, []);

  // Gestionnaire d'erreur de connexion
  const handleConnectionError = useCallback((error) => {
    console.error('❌ Erreur de connexion WebSocket:', error);
    setConnectionStatus(prev => ({
      ...prev,
      connected: false
    }));
  }, []);

  // Gestionnaire générique pour router les messages WebSocket
  const handleWebSocketMessage = useCallback((data) => {
    // Gérer le message 'registered' comme une authentification réussie
    if (data.type === 'registered') {
      console.log('✅ WebSocket enregistré:', data.clientKey);
      handleAuthenticated(data);
      return;
    }
    
    // Router les autres messages selon leur type
    switch (data.type) {
      case 'connection_status':
        handleConnectionStatus(data);
        break;
      case 'authenticated':
        handleAuthenticated(data);
        break;
      case 'auth_error':
        handleAuthError(data);
        break;
      case 'new_notification':
        handleNewNotification(data);
        break;
      case 'notifications_update':
        handleNotificationsUpdate(data);
        break;
      case 'new_message':
        handleNewMessage(data);
        break;
      case 'messages_update':
        handleMessagesUpdate(data);
        break;
      case 'connection_error':
        handleConnectionError(data);
        break;
      default:
        // Ne pas traiter les messages inconnus comme des erreurs
        if (data.type && !data.type.startsWith('error') && data.type !== 'registered') {
          console.log('📨 Message WebSocket non géré:', data.type, data);
        }
    }
  }, [
    handleConnectionStatus,
    handleAuthenticated,
    handleAuthError,
    handleNewNotification,
    handleNotificationsUpdate,
    handleNewMessage,
    handleMessagesUpdate,
    handleConnectionError
  ]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    // Utiliser un listener générique qui route les messages
    webSocketService.addListener('webSocket-router', handleWebSocketMessage);

    // Nettoyage des écouteurs
    return () => {
      webSocketService.removeListener('webSocket-router');
    };
  }, [handleWebSocketMessage]);

  // Connexion automatique désactivée - la messagerie a été supprimée
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     connect();
  //   } else {
  //     disconnect();
  //   }

  //   // Nettoyage lors du démontage
  //   return () => {
  //     disconnect();
  //   };
  // }, [isAuthenticated, user, connect, disconnect]);

  // Demander les données initiales - désactivé car la messagerie a été supprimée
  // useEffect(() => {
  //   if (!connectionStatus.connected) return;

  //   let timeoutId = null;
  //   let onOpenHandler = null;

  //   // Vérifier que le socket existe et est vraiment ouvert
  //   if (webSocketService.socket && webSocketService.socket.readyState === WebSocket.OPEN) {
  //     // Double vérification après un court délai
  //     timeoutId = setTimeout(() => {
  //       if (webSocketService.socket && webSocketService.socket.readyState === WebSocket.OPEN) {
  //         webSocketService.getNotifications();
  //         webSocketService.getMessages();
  //       }
  //     }, 300);
  //   } else if (webSocketService.socket && webSocketService.socket.readyState === WebSocket.CONNECTING) {
  //     // Si la connexion est en cours, attendre l'événement 'open'
  //     onOpenHandler = () => {
  //       timeoutId = setTimeout(() => {
  //         if (webSocketService.socket && webSocketService.socket.readyState === WebSocket.OPEN) {
  //           webSocketService.getNotifications();
  //           webSocketService.getMessages();
  //         }
  //       }, 300);
  //     };
  //     webSocketService.socket.addEventListener('open', onOpenHandler, { once: true });
  //   }

  //   // Nettoyage
  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //     if (onOpenHandler && webSocketService.socket) {
  //       webSocketService.socket.removeEventListener('open', onOpenHandler);
  //     }
  //   };
  // }, [connectionStatus.connected]);

  // Demander la permission pour les notifications du navigateur
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fonctions utilitaires
  const markNotificationAsRead = useCallback((notificationId) => {
    webSocketService.markNotificationAsRead(notificationId);
  }, []);

  const markMessageAsRead = useCallback((messageId) => {
    webSocketService.markMessageAsRead(messageId);
  }, []);

  const refreshNotifications = useCallback(() => {
    webSocketService.getNotifications();
  }, []);

  const refreshMessages = useCallback(() => {
    webSocketService.getMessages();
  }, []);

  return {
    // État de connexion
    connectionStatus,
    isConnected: connectionStatus.connected,
    
    // Données
    notifications,
    messages,
    unreadCounts,
    
    // Actions
    connect,
    disconnect,
    markNotificationAsRead,
    markMessageAsRead,
    refreshNotifications,
    refreshMessages,
    
    // Utilitaires
    socketId: connectionStatus.socketId
  };
};

export default useWebSocket;



