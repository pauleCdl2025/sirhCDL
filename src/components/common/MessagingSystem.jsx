import React, { useState, useEffect, useRef } from 'react';
import { employeeService } from '../../services/api';
import './MessagingSystem.css';

const MessagingSystem = ({ user, isRH = false }) => {
  const [messages, setMessages] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Charger les employés et messages au démarrage
  useEffect(() => {
    loadEmployees();
    loadMessages();
    initializeWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger la liste des employés
  const loadEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setEmployees([]);
    }
  };

  // Charger les messages
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/messages/${isRH ? 'rh' : 'employee'}/${user?.id || 1}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.log('API messages non disponible, utilisation de données par défaut');
        setMessages([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setMessages([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialiser WebSocket pour les notifications en temps réel
  const initializeWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:5002/ws/messages/${isRH ? 'rh' : 'employee'}/${user?.id || 1}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté pour la messagerie');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          setMessages(prev => [...prev, data.message]);
          if (!data.message.isRead) {
            setUnreadCount(prev => prev + 1);
          }
        } else if (data.type === 'message_read') {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            )
          );
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket fermé, reconnexion...');
        setTimeout(initializeWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation WebSocket:', error);
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || (!isRH && !selectedEmployee)) return;

    try {
      const messageData = {
        senderId: user.id,
        senderName: user.nom_prenom || user.name,
        senderType: isRH ? 'rh' : 'employee',
        receiverId: isRH ? selectedEmployee.id : 'rh',
        receiverName: isRH ? selectedEmployee.nom_prenom : 'Service RH',
        receiverType: isRH ? 'employee' : 'rh',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Envoyer via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'send_message',
            message: sentMessage
          }));
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async (messageIds) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });

      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - messageIds.length));
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
    }
  };

  // Sélectionner un employé (pour RH)
  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeList(false);
    
    // Marquer les messages avec cet employé comme lus
    const unreadMessageIds = messages
      .filter(msg => 
        msg.senderId === employee.id && 
        msg.senderType === 'employee' && 
        !msg.isRead
      )
      .map(msg => msg.id);
    
    if (unreadMessageIds.length > 0) {
      markMessagesAsRead(unreadMessageIds);
    }
  };

  // Filtrer les messages selon le contexte
  const getFilteredMessages = () => {
    if (isRH && selectedEmployee) {
      return messages.filter(msg => 
        (msg.senderId === selectedEmployee.id && msg.senderType === 'employee') ||
        (msg.receiverId === selectedEmployee.id && msg.receiverType === 'employee')
      );
    } else if (!isRH) {
      return messages.filter(msg => 
        msg.senderType === 'rh' || msg.receiverType === 'rh'
      );
    }
    return messages;
  };

  // Scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Gérer l'envoi avec Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="messaging-system">
      {/* Header */}
      <div className="messaging-header">
        <div className="header-left">
          <h3>
            <i className="fas fa-comments"></i>
            Messagerie {isRH ? 'RH' : 'Employé'}
          </h3>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        
        {isRH && (
          <button 
            className="select-employee-btn"
            onClick={() => setShowEmployeeList(!showEmployeeList)}
          >
            <i className="fas fa-user-plus"></i>
            {selectedEmployee ? selectedEmployee.nom_prenom : 'Sélectionner un employé'}
          </button>
        )}
      </div>

      {/* Liste des employés (RH seulement) */}
      {isRH && showEmployeeList && (
        <div className="employee-list">
          <div className="employee-list-header">
            <h4>Sélectionner un employé</h4>
            <button 
              className="close-btn"
              onClick={() => setShowEmployeeList(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="employee-search">
            <input 
              type="text" 
              placeholder="Rechercher un employé..."
              className="search-input"
            />
          </div>
          
          <div className="employee-items">
            {employees.map(employee => (
              <div 
                key={employee.id}
                className={`employee-item ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                onClick={() => selectEmployee(employee)}
              >
                <div className="employee-avatar">
                  {employee.nom_prenom?.charAt(0) || 'E'}
                </div>
                <div className="employee-info">
                  <h5>{employee.nom_prenom || 'Nom non disponible'}</h5>
                  <p>{employee.poste_actuel || employee.functional_area || 'Poste non défini'}</p>
                  <small>Matricule: {employee.matricule}</small>
                </div>
                <div className="employee-status">
                  <span className="status-dot online"></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone de messages */}
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-messages">
            <div className="spinner"></div>
            <p>Chargement des messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="no-messages">
            <i className="fas fa-comment-slash"></i>
            <p>
              {isRH 
                ? selectedEmployee 
                  ? `Aucun message avec ${selectedEmployee.nom_prenom}` 
                  : 'Sélectionnez un employé pour voir les messages'
                : 'Aucun message avec le service RH'
              }
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {filteredMessages.map((message, index) => {
              const isOwnMessage = message.senderId === user.id;
              const isFromRH = message.senderType === 'rh';
              
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="message-input-container">
        {isRH && !selectedEmployee ? (
          <div className="no-employee-selected">
            <i className="fas fa-info-circle"></i>
            <p>Sélectionnez un employé pour envoyer un message</p>
          </div>
        ) : (
          <div className="message-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isRH 
                  ? `Écrire un message à ${selectedEmployee?.nom_prenom || 'un employé'}...`
                  : 'Écrire un message au service RH...'
              }
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
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
