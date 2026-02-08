import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { sanctionService, employeeService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const SanctionManagement = () => {
  // États
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [sanctions, setSanctions] = useState([]);
  const [filteredSanctions, setFilteredSanctions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSanction, setSelectedSanction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sanctionToCancel, setSanctionToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [searchParams, setSearchParams] = useState({
    employee: '',
    type: '',
    status: '',
    dateStart: '',
    dateEnd: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    terminee: 0,
    annulee: 0,
    byType: {},
  });

  // Validation schema for sanction form
  const sanctionSchema = Yup.object().shape({
    nom_employe: Yup.string().required('L\'employé est requis'),
    type_sanction: Yup.string().required('Le type de sanction est requis'),
    contenu_sanction: Yup.string().required('Le contenu est requis').min(10, 'Le contenu doit contenir au moins 10 caractères'),
    date: Yup.date().required('La date est requise').max(new Date(), 'La date ne peut pas être dans le futur'),
    statut: Yup.string().required('Le statut est requis'),
    duree: Yup.number().when('type_sanction', {
      is: (val) => val === 'Mise à pied' || val === 'Suspension',
      then: () => Yup.number().required('La durée est requise pour ce type de sanction').positive('La durée doit être positive'),
      otherwise: () => Yup.number().nullable()
    })
  });

  // Sanction types
  const sanctionTypes = [
    'Avertissement',
    'Blâme',
    'Mise à pied',
    'Suspension',
    'Licenciement'
  ];

  // Sanction severity levels (memoized to avoid recreating on every render)
  const severityLevels = useMemo(() => ({
    'Avertissement': 1,
    'Blâme': 2,
    'Mise à pied': 3,
    'Suspension': 4,
    'Licenciement': 5
  }), []);

  // Statuts possibles
  const statutsList = [
    'En cours',
    'Terminée',
    'Annulée'
  ];

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Fetch sanctions and employees on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    let enCours = 0;
    let terminee = 0;
    let annulee = 0;
    const byType = {};
    
    sanctions.forEach(sanction => {
      // Count by status
      if (sanction.statut === 'En cours') enCours++;
      else if (sanction.statut === 'Terminée') terminee++;
      else if (sanction.statut === 'Annulée') annulee++;
      
      // Count by type
      byType[sanction.type_sanction] = (byType[sanction.type_sanction] || 0) + 1;
    });
    
    setStats({
      total: sanctions.length,
      enCours,
      terminee,
      annulee,
      byType
    });
  }, [sanctions]);

  // Fetch sanctions and employees from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data in parallel
      const [sanctionsData, employeesData] = await Promise.all([
        sanctionService.getAll(),
        employeeService.getAll()
      ]);
      
      setSanctions(sanctionsData);
      
      // Format employee data
      const formattedEmployees = employeesData.map(emp => ({
        id: emp.id,
        nom_prenom: emp.nom_prenom || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        department: emp.functional_area || emp.department || '',
        position: emp.poste_actuel || emp.position || ''
      }));
      
      setEmployees(formattedEmployees);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort sanctions
  const filterAndSortSanctions = useCallback(() => {
    let result = [...sanctions];
    
    // Filter by employee
    if (searchParams.employee) {
      const employeeLower = searchParams.employee.toLowerCase();
      result = result.filter(s => s.nom_employe.toLowerCase().includes(employeeLower));
    }
    
    // Filter by type
    if (searchParams.type) {
      result = result.filter(s => s.type_sanction === searchParams.type);
    }
    
    // Filter by status
    if (searchParams.status) {
      result = result.filter(s => s.statut === searchParams.status);
    }
    
    // Filter by date range
    if (searchParams.dateStart) {
      const startDate = new Date(searchParams.dateStart);
      result = result.filter(s => new Date(s.date) >= startDate);
    }
    
    if (searchParams.dateEnd) {
      const endDate = new Date(searchParams.dateEnd);
      endDate.setHours(23, 59, 59); // End of the day
      result = result.filter(s => new Date(s.date) <= endDate);
    }
    
    // Sort
    result.sort((a, b) => {
      let valueA = a[sortConfig.key];
      let valueB = b[sortConfig.key];
      
      // Convert dates to timestamps for comparison
      if (sortConfig.key === 'date' || sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      
      // For type_sanction, sort by severity level
      if (sortConfig.key === 'type_sanction') {
        valueA = severityLevels[valueA] || 0;
        valueB = severityLevels[valueB] || 0;
      }
      
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredSanctions(result);
  }, [sanctions, searchParams, sortConfig, severityLevels]);

  // Filter sanctions when search params or sort config changes
  useEffect(() => {
    filterAndSortSanctions();
  }, [sanctions, searchParams, sortConfig, filterAndSortSanctions]);

  // Calculate statistics when sanctions change
  useEffect(() => {
    calculateStats();
  }, [sanctions, calculateStats]);

  // Handle sort change
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle search params change
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  // Reset search filters
  const resetFilters = () => {
    setSearchParams({
      employee: '',
      type: '',
      status: '',
      dateStart: '',
      dateEnd: '',
    });
  };

  // Handle sanction submission
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Prepare data for API
      const sanctionData = {
        nom_employe: values.nom_employe,
        type_sanction: values.type_sanction,
        contenu_sanction: values.contenu_sanction,
        date: values.date,
        statut: values.statut,
        duree: values.duree || null
      };
      
      // Send data to API
      const response = await sanctionService.create(sanctionData);
      
      // Add the new sanction to the list
      setSanctions(prev => [response, ...prev]);
      
      // Success
      setSubmitSuccess(true);
      resetForm();
      showNotification('Sanction enregistrée avec succès!');
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting sanction:', error);
      setError('Erreur lors de l\'enregistrement de la sanction. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update sanction
  const handleUpdate = async (values) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare data for API
      const sanctionData = {
        id: values.id,
        nom_employe: values.nom_employe,
        type_sanction: values.type_sanction,
        contenu_sanction: values.contenu_sanction,
        date: values.date,
        statut: values.statut,
        duree: values.duree || null
      };
      
      // Send data to API
      const response = await sanctionService.update(sanctionData.id, sanctionData);
      
      // Update the sanction in the list
      setSanctions(prev => prev.map(s => s.id === response.id ? response : s));
      
      // Success
      showNotification('Sanction mise à jour avec succès!');
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating sanction:', error);
      setError('Erreur lors de la mise à jour de la sanction. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete sanction
  const handleDeleteSanction = async (sanctionId) => {
    try {
      // Call API to delete sanction
      await sanctionService.delete(sanctionId);
      
      // Remove from local state
      setSanctions(prev => prev.filter(s => s.id !== sanctionId));
      
      // Success notification
      showNotification('Sanction supprimée avec succès!', 'success');
      
      // Close delete modal
      setShowDeleteModal(false);
      setSelectedSanction(null);
    } catch (error) {
      console.error('Error deleting sanction:', error);
      setError('Erreur lors de la suppression de la sanction. Veuillez réessayer.');
    }
  };

  // Open delete modal
  const openDeleteModal = (sanction) => {
    setSelectedSanction(sanction);
    setShowDeleteModal(true);
  };

  // Handle view sanction details
  const handleViewDetails = (sanction) => {
    setSelectedSanction(sanction);
    setShowDetailsModal(true);
  };

  // Handle edit sanction
  const handleEditSanction = (sanction) => {
    setSelectedSanction(sanction);
    setShowEditModal(true);
  };

  // Handle cancel sanction
  const handleCancelSanction = (sanction) => {
    setSanctionToCancel(sanction);
    setShowCancelModal(true);
  };

  // Submit cancel sanction
  const submitCancelSanction = async () => {
    if (!sanctionToCancel || !cancelReason.trim()) {
      setError('Veuillez fournir un motif d\'annulation.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call API to cancel sanction
      const response = await sanctionService.cancel(sanctionToCancel.id, cancelReason);
      
      // Update sanctions list
      setSanctions(prev => 
        prev.map(s => s.id === sanctionToCancel.id ? response : s)
      );
      
      // Close modal and reset
      setShowCancelModal(false);
      setSanctionToCancel(null);
      setCancelReason('');
      
      // Show success notification
      showNotification('La sanction a été annulée avec succès.');
    } catch (error) {
      console.error('Error cancelling sanction:', error);
      setError('Erreur lors de l\'annulation de la sanction. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get sanction history and update status
  const updateSanctionStatus = async (id, newStatus) => {
    try {
      setIsLoading(true);
      
      // Call API to update status
      const response = await sanctionService.updateStatus(id, newStatus);
      
      // Update sanctions list
      setSanctions(prev => 
        prev.map(s => s.id === id ? response : s)
      );
      
      // Show success notification
      showNotification(`Statut de la sanction mis à jour: ${newStatus}`);
      
      // Close details modal if open
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error updating sanction status:', error);
      setError('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get badge class for sanction status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'En cours':
        return 'badge bg-warning text-dark';
      case 'Terminée':
        return 'badge bg-success';
      case 'Annulée':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  // Get class for sanction type
  const getSanctionTypeClass = (type) => {
    switch (type) {
      case 'Avertissement':
        return 'sanction-type-low';
      case 'Blâme':
        return 'sanction-type-medium';
      case 'Mise à pied':
        return 'sanction-type-high';
      case 'Suspension':
        return 'sanction-type-high';
      case 'Licenciement':
        return 'sanction-type-severe';
      default:
        return 'sanction-type-default';
    }
  };

  // Get icon for sanction type
  const getSanctionTypeIcon = (type) => {
    switch (type) {
      case 'Avertissement':
        return <i className="fas fa-exclamation-triangle text-warning me-2"></i>;
      case 'Blâme':
        return <i className="fas fa-thumbs-down text-danger me-2"></i>;
      case 'Mise à pied':
        return <i className="fas fa-user-slash text-danger me-2"></i>;
      case 'Suspension':
        return <i className="fas fa-user-lock text-danger me-2"></i>;
      case 'Licenciement':
        return <i className="fas fa-user-times text-danger me-2"></i>;
      default:
        return <i className="fas fa-gavel text-secondary me-2"></i>;
    }
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <div className="bg-primary text-white p-4 rounded mb-3" style={{background: 'linear-gradient(135deg, #3a7bd5, #00d1b2)'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="h2 mb-2 text-white">Gestion des sanctions</h1>
                <p className="text-white mb-3 opacity-75 fs-5">Gérez les sanctions disciplinaires des employés de votre entreprise</p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-white text-primary fs-6 px-3 py-2">
                    <i className="fas fa-gavel me-2"></i>
                    {stats.total} Sanctions totales
                  </span>
                  <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                    <i className="fas fa-clock me-2"></i>
                    {stats.enCours} En cours
                  </span>
                  <span className="badge bg-success fs-6 px-3 py-2">
                    <i className="fas fa-check-circle me-2"></i>
                    {stats.terminee} Terminées
                  </span>
                  <span className="badge bg-danger fs-6 px-3 py-2">
                    <i className="fas fa-ban me-2"></i>
                    {stats.annulee} Annulées
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-light text-primary"
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nouvelle sanction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification.show && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show animated fadeIn`} role="alert">
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: '', type: '' })}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show animated fadeIn" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Dashboard Stats - Supprimé */}

      <div className="card table-card mb-4" style={{border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderRadius: '16px'}}>
        <div className="card-header d-flex justify-content-between align-items-center" style={{
          backgroundColor: '#f8f9fa', 
          borderBottom: '2px solid #e9ecef',
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem'
        }}>
          <div className="d-flex align-items-center">
            <div className="card-icon me-3" style={{
              width: '50px',
              height: '50px',
              backgroundColor: 'linear-gradient(135deg, #3a7bd5, #00d1b2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #3a7bd5, #00d1b2)'
            }}>
              <i className="fas fa-gavel text-white fs-4"></i>
            </div>
            <div>
              <h3 className="card-title mb-1" style={{color: '#2c3e50', fontWeight: '600'}}>Sanctions disciplinaires</h3>
              <p className="text-muted mb-0" style={{fontSize: '0.9rem'}}>Gérez et suivez toutes les sanctions de votre équipe</p>
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #3a7bd5, #00d1b2)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600'
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Nouvelle sanction
          </button>
        </div>
        
        <div className="card-body">
          {/* Filters */}
          <div className="filters-container mb-4" style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{borderColor: '#dee2e6'}}>
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Rechercher par employé..." 
                    className="form-control border-start-0" 
                    name="employee"
                    value={searchParams.employee}
                    onChange={handleSearchChange}
                    style={{borderColor: '#dee2e6'}}
                  />
                </div>
              </div>
              
              <div className="col-md-2">
                <select 
                  className="form-select border-0 shadow-sm"
                  name="type"
                  value={searchParams.type}
                  onChange={handleSearchChange}
                  style={{backgroundColor: 'white', border: '1px solid #dee2e6'}}
                >
                  <option value="">Tous les types</option>
                  {sanctionTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <select 
                  className="form-select border-0 shadow-sm"
                  name="status"
                  value={searchParams.status}
                  onChange={handleSearchChange}
                  style={{backgroundColor: 'white', border: '1px solid #dee2e6'}}
                >
                  <option value="">Tous les statuts</option>
                  {statutsList.map((statut, index) => (
                    <option key={index} value={statut}>{statut}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <button 
                  className="btn btn-outline-secondary w-100 shadow-sm"
                  onClick={resetFilters}
                  style={{borderColor: '#dee2e6', color: '#6c757d', backgroundColor: 'white'}}
                >
                  <i className="fas fa-filter-circle-xmark me-2"></i>
                  Réinitialiser
                </button>
              </div>
            </div>
            
            <div className="row g-3 mt-3">
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{borderColor: '#dee2e6'}}>
                    <i className="fas fa-calendar text-muted"></i>
                  </span>
                  <input 
                    type="date" 
                    className="form-control border-start-0" 
                    name="dateStart"
                    value={searchParams.dateStart}
                    onChange={handleSearchChange}
                    style={{borderColor: '#dee2e6'}}
                  />
                </div>
              </div>
              
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0" style={{borderColor: '#dee2e6'}}>
                    <i className="fas fa-calendar text-muted"></i>
                  </span>
                  <input 
                    type="date" 
                    className="form-control border-start-0" 
                    name="dateEnd"
                    value={searchParams.dateEnd}
                    onChange={handleSearchChange}
                    style={{borderColor: '#dee2e6'}}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex justify-content-end">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => {}} // Fonction de recherche avancée
                    style={{
                      background: 'linear-gradient(135deg, #3a7bd5, #00d1b2)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <i className="fas fa-search me-2"></i>
                    Recherche avancée
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => {}} // Fonction d'export
                    style={{
                      background: 'linear-gradient(135deg, #00d1b2, #2bb673)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    <i className="fas fa-download me-2"></i>
                    Exporter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : filteredSanctions.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-gavel empty-icon"></i>
              <h4 className="empty-title">Aucune sanction trouvée</h4>
              <p className="empty-text">
                {searchParams.employee || searchParams.type || searchParams.status || searchParams.dateStart || searchParams.dateEnd ? 
                  'Aucun résultat ne correspond à vos critères de recherche.' : 
                  'Commencez par ajouter une nouvelle sanction.'}
              </p>
              {searchParams.employee || searchParams.type || searchParams.status || searchParams.dateStart || searchParams.dateEnd ? (
                <button className="btn btn-outline-secondary" onClick={resetFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>Nouvelle sanction
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('nom_employe')} className="sortable-header">
                      Employé
                      {sortConfig.key === 'nom_employe' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('type_sanction')} className="sortable-header">
                      Type de sanction
                      {sortConfig.key === 'type_sanction' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('date')} className="sortable-header">
                      Date
                      {sortConfig.key === 'date' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Contenu</th>
                    <th onClick={() => handleSort('statut')} className="sortable-header">
                      Statut
                      {sortConfig.key === 'statut' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('created_at')} className="sortable-header">
                      Date de création
                      {sortConfig.key === 'created_at' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSanctions.map((sanction) => (
                    <tr key={sanction.id} className={sanction.statut === 'En cours' ? 'table-warning' : sanction.statut === 'Annulée' ? 'table-danger' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2">
                            {sanction.nom_employe
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)}
                          </div>
                          {sanction.nom_employe}
                        </div>
                      </td>
                      <td>
                        <span className={`sanction-type ${getSanctionTypeClass(sanction.type_sanction)}`}>
                          {getSanctionTypeIcon(sanction.type_sanction)}
                          {sanction.type_sanction}
                          {(sanction.type_sanction === 'Mise à pied' || sanction.type_sanction === 'Suspension') && sanction.duree && (
                            <span className="ms-1 badge bg-secondary">
                              {sanction.duree} {sanction.duree > 1 ? 'jours' : 'jour'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td>{formatDate(sanction.date)}</td>
                      <td>
                        <div className="content-preview">
                          {sanction.contenu_sanction.length > 50
                            ? `${sanction.contenu_sanction.substring(0, 50)}...`
                            : sanction.contenu_sanction
                          }
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(sanction.statut)}>
                          {sanction.statut}
                        </span>
                      </td>
                      <td>{formatDate(sanction.created_at)}</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-info me-1" 
                            onClick={() => handleViewDetails(sanction)}
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {sanction.statut === 'En cours' && (
                            <>
                              <button 
                                className="btn btn-sm btn-primary me-1" 
                                onClick={() => handleEditSanction(sanction)}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-success me-1" 
                                onClick={() => updateSanctionStatus(sanction.id, 'Terminée')}
                                title="Terminer la sanction"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-danger me-1" 
                                onClick={() => handleCancelSanction(sanction)}
                                title="Annuler la sanction"
                              >
                                <i className="fas fa-ban"></i>
                              </button>
                            </>
                          )}
                          
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => openDeleteModal(sanction)}
                            title="Supprimer définitivement"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Sanction Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-gavel me-2 text-primary"></i>
                Nouvelle sanction disciplinaire
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {submitSuccess && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Sanction enregistrée avec succès!
                </div>
              )}

              <Formik
                initialValues={{
                  nom_employe: '',
                  type_sanction: '',
                  contenu_sanction: '',
                  date: new Date().toISOString().split('T')[0],
                  statut: 'En cours',
                  duree: ''
                }}
                validationSchema={sanctionSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue }) => (
                  <Form>
                    <div className="form-section">
                      <h6 className="form-section-title">Informations générales</h6>
                      
                      <div className="mb-3">
                        <label htmlFor="nom_employe" className="form-label">Employé <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="nom_employe"
                          className={`form-select ${errors.nom_employe && touched.nom_employe ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un employé</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.nom_prenom}>
                              {employee.nom_prenom}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="nom_employe" component="div" className="invalid-feedback" />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="type_sanction" className="form-label">Type de sanction <span className="text-danger">*</span></label>
                          <Field
                            as="select"
                            name="type_sanction"
                            className={`form-select ${errors.type_sanction && touched.type_sanction ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFieldValue('type_sanction', value);
                              
                              // Reset duree if not a suspension or mise à pied
                              if (value !== 'Mise à pied' && value !== 'Suspension') {
                                setFieldValue('duree', '');
                              }
                            }}
                          >
                            <option value="">Sélectionnez un type de sanction</option>
                            {sanctionTypes.map((type, index) => (
                              <option key={index} value={type}>{type}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="type_sanction" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date" className="form-label">Date <span className="text-danger">*</span></label>
                          <Field
                            name="date"
                            type="date"
                            className={`form-control ${errors.date && touched.date ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="date" component="div" className="invalid-feedback" />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="statut" className="form-label">Statut <span className="text-danger">*</span></label>
                          <Field
                            as="select"
                            name="statut"
                            className={`form-select ${errors.statut && touched.statut ? 'is-invalid' : ''}`}
                          >
                            {statutsList.map((statut, index) => (
                              <option key={index} value={statut}>{statut}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="statut" component="div" className="invalid-feedback" />
                        </div>
                        
                        {(values.type_sanction === 'Mise à pied' || values.type_sanction === 'Suspension') && (
                          <div className="col-md-6 mb-3">
                            <label htmlFor="duree" className="form-label">Durée (jours) <span className="text-danger">*</span></label>
                            <Field
                              name="duree"
                              type="number"
                              min="1"
                              className={`form-control ${errors.duree && touched.duree ? 'is-invalid' : ''}`}
                            />
                            <ErrorMessage name="duree" component="div" className="invalid-feedback" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-section mt-4">
                      <h6 className="form-section-title">Contenu de la sanction</h6>
                      
                      <div className="mb-3">
                        <label htmlFor="contenu_sanction" className="form-label">Description détaillée <span className="text-danger">*</span></label>
                        <Field
                          as="textarea"
                          name="contenu_sanction"
                          className={`form-control ${errors.contenu_sanction && touched.contenu_sanction ? 'is-invalid' : ''}`}
                          rows="6"
                          placeholder="Détaillez les raisons et le contenu de la sanction..."
                        />
                        <ErrorMessage name="contenu_sanction" component="div" className="invalid-feedback" />
                        <small className="form-text text-muted">Minimum 10 caractères. Soyez précis et factuel.</small>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => setShowModal(false)}
                      >
                        <i className="fas fa-times me-2"></i>
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Enregistrer
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* Edit Sanction Modal */}
      {showEditModal && selectedSanction && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2 text-primary"></i>
                Modifier la sanction
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <Formik
                initialValues={{
                  id: selectedSanction.id,
                  nom_employe: selectedSanction.nom_employe,
                  type_sanction: selectedSanction.type_sanction,
                  contenu_sanction: selectedSanction.contenu_sanction,
                  date: selectedSanction.date ? new Date(selectedSanction.date).toISOString().split('T')[0] : '',
                  statut: selectedSanction.statut,
                  duree: selectedSanction.duree || ''
                }}
                validationSchema={sanctionSchema}
                onSubmit={handleUpdate}
              >
                {({ errors, touched, values, setFieldValue }) => (
                  <Form>
                    <div className="form-section">
                      <h6 className="form-section-title">Informations générales</h6>
                      
                      <div className="mb-3">
                        <label htmlFor="nom_employe" className="form-label">Employé <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="nom_employe"
                          className={`form-select ${errors.nom_employe && touched.nom_employe ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un employé</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.nom_prenom}>
                              {employee.nom_prenom}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="nom_employe" component="div" className="invalid-feedback" />
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="type_sanction" className="form-label">Type de sanction <span className="text-danger">*</span></label>
                          <Field
                            as="select"
                            name="type_sanction"
                            className={`form-select ${errors.type_sanction && touched.type_sanction ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFieldValue('type_sanction', value);
                              
                              // Reset duree if not a suspension or mise à pied
                              if (value !== 'Mise à pied' && value !== 'Suspension') {
                                setFieldValue('duree', '');
                              }
                            }}
                          >
                            <option value="">Sélectionnez un type de sanction</option>
                            {sanctionTypes.map((type, index) => (
                              <option key={index} value={type}>{type}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="type_sanction" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date" className="form-label">Date <span className="text-danger">*</span></label>
                          <Field
                            name="date"
                            type="date"
                            className={`form-control ${errors.date && touched.date ? 'is-invalid' : ''}`}
                          />
                          <ErrorMessage name="date" component="div" className="invalid-feedback" />
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="statut" className="form-label">Statut <span className="text-danger">*</span></label>
                          <Field
                            as="select"
                            name="statut"
                            className={`form-select ${errors.statut && touched.statut ? 'is-invalid' : ''}`}
                          >
                            {statutsList.map((statut, index) => (
                              <option key={index} value={statut}>{statut}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="statut" component="div" className="invalid-feedback" />
                        </div>
                        
                        {(values.type_sanction === 'Mise à pied' || values.type_sanction === 'Suspension') && (
                          <div className="col-md-6 mb-3">
                            <label htmlFor="duree" className="form-label">Durée (jours) <span className="text-danger">*</span></label>
                            <Field
                              name="duree"
                              type="number"
                              min="1"
                              className={`form-control ${errors.duree && touched.duree ? 'is-invalid' : ''}`}
                            />
                            <ErrorMessage name="duree" component="div" className="invalid-feedback" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-section mt-4">
                      <h6 className="form-section-title">Contenu de la sanction</h6>
                      
                      <div className="mb-3">
                        <label htmlFor="contenu_sanction" className="form-label">Description détaillée <span className="text-danger">*</span></label>
                        <Field
                          as="textarea"
                          name="contenu_sanction"
                          className={`form-control ${errors.contenu_sanction && touched.contenu_sanction ? 'is-invalid' : ''}`}
                          rows="6"
                        />
                        <ErrorMessage name="contenu_sanction" component="div" className="invalid-feedback" />
                        <small className="form-text text-muted">Minimum 10 caractères. Soyez précis et factuel.</small>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => setShowEditModal(false)}
                      >
                        <i className="fas fa-times me-2"></i>
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Mettre à jour
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* Sanction Details Modal */}
      {showDetailsModal && selectedSanction && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Détails de la sanction
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDetailsModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="sanction-details">
                <div className="sanction-header">
                  <div className="employee-info">
                    <div className="user-avatar large">
                      {selectedSanction.nom_employe
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="employee-name">{selectedSanction.nom_employe}</h4>
                      <span className={`sanction-type ${getSanctionTypeClass(selectedSanction.type_sanction)}`}>
                        {getSanctionTypeIcon(selectedSanction.type_sanction)}
                        {selectedSanction.type_sanction}
                        {(selectedSanction.type_sanction === 'Mise à pied' || selectedSanction.type_sanction === 'Suspension') && selectedSanction.duree && (
                          <span className="ms-1 badge bg-secondary">
                            {selectedSanction.duree} {selectedSanction.duree > 1 ? 'jours' : 'jour'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="sanction-status">
                    <span className={getStatusBadgeClass(selectedSanction.statut)}>
                      {selectedSanction.statut}
                    </span>
                  </div>
                </div>
                
                <div className="sanction-dates">
                  <div className="date-item">
                    <i className="far fa-calendar-alt me-2"></i>
                    <strong>Date de la sanction:</strong> {formatDate(selectedSanction.date)}
                  </div>
                  <div className="date-item">
                    <i className="far fa-clock me-2"></i>
                    <strong>Créé le:</strong> {formatDate(selectedSanction.created_at)}
                  </div>
                  {selectedSanction.updated_at && selectedSanction.updated_at !== selectedSanction.created_at && (
                    <div className="date-item">
                      <i className="fas fa-edit me-2"></i>
                      <strong>Dernière mise à jour:</strong> {formatDate(selectedSanction.updated_at)}
                    </div>
                  )}
                </div>
                
                <div className="sanction-content">
                  <h6 className="content-title">Contenu de la sanction</h6>
                  <div className="content-box">
                    {selectedSanction.contenu_sanction.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
                
                {selectedSanction.motif_annulation && (
                  <div className="sanction-cancellation mt-4">
                    <h6 className="content-title">Motif d'annulation</h6>
                    <div className="cancellation-box">
                      <p>{selectedSanction.motif_annulation}</p>
                      <div className="cancellation-date text-muted">
                        <i className="fas fa-ban me-2"></i>
                        Annulée le: {formatDate(selectedSanction.date_annulation)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowDetailsModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Fermer
              </button>
              
              {selectedSanction.statut === 'En cours' && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEditSanction(selectedSanction);
                    }}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Modifier
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success" 
                    onClick={() => updateSanctionStatus(selectedSanction.id, 'Terminée')}
                  >
                    <i className="fas fa-check me-2"></i>
                    Terminer
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleCancelSanction(selectedSanction);
                    }}
                  >
                    <i className="fas fa-ban me-2"></i>
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Sanction Modal */}
      {showCancelModal && sanctionToCancel && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-ban me-2 text-danger"></i>
                Annuler la sanction
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowCancelModal(false);
                  setSanctionToCancel(null);
                  setCancelReason('');
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Attention:</strong> L'annulation d'une sanction est une action définitive qui sera enregistrée dans l'historique de l'employé.
              </div>
              
              <p>Vous êtes sur le point d'annuler la sanction suivante:</p>
              
              <div className="sanction-summary mb-3">
                <div className="summary-item">
                  <strong>Employé:</strong> {sanctionToCancel.nom_employe}
                </div>
                <div className="summary-item">
                  <strong>Type:</strong> {sanctionToCancel.type_sanction}
                </div>
                <div className="summary-item">
                  <strong>Date:</strong> {formatDate(sanctionToCancel.date)}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="cancelReason" className="form-label">Motif d'annulation <span className="text-danger">*</span></label>
                <textarea
                  id="cancelReason"
                  className="form-control"
                  rows="4"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Veuillez détailler les raisons de l'annulation..."
                  required
                ></textarea>
                <small className="form-text text-muted">Ce motif sera enregistré et visible dans l'historique de la sanction.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowCancelModal(false);
                  setSanctionToCancel(null);
                  setCancelReason('');
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={submitCancelSanction}
                disabled={!cancelReason.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-ban me-2"></i>
                    Confirmer l'annulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Sanction Modal */}
      {showDeleteModal && selectedSanction && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-danger">
                <i className="fas fa-trash me-2"></i>
                Supprimer la sanction
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSanction(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Attention:</strong> La suppression d'une sanction est une action définitive et irréversible.
              </div>
              
              <p>Vous êtes sur le point de supprimer définitivement la sanction suivante:</p>
              
              <div className="sanction-summary mb-3">
                <div className="summary-item">
                  <strong>Employé:</strong> {selectedSanction.nom_employe}
                </div>
                <div className="summary-item">
                  <strong>Type:</strong> {selectedSanction.type_sanction}
                </div>
                <div className="summary-item">
                  <strong>Date:</strong> {formatDate(selectedSanction.date)}
                </div>
                <div className="summary-item">
                  <strong>Statut:</strong> {selectedSanction.statut}
                </div>
              </div>
              
              <div className="alert alert-warning">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Information:</strong> Cette action supprimera complètement la sanction de la base de données. 
                Aucune trace ne sera conservée.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSanction(null);
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => handleDeleteSanction(selectedSanction.id)}
              >
                <i className="fas fa-trash me-2"></i>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS supplémentaires */}
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: modalFadeIn 0.3s ease-out;
        }
        
        .modal-lg {
          max-width: 800px;
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stats-dashboard {
          margin-bottom: 20px;
        }
        
        .card-icon {
          background-color: #f0f7ff;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: #0d6efd;
        }
        
        .card-title {
          margin-bottom: 0;
          font-size: 18px;
        }
        
        .sortable-header {
          cursor: pointer;
          position: relative;
        }
        
        .sortable-header:hover {
          background-color: #f8f9fa;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
        }
        
        .empty-icon {
          font-size: 60px;
          color: #dee2e6;
          margin-bottom: 20px;
        }
        
        .empty-title {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .empty-text {
          color: #6c757d;
          margin-bottom: 20px;
        }
        
        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: white;
          font-weight: bold;
        }
        
        .user-avatar.large {
          width: 60px;
          height: 60px;
          font-size: 24px;
        }
        
        .sanction-type {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 0.9rem;
        }
        
        .sanction-type-low {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .sanction-type-medium {
          background-color: #ffeeba;
          color: #856404;
        }
        
        .sanction-type-high {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .sanction-type-severe {
          background-color: #dc3545;
          color: white;
        }
        
        .sanction-type-default {
          background-color: #e9ecef;
          color: #495057;
        }
        
        .content-preview {
          font-size: 0.9rem;
          color: #6c757d;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .form-section {
          margin-bottom: 15px;
        }
        
        .form-section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #0d6efd;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 5px;
        }
        
        .sanction-details {
          padding: 10px;
        }
        
        .sanction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .employee-info {
          display: flex;
          align-items: center;
        }
        
        .employee-info > div:last-child {
          margin-left: 15px;
        }
        
        .employee-name {
          font-size: 18px;
          margin-bottom: 5px;
        }
        
        .sanction-dates {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .date-item {
          margin-bottom: 5px;
        }
        
        .date-item:last-child {
          margin-bottom: 0;
        }
        
        .content-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #212529;
        }
        
        .content-box {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #0d6efd;
        }
        
        .content-box p {
          margin-bottom: 10px;
        }
        
        .content-box p:last-child {
          margin-bottom: 0;
        }
        
        .cancellation-box {
          background-color: #f8d7da;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #dc3545;
        }
        
        .cancellation-date {
          margin-top: 10px;
          font-size: 0.9rem;
        }
        
        .sanction-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          margin-bottom: 5px;
        }
        
        .summary-item:last-child {
          margin-bottom: 0;
        }
        
        .filters-container {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .animated {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        
        .fadeIn {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media print {
          .actions-bar, .filters-container, .action-btns, .modal-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default SanctionManagement;
