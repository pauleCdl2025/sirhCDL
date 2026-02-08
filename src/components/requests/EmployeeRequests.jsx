import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { requestService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/EmployeeRequests.css';

const EmployeeRequests = () => {
  // États principaux
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailView, setDetailView] = useState(false);
  const [comments, setComments] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'request_date', direction: 'desc' });

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

  // Filtres
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    priority: ''
  });

  // Modales
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  
  // Fonction pour afficher des notifications
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);
  
  // Récupération des données
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les demandes
      const requestsData = await requestService.getAll();
      setRequests(requestsData);
      
      // Récupérer les statistiques
      const statsData = await requestService.getStatistics();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching requests data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Filtrage et tri des demandes
  useEffect(() => {
    let result = [...requests];
    
    // Appliquer les filtres
    if (filters.status) {
      result = result.filter(req => req.status === filters.status);
    }
    
    if (filters.type) {
      result = result.filter(req => req.request_type === filters.type);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(req => 
        req.nom_prenom?.toLowerCase().includes(searchLower) ||
        req.request_details?.toLowerCase().includes(searchLower) ||
        req.id?.toString().includes(searchLower)
      );
    }
    
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(req => new Date(req.request_date) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // Fin de la journée
      result = result.filter(req => new Date(req.request_date) <= toDate);
    }
    
    if (filters.priority) {
      result = result.filter(req => req.priority === filters.priority);
    }
    
    // Appliquer le tri
    result.sort((a, b) => {
      // Gestion spéciale pour les dates
      if (['request_date', 'response_date', 'start_date', 'end_date'].includes(sortConfig.key)) {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]) : new Date(0);
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]) : new Date(0);
        
        return sortConfig.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      
      // Pour les autres champs
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredRequests(result);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [requests, filters, sortConfig]);

  // Gestion de la pagination
  const paginatedRequests = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredRequests, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRequests.length / itemsPerPage);
  }, [filteredRequests, itemsPerPage]);

  // Changer de page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: '',
      type: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      priority: ''
    });
  };
  
  // Gestion des changements de filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Gestion du tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Gérer l'approbation d'une demande
  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setLoadingAction(true);
    setError(null);
    
    try {
      // Appeler l'API pour approuver la demande
      const result = await requestService.approve(selectedRequest.id, comments);
      
      // Mettre à jour la liste des demandes
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id ? { ...req, ...result } : req
        )
      );
      
      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        approved: prev.approved + 1
      }));
      
      showNotification(`La demande #${selectedRequest.id} a été approuvée avec succès.`);
      setShowApproveModal(false);
      setComments('');
      
      // Émettre un événement pour la mise à jour en temps réel
      window.dispatchEvent(new CustomEvent('requestProcessed', {
        detail: { requestId: selectedRequest.id, action: 'approved' }
      }));
      
      // Si on est en vue détaillée, mettre à jour la demande sélectionnée
      if (detailView) {
        setSelectedRequest(result);
      } else {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Erreur lors de l\'approbation de la demande. Veuillez réessayer.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Gérer le refus d'une demande
  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!comments.trim()) return;
    
    setLoadingAction(true);
    setError(null);
    
    try {
      // Appeler l'API pour rejeter la demande
      const result = await requestService.reject(selectedRequest.id, null, comments);
      
      // Mettre à jour la liste des demandes
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id ? { ...req, ...result } : req
        )
      );
      
      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1
      }));
      
      showNotification(`La demande #${selectedRequest.id} a été refusée.`, 'warning');
      setShowRejectModal(false);
      setComments('');
      
      // Émettre un événement pour la mise à jour en temps réel
      window.dispatchEvent(new CustomEvent('requestProcessed', {
        detail: { requestId: selectedRequest.id, action: 'rejected' }
      }));
      
      // Si on est en vue détaillée, mettre à jour la demande sélectionnée
      if (detailView) {
        setSelectedRequest(result);
      } else {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Erreur lors du refus de la demande. Veuillez réessayer.');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Gérer l'exportation des données
  const handleExport = async (format) => {
    setLoadingAction(true);
    
    try {
      if (format === 'csv') {
        await requestService.exportToCSV(filteredRequests);
      } else if (format === 'excel') {
        await requestService.exportToExcel(filteredRequests);
      } else if (format === 'pdf') {
        await requestService.exportToPDF(filteredRequests);
      }
      
      showNotification(`Exportation en ${format.toUpperCase()} réussie`);
      setShowExportModal(false);
    } catch (err) {
      console.error(`Error exporting to ${format}:`, err);
      setError(`Erreur lors de l'exportation en ${format.toUpperCase()}`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Gérer la suppression de toutes les demandes
  const handleDeleteAll = async () => {
    setLoadingAction(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/requests/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
      
      const result = await response.json();
      
      // Réinitialiser les données
      setRequests([]);
      setFilteredRequests([]);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        leaves: 0,
        absences: 0,
        documents: 0
      });
      
      showNotification(`Toutes les demandes ont été supprimées avec succès (${result.deletedCount} lignes supprimées)`, 'success');
      setShowDeleteAllModal(false);
      setConfirmDeleteAll(false);
      
      // Émettre un événement pour la mise à jour en temps réel
      window.dispatchEvent(new CustomEvent('allRequestsDeleted'));
    } catch (err) {
      console.error('Error deleting all requests:', err);
      setError(err.message || 'Erreur lors de la suppression de toutes les demandes. Veuillez réessayer.');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Visualiser les détails d'une demande
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailView(true);
  };
  
  // Obtenir les initiales d'un employé
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
    
    return initials || 'U';
  };

  // Obtenir les informations de type de demande
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

  // Obtenir les informations de statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          class: 'status-pending',
          text: 'En attente',
          icon: 'fas fa-clock'
        };
      case 'approved':
        return {
          class: 'status-approved',
          text: 'Approuvé',
          icon: 'fas fa-check-circle'
        };
      case 'rejected':
        return {
          class: 'status-rejected',
          text: 'Refusé',
          icon: 'fas fa-times-circle'
        };
      default:
        return {
          class: '',
          text: 'Inconnu',
          icon: 'fas fa-question-circle'
        };
    }
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Formater une date et heure
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="employee-requests-container">
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Demandes des employés</h1>
          <p className="page-subtitle">Gérez les demandes administratives et documentaires des employés.</p>
        </div>
        <div className="title-actions">
          <button 
            className="btn btn-outline-danger me-2" 
            onClick={() => setShowDeleteAllModal(true)}
            disabled={requests.length === 0}
            title={requests.length === 0 ? 'Aucune demande à supprimer' : 'Supprimer toutes les demandes'}
          >
            <i className="fas fa-trash-alt me-2"></i>Supprimer tout
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => setShowExportModal(true)}>
            <i className="fas fa-download me-2"></i>Exporter
          </button>
          <button className="btn btn-primary" onClick={fetchData}>
            <i className="fas fa-sync-alt me-2"></i>Actualiser
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification.show && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show animated fadeInDown`} role="alert">
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : notification.type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} me-2`}></i>
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          ></button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show animated fadeInDown" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>{error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Vue détaillée ou Vue liste */}
      {detailView && selectedRequest ? (
        <div className="detail-view-container animated fadeIn">
          {/* Navigation */}
          <div className="detail-nav">
            <button className="btn btn-link btn-back" onClick={() => {
              setDetailView(false);
              setSelectedRequest(null);
            }}>
              <i className="fas fa-arrow-left me-2"></i>Retour à la liste
            </button>
          </div>
          
          {/* En-tête de la demande */}
          <div className="request-detail-header">
            <div className="request-detail-header-left">
              <div className="detail-header-info">
                <div className="d-flex align-items-center">
                  <div className="employee-avatar-large me-3">
                    {getInitials(selectedRequest.nom_prenom)}
                  </div>
                  <div>
                    <h3 className="mb-1">{selectedRequest.nom_prenom}</h3>
                    <p className="text-muted mb-0">{selectedRequest.poste_actuel} - {selectedRequest.entity}</p>
                    <div className="d-flex mt-2">
                      <span className="me-3">
                        <i className="fas fa-envelope me-1 text-muted"></i> {selectedRequest.email || '-'}
                      </span>
                      <span>
                        <i className="fas fa-phone me-1 text-muted"></i> {selectedRequest.telephone || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="request-detail-header-right">
              <div className="d-flex align-items-center mb-2">
                <span className="me-2">ID de demande:</span>
                <span className="badge bg-secondary">#{selectedRequest.id}</span>
              </div>
              <div className="d-flex align-items-center">
                {/* Type de demande */}
                <div className="me-2">
                  {(() => {
                    const typeInfo = getRequestTypeInfo(selectedRequest.request_type);
                    return (
                      <span className={`request-badge ${typeInfo.class}`}>
                        <i className={`${typeInfo.icon} me-1`}></i>{typeInfo.text}
                      </span>
                    );
                  })()}
                </div>
                {/* Statut */}
                <div>
                  {(() => {
                    const statusInfo = getStatusInfo(selectedRequest.status);
                    return (
                      <span className={`request-badge status-badge ${statusInfo.class}`}>
                        <i className={`${statusInfo.icon} me-1`}></i>{statusInfo.text}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contenu de la demande */}
          <div className="request-detail-content">
            <div className="row">
              <div className="col-lg-8">
                <div className="content-card mb-4">
                  <h5 className="content-card-title">
                    <i className="fas fa-info-circle me-2"></i>Détails de la demande
                  </h5>
                  <div className="content-card-body">
                    <div className="request-description mb-4">
                      <h6>Description</h6>
                      <p>{selectedRequest.request_details || 'Aucune description fournie.'}</p>
                    </div>
                    
                    {(selectedRequest.request_type === 'leave' || selectedRequest.request_type === 'absence') && (
                      <div className="request-dates mb-4">
                        <h6>Période</h6>
                        <div className="row g-3">
                          <div className="col-md-3">
                            <div className="date-card">
                              <div className="date-card-label">Date de début</div>
                              <div className="date-card-value">{formatDate(selectedRequest.start_date)}</div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="date-card">
                              <div className="date-card-label">Date de fin</div>
                              <div className="date-card-value">{formatDate(selectedRequest.end_date)}</div>
                            </div>
                          </div>
                          {selectedRequest.start_time && (
                            <div className="col-md-3">
                              <div className="date-card">
                                <div className="date-card-label">Heure de début</div>
                                <div className="date-card-value">{selectedRequest.start_time}</div>
                              </div>
                            </div>
                          )}
                          {selectedRequest.end_time && (
                            <div className="col-md-3">
                              <div className="date-card">
                                <div className="date-card-label">Heure de fin</div>
                                <div className="date-card-value">{selectedRequest.end_time}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="request-reason mb-4">
                      <h6>Motif</h6>
                      <div className="reason-content">
                        {selectedRequest.reason || 'Aucun motif spécifié.'}
                      </div>
                    </div>
                    
                    {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                      <div className="request-attachments">
                        <h6>Pièces jointes</h6>
                        <div className="attachments-list">
                          {selectedRequest.attachments.map((attachment, index) => (
                            <div className="attachment-item" key={index}>
                              <i className="fas fa-paperclip me-2"></i>
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                {attachment.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4">
                <div className="content-card mb-4">
                  <h5 className="content-card-title">
                    <i className="fas fa-history me-2"></i>Historique
                  </h5>
                  <div className="content-card-body">
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-icon bg-primary">
                          <i className="fas fa-paper-plane"></i>
                        </div>
                        <div className="timeline-content">
                          <h6>Demande soumise</h6>
                          <div className="timeline-date">{formatDateTime(selectedRequest.request_date)}</div>
                        </div>
                      </div>
                      
                      {selectedRequest.status !== 'pending' && (
                        <div className="timeline-item">
                          <div className={`timeline-icon ${selectedRequest.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                            <i className={selectedRequest.status === 'approved' ? 'fas fa-check' : 'fas fa-times'}></i>
                          </div>
                          <div className="timeline-content">
                            <h6>{selectedRequest.status === 'approved' ? 'Demande approuvée' : 'Demande refusée'}</h6>
                            <div className="timeline-date">{formatDateTime(selectedRequest.response_date)}</div>
                            {selectedRequest.response_comments && (
                              <div className="timeline-comments mt-2">
                                <div className="comments-label">Commentaires:</div>
                                <div className="comments-content">{selectedRequest.response_comments}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedRequest.status === 'pending' && (
                  <div className="content-card action-card">
                    <h5 className="content-card-title">
                      <i className="fas fa-tasks me-2"></i>Actions
                    </h5>
                    <div className="content-card-body">
                      <button 
                        className="btn btn-success btn-block mb-2 w-100" 
                        onClick={() => setShowApproveModal(true)}
                      >
                        <i className="fas fa-check me-2"></i>Approuver la demande
                      </button>
                      <button 
                        className="btn btn-danger btn-block w-100" 
                        onClick={() => setShowRejectModal(true)}
                      >
                        <i className="fas fa-times me-2"></i>Refuser la demande
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="row mb-4">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stats-card text-center">
                <div className="stats-icon bg-primary-light text-primary rounded-circle p-3 mb-3 mx-auto">
                  <i className="fas fa-tasks fa-lg"></i>
                </div>
                <h3 className="mb-0 count-up">{stats.total}</h3>
                <p className="text-muted mb-0">Demandes totales</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stats-card text-center">
                <div className="stats-icon bg-warning-light text-warning rounded-circle p-3 mb-3 mx-auto">
                  <i className="fas fa-clock fa-lg"></i>
                </div>
                <h3 className="mb-0 count-up">{stats.pending}</h3>
                <p className="text-muted mb-0">En attente</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stats-card text-center">
                <div className="stats-icon bg-success-light text-success rounded-circle p-3 mb-3 mx-auto">
                  <i className="fas fa-check-circle fa-lg"></i>
                </div>
                <h3 className="mb-0 count-up">{stats.approved}</h3>
                <p className="text-muted mb-0">Approuvées</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stats-card text-center">
                <div className="stats-icon bg-danger-light text-danger rounded-circle p-3 mb-3 mx-auto">
                  <i className="fas fa-times-circle fa-lg"></i>
                </div>
                <h3 className="mb-0 count-up">{stats.rejected}</h3>
                <p className="text-muted mb-0">Refusées</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-container mb-4">
            <div className="filters-header" onClick={() => document.querySelector('.filters-body').classList.toggle('show')}>
              <h5 className="filters-title mb-0">
                <i className="fas fa-filter me-2"></i>Filtres
              </h5>
              <i className="fas fa-chevron-down"></i>
            </div>
            <div className="filters-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-search"></i></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Rechercher..." 
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select" 
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Refusé</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select" 
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les types</option>
                    <option value="leave">Congés</option>
                    <option value="absence">Absences</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select" 
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes priorités</option>
                    <option value="high">Haute</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Basse</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
                    <i className="fas fa-undo me-2"></i>Réinitialiser
                  </button>
                </div>
              </div>
              
              <div className="row g-3 mt-2">
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">Du</span>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="input-group">
                    <span className="input-group-text">Au</span>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <select 
                    className="form-select" 
                    name="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  >
                    <option value="5">5 par page</option>
                    <option value="10">10 par page</option>
                    <option value="20">20 par page</option>
                    <option value="50">50 par page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Request List */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state animated fadeIn">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h3>Aucune demande trouvée</h3>
              <p className="text-muted">Il n'y a aucune demande correspondant à vos critères de recherche.</p>
              {(filters.status || filters.type || filters.search || filters.dateFrom || filters.dateTo || filters.priority) && (
                <button className="btn btn-outline-primary" onClick={resetFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="requests-list animated fadeIn">
              <div className="result-info mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted">Affichage de </span>
                  <span className="fw-bold">{Math.min(filteredRequests.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredRequests.length, currentPage * itemsPerPage)}</span>
                  <span className="text-muted"> sur {filteredRequests.length} demandes</span>
                </div>
                <div className="sort-options">
                  <span className="text-muted me-2">Trier par:</span>
                  <div className="btn-group">
                    <button 
                      className={`btn btn-sm ${sortConfig.key === 'request_date' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => requestSort('request_date')}
                    >
                      Date
                      {sortConfig.key === 'request_date' && (
                        <i className={`ms-1 fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </button>
                    <button 
                      className={`btn btn-sm ${sortConfig.key === 'nom_prenom' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => requestSort('nom_prenom')}
                    >
                      Employé
                      {sortConfig.key === 'nom_prenom' && (
                        <i className={`ms-1 fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </button>
                    <button 
                      className={`btn btn-sm ${sortConfig.key === 'status' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => requestSort('status')}
                    >
                      Statut
                      {sortConfig.key === 'status' && (
                        <i className={`ms-1 fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {paginatedRequests.map((request, index) => {
                const requestTypeInfo = getRequestTypeInfo(request.request_type);
                const statusInfo = getStatusInfo(request.status);
                
                return (
                  <div className="request-card" key={request.id} style={{animationDelay: `${index * 0.05}s`}}>
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
                        <span className={`request-badge status-badge ${statusInfo.class} ms-2`}>
                          <i className={`${statusInfo.icon} me-1`}></i>{statusInfo.text}
                        </span>
                      </div>
                    </div>
                    
                    <div className="request-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6>Détails de la demande</h6>
                          <p className="request-details">{request.request_details}</p>
                          
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
                              {request.start_time && (
                                <div className="ms-4">
                                  <span className="text-muted small">Heure de début:</span>
                                  <div className="fw-bold">{request.start_time}</div>
                                </div>
                              )}
                              {request.end_time && (
                                <div className="ms-4">
                                  <span className="text-muted small">Heure de fin:</span>
                                  <div className="fw-bold">{request.end_time}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-6">
                          <h6>Informations de la demande</h6>
                          <div className="d-flex flex-wrap">
                            <div className="me-4 mb-2">
                              <span className="text-muted small">ID de demande:</span>
                              <div className="fw-bold">#{request.id}</div>
                            </div>
                            <div className="mb-2">
                              <span className="text-muted small">Date de demande:</span>
                              <div className="fw-bold">{formatDateTime(request.request_date)}</div>
                            </div>
                          </div>
                          
                          {request.status !== 'pending' && (
                            <div>
                              <span className="text-muted small">Date de réponse:</span>
                              <div className="fw-bold">{formatDateTime(request.response_date)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="request-footer d-flex justify-content-between align-items-center">
                      <button 
                        className="btn btn-link view-details-link" 
                        onClick={() => viewRequestDetails(request)}
                      >
                        <i className="fas fa-eye me-1"></i>Voir détails
                      </button>
                      
                      {request.status === 'pending' && (
                        <div>
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
                  </div>
                );
              })}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <nav aria-label="Pagination des demandes">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage - 1)}
                          aria-label="Précédent"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Afficher uniquement les pages adjacentes à la page courante
                        if (
                          pageNumber === 1 || 
                          pageNumber === totalPages || 
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        } else if (
                          (pageNumber === currentPage - 2 && currentPage > 3) ||
                          (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <li key={pageNumber} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => paginate(currentPage + 1)}
                          aria-label="Suivant"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="modal-backdrop animated fadeIn">
          <div className="modal-content animated zoomIn">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-check-circle text-success me-2"></i>
                Approuver la demande
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowApproveModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div className="alert alert-info">
                  <div className="d-flex">
                    <div className="me-3">
                      <i className="fas fa-info-circle fa-2x"></i>
                    </div>
                    <div>
                      <p className="mb-0">Vous êtes sur le point d'approuver la demande <strong>#{selectedRequest.id}</strong> de <strong>{selectedRequest.nom_prenom}</strong>.</p>
                      <p className="mb-0 mt-1">Type: <strong>{getRequestTypeInfo(selectedRequest.request_type).text}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              
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
                className="btn btn-outline-secondary" 
                onClick={() => setShowApproveModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={handleApprove}
                disabled={loadingAction}
              >
                {loadingAction ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Confirmer l'approbation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="modal-backdrop animated fadeIn">
          <div className="modal-content animated zoomIn">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-times-circle text-danger me-2"></i>
                Refuser la demande
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowRejectModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div className="alert alert-warning">
                  <div className="d-flex">
                    <div className="me-3">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <div>
                      <p className="mb-0">Vous êtes sur le point de refuser la demande <strong>#{selectedRequest.id}</strong> de <strong>{selectedRequest.nom_prenom}</strong>.</p>
                      <p className="mb-0 mt-1">Type: <strong>{getRequestTypeInfo(selectedRequest.request_type).text}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="rejectComments" className="form-label">Motif du refus:<span className="text-danger">*</span></label>
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
                className="btn btn-outline-secondary" 
                onClick={() => setShowRejectModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleReject}
                disabled={comments.trim() === '' || loadingAction}
              >
                {loadingAction ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ban me-2"></i>
                    Confirmer le refus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {showDeleteAllModal && (
        <div className="modal-backdrop animated fadeIn">
          <div className="modal-content animated zoomIn" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                Supprimer toutes les demandes
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setConfirmDeleteAll(false);
                }}
                disabled={loadingAction}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <div className="alert alert-danger">
                  <div className="d-flex">
                    <div className="me-3">
                      <i className="fas fa-exclamation-triangle fa-2x"></i>
                    </div>
                    <div>
                      <h6 className="alert-heading">Attention !</h6>
                      <p className="mb-0">Vous êtes sur le point de supprimer <strong>toutes les demandes</strong> des employés.</p>
                      <p className="mb-0 mt-2"><strong>Cette action est irréversible.</strong></p>
                      <p className="mb-0 mt-1">Nombre total de demandes à supprimer : <strong>{stats.total}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-muted">
                  <i className="fas fa-info-circle me-2"></i>
                  Toutes les demandes (en attente, approuvées et refusées) seront définitivement supprimées de la base de données.
                </p>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="confirmDeleteAll"
                  checked={confirmDeleteAll}
                  onChange={(e) => setConfirmDeleteAll(e.target.checked)}
                  required
                />
                <label className="form-check-label" htmlFor="confirmDeleteAll">
                  Je confirme vouloir supprimer toutes les demandes
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setConfirmDeleteAll(false);
                }}
                disabled={loadingAction}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeleteAll}
                disabled={loadingAction || !confirmDeleteAll}
              >
                {loadingAction ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Suppression...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt me-2"></i>
                    Supprimer toutes les demandes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-backdrop animated fadeIn">
          <div className="modal-content animated zoomIn" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-file-export me-2"></i>
                Exporter les données
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowExportModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Sélectionnez le format d'exportation souhaité :</p>
              
              <div className="export-options">
                <div className="export-option" onClick={() => handleExport('csv')}>
                  <div className="export-icon">
                    <i className="fas fa-file-csv"></i>
                  </div>
                  <div className="export-label">CSV</div>
                </div>
                <div className="export-option" onClick={() => handleExport('excel')}>
                  <div className="export-icon">
                    <i className="fas fa-file-excel"></i>
                  </div>
                  <div className="export-label">Excel</div>
                </div>
                <div className="export-option" onClick={() => handleExport('pdf')}>
                  <div className="export-icon">
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <div className="export-label">PDF</div>
                </div>
              </div>
              
              <div className="export-info mt-3">
                <p className="text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  L'exportation inclura {filteredRequests.length} demandes correspondant à vos filtres actuels.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setShowExportModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS supplémentaires */}
      <style>{`
        .employee-requests-container {
          position: relative;
        }
        
        .page-title-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .stats-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          height: 100%;
          transition: all 0.3s ease;
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .bg-primary-light {
          background-color: rgba(13, 110, 253, 0.1);
        }
        
        .bg-warning-light {
          background-color: rgba(255, 193, 7, 0.1);
        }
        
        .bg-success-light {
          background-color: rgba(25, 135, 84, 0.1);
        }
        
        .bg-danger-light {
          background-color: rgba(220, 53, 69, 0.1);
        }
        
        .stats-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .count-up {
          font-size: 2rem;
          font-weight: 600;
        }
        
        .filters-container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        
        .filters-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .filters-body {
          padding: 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .filters-body.show {
          max-height: 500px;
        }
        
        .request-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          overflow: hidden;
          animation: fadeInUp 0.3s ease forwards;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .request-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .request-body {
          padding: 1.5rem;
        }
        
        .request-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f0f0f0;
        }
        
        .employee-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .employee-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.25rem;
        }
        
        .request-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .status-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .status-pending {
          background-color: #ffc107;
          color: #212529;
        }
        
        .status-approved {
          background-color: #28a745;
          color: white;
        }
        
        .status-rejected {
          background-color: #dc3545;
          color: white;
        }
        
        .view-details-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          padding: 0;
        }
        
        .view-details-link:hover {
          text-decoration: underline;
        }
        
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .modal-content {
          background-color: white;
          border-radius: 10px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .modal-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .pagination-container {
          margin-top: 2rem;
        }
        
        .animated {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        
        .fadeIn {
          animation-name: fadeIn;
        }
        
        .fadeInDown {
          animation-name: fadeInDown;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .zoomIn {
          animation-name: zoomIn;
        }
        
        .detail-view-container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .detail-nav {
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .btn-back {
          color: #6c757d;
          text-decoration: none;
          padding: 0;
        }
        
        .btn-back:hover {
          color: #007bff;
        }
        
        .request-detail-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        
        .request-detail-header-left {
          flex: 1;
          min-width: 300px;
        }
        
        .request-detail-header-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
        }
        
        .request-detail-content {
          padding: 1.5rem;
        }
        
        .content-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .content-card-title {
          padding: 1rem;
          margin: 0;
          border-bottom: 1px solid #e9ecef;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .content-card-body {
          padding: 1rem;
        }
        
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        
        .timeline:before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 15px;
          width: 2px;
          background-color: #e9ecef;
        }
        
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .timeline-item:last-child {
          margin-bottom: 0;
        }
        
        .timeline-icon {
          position: absolute;
          left: -30px;
          top: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
        }
        
        .timeline-content {
          padding-bottom: 1rem;
        }
        
        .timeline-content h6 {
          margin-bottom: 0.25rem;
        }
        
        .timeline-date {
          font-size: 0.8rem;
          color: #6c757d;
        }
        
        .timeline-comments {
          background-color: white;
          border-radius: 4px;
          padding: 0.75rem;
          border-left: 3px solid #007bff;
        }
        
        .comments-label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .action-card {
          margin-top: 1rem;
        }
        
        .date-card {
          background-color: white;
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid #e9ecef;
        }
        
        .date-card-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }
        
        .date-card-value {
          font-weight: 600;
        }
        
        .reason-content {
          background-color: white;
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid #e9ecef;
        }
        
        .export-options {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .export-option {
          flex: 1;
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .export-option:hover {
          background-color: #f8f9fa;
        }
        
        .export-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .export-icon .fa-file-csv {
          color: #217346;
        }
        
        .export-icon .fa-file-excel {
          color: #217346;
        }
        
        .export-icon .fa-file-pdf {
          color: #dc3545;
        }
        
        @media (max-width: 768px) {
          .request-detail-header {
            flex-direction: column;
          }
          
          .request-detail-header-right {
            margin-top: 1rem;
            align-items: flex-start;
          }
          
          .export-options {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeRequests;


