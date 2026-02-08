import React from 'react';

const RequestDetailsModal = ({ request, onClose, show }) => {
  if (!show || !request) {
    return null;
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning text-dark">En attente</span>;
      case 'approved':
        return <span className="badge bg-success">Approuvée</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejetée</span>;
      case 'cancelled':
        return <span className="badge bg-secondary">Annulée</span>;
      case 'in_progress':
        return <span className="badge bg-info">En cours</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Get request type label
  const getRequestTypeLabel = () => {
    if (request.leaveType) return 'Demande de congé';
    if (request.absenceType) return 'Demande d\'absence';
    if (request.documentType) return 'Demande de document';
    return 'Demande';
  };

  // Get request details based on type
  const renderRequestDetails = () => {
    // Leave request
    if (request.leaveType) {
      const leaveTypeLabels = {
        'annual': 'Congé annuel',
        'sick': 'Congé maladie',
        'family': 'Congé familial',
        'special': 'Congé exceptionnel',
        'unpaid': 'Congé sans solde'
      };

      const durationLabels = {
        'full-day': 'Journée complète',
        'half-day-morning': 'Demi-journée (matin)',
        'half-day-afternoon': 'Demi-journée (après-midi)',
        'multiple-days': 'Plusieurs jours'
      };

      return (
        <>
          <div className="request-detail-item">
            <span className="detail-label">Type de congé:</span>
            <span className="detail-value">{leaveTypeLabels[request.leaveType] || request.leaveType}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Durée:</span>
            <span className="detail-value">{durationLabels[request.leaveDuration] || request.leaveDuration}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Date de début:</span>
            <span className="detail-value">{formatDate(request.startDate)}</span>
          </div>
          {request.endDate && request.leaveDuration === 'multiple-days' && (
            <div className="request-detail-item">
              <span className="detail-label">Date de fin:</span>
              <span className="detail-value">{formatDate(request.endDate)}</span>
            </div>
          )}
          <div className="request-detail-item">
            <span className="detail-label">Motif:</span>
            <span className="detail-value">{request.reason}</span>
          </div>
        </>
      );
    }
    
    // Absence request
    if (request.absenceType) {
      const absenceTypeLabels = {
        'sick': 'Maladie',
        'doctor': 'Rendez-vous médical',
        'family': 'Raison familiale',
        'personal': 'Raison personnelle',
        'other': 'Autre'
      };

      const durationLabels = {
        'full-day': 'Journée complète',
        'half-day-morning': 'Demi-journée (matin)',
        'half-day-afternoon': 'Demi-journée (après-midi)',
        'multiple-days': 'Plusieurs jours',
        'hours': 'Heures'
      };

      return (
        <>
          <div className="request-detail-item">
            <span className="detail-label">Type d'absence:</span>
            <span className="detail-value">{absenceTypeLabels[request.absenceType] || request.absenceType}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Durée:</span>
            <span className="detail-value">{durationLabels[request.absenceDuration] || request.absenceDuration}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Date de début:</span>
            <span className="detail-value">{formatDate(request.startDate)}</span>
          </div>
          {request.endDate && request.absenceDuration === 'multiple-days' && (
            <div className="request-detail-item">
              <span className="detail-label">Date de fin:</span>
              <span className="detail-value">{formatDate(request.endDate)}</span>
            </div>
          )}
          {request.absenceDuration === 'hours' && (
            <>
              <div className="request-detail-item">
                <span className="detail-label">Heure de début:</span>
                <span className="detail-value">{request.startTime || '-'}</span>
              </div>
              <div className="request-detail-item">
                <span className="detail-label">Heure de fin:</span>
                <span className="detail-value">{request.endTime || '-'}</span>
              </div>
            </>
          )}
          <div className="request-detail-item">
            <span className="detail-label">Motif:</span>
            <span className="detail-value">{request.reason}</span>
          </div>
        </>
      );
    }
    
    // Document request
    if (request.documentType) {
      const urgencyLabels = {
        'low': 'Faible - Dans les 2 semaines',
        'normal': 'Normal - Dans la semaine',
        'high': 'Élevé - Dans les 48 heures',
        'urgent': 'Urgent - Dans les 24 heures'
      };

      return (
        <>
          <div className="request-detail-item">
            <span className="detail-label">Type de document:</span>
            <span className="detail-value">{request.documentLabel || request.documentType}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Niveau d'urgence:</span>
            <span className="detail-value">{urgencyLabels[request.urgency] || request.urgency}</span>
          </div>
          <div className="request-detail-item">
            <span className="detail-label">Motif:</span>
            <span className="detail-value">{request.reason}</span>
          </div>
          {request.additionalInfo && (
            <div className="request-detail-item">
              <span className="detail-label">Informations complémentaires:</span>
              <span className="detail-value">{request.additionalInfo}</span>
            </div>
          )}
        </>
      );
    }
    
    // Generic fallback
    return (
      <div className="request-detail-item">
        <span className="detail-value">Aucun détail disponible pour cette demande.</span>
      </div>
    );
  };

  // Render approval info if available
  const renderApprovalInfo = () => {
    if (request.status === 'approved' && request.approvedBy) {
      return (
        <div className="approval-info approved">
          <div className="info-header">
            <i className="fas fa-check-circle me-2"></i>
            <span>Approuvée</span>
          </div>
          <div className="info-detail">
            <p>
              <strong>Par:</strong> {request.approvedBy}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(request.approvalDate)}
            </p>
            {request.approvalComments && (
              <p>
                <strong>Commentaire:</strong> {request.approvalComments}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    if (request.status === 'rejected' && request.rejectedBy) {
      return (
        <div className="approval-info rejected">
          <div className="info-header">
            <i className="fas fa-times-circle me-2"></i>
            <span>Rejetée</span>
          </div>
          <div className="info-detail">
            <p>
              <strong>Par:</strong> {request.rejectedBy}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(request.rejectionDate)}
            </p>
            {request.rejectionReason && (
              <p>
                <strong>Motif de rejet:</strong> {request.rejectionReason}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h5 className="modal-title">
            {getRequestTypeLabel()} - #{request.id}
          </h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="request-status-header">
            <div className="status-badge">
              {getStatusBadge(request.status)}
            </div>
            <div className="request-date">
              <small>Soumise le: {formatDate(request.submittedAt)}</small>
            </div>
          </div>
          
          <div className="request-details">
            {renderRequestDetails()}
          </div>
          
          {renderApprovalInfo()}
          
          {request.status === 'pending' && (
            <div className="request-actions mt-4">
              <p className="text-muted">
                <i className="fas fa-info-circle me-2"></i>
                Votre demande est en cours d'examen. Vous serez notifié(e) lorsqu'une décision sera prise.
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {request.status === 'pending' && (
            <button type="button" className="btn btn-outline-danger me-2">
              <i className="fas fa-ban me-2"></i>
              Annuler la demande
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;