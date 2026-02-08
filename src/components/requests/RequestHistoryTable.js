import React from 'react';
import '../../styles/EmployeePortal.css';

const RequestHistoryTable = ({ 
  requests, 
  isLoading, 
  onViewDetails, 
  onFilterChange,
  getRequestTypeText,
  getStatusText,
  getStatusClass
}) => {
  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="history-card">
      <div className="history-card-header">
        <h3 className="history-card-title">Demandes récentes</h3>
        <div>
          <select 
            className="form-select form-select-sm" 
            id="historyFilter"
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">Toutes les demandes</option>
            <option value="leave">Congés</option>
            <option value="absence">Absences</option>
            <option value="document">Documents</option>
          </select>
        </div>
      </div>
      <div className="history-card-body">
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
                <td colSpan="5" className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  Aucune demande trouvée
                </td>
              </tr>
            ) : (
              requests.map((request) => (
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
                      className="btn btn-sm btn-outline-primary" 
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
  );
};

export default RequestHistoryTable;