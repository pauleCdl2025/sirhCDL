import React, { useState, useEffect } from 'react';
import MessagingSystem from '../common/MessagingSystem';
import { employeeService } from '../../services/api';
import './RHMessaging.css';

const RHMessaging = ({ user }) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    todayMessages: 0,
    unreadMessages: 0,
    activeEmployees: 0
  });
  const [loading, setLoading] = useState(true);

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
      
      // Charger les statistiques de messagerie (avec gestion d'erreur)
      try {
        const statsResponse = await fetch(`/api/messages/stats/rh/${user?.id || 1}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            todayMessages: statsData.stats?.sent_messages || 0,
            unreadMessages: statsData.stats?.unread_messages || 0,
            activeEmployees: employeesResponse?.length || 0
          });
        } else {
          console.log('API stats non disponible, utilisation de valeurs par défaut');
          setStats({
            todayMessages: 0,
            unreadMessages: 0,
            activeEmployees: employeesResponse?.length || 0
          });
        }
      } catch (statsError) {
        console.log('Erreur stats, utilisation de valeurs par défaut:', statsError);
        setStats({
          todayMessages: 0,
          unreadMessages: 0,
          activeEmployees: employeesResponse?.length || 0
        });
      }
      
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
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          Historique
        </button>
      </div>

      {/* Content */}
      <div className="rh-messaging-content">
        {activeTab === 'messages' && (
          <div className="messages-tab">
            <MessagingSystem user={user} isRH={true} />
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="employees-tab">
            <div className="employees-header">
              <h3>Liste des Employés</h3>
              <div className="employees-actions">
                <div className="search-container">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Rechercher un employé..."
                    className="search-input"
                  />
                </div>
                <select className="filter-select">
                  <option value="all">Tous les départements</option>
                  <option value="rh">Ressources Humaines</option>
                  <option value="it">Informatique</option>
                  <option value="medical">Médical</option>
                  <option value="admin">Administration</option>
                </select>
              </div>
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
                  
                  <button className="message-employee-btn">
                    <i className="fas fa-paper-plane"></i>
                    Envoyer un message
                  </button>
                </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="history-header">
              <h3>Historique des Conversations</h3>
              <div className="history-filters">
                <select className="filter-select">
                  <option value="all">Toutes les conversations</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
                <input 
                  type="date" 
                  className="date-filter"
                  placeholder="Date de début"
                />
                <input 
                  type="date" 
                  className="date-filter"
                  placeholder="Date de fin"
                />
              </div>
            </div>

            <div className="conversations-list">
              {[
                {
                  id: 1,
                  employee: 'Jean Dupont',
                  department: 'IT',
                  lastMessage: 'Merci pour les informations',
                  timestamp: '2025-01-15 14:30',
                  messageCount: 8,
                  status: 'completed'
                },
                {
                  id: 2,
                  employee: 'Marie Martin',
                  department: 'RH',
                  lastMessage: 'Je vais vérifier cela',
                  timestamp: '2025-01-15 13:45',
                  messageCount: 12,
                  status: 'pending'
                },
                {
                  id: 3,
                  employee: 'Pierre Durand',
                  department: 'Médical',
                  lastMessage: 'Parfait, je comprends',
                  timestamp: '2025-01-15 11:20',
                  messageCount: 5,
                  status: 'completed'
                }
              ].map(conversation => (
                <div key={conversation.id} className="conversation-item">
                  <div className="conversation-header">
                    <div className="conversation-employee">
                      <div className="employee-avatar-small">
                        {conversation.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="employee-details">
                        <h5>{conversation.employee}</h5>
                        <p>{conversation.department}</p>
                      </div>
                    </div>
                    <div className="conversation-meta">
                      <span className="message-count">{conversation.messageCount} messages</span>
                      <span className={`conversation-status ${conversation.status}`}>
                        {conversation.status === 'completed' ? 'Terminée' : 'En cours'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="conversation-content">
                    <p className="last-message-text">{conversation.lastMessage}</p>
                    <span className="conversation-time">{conversation.timestamp}</span>
                  </div>
                  
                  <div className="conversation-actions">
                    <button className="view-conversation-btn">
                      <i className="fas fa-eye"></i>
                      Voir la conversation
                    </button>
                    <button className="export-conversation-btn">
                      <i className="fas fa-download"></i>
                      Exporter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RHMessaging;
