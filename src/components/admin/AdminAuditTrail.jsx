import React, { useState, useEffect } from 'react';
import '../../styles/AdminAuditTrail.css';
import { FaShieldAlt, FaSearch, FaFilter, FaTrash, FaEdit, FaKey, FaPlus, FaEye } from 'react-icons/fa';
import api from '../../services/api';

const AdminAuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      let url = 'admin/audit-logs?limit=500';
      
      if (filterAction !== 'all') {
        url += `&actionType=${filterAction}`;
      }
      if (filterEntity !== 'all') {
        url += `&entityType=${filterEntity}`;
      }

      const response = await api.get(url);
      setLogs(response.data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.entity_name && log.entity_name.toLowerCase().includes(searchLower)) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchLower)) ||
      (log.entity_id && log.entity_id.toString().includes(searchLower)) ||
      (log.description && log.description.toLowerCase().includes(searchLower))
    );
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

  const getActionIcon = (actionType) => {
    const icons = {
      'delete': <FaTrash className="action-icon delete" />,
      'update': <FaEdit className="action-icon update" />,
      'create': <FaPlus className="action-icon create" />,
      'password_reset': <FaKey className="action-icon password" />,
      'login': <FaEye className="action-icon login" />
    };
    return icons[actionType] || <FaEdit className="action-icon" />;
  };

  const getActionLabel = (actionType) => {
    const labels = {
      'delete': 'Suppression',
      'update': 'Modification',
      'create': 'Création',
      'password_reset': 'Réinitialisation MDP',
      'login': 'Connexion',
      'logout': 'Déconnexion'
    };
    return labels[actionType] || actionType;
  };

  const getUserTypeBadge = (userType) => {
    const badges = {
      'admin': { label: 'Admin', class: 'badge-admin' },
      'rh': { label: 'RH', class: 'badge-rh' },
      'employee': { label: 'Employé', class: 'badge-employee' }
    };
    const badge = badges[userType] || { label: userType, class: 'badge-default' };
    return <span className={`user-type-badge ${badge.class}`}>{badge.label}</span>;
  };

  return (
    <div className="admin-audit-trail">
      <div className="admin-page-header">
        <h1>
          <FaShieldAlt /> Journal d'Audit - Traçabilité
        </h1>
        <button className="btn-secondary" onClick={fetchAuditLogs}>
          Actualiser
        </button>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher par nom, email, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
            <option value="all">Toutes les actions</option>
            <option value="delete">Suppressions</option>
            <option value="update">Modifications</option>
            <option value="create">Créations</option>
            <option value="password_reset">Réinitialisations MDP</option>
          </select>

          <select value={filterEntity} onChange={(e) => setFilterEntity(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="user">Utilisateurs RH</option>
            <option value="employee">Employés</option>
            <option value="contract">Contrats</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : (
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date/Heure</th>
                <th>Action</th>
                <th>Type</th>
                <th>Entité</th>
                <th>Utilisateur</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">Aucun log trouvé</td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.created_at)}</td>
                    <td>
                      <div className="action-cell">
                        {getActionIcon(log.action_type)}
                        <span>{getActionLabel(log.action_type)}</span>
                      </div>
                    </td>
                    <td>{getUserTypeBadge(log.entity_type)}</td>
                    <td>
                      <div className="entity-cell">
                        <strong>{log.entity_name || log.entity_id}</strong>
                        {log.entity_id && (
                          <small className="entity-id">ID: {log.entity_id}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        {getUserTypeBadge(log.user_type)}
                        <span>{log.user_email || log.user_id}</span>
                      </div>
                    </td>
                    <td className="description-cell">
                      {log.description || '-'}
                    </td>
                    <td>
                      <span className={`status-badge status-${log.status}`}>
                        {log.status === 'success' ? 'Succès' : 
                         log.status === 'failed' ? 'Échec' : log.status}
                      </span>
                    </td>
                    <td>
                      {log.changes && (
                        <button
                          className="btn-details"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FaEye /> Voir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour afficher les détails */}
      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'action</h2>
              <button className="modal-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Action:</strong> {getActionLabel(selectedLog.action_type)}
              </div>
              <div className="detail-row">
                <strong>Entité:</strong> {selectedLog.entity_name || selectedLog.entity_id}
              </div>
              <div className="detail-row">
                <strong>Utilisateur:</strong> {selectedLog.user_email || selectedLog.user_id}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {formatDate(selectedLog.created_at)}
              </div>
              <div className="detail-row">
                <strong>Description:</strong> {selectedLog.description}
              </div>
              {selectedLog.changes && (
                <div className="detail-row">
                  <strong>Modifications:</strong>
                  <pre className="changes-preview">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.error_message && (
                <div className="detail-row error">
                  <strong>Erreur:</strong> {selectedLog.error_message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="audit-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredLogs.filter(l => l.action_type === 'delete').length}</div>
          <div className="stat-label">Suppressions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredLogs.filter(l => l.action_type === 'update').length}</div>
          <div className="stat-label">Modifications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredLogs.filter(l => l.entity_type === 'user').length}</div>
          <div className="stat-label">Actions Utilisateurs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredLogs.filter(l => l.entity_type === 'employee').length}</div>
          <div className="stat-label">Actions Employés</div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditTrail;

