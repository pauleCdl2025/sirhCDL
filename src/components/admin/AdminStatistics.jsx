import React, { useState, useEffect } from 'react';
import '../../styles/AdminStatistics.css';
import { 
  FaChartBar, FaChartLine, FaChartPie, FaUsers, FaUserTie
} from 'react-icons/fa';
import api from '../../services/api';

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    rh_portal: { total_users: 0, admins: 0, rh_users: 0 },
    employee_portal: { total_employees: 0, active: 0, inactive: 0 },
    login_stats: { total_logins: 0, successful: 0, failed: 0 },
    activity_stats: { today: 0, this_week: 0, this_month: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // 'day', 'week', 'month'

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques globales
      const statsResponse = await api.get('admin/stats/overview');
      if (statsResponse.data) {
        setStats(prev => ({
          ...prev,
          ...statsResponse.data
        }));
      }

      // Récupérer les statistiques de connexion
      try {
        const loginHistoryResponse = await api.get('admin/login-history?limit=1000');
        const logins = loginHistoryResponse.data || [];
        const successful = logins.filter(l => l.login_status === 'success').length;
        const failed = logins.filter(l => l.login_status === 'failed').length;
        
        setStats(prev => ({
          ...prev,
          login_stats: {
            total_logins: logins.length,
            successful,
            failed
          }
        }));
      } catch (err) {
        console.error('Erreur lors de la récupération des stats de connexion:', err);
      }

      // Récupérer les statistiques d'activité
      try {
        const auditResponse = await api.get('admin/audit-logs?limit=1000');
        const audits = auditResponse.data || [];
        const now = new Date();
        const today = audits.filter(a => {
          const date = new Date(a.created_at);
          return date.toDateString() === now.toDateString();
        }).length;
        
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = audits.filter(a => {
          const date = new Date(a.created_at);
          return date >= weekAgo;
        }).length;
        
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const thisMonth = audits.filter(a => {
          const date = new Date(a.created_at);
          return date >= monthAgo;
        }).length;
        
        setStats(prev => ({
          ...prev,
          activity_stats: {
            today,
            this_week: thisWeek,
            this_month: thisMonth
          }
        }));
      } catch (err) {
        console.error('Erreur lors de la récupération des stats d\'activité:', err);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Utilisateurs RH',
      value: stats.rh_portal.total_users,
      icon: <FaUsers />,
      color: '#3a8eba',
      change: null,
      details: [
        { label: 'Administrateurs', value: stats.rh_portal.admins },
        { label: 'Utilisateurs RH', value: stats.rh_portal.rh_users }
      ]
    },
    {
      title: 'Total Employés',
      value: stats.employee_portal.total_employees,
      icon: <FaUserTie />,
      color: '#295785',
      change: null,
      details: [
        { label: 'Actifs', value: stats.employee_portal.active },
        { label: 'Inactifs', value: stats.employee_portal.inactive }
      ]
    },
    {
      title: 'Connexions Total',
      value: stats.login_stats.total_logins,
      icon: <FaChartLine />,
      color: '#00d1b2',
      change: null,
      details: [
        { label: 'Réussies', value: stats.login_stats.successful },
        { label: 'Échouées', value: stats.login_stats.failed }
      ]
    },
    {
      title: 'Activité Ce Mois',
      value: stats.activity_stats.this_month,
      icon: <FaChartBar />,
      color: '#ffdd57',
      change: null,
      details: [
        { label: 'Aujourd\'hui', value: stats.activity_stats.today },
        { label: 'Cette semaine', value: stats.activity_stats.this_week }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="admin-statistics-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-statistics">
      <div className="statistics-header">
        <div>
          <h1>📊 Statistiques Détaillées</h1>
          <p className="statistics-subtitle">Analyse complète des données du système</p>
        </div>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'day' ? 'active' : ''}
            onClick={() => setSelectedPeriod('day')}
          >
            Aujourd'hui
          </button>
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Cette semaine
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Ce mois
          </button>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="statistics-grid">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card-statistics"
            style={{ '--card-color': card.color }}
          >
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: `${card.color}20`, color: card.color }}>
                {card.icon}
              </div>
              <div className="stat-card-title">{card.title}</div>
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-details">
              {card.details.map((detail, idx) => (
                <div key={idx} className="stat-detail-item">
                  <span className="detail-label">{detail.label}:</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section Graphiques */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Répartition des Utilisateurs</h3>
          </div>
          <div className="chart-placeholder">
            <FaChartPie size={48} />
            <p>Graphique en cours de développement</p>
            <div className="chart-stats">
              <div className="chart-stat-item">
                <span className="stat-label">RH:</span>
                <span className="stat-number">{stats.rh_portal.total_users}</span>
              </div>
              <div className="chart-stat-item">
                <span className="stat-label">Employés:</span>
                <span className="stat-number">{stats.employee_portal.total_employees}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Évolution des Connexions</h3>
          </div>
          <div className="chart-placeholder">
            <FaChartLine size={48} />
            <p>Graphique en cours de développement</p>
            <div className="chart-stats">
              <div className="chart-stat-item success">
                <span className="stat-label">Réussies:</span>
                <span className="stat-number">{stats.login_stats.successful}</span>
              </div>
              <div className="chart-stat-item failed">
                <span className="stat-label">Échouées:</span>
                <span className="stat-number">{stats.login_stats.failed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;

