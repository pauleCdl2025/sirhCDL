import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/api';
import './RHMessagingFixed.css';

const RHMessaging = ({ user }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    todayMessages: 0,
    unreadMessages: 0,
    activeEmployees: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Charger les données réelles
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      
      // Charger la liste des employés
      const employeesResponse = await employeeService.getAll();
      console.log('Employés chargés:', employeesResponse);
      setEmployees(employeesResponse || []);
      
      // Utiliser des valeurs par défaut pour les stats
      setStats({
        todayMessages: 0,
        unreadMessages: 0,
        activeEmployees: employeesResponse?.length || 0
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setEmployees([]);
      setStats({
        todayMessages: 0,
        unreadMessages: 0,
        activeEmployees: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    // Simuler quelques messages pour la démonstration
    setMessages([
      {
        id: 1,
        senderName: employee.nom_prenom,
        content: 'Bonjour, j\'ai une question sur mes congés.',
        timestamp: new Date().toISOString(),
        isRead: false
      },
      {
        id: 2,
        senderName: 'Service RH',
        content: 'Bonjour, comment puis-je vous aider ?',
        timestamp: new Date().toISOString(),
        isRead: true
      }
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedEmployee || isSending) {
      console.log('❌ Impossible d\'envoyer le message:', {
        hasMessage: !!newMessage.trim(),
        hasEmployee: !!selectedEmployee,
        isSending
      });
      return;
    }

    console.log('🚀 Tentative d\'envoi de message...');
    setIsSending(true);

    // Créer le message côté RH
    const rhMessage = {
      id: Date.now(),
      senderName: 'Service RH',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      senderType: 'rh',
      receiverType: 'employee',
      receiverId: selectedEmployee.id,
      receiverName: selectedEmployee.nom_prenom
    };

    console.log('📝 Message créé:', rhMessage);

    // Ajouter le message à la conversation
    setMessages(prev => {
      const newMessages = [...prev, rhMessage];
      console.log('💬 Messages mis à jour:', newMessages);
      return newMessages;
    });
    
    // Mettre à jour les statistiques
    setStats(prev => ({
      ...prev,
      todayMessages: prev.todayMessages + 1
    }));

    // Effacer le champ de saisie
    setNewMessage('');

    console.log('✅ Message envoyé à', selectedEmployee.nom_prenom, ':', newMessage.trim());

    // Simuler une réponse de l'employé après 2 secondes
    setTimeout(() => {
      const employeeResponse = {
        id: Date.now() + 1,
        senderName: selectedEmployee.nom_prenom,
        content: 'Message reçu, merci pour l\'information.',
        timestamp: new Date().toISOString(),
        isRead: true,
        senderType: 'employee',
        receiverType: 'rh',
        receiverId: user?.id || 1,
        receiverName: 'Service RH'
      };
      
      setMessages(prev => [...prev, employeeResponse]);
      console.log('📨 Réponse simulée reçue de', selectedEmployee.nom_prenom);
    }, 2000);

    setIsSending(false);
  };

  // Gérer l'envoi avec la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rh-messaging">
      {/* Header */}
      <div className="rh-messaging-header">
        <div className="header-content">
          <h2>
            <i className="fas fa-comments"></i>
            Messagerie RH
          </h2>
          <p>Communiquez avec les employés en temps réel</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{loading ? '...' : stats.todayMessages}</div>
            <div className="stat-label">Messages aujourd'hui</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{loading ? '...' : stats.unreadMessages}</div>
            <div className="stat-label">Non lus</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{loading ? '...' : stats.activeEmployees}</div>
            <div className="stat-label">Employés actifs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rh-messaging-tabs">
        <button 
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <i className="fas fa-comments"></i>
          Messages
        </button>
        <button 
          className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <i className="fas fa-users"></i>
          Employés
        </button>
      </div>

      {/* Content */}
      <div className="rh-messaging-content">
        {activeTab === 'messages' && (
          <div className="messages-tab">
            <div className="messaging-container">
              {/* Liste des employés */}
              <div className="employees-sidebar">
                <h4>Sélectionner un employé</h4>
                {loading ? (
                  <div className="loading">Chargement...</div>
                ) : employees.length === 0 ? (
                  <div className="no-employees">Aucun employé trouvé</div>
                ) : (
                  <div className="employees-list">
                    {employees.slice(0, 10).map(employee => (
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
                          <p>{employee.poste_actuel || 'Poste non défini'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Zone de messages */}
              <div className="messages-area">
                {selectedEmployee ? (
                  <>
                    <div className="messages-header">
                      <h4>Conversation avec {selectedEmployee.nom_prenom}</h4>
                      {isSending && (
                        <div className="sending-indicator">
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Envoi en cours...</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="messages-list">
                      {messages.map(message => (
                        <div 
                          key={message.id}
                          className={`message-item ${message.senderName === 'Service RH' ? 'own' : 'other'}`}
                        >
                          <div className="message-content">
                            <div className="message-header">
                              <span className="sender-name">{message.senderName}</span>
                              <span className="message-time">
                                {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="message-text">{message.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="message-input-container">
                      <div className="message-input">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={`Écrire un message à ${selectedEmployee.nom_prenom}...`}
                          className="message-textarea"
                          rows="2"
                          disabled={isSending}
                        />
                        <button 
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || isSending}
                          className="send-btn"
                        >
                          {isSending ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-paper-plane"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-selection">
                    <i className="fas fa-comment-slash"></i>
                    <p>Sélectionnez un employé pour commencer la conversation</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="employees-tab">
            <div className="employees-header">
              <h3>Liste des Employés</h3>
            </div>

            <div className="employees-grid">
              {loading ? (
                <div className="loading-employees">
                  <div className="spinner"></div>
                  <p>Chargement des employés...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="no-employees">
                  <i className="fas fa-users"></i>
                  <p>Aucun employé trouvé</p>
                </div>
              ) : (
                employees.map(employee => (
                  <div key={employee.id} className="employee-card">
                    <div className="employee-card-header">
                      <div className="employee-avatar">
                        {employee.nom_prenom?.split(' ').map(n => n[0]).join('') || 'E'}
                      </div>
                      <div className="employee-status">
                        <span className={`status-dot ${employee.last_login ? 'online' : 'offline'}`}></span>
                      </div>
                    </div>
                    
                    <div className="employee-info">
                      <h4>{employee.nom_prenom || 'Nom non disponible'}</h4>
                      <p>{employee.poste_actuel || employee.functional_area || 'Poste non défini'}</p>
                    </div>
                    
                    <div className="employee-messaging-info">
                      <div className="last-message">
                        <i className="fas fa-comment"></i>
                        <span>
                          {employee.last_login 
                            ? `Dernière connexion: ${new Date(employee.last_login).toLocaleDateString('fr-FR')}`
                            : 'Jamais connecté'
                          }
                        </span>
                      </div>
                      <div className="employee-details">
                        <small>Matricule: {employee.matricule}</small>
                        <small>Email: {employee.email || 'Non disponible'}</small>
                      </div>
                    </div>
                    
                    <button 
                      className="message-employee-btn"
                      onClick={() => {
                        setActiveTab('messages');
                        selectEmployee(employee);
                      }}
                    >
                      <i className="fas fa-paper-plane"></i>
                      Envoyer un message
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RHMessaging;
