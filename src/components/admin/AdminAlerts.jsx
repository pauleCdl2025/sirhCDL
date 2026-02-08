import React, { useState, useEffect } from 'react';
import '../../styles/AdminAlerts.css';
import { 
  FaExclamationTriangle, FaCheckCircle, FaClock, FaFileContract,
  FaArrowRight, FaFilter, FaSearch, FaBan
} from 'react-icons/fa';
import api from '../../services/api';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    expiring_contracts: 0,
    pending_requests: 0,
    blocked_accounts: 0,
    failed_logins: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'contracts', 'requests', 'security'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [filterType]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      const statsResponse = await api.get('admin/stats/overview');
      if (statsResponse.data) {
        setStats(prev => ({
          ...prev,
          ...statsResponse.data.alerts,
          ...statsResponse.data.requests
        }));
      }

      // Construire la liste des alertes
      const alertsList = [];

      // Alertes de contrats expirants
      if (statsResponse.data?.alerts?.expiring_contracts > 0) {
        alertsList.push({
          id: 'contracts-expiring',
          type: 'contract',
          severity: 'warning',
          title: 'Contrats Expirant',
          description: `${statsResponse.data.alerts.expiring_contracts} contrat(s) vont expirer prochainement`,
          count: statsResponse.data.alerts.expiring_contracts,
          icon: <FaFileContract />,
          color: '#ffdd57',
          action: 'Voir les contrats'
        });
      }

      // Alertes de demandes en attente
      if (statsResponse.data?.requests?.pending > 0) {
        alertsList.push({
          id: 'pending-requests',
          type: 'request',
          severity: 'info',
          title: 'Demandes en Attente',
          description: `${statsResponse.data.requests.pending} demande(s) nécessitent votre attention`,
          count: statsResponse.data.requests.pending,
          icon: <FaClock />,
          color: '#3a8eba',
          action: 'Traiter les demandes'
        });
      }

      // Récupérer les comptes bloqués depuis les utilisateurs
      try {
        const usersResponse = await api.get('admin/users/all?limit=500');
        const allUsers = usersResponse.data || [];
        const blockedUsers = allUsers.filter(u => 
          u.status === 'suspended' || 
          u.status === 'inactive' || 
          u.statut_employe === 'Inactif'
        );
        
        if (blockedUsers.length > 0) {
          alertsList.push({
            id: 'blocked-accounts',
            type: 'security',
            severity: 'warning',
            title: 'Comptes Bloqués',
            description: `${blockedUsers.length} compte(s) sont actuellement bloqués`,
            count: blockedUsers.length,
            icon: <FaBan />,
            color: '#f57c00',
            action: 'Gérer les comptes',
            items: blockedUsers
          });
        }
        setStats(prev => ({ ...prev, blocked_accounts: blockedUsers.length }));
      } catch (err) {
        console.error('Erreur lors de la récupération des comptes bloqués:', err);
      }

      // Récupérer les connexions échouées récentes
      try {
        const loginHistoryResponse = await api.get('admin/login-history?limit=100');
        const failedLogins = loginHistoryResponse.data?.filter(l => 
          l.login_status === 'failed'
        ) || [];
        
        if (failedLogins.length > 0) {
          alertsList.push({
            id: 'failed-logins',
            type: 'security',
            severity: 'error',
            title: 'Connexions Échouées Récentes',
            description: `${failedLogins.length} tentative(s) de connexion échouée(s) récemment`,
            count: failedLogins.length,
            icon: <FaExclamationTriangle />,
            color: '#e53e3e',
            action: 'Voir l\'historique',
            items: failedLogins.slice(0, 5)
          });
        }
        setStats(prev => ({ ...prev, failed_logins: failedLogins.length }));
      } catch (err) {
        console.error('Erreur lors de la récupération des connexions échouées:', err);
      }

      setAlerts(alertsList);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterType !== 'all' && alert.type !== filterType) {
      return false;
    }
    if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getSeverityBadge = (severity) => {
    const badges = {
      error: { class: 'severity-error', text: 'Critique' },
      warning: { class: 'severity-warning', text: 'Avertissement' },
      info: { class: 'severity-info', text: 'Information' }
    };
    return badges[severity] || badges.info;
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

  if (loading) {
    return (
      <div className="admin-alerts-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des alertes...</p>
      </div>
    );
  }

  return (
    <div className="admin-alerts">
      <div className="alerts-header">
        <div>
          <h1>🚨 Alertes et Notifications</h1>
          <p className="alerts-subtitle">Surveillance du système et actions requises</p>
        </div>
      </div>

      {/* Statistiques d'alertes */}
      <div className="alert-stats-grid">
        <div className="alert-stat-card">
          <div className="alert-stat-icon" style={{ background: '#ffdd5720', color: '#ffdd57' }}>
            <FaFileContract />
          </div>
          <div className="alert-stat-content">
            <div className="alert-stat-value">{stats.expiring_contracts}</div>
            <div className="alert-stat-label">Contrats Expirant</div>
          </div>
        </div>
        <div className="alert-stat-card">
          <div className="alert-stat-icon" style={{ background: '#3a8eba20', color: '#3a8eba' }}>
            <FaClock />
          </div>
          <div className="alert-stat-content">
            <div className="alert-stat-value">{stats.pending_requests}</div>
            <div className="alert-stat-label">Demandes en Attente</div>
          </div>
        </div>
        <div className="alert-stat-card">
          <div className="alert-stat-icon" style={{ background: '#f57c0020', color: '#f57c00' }}>
            <FaBan />
          </div>
          <div className="alert-stat-content">
            <div className="alert-stat-value">{stats.blocked_accounts}</div>
            <div className="alert-stat-label">Comptes Bloqués</div>
          </div>
        </div>
        <div className="alert-stat-card">
          <div className="alert-stat-icon" style={{ background: '#e53e3e20', color: '#e53e3e' }}>
            <FaExclamationTriangle />
          </div>
          <div className="alert-stat-content">
            <div className="alert-stat-value">{stats.failed_logins}</div>
            <div className="alert-stat-label">Connexions Échouées</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="alerts-filters">
        <div className="filter-group">
          <FaFilter />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="contract">Contrats</option>
            <option value="request">Demandes</option>
            <option value="security">Sécurité</option>
          </select>
        </div>
        <div className="search-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher une alerte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <FaCheckCircle size={48} />
            <h3>Aucune alerte</h3>
            <p>Tout fonctionne normalement dans le système.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const severityBadge = getSeverityBadge(alert.severity);
            return (
              <div key={alert.id} className={`alert-card alert-${alert.severity}`}>
                <div className="alert-card-header">
                  <div className="alert-icon" style={{ color: alert.color }}>
                    {alert.icon}
                  </div>
                  <div className="alert-title-section">
                    <h3>{alert.title}</h3>
                    <span className={`severity-badge ${severityBadge.class}`}>
                      {severityBadge.text}
                    </span>
                  </div>
                  <div className="alert-count-badge" style={{ background: alert.color }}>
                    {alert.count}
                  </div>
                </div>
                <div className="alert-card-body">
                  <p className="alert-description">{alert.description}</p>
                  {alert.items && alert.items.length > 0 && (
                    <div className="alert-items-list">
                      <div className="alert-items-header">
                        <strong>Détails:</strong>
                      </div>
                      {alert.items.map((item, idx) => (
                        <div key={idx} className="alert-item">
                          <span className="item-name">
                            {item.email || item.matricule || item.nom_prenom || item.user_id}
                          </span>
                          {item.login_time && (
                            <span className="item-time">{formatDate(item.login_time)}</span>
                          )}
                          {item.failure_reason && (
                            <span className="item-reason">{item.failure_reason}</span>
                          )}
                        </div>
                      ))}
                      {alert.items.length < alert.count && (
                        <div className="alert-item-more">
                          + {alert.count - alert.items.length} autre(s)
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="alert-card-footer">
                  <button className="alert-action-button" style={{ borderColor: alert.color, color: alert.color }}>
                    {alert.action} <FaArrowRight />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;

