import React, { useState } from 'react';
import { formatDate } from '../../utils/dateUtils';

const RequestHistory = ({ requests, isLoading, onViewDetails }) => {
  const [filter, setFilter] = useState('all');

  // Fonction pour convertir les types de demandes en texte lisible
  const getRequestTypeText = (type) => {
    switch (type) {
      case 'leave':
        return 'Congé';
      case 'absence':
        return 'Absence';
      case 'document':
        return 'Document';
      default:
        return 'Autre';
    }
  };

  // Fonction pour convertir les statuts en texte lisible
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Refusé';
      default:
        return 'Inconnu';
    }
  };

  // Fonction pour obtenir la classe CSS pour les statuts
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  // Filtrer les demandes en fonction du filtre sélectionné
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.request_type === filter;
  });

  return (
    <div className="history-section fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-history"></i>
        </div>
        <h2 className="section-title">Historique de mes demandes</h2>
      </div>
      
      <div className="history-card">
        <div className="history-card-header">
          <h3 className="history-card-title">Demandes récentes</h3>
          <div>
            <select 
              className="form-select form-select-sm" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Toutes les demandes</option>
              <option value="leave">Congés</option>
              <option value="absence">Absences</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>
        <div className="history-card-body">
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Détails</th>
                  <th>Date de demande</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      Chargement des demandes...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3">Aucune demande trouvée</td>
                  </tr>
                ) : (
                  filteredRequests.map(request => (
                    <tr key={request.id} data-request-type={request.request_type} className="request-row">
                      <td>{getRequestTypeText(request.request_type)}</td>
                      <td>{request.request_details}</td>
                      <td>{formatDate(request.request_date)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary view-details" 
                          onClick={() => onViewDetails(request)}
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHistory;