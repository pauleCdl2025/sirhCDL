import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DashboardAdmin.css';
import { 
  FaUsers, FaUserTie, FaChartLine, FaExclamationTriangle, 
  FaShieldAlt, FaHistory, FaKey, FaTrash, FaCheckCircle,
  FaArrowRight, FaEnvelope
} from 'react-icons/fa';
import api from '../../services/api';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    rh_portal: { total_users: 0, admins: 0, rh_users: 0 },
    employee_portal: { total_employees: 0, active: 0, inactive: 0 },
    alerts: { expiring_contracts: 0 },
    requests: { pending: 0 }
  });
  const [recentLogins, setRecentLogins] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Récupération des données du dashboard admin...');
      
      // Récupérer les statistiques globales
      try {
        console.log('📥 Appel à admin/stats/overview');
        const statsResponse = await api.get('admin/stats/overview');
        console.log('✅ Statistiques reçues:', statsResponse.data);
        if (statsResponse.data) {
          setStats(prev => ({
            ...prev,
            ...statsResponse.data,
            rh_portal: { ...prev.rh_portal, ...statsResponse.data.rh_portal },
            employee_portal: { ...prev.employee_portal, ...statsResponse.data.employee_portal },
            alerts: { ...prev.alerts, ...statsResponse.data.alerts },
            requests: { ...prev.requests, ...statsResponse.data.requests }
          }));
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des statistiques:', err);
        console.error('❌ Détails:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
      }

      // Récupérer les connexions récentes
      try {
        console.log('📥 Appel à admin/login-history');
        const loginResponse = await api.get('admin/login-history?limit=5');
        console.log('✅ Historique de connexion reçu:', loginResponse.data?.length || 0);
        setRecentLogins(loginResponse.data || []);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération de l\'historique de connexion:', err);
        console.error('❌ Détails:', err.response?.data || err.message);
        setRecentLogins([]);
      }

      // Récupérer les audits récents
      try {
        console.log('📥 Appel à admin/audit-logs');
        const auditResponse = await api.get('admin/audit-logs?limit=5');
        console.log('✅ Logs d\'audit reçus:', auditResponse.data?.length || 0);
        setRecentAudits(auditResponse.data || []);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des logs d\'audit:', err);
        console.error('❌ Détails:', err.response?.data || err.message);
        setRecentAudits([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statCards = [
    {
      title: 'Utilisateurs RH',
      value: stats.rh_portal.total_users,
      icon: <FaEnvelope />,
      color: '#3a8eba',
      path: '/admin-portal/users',
      subtitle: `${stats.rh_portal.admins} admin, ${stats.rh_portal.rh_users} RH`
    },
    {
      title: 'Employés',
      value: stats.employee_portal.total_employees,
      icon: <FaUserTie />,
      color: '#295785',
      path: '/admin-portal/employees',
      subtitle: `${stats.employee_portal.active} actifs`
    },
    {
      title: 'Contrats Expirant',
      value: stats.alerts.expiring_contracts,
      icon: <FaExclamationTriangle />,
      color: '#ffdd57',
      path: '/admin-portal/alerts',
      subtitle: 'Prochainement'
    },
    {
      title: 'Demandes en Attente',
      value: stats.requests.pending,
      icon: <FaChartLine />,
      color: '#00d1b2',
      path: '/admin-portal/alerts',
      subtitle: 'À traiter'
    }
  ];

  const quickActions = [
    {
      title: 'Gestion Utilisateurs',
      icon: <FaUsers />,
      path: '/admin-portal/users',
      color: '#3a8eba'
    },
    {
      title: 'Gestion Employés',
      icon: <FaUserTie />,
      path: '/admin-portal/employees',
      color: '#295785'
    },
    {
      title: 'Historique Connexions',
      icon: <FaHistory />,
      path: '/admin-portal/login-history',
      color: '#ffdd57'
    },
    {
      title: 'Journal d\'Audit',
      icon: <FaShieldAlt />,
      path: '/admin-portal/audit-trail',
      color: '#00d1b2'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-admin-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Administrateur</h1>
          <p className="dashboard-subtitle">Vue d'ensemble du système et gestion complète</p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid-admin">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card-admin"
            style={{ '--card-color': card.color }}
            onClick={() => navigate(card.path)}
          >
            <div className="stat-card-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-content">
              <div className="stat-value-admin">{card.value}</div>
              <div className="stat-title-admin">{card.title}</div>
              <div className="stat-subtitle">{card.subtitle}</div>
            </div>
            <div className="stat-card-arrow">
              <FaArrowRight />
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="quick-actions-section">
        <h2 className="section-title">Actions Rapides</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action-card"
              onClick={() => navigate(action.path)}
              style={{ '--action-color': action.color }}
            >
              <div className="quick-action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                {action.icon}
              </div>
              <div className="quick-action-title">{action.title}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Connexions récentes */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <FaHistory /> Connexions Récentes
            </h3>
            <button 
              className="view-all-link"
              onClick={() => navigate('/admin-portal/login-history')}
            >
              Voir tout <FaArrowRight />
            </button>
          </div>
          <div className="card-content">
            {recentLogins.length === 0 ? (
              <div className="empty-state">Aucune connexion récente</div>
            ) : (
              <div className="recent-list">
                {recentLogins.map(login => (
                  <div key={login.id} className="recent-item">
                    <div className="recent-item-icon">
                      {login.login_status === 'success' ? (
                        <FaCheckCircle className="success" />
                      ) : (
                        <FaExclamationTriangle className="failed" />
                      )}
                    </div>
                    <div className="recent-item-content">
                      <div className="recent-item-title">
                        {login.email || login.matricule || login.user_id}
                      </div>
                      <div className="recent-item-subtitle">
                        {login.user_type === 'rh' ? 'RH' : login.user_type === 'employee' ? 'Employé' : 'Admin'} • {formatDate(login.login_time)}
                      </div>
                    </div>
                    <div className="recent-item-status">
                      <span className={`status-badge status-${login.login_status}`}>
                        {login.login_status === 'success' ? 'Succès' : 'Échec'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <FaShieldAlt /> Activité Récente (Audit)
            </h3>
            <button 
              className="view-all-link"
              onClick={() => navigate('/admin-portal/audit-trail')}
            >
              Voir tout <FaArrowRight />
            </button>
          </div>
          <div className="card-content">
            {recentAudits.length === 0 ? (
              <div className="empty-state">Aucune activité récente</div>
            ) : (
              <div className="recent-list">
                {recentAudits.map(audit => (
                  <div key={audit.id} className="recent-item">
                    <div className="recent-item-icon">
                      {audit.action_type === 'delete' ? (
                        <FaTrash className="delete" />
                      ) : audit.action_type === 'password_reset' ? (
                        <FaKey className="password" />
                      ) : (
                        <FaCheckCircle className="success" />
                      )}
                    </div>
                    <div className="recent-item-content">
                      <div className="recent-item-title">
                        {audit.description || `${audit.action_type} - ${audit.entity_type}`}
                      </div>
                      <div className="recent-item-subtitle">
                        {audit.user_email || audit.user_id} • {formatDate(audit.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
