import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Tables.css';
import '../../styles/EmployeeRequests.css';

const HRDocumentRequests = () => {
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    documents: 0
  });

  useEffect(() => {
    // Simuler un appel API pour récupérer les demandes et statistiques
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // Dans une application réelle, ceci serait un appel API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai réseau
        
        // Données fictives pour les demandes
        const mockRequests = [
          {
            id: 1,
            employee_id: 1,
            nom_prenom: 'John Doe',
            poste_actuel: 'Développeur Senior',
            entity: 'Informatique',
            email: 'john.doe@example.com',
            request_type: 'document',
            document_type: 'Attestation de travail',
            request_details: 'Attestation de travail pour formalités administratives',
            reason: 'Dossier administratif',
            format: 'PDF',
            urgency: 'Normale',
            request_date: '2025-06-15 09:30:00',
            status: 'pending',
            response_date: null,
            response_comments: null,
            document_url: null
          },
          {
            id: 2,
            employee_id: 2,
            nom_prenom: 'Jane Smith',
            poste_actuel: 'Chef de projet',
            entity: 'Marketing',
            email: 'jane.smith@example.com',
            request_type: 'document',
            document_type: 'Bulletin de salaire',
            request_details: 'Bulletin de salaire du mois de mai 2025',
            reason: 'Prêt bancaire',
            format: 'PDF',
            urgency: 'Haute',
            request_date: '2025-06-10 14:45:00',
            status: 'approved',
            response_date: '2025-06-12 10:15:00',
            response_comments: 'Document généré et envoyé par email.',
            document_url: 'https://example.com/bulletins/jane_smith_052025.pdf'
          },
          {
            id: 3,
            employee_id: 3,
            nom_prenom: 'Robert Johnson',
            poste_actuel: 'Technicien',
            entity: 'Production',
            email: 'robert.johnson@example.com',
            request_type: 'document',
            document_type: 'Certificat de travail',
            request_details: 'Certificat de travail pour dossier de visa',
            reason: 'Visa touristique',
            format: 'Papier',
            urgency: 'Très urgente',
            request_date: '2025-06-05 11:20:00',
            status: 'rejected',
            response_date: '2025-06-07 08:45:00',
            response_comments: 'Veuillez fournir plus de détails concernant les dates exactes de votre séjour à l\'étranger.',
            document_url: null
          },
          {
            id: 4,
            employee_id: 4,
            nom_prenom: 'Sarah Williams',
            poste_actuel: 'Responsable RH',
            entity: 'Ressources Humaines',
            email: 'sarah.williams@example.com',
            request_type: 'document',
            document_type: 'Attestation de salaire',
            request_details: 'Attestation de salaire pour les 6 derniers mois',
            reason: 'Dossier administratif',
            format: 'PDF',
            urgency: 'Normale',
            request_date: '2025-06-08 16:30:00',
            status: 'pending',
            response_date: null,
            response_comments: null,
            document_url: null
          }
        ];
        
        // Calculer les statistiques
        const mockStats = {
          total: mockRequests.length,
          pending: mockRequests.filter(req => req.status === 'pending').length,
          approved: mockRequests.filter(req => req.status === 'approved').length,
          rejected: mockRequests.filter(req => req.status === 'rejected').length,
          documents: mockRequests.length
        };
        
        // Filtrer les demandes selon les filtres
        let filteredRequests = [...mockRequests];
        
        if (status) {
          filteredRequests = filteredRequests.filter(req => req.status === status);
        }
        
        if (type) {
          filteredRequests = filteredRequests.filter(req => req.document_type.toLowerCase().includes(type.toLowerCase()));
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
        console.error('Erreur lors de la récupération des demandes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [status, type, search]);

  // Gérer la soumission du formulaire de filtre
  const handleFilter = (e) => {
    e.preventDefault();
    // Le hook useEffect gérera le filtrage
  };

  // Gérer le téléchargement de fichier
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Gérer l'approbation avec téléchargement de document
  const handleUpload = () => {
    if (!selectedRequest) return;
    if (!uploadedFile && !comments.trim()) return;
    
    setIsSubmitting(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? {
                ...req, 
                status: 'approved',
                response_date: new Date().toISOString(),
                response_comments: comments,
                document_url: uploadedFile ? URL.createObjectURL(uploadedFile) : null
              } 
            : req
        )
      );
      
      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
      
      setSuccessMessage(`Le document a été envoyé pour la demande #${selectedRequest.id}.`);
      setIsSubmitting(false);
      setShowUploadModal(false);
      setComments('');
      setUploadedFile(null);
      setSelectedRequest(null);
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  // Gérer le rejet de la demande
  const handleReject = () => {
    if (!selectedRequest) return;
    if (!comments.trim()) return;
    
    setIsSubmitting(true);
    
    // Simuler un appel API
    setTimeout(() => {
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? {
                ...req, 
                status: 'rejected',
                response_date: new Date().toISOString(),
                response_comments: comments,
                document_url: null
              } 
            : req
        )
      );
      
      // Mettre à jour les statistiques
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
      
      // Effacer le message de succès après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }, 1000);
  };

  // Obtenir les initiales de l'employé
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
    
    return initials || 'U';
  };

  // Obtenir la classe et le texte de l'urgence
  const getUrgencyInfo = (urgency) => {
    switch (urgency) {
      case 'Haute':
        return {
          class: 'bg-danger text-white',
          text: 'Haute'
        };
      case 'Normale':
        return {
          class: 'bg-primary text-white',
          text: 'Normale'
        };
      case 'Très urgente':
        return {
          class: 'bg-danger text-white',
          text: 'Très urgente'
        };
      case 'Basse':
        return {
          class: 'bg-success text-white',
          text: 'Basse'
        };
      default:
        return {
          class: 'bg-secondary text-white',
          text: urgency || 'Non définie'
        };
    }
  };

  // Obtenir la classe et le texte du statut
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

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Formater la date et l'heure
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des demandes de documents</h1>
          <p className="page-subtitle">Traitez et répondez aux demandes de documents des employés.</p>
        </div>
      </div>

      {/* Message de succès */}
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

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-4">
          <div className="stats-card text-center">
            <div className="stats-icon bg-primary-light text-primary rounded-circle p-3 mb-3 mx-auto">
              <i className="fas fa-file-alt fa-lg"></i>
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
            <p className="text-muted mb-0">Traitées</p>
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

      {/* Filtres */}
      <div className="filters">
        <form onSubmit={handleFilter} className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Rechercher un employé ou une demande..." 
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
              <option value="">Tous les types de documents</option>
              <option value="attestation">Attestations</option>
              <option value="bulletin">Bulletins de salaire</option>
              <option value="certificat">Certificats</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Filtrer</button>
          </div>
        </form>
      </div>

      {/* Liste des demandes */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
          <h3>Aucune demande trouvée</h3>
          <p className="text-muted">Il n'y a aucune demande correspondant à vos critères de recherche.</p>
        </div>
      ) : (
        requests.map(request => {
          const urgencyInfo = getUrgencyInfo(request.urgency);
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
                  <span className="request-badge bg-info text-white">
                    <i className="fas fa-file-alt me-1"></i>{request.document_type}
                  </span>
                  <span className={`request-badge ${urgencyInfo.class} ms-2`}>
                    <i className="fas fa-exclamation-circle me-1"></i>{urgencyInfo.text}
                  </span>
                  <span className={`request-badge status-badge ${statusInfo.class} ms-2`}>{statusInfo.text}</span>
                </div>
              </div>
              
              <div className="request-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Détails de la demande</h6>
                    <p>{request.request_details}</p>
                    
                    <div>
                      <span className="text-muted small">Motif:</span>
                      <div>{request.reason}</div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="text-muted small">Format souhaité:</span>
                      <div className="badge bg-secondary mt-1">{request.format}</div>
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
                        
                        {request.document_url && (
                          <div className="mt-3">
                            <span className="text-muted small">Document:</span>
                            <div className="mt-1">
                              <a 
                                href={request.document_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fas fa-download me-1"></i>Voir le document
                              </a>
                            </div>
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
                      setShowUploadModal(true);
                    }}
                  >
                    <i className="fas fa-upload me-1"></i>Envoyer un document
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

      {/* Modal d'envoi de document */}
      {showUploadModal && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Envoyer un document</h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowUploadModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Vous allez envoyer un document pour la demande #{selectedRequest.id} de {selectedRequest.nom_prenom}.</p>
              
              <div className="mb-3">
                <label htmlFor="documentFile" className="form-label">Document:</label>
                <input 
                  type="file" 
                  className="form-control" 
                  id="documentFile" 
                  onChange={handleFileChange}
                />
                <div className="form-text">Formats acceptés: PDF, DOCX, JPG, PNG (max. 10 Mo)</div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="uploadComments" className="form-label">Commentaires:</label>
                <textarea 
                  className="form-control" 
                  id="uploadComments" 
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
                onClick={() => setShowUploadModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={handleUpload}
                disabled={!uploadedFile && !comments.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <><i className="fas fa-paper-plane me-1"></i>Envoyer le document</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
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
                  <><i className="fas fa-times me-1"></i>Confirmer le refus</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HRDocumentRequests;