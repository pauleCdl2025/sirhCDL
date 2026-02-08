import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/api';
import webSocketService from '../../services/webSocketService';
import './RHMessagingSimple.css';

const RHMessagingSimple = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Charger les employés
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log('🔄 Chargement des employés...');
        const data = await employeeService.getAll();
        console.log('✅ Employés chargés:', data.length);
        setEmployees(data); // Afficher tous les employés
        setFilteredEmployees(data); // Initialiser la liste filtrée
      } catch (error) {
        console.error('❌ Erreur lors du chargement des employés:', error);
        // En cas d'erreur, utiliser des données de test
        setEmployees([
          { id: 1, nom_prenom: 'Jean Dupont', poste: 'Développeur' },
          { id: 2, nom_prenom: 'Marie Martin', poste: 'Designer' },
          { id: 3, nom_prenom: 'Pierre Durand', poste: 'Manager' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Filtrer les employés selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.poste && employee.poste.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  // Charger les compteurs de messages non lus
  const loadUnreadCounts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/stats/rh/${user?.id || user?.email || 1}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCounts(data.unreadCounts || {});
        
        // Calculer le total des messages non lus
        const total = Object.values(data.unreadCounts || {}).reduce((sum, count) => sum + count, 0);
        setTotalUnreadCount(total);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des compteurs:', error);
    }
  };

  // Charger les compteurs au démarrage
  useEffect(() => {
    loadUnreadCounts();
    // Recharger les compteurs toutes les 30 secondes
    const interval = setInterval(loadUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // WebSocket pour les notifications en temps réel
  useEffect(() => {
    if (user?.id || user?.email) {
      // Se connecter au WebSocket avec l'ID ou l'email
      webSocketService.connect(user.id || user.email, 'rh');
      
      // Écouter les nouveaux messages
      const handleNewMessage = (data) => {
        if (data.type === 'new_message') {
          console.log('🔔 Nouveau message reçu via WebSocket:', data.message);
          
          // Ajouter une notification
          addNotification(`Nouveau message de ${data.message.senderName}`);
          
          // Recharger les compteurs
          loadUnreadCounts();
          
          // Si c'est la conversation active, ajouter le message
          if (selectedEmployee && data.message.sender_id === selectedEmployee.id) {
            setMessages(prev => [...prev, data.message]);
          }
        }
      };
      
      webSocketService.addListener('rh-messaging', handleNewMessage);
      
      return () => {
        webSocketService.removeListener('rh-messaging');
      };
    }
  }, [user?.id, user?.email, selectedEmployee]);

  // Charger les messages d'un employé
  const loadMessages = async (employee) => {
    setSelectedEmployee(employee);
    try {
      console.log(`🔄 Chargement des messages avec l'employé ${employee.nom_prenom}...`);
      const response = await fetch(`http://localhost:5000/api/messages/conversation/rh/${user?.id || user?.email || 1}/employee/${employee.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Messages chargés:', data.conversation?.length || 0);
        setMessages(data.conversation || []);
        
        // Marquer les messages comme lus
        await markMessagesAsRead(employee.id);
      } else {
        console.error('❌ Erreur API:', response.status);
        setMessages([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      setMessages([]);
    }
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async (employeeId) => {
    try {
      await fetch('http://localhost:5000/api/messages/mark-read-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: employeeId,
          senderType: 'employee',
          receiverId: user?.id || user?.email || 1,
          receiverType: 'rh'
        })
      });
      // Mettre à jour le compteur local
      setUnreadCounts(prev => ({ ...prev, [employeeId]: 0 }));
    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages comme lus:', error);
    }
  };

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

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedEmployee) return;

    const messageData = {
      senderId: user?.id || user?.email || 1,
      senderName: user?.name || 'Service RH',
      senderType: 'rh',
      receiverId: selectedEmployee.id,
      receiverName: selectedEmployee.nom_prenom,
      receiverType: 'employee',
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
          senderType: 'rh' // Forcer le bon senderType
        }]);
        setNewMessage('');
        
        // Ajouter une notification
        addNotification(`Message envoyé à ${selectedEmployee.nom_prenom}`);
        
        // Recharger les compteurs
        loadUnreadCounts();
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
    return <div className="messaging-loading">Chargement des employés...</div>;
  }

  return (
    <div className="rh-messaging-simple">
      <div className="messaging-header">
        <div className="header-title">
          <h2>Messagerie RH</h2>
          {totalUnreadCount > 0 && (
            <div className="total-unread-badge">
              {totalUnreadCount}
            </div>
          )}
        </div>
        <p>Sélectionnez un employé pour commencer la conversation</p>
        
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

      <div className="messaging-content">
        {/* Liste des employés */}
        <div className="employees-list">
          <h3>Employés ({filteredEmployees.length})</h3>
          
          {/* Barre de recherche */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="employees-grid">
            {filteredEmployees.map(employee => (
              <div 
                key={employee.id}
                className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                onClick={() => loadMessages(employee)}
              >
                <div className="employee-avatar">
                  {employee.nom_prenom.charAt(0).toUpperCase()}
                </div>
                <div className="employee-info">
                  <h4>{employee.nom_prenom}</h4>
                  <p>{employee.poste}</p>
                </div>
                {unreadCounts[employee.id] > 0 && (
                  <div className="unread-badge">
                    {unreadCounts[employee.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="conversation-area">
          {selectedEmployee ? (
            <>
              <div className="conversation-header">
                <h3>Conversation avec {selectedEmployee.nom_prenom}</h3>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>Aucun message dans cette conversation</p>
                    <p>Envoyez le premier message !</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div 
                      key={index}
                      className={`message ${message.sender_id === (user?.id || 1) ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <div className="message-header">
                          <div className="sender-info">
                            <i className={`fas ${message.sender_id === (user?.id || 1) ? 'fa-user-tie' : 'fa-user'}`}></i>
                            <span className="sender-name">
                              {message.sender_id === (user?.id || 1) ? 'Service RH' : message.senderName}
                            </span>
                          </div>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString()}
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
                  placeholder="Tapez votre message..."
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
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <i className="fas fa-comments"></i>
                <h3>Sélectionnez un employé</h3>
                <p>Choisissez un employé dans la liste pour commencer une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RHMessagingSimple;