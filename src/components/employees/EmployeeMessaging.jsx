import React, { useState, useEffect } from 'react';
import './EmployeeMessaging.css';

const EmployeeMessaging = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simuler quelques messages pour la démonstration
    setMessages([
      {
        id: 1,
        senderName: 'Service RH',
        content: 'Bonjour, nous vous informons que votre demande de congé a été approuvée.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
        isRead: false
      },
      {
        id: 2,
        senderName: 'Service RH',
        content: 'N\'oubliez pas votre visite médicale prévue demain à 14h.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Il y a 1h
        isRead: false
      },
      {
        id: 3,
        senderName: 'Vous',
        content: 'Merci pour l\'information, je serai présent.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Il y a 30min
        isRead: true
      }
    ]);
    
    setUnreadCount(2);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderName: 'Vous',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="employee-messaging">
      {/* Header */}
      <div className="messaging-header">
        <div className="header-left">
          <h3>
            <i className="fas fa-comments"></i>
            Messages RH
          </h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        <div className="header-right">
          <span className="status-indicator">
            <i className="fas fa-circle"></i>
            Service RH en ligne
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-comment-slash"></i>
            <p>Aucun message avec le service RH</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderName === 'Vous';
              
              return (
                <div 
                  key={message.id}
                  className={`message-item ${isOwnMessage ? 'own' : 'other'} ${!message.isRead ? 'unread' : ''}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {isOwnMessage ? 'Vous' : message.senderName}
                      </span>
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="message-text">{message.content}</div>
                    {!message.isRead && !isOwnMessage && (
                      <div className="unread-indicator">
                        <i className="fas fa-circle"></i>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="message-input-container">
        <div className="message-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrire un message au service RH..."
            className="message-textarea"
            rows="2"
          />
          <button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="send-btn"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMessaging;




