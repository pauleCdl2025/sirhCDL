import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import webSocketService from '../services/webSocketService';

export const useUnreadMessages = () => {
  const { user, loading: authLoading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = async () => {
    // Utiliser l'ID si disponible, sinon utiliser l'email comme identifiant
    const userId = user?.id || user?.email;
    
    if (!user || !userId) {
      console.log('🔍 useUnreadMessages: Pas d\'utilisateur connecté');
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    console.log('🔍 useUnreadMessages: Chargement des messages non lus pour user:', userId, 'role:', user.role);
    console.log('🔍 useUnreadMessages: Données complètes de l\'utilisateur:', user);

    try {
      // Déterminer le type d'utilisateur et l'endpoint approprié
      const isRH = user.role === 'admin' || user.role === 'rh';
      const endpoint = isRH 
        ? `http://localhost:5000/api/messages/stats/rh/${userId}`
        : `http://localhost:5000/api/messages/stats/employee/${userId}`;

      console.log('🔍 useUnreadMessages: isRH =', isRH, 'Endpoint:', endpoint);

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 useUnreadMessages: Données reçues:', data);
        
        if (isRH) {
          // Pour RH, utiliser le totalUnread du nouvel endpoint
          console.log('🔍 useUnreadMessages: Total RH:', data.totalUnread);
          setUnreadCount(data.totalUnread || 0);
        } else {
          // Pour employé, utiliser directement le compteur
          console.log('🔍 useUnreadMessages: Compteur employé:', data.unreadCount);
          setUnreadCount(data.unreadCount || 0);
        }
      } else {
        console.error('❌ useUnreadMessages: Erreur HTTP:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages non lus:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attendre que l'authentification soit chargée ET que l'utilisateur soit disponible
    if (authLoading) {
      console.log('🔍 useUnreadMessages: Authentification en cours de chargement...');
      return;
    }

    if (!user) {
      console.log('🔍 useUnreadMessages: Utilisateur non disponible');
      return;
    }

    console.log('🔍 useUnreadMessages: Utilisateur disponible, chargement des messages...');
    loadUnreadCount();
    
    // Recharger périodiquement
    const interval = setInterval(loadUnreadCount, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [user, authLoading]);

  // WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    // Attendre que l'authentification soit chargée ET que l'utilisateur soit disponible
    if (authLoading || !user) {
      return;
    }

    // Utiliser l'ID si disponible, sinon utiliser l'email comme identifiant
    const userId = user?.id || user?.email;
    if (!userId) {
      return;
    }

    const userType = (user.role === 'admin' || user.role === 'rh') ? 'rh' : 'employee';
    
    // Se connecter au WebSocket
    webSocketService.connect(userId, userType);
    
    // Écouter les nouveaux messages
    const handleNewMessage = (data) => {
      if (data.type === 'new_message') {
        console.log('🔔 Nouveau message reçu dans la sidebar:', data.message);
        // Recharger le compteur
        loadUnreadCount();
      }
    };
    
    webSocketService.addListener('sidebar-messaging', handleNewMessage);
    
    return () => {
      webSocketService.removeListener('sidebar-messaging');
    };
  }, [user, authLoading]);

  return { unreadCount, loading, refreshUnreadCount: loadUnreadCount };
};
