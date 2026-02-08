import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Tables.css';
import '../../styles/EmployeeRequests.css';

const EmployeeRequests = () => {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    leaves: 0,
    absences: 0,
    documents: 0
  });

  useEffect(() => {
    // Simulate API call to fetch requests and statistics
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // In a real application, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Mock data for requests
        const mockRequests = [
          {
            id: 1,
            employee_id: 1,
            nom_prenom: 'John Doe',
            poste_actuel: 'Développeur Senior',
            entity: 'Informatique',
            email: 'john.doe@example.com',
            request_type: 'leave',
            request_details: 'Je souhaite prendre 5 jours de congés pour raisons personnelles.',
            reason: 'Raisons personnelles',
            start_date: '2025-07-15',
            end_date: '2025-07-20',
            request_date: '2025-06-15 09:30:00',
            status: 'pending',
            response_date: null,
            response_comments: null
          },
          {
            id: 2,
            employee_id: 2,
            nom_prenom: 'Jane Smith',
            poste_actuel: 'Chef de projet',
            entity: 'Marketing',
            email: 'jane.smith@example.com',
            request_type: 'document',
            request_details: 'J\'ai besoin d\'une attestation de travail pour mon dossier de prêt bancaire.',
            reason: 'Prêt bancaire',
            start_date: null,
            end_date: null,
            request_date: '2025-06-10 14:45:00',
            status: 'approved',
            response_date: '2025-06-12 10:15:00',
            response_comments: 'Attestation générée et envoyée par email.'
          },
          {
            id: 3,
            employee_id: 3,
            nom_prenom: 'Robert Johnson',
            poste_actuel: 'Technicien',
            entity: 'Production',
            email: 'robert.johnson@example.com',
            request_type: 'absence',
            request_details: 'Je dois m\'absenter pour un rendez-vous médical.',
            reason: 'Rendez-vous médical',
            start_date: '2025-06-20',
            end_date: '2025-06-20',
            request_date: '2025-06-05 11:20:00',
            status: 'rejected',
            response_date: '2025-06-07 08:45:00',
            response_comments: 'Veuillez fournir un justificatif médical.'
          },
          {
            id: 4,
            employee_id: 4,
            nom_prenom: 'Sarah Williams',
            poste_actuel: 'Responsable RH',
            entity: 'Ressources Humaines',
            email: 'sarah.williams@example.com',
            request_type: 'document',
            request_details: 'Demande de certificat de salaire pour les 6 derniers mois.',
            reason: 'Dossier administratif',
            start_date: null,
            end_date: null,
            request_date: '2025-06-08 16:30:00',
            status: 'pending',
            response_date: null,
            response_comments: null
          }
        ];
        
        // Calculate statistics
        const mockStats = {
          total: mockRequests.length,
          pending: mockRequests.filter(req => req.status === 'pending').length,
          approved: mockRequests.filter(req => req.status === 'approved').length,
          rejected: mockRequests.filter(req => req.status === 'rejected').length,
          leaves: mockRequests.filter(req => req.request_type === 'leave').length,
          absences: mockRequests.filter(req => req.request_type === 'absence').length,
          documents: mockRequests.filter(req => req.request_type === 'document').length
        };
        
        // Filter requests based on filters
        let filteredRequests = [...mockRequests];
        
        if (status) {
          filteredRequests = filteredRequests.filter(req => req.status === status);
        }
        
        if (type) {
          filteredRequests = filteredRequests.filter(req => req.request_type === type);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredRequests = filteredRequests.filter(req => 
            req.nom_prenom.toLowerCase().includes(searchLower) || 
            req.request_details.toLowerCase().includes(searchLower) || 
            req.reason.toLowerCase().includes(searchLower)
          );
        }
        
        setRequests(filteredRequests);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [status, type, search]);

  // Handle form submission
  const handleFilter = (e) => {
    e.preventDefault();
    // The useEffect hook will handle the filtering
  };

  // Handle approve request
  const handleApprove = () => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? {
                ...req, 
                status: 'approved',
                response_date: new Date().toISOString(),
                response_comments: comments
              } 
            : req
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
      
      setSuccessMessage(`La demande #${selectedRequest.id} a été approuvée.`);
      setIsSubmitting(false);
      setShowApproveModal(false);
      setComments('');
      setSelectedRequest(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  // Handle reject request
  const handleReject = () => {
    if (!selectedRequest) return;
    if (!comments.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? {
                ...req, 
                status: 'rejected',
                response_date: new Date().toISOString(),
                response_comments: comments
              } 
            : req
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      setSuccessMessage(`La demande #${selectedRequest.id} a été refusée.`);
      setIsSubmitting(false);
      setShowRejectModal(false);
      setComments('');
      setSelectedRequest(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  // Get employee initials
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
    
    return initials || 'U';
  };

  // Get request type icon, class and text
  const getRequestTypeInfo = (type) => {
    switch (type) {
      case 'leave':
        return {
          icon: 'fas fa-calendar-alt',
          class: 'bg-primary text-white',
          text: 'Congé'
        };
      case 'absence':
        return {
          icon: 'fas fa-clock',
          class: 'bg-danger text-white',
          text: 'Absence'
        };
      case 'document':
        return {
          icon: 'fas fa-file-alt',
          class: 'bg-warning text-dark',
          text: 'Document'
        };
      default:
        return {
          icon: 'fas fa-question',
          class: 'bg-secondary text-white',
          text: 'Autre'
        };
    }
  };

  // Get status class and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          class: 'status-pending',
          text: 'En attente'
        };
      case 'approved':
        return {
          class: 'status-approved',
          text: 'Approuvé'
        };
      case 'rejected':
        return {
          class: 'status-rejected',
          text: 'Refusé'
        };
      default:
        return {
          class: '',
          text: 'Inconnu'
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Demandes des employés</h1>
          <p className="page-subtitle">Gérez les demandes administratives et documentaires des employés.</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>{successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card text-center">
            <div className="stats-icon bg-primary-light text-primary rounded-circle p-3 mb-3 mx-auto">
              <i className="fas fa-tasks fa-lg"></i>
            </div>
            <h3 className="mb-0">{stats.total}</h3>
            <p className="text-muted mb-0">Demandes totales</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card text-center">
            <div className="stats-icon bg-warning-light text-warning rounded-circle p-3 mb-3 mx-auto">
              <i className="fas fa-clock fa-lg"></i>
            </div>
            <h3 className="mb-0">{stats.pending}</h3>
            <p className="text-muted mb-0">En attente</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card text-center">
            <div className="stats-icon bg-success-light text-success rounded-circle p-3 mb-3 mx-auto">
              <i className="fas fa-check-circle fa-lg"></i>
            </div>
            <h3 className="mb-0">{stats.approved}</h3>
            <p className="text-muted mb-0">Approuvées</p>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card text-center">
            <div className="stats-icon bg-danger-light text-danger rounded-circle p-3 mb-3 mx-auto">
              <i className="fas fa-times-circle fa-lg"></i>
            </div>
            <h3 className="mb-0">{stats.rejected}</h3>
            <p className="text-muted mb-0">Refusées</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <form onSubmit={handleFilter} className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Rechercher..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="leave">Congés</option>
              <option value="absence">Absences</option>
              <option value="document">Documents</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Filtrer</button>
          </div>
        </form>
      </div>

      {/* Request List */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h3>Aucune demande trouvée</h3>
          <p className="text-muted">Il n'y a aucune demande correspondant à vos critères de recherche.</p>
        </div>
      ) : (
        requests.map(request => {
          const requestTypeInfo = getRequestTypeInfo(request.request_type);
          const statusInfo = getStatusInfo(request.status);
          
          return (
            <div className="request-card" key={request.id}>
              <div className="request-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="employee-avatar me-3">{getInitials(request.nom_prenom)}</div>
                  <div>
                    <h5 className="mb-0">{request.nom_prenom}</h5>
                    <p className="text-muted mb-0 small">{request.poste_actuel} - {request.entity}</p>
                  </div>
                </div>
                <div>
                  <span className={`request-badge ${requestTypeInfo.class}`}>
                    <i className={`${requestTypeInfo.icon} me-1`}></i>{requestTypeInfo.text}
                  </span>
                  <span className={`request-badge status-badge ${statusInfo.class} ms-2`}>{statusInfo.text}</span>
                </div>
              </div>
              
              <div className="request-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Détails de la demande</h6>
                    <p>{request.request_details}</p>
                    
                    {(request.request_type === 'leave' || request.request_type === 'absence') && (
                      <div className="d-flex flex-wrap mb-3">
                        <div className="me-4">
                          <span className="text-muted small">Date de début:</span>
                          <div className="fw-bold">{formatDate(request.start_date)}</div>
                        </div>
                        {request.end_date && (
                          <div>
                            <span className="text-muted small">Date de fin:</span>
                            <div className="fw-bold">{formatDate(request.end_date)}</div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted small">Motif:</span>
                      <div>{request.reason}</div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6>Informations de la demande</h6>
                    <div className="d-flex flex-wrap">
                      <div className="me-4 mb-3">
                        <span className="text-muted small">ID de demande:</span>
                        <div className="fw-bold">#{request.id}</div>
                      </div>
                      <div className="mb-3">
                        <span className="text-muted small">Date de demande:</span>
                        <div className="fw-bold">{formatDateTime(request.request_date)}</div>
                      </div>
                    </div>
                    
                    {request.status !== 'pending' && (
                      <>
                        <div>
                          <span className="text-muted small">Date de réponse:</span>
                          <div className="fw-bold">{formatDateTime(request.response_date)}</div>
                        </div>
                        
                        {request.response_comments && (
                          <div className="mt-2">
                            <span className="text-muted small">Commentaires:</span>
                            <div className="mt-1 p-2 bg-light rounded">{request.response_comments}</div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="mt-3">
                      <span className="text-muted small">Contact:</span>
                      <div>
                        <a href={`mailto:${request.email}`} className="text-decoration-none">
                          <i className="fas fa-envelope me-1"></i>{request.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="request-footer d-flex justify-content-end">
                  <button 
                    className="btn btn-success btn-action me-2" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowApproveModal(true);
                    }}
                  >
                    <i className="fas fa-check me-1"></i>Approuver
                  </button>
                  <button 
                    className="btn btn-danger btn-action" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                  >
                    <i className="fas fa-times me-1"></i>Refuser
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Approuver la demande</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowApproveModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Vous êtes sur le point d'approuver la demande #{selectedRequest.id} de {selectedRequest.nom_prenom}.</p>
              
              <div className="mb-3">
                <label htmlFor="approveComments" className="form-label">Commentaires (optionnel):</label>
                <textarea 
                  className="form-control" 
                  id="approveComments" 
                  rows="3" 
                  placeholder="Ajouter des commentaires pour l'employé..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowApproveModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <>Confirmer l'approbation</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Refuser la demande</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowRejectModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Vous êtes sur le point de refuser la demande #{selectedRequest.id} de {selectedRequest.nom_prenom}.</p>
              
              <div className="mb-3">
                <label htmlFor="rejectComments" className="form-label">Motif du refus:</label>
                <textarea 
                  className="form-control" 
                  id="rejectComments" 
                  rows="3" 
                  placeholder="Veuillez indiquer le motif du refus..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                ></textarea>
                {comments.trim() === '' && (
                  <div className="form-text text-danger">Le motif de refus est requis.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowRejectModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleReject}
                disabled={comments.trim() === '' || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <>Confirmer le refus</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeRequests;