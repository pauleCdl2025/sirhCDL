import React, { useState, useEffect } from 'react';
import '../../styles/AdminDeletedItems.css';
import { 
  FaTrash, FaSearch, FaFilter, FaClock, FaUser, FaUserTie, FaFileContract,
  FaCalendarAlt, FaEnvelope, FaIdCard, FaCheckCircle, FaEye
} from 'react-icons/fa';
import api from '../../services/api';

const AdminDeletedItems = () => {
  const [deletions, setDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });

  const fetchDeletions = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = 'admin/audit-logs/deletions?limit=500';
      
      if (filterEntityType !== 'all') {
        url += `&entityType=${filterEntityType}`;
      }
      
      if (filterDateRange.start) {
        url += `&startDate=${filterDateRange.start}`;
      }
      
      if (filterDateRange.end) {
        url += `&endDate=${filterDateRange.end}`;
      }

      console.log('📥 Récupération des suppressions depuis:', url);
      const response = await api.get(url);
      let data = response.data || [];
      console.log('✅ Suppressions reçues:', data.length, 'entrées');

      setDeletions(data);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suppressions:', error);
      setError(error.response?.data?.error || error.message || 'Erreur lors du chargement des suppressions');
    } finally {
      setLoading(false);
    }
  }, [filterEntityType, filterDateRange]);

  useEffect(() => {
    fetchDeletions();
  }, [fetchDeletions]);

  const filteredDeletions = deletions.filter(deletion => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (deletion.entity_name && deletion.entity_name.toLowerCase().includes(searchLower)) ||
        (deletion.user_email && deletion.user_email.toLowerCase().includes(searchLower)) ||
        (deletion.description && deletion.description.toLowerCase().includes(searchLower)) ||
        (deletion.entity_id && deletion.entity_id.toString().includes(searchLower));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

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

  const getEntityIcon = (entityType) => {
    const icons = {
      'employee': <FaUserTie />,
      'contract': <FaFileContract />,
      'conge': <FaCalendarAlt />,
      'leave_request': <FaCalendarAlt />,
      'employee_request': <FaEnvelope />,
      'recruitment': <FaIdCard />,
      'user': <FaUser />,
      'default': <FaTrash />
    };
    return icons[entityType] || icons.default;
  };

  const getEntityTypeLabel = (entityType) => {
    const labels = {
      'employee': 'Employé',
      'contract': 'Contrat',
      'conge': 'Congé',
      'leave_request': 'Demande de congé',
      'employee_request': 'Demande employé',
      'recruitment': 'Recrutement',
      'user': 'Utilisateur RH',
      'note': 'Note de service',
      'absence': 'Absence',
      'sanction': 'Sanction',
      'default': 'Autre'
    };
    return labels[entityType] || labels.default;
  };

  const getEntityTypeColor = (entityType) => {
    const colors = {
      'employee': '#295785',
      'contract': '#f57c00',
      'conge': '#00d1b2',
      'leave_request': '#00d1b2',
      'employee_request': '#3a8eba',
      'recruitment': '#7b1fa2',
      'user': '#e53e3e',
      'note': '#9c27b0',
      'absence': '#ff9800',
      'sanction': '#f44336',
      'default': '#718096'
    };
    return colors[entityType] || colors.default;
  };

  const parseChanges = (changes) => {
    if (!changes) return null;
    try {
      return typeof changes === 'string' ? JSON.parse(changes) : changes;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-deleted-items-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des suppressions...</p>
      </div>
    );
  }

  return (
    <div className="admin-deleted-items">
      <div className="deleted-items-header">
        <div>
          <h1>🗑️ Traçabilité des Suppressions</h1>
          <p className="deleted-items-subtitle">Historique complet de tous les éléments supprimés du système</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="deletions-stats">
        <div className="stat-card-deletion">
          <div className="stat-icon-deletion">
            <FaTrash />
          </div>
          <div className="stat-content-deletion">
            <div className="stat-value-deletion">{deletions.length}</div>
            <div className="stat-label-deletion">Total Suppressions</div>
          </div>
        </div>
        {['employee', 'contract', 'conge', 'employee_request'].map(type => {
          const count = deletions.filter(d => d.entity_type === type || d.entity_type === 'leave_request').length;
          return count > 0 ? (
            <div key={type} className="stat-card-deletion">
              <div className="stat-icon-deletion" style={{ color: getEntityTypeColor(type) }}>
                {getEntityIcon(type)}
              </div>
              <div className="stat-content-deletion">
                <div className="stat-value-deletion">{count}</div>
                <div className="stat-label-deletion">{getEntityTypeLabel(type)}</div>
              </div>
            </div>
          ) : null;
        })}
      </div>

      {/* Filtres */}
      <div className="deletions-filters">
        <div className="filter-group">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher dans les suppressions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <FaFilter />
          <select value={filterEntityType} onChange={(e) => setFilterEntityType(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="employee">Employés</option>
            <option value="contract">Contrats</option>
            <option value="conge">Congés</option>
            <option value="leave_request">Demandes de congé</option>
            <option value="employee_request">Demandes employés</option>
            <option value="recruitment">Recrutements</option>
            <option value="user">Utilisateurs RH</option>
            <option value="note">Notes de service</option>
            <option value="absence">Absences</option>
            <option value="sanction">Sanctions</option>
          </select>
        </div>
        <div className="filter-group">
          <FaClock />
          <input
            type="date"
            placeholder="Date début"
            value={filterDateRange.start}
            onChange={(e) => setFilterDateRange({ ...filterDateRange, start: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <FaClock />
          <input
            type="date"
            placeholder="Date fin"
            value={filterDateRange.end}
            onChange={(e) => setFilterDateRange({ ...filterDateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Liste des suppressions */}
      {error ? (
        <div className="error-message">{error}</div>
      ) : filteredDeletions.length === 0 ? (
        <div className="no-deletions">
          <FaCheckCircle size={48} />
          <h3>Aucune suppression trouvée</h3>
          <p>Aucun élément n'a été supprimé dans la période sélectionnée.</p>
        </div>
      ) : (
        <div className="deletions-table-container">
          <table className="deletions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Élément Supprimé</th>
                <th>Détails</th>
                <th>Supprimé Par</th>
                <th>Date de Suppression</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeletions.map(deletion => {
                const changes = parseChanges(deletion.changes);
                const entityColor = getEntityTypeColor(deletion.entity_type);
                
                return (
                  <tr key={deletion.id}>
                    <td>
                      <span 
                        className="entity-type-badge"
                        style={{ borderColor: entityColor, color: entityColor }}
                      >
                        {getEntityIcon(deletion.entity_type)}
                        {getEntityTypeLabel(deletion.entity_type)}
                      </span>
                    </td>
                    <td>
                      <div className="entity-name-cell">
                        <strong>{deletion.entity_name || 'Élément supprimé'}</strong>
                        {deletion.entity_id && (
                          <span className="entity-id">ID: {deletion.entity_id}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="details-cell">
                        {changes ? (
                          <details>
                            <summary>Voir les détails</summary>
                            <div className="changes-details">
                              {Object.entries(changes).map(([key, value]) => (
                                <div key={key} className="change-item">
                                  <strong>{key}:</strong> {value !== null && value !== undefined ? String(value) : 'N/A'}
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <span className="no-details">Aucun détail disponible</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-email">{deletion.user_email || deletion.user_id || 'Système'}</div>
                        <div className={`user-type-badge type-${deletion.user_type}`}>
                          {deletion.user_type === 'admin' ? 'Admin' : 
                           deletion.user_type === 'rh' ? 'RH' : 
                           deletion.user_type === 'employee' ? 'Employé' : 'Système'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <FaClock /> {formatDate(deletion.created_at)}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="view-details-btn"
                        title="Voir les détails"
                        onClick={() => {
                          alert(`Description: ${deletion.description || 'N/A'}\n\nDétails: ${changes ? JSON.stringify(changes, null, 2) : 'Aucun détail disponible'}`);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDeletedItems;

