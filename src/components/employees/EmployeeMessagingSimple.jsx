import React, { useState, useEffect } from 'react';
import webSocketService from '../../services/webSocketService';
import './EmployeeMessagingSimple.css';

const EmployeeMessagingSimple = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        console.log(`🔄 Chargement des messages pour l'employé ${user?.nom_prenom}...`);
        const response = await fetch(`http://localhost:5000/api/messages/employee/${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Messages chargés:', data.messages?.length || 0);
          setMessages(data.messages || []);
        } else {
          console.error('❌ Erreur API:', response.status);
          setMessages([]);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [user?.id, user?.nom_prenom]);

  // Marquer les messages comme lus quand l'utilisateur ouvre la messagerie
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages.length]);

  // WebSocket pour les notifications en temps réel
  useEffect(() => {
    if (user?.id) {
      // Se connecter au WebSocket
      webSocketService.connect(user.id, 'employee');
      
      // Écouter les nouveaux messages
      const handleNewMessage = (data) => {
        if (data.type === 'new_message') {
          console.log('🔔 Nouveau message reçu via WebSocket:', data.message);
          
          // Ajouter une notification
          addNotification(`Nouveau message du Service RH`);
          
          // Recharger les compteurs
          loadUnreadCount();
          
          // Ajouter le message à la liste
          setMessages(prev => [...prev, data.message]);
        }
      };
      
      webSocketService.addListener('employee-messaging', handleNewMessage);
      
      return () => {
        webSocketService.removeListener('employee-messaging');
      };
    }
  }, [user?.id]);

  // Charger les compteurs de messages non lus
  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/stats/employee/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du compteur:', error);
    }
  };

  // Charger les compteurs au démarrage
  useEffect(() => {
    loadUnreadCount();
    // Recharger les compteurs toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Ajouter une notification
  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message: message,
      timestamp: new Date(),
      type: 'message'
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Garder max 5 notifications
    
    // Supprimer la notification après 5 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async () => {
    try {
      await fetch('http://localhost:5000/api/messages/mark-read-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 1, // RH ID
          senderType: 'rh',
          receiverId: user?.id,
          receiverType: 'employee'
        })
      });
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages comme lus:', error);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: user?.id,
      senderName: user?.nom_prenom || 'Employé',
      senderType: 'employee',
      receiverId: 'rh@centre-diagnostic.com', // Utiliser l'email du RH au lieu d'un ID fixe
      receiverName: 'Service RH',
      receiverType: 'rh',
      content: newMessage.trim()
    };

    try {
      console.log('📤 Envoi du message:', messageData);
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message envoyé:', data);
        setMessages(prev => [...prev, { 
          ...messageData, 
          timestamp: new Date().toISOString(),
          senderType: 'employee' // Forcer le bon senderType
        }]);
        setNewMessage('');
        
        // Ajouter une notification
        addNotification('Message envoyé au Service RH');
        
        // Recharger les compteurs
        loadUnreadCount();
      } else {
        console.error('❌ Erreur lors de l\'envoi:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du message:', error);
    }
  };

  // Gérer la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="messaging-loading">Chargement des messages...</div>;
  }

  return (
    <div className="employee-messaging-simple">
      <div className="messaging-header">
        <div className="header-title">
          <h2>Messagerie</h2>
          {unreadCount > 0 && (
            <div className="total-unread-badge">
              {unreadCount}
            </div>
          )}
        </div>
        <p>Communiquez avec le Service RH</p>
        
        {/* Badge de messages non lus */}
        {unreadCount > 0 && (
          <div className="unread-badge-header">
            <i className="fas fa-envelope"></i>
            <span>{unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}</span>
          </div>
        )}
        
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="notifications-container">
            {notifications.map(notification => (
              <div key={notification.id} className="notification">
                <i className="fas fa-bell"></i>
                <span>{notification.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-comments"></i>
            <h3>Aucun message</h3>
            <p>Envoyez votre premier message au Service RH</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index}
              className={`message ${message.sender_id === user?.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <div className="sender-info">
                    <i className={`fas ${message.sender_id === user?.id ? 'fa-user' : 'fa-user-tie'}`}></i>
                    <span className="sender-name">
                      {message.sender_id === user?.id ? 'Vous' : 'Service RH'}
                    </span>
                  </div>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p>{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="message-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message au Service RH..."
          rows="3"
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="send-button"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default EmployeeMessagingSimple;
