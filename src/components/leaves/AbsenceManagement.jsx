import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { absenceService, employeeService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const AbsenceManagement = () => {
  // États
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [absences, setAbsences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [otherMotifVisible, setOtherMotifVisible] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_debut', direction: 'desc' });
  const [deleteId, setDeleteId] = useState(null);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  // Validation schema for absence form
  const absenceSchema = Yup.object().shape({
    employee: Yup.string().required('L\'employé est requis'),
    type_absence: Yup.string().required('Le type d\'absence est requis'),
    motif: Yup.string().required('Le motif est requis'),
    date_debut: Yup.date().required('La date de début est requise'),
    date_fin: Yup.date()
      .required('La date de fin est requise')
      .min(
        Yup.ref('date_debut'), 
        'La date de fin doit être postérieure à la date de début'
      ),
    other_motif: Yup.string().when('motif', {
      is: 'Autre',
      then: Yup.string().required('Veuillez préciser le motif')
    })
  });

  // Services list
  const services = [
    'Clinique', 
    'Laboratoire', 
    'Accueil/Facturation', 
    'Hotellerie/Hospitalité/Buanderie/Self', 
    'Direction Générale', 
    'Marketing/Communication', 
    'Cotation', 
    'Walyah', 
    'RH', 
    'Cuisine', 
    'Informatique', 
    'Bureau des entrées'
  ];

  // Absence types
  const absenceTypes = [
    'Arrêt maladie',
    'Absence'
  ];

  // Motifs
  const motifs = [
    'Repos maladie',
    'Affection médicale',
    'Obligation familiale',
    'Formalité administrative',
    'Raison personnelle',
    'Décès',
    'Raison académique',
    'Cérémonie religieuse',
    'Autre'
  ];

  // Remuneration options
  const remunerationOptions = [
    'Rémunéré',
    'Non rémunéré'
  ];

  // Statut options
  const statutOptions = [
    'En attente',
    'Approuvé',
    'Refusé'
  ];

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Récupérer les absences - memoized avec useCallback
  const fetchAbsences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch absences from API
      const absencesData = await absenceService.getAll();
      console.log('Données des absences reçues:', absencesData);
      setAbsences(absencesData);
    } catch (err) {
      console.error('Erreur lors de la récupération des absences:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Récupérer les employés - memoized avec useCallback
  const fetchEmployees = useCallback(async () => {
    try {
      // Fetch employees data
      const employeesData = await employeeService.getAll();
      console.log('Données des employés reçues:', employeesData);
      
      if (Array.isArray(employeesData) && employeesData.length > 0) {
        // Format employee data for dropdown
        const formattedEmployees = employeesData.map(emp => ({
          id: emp.id,
          nom_prenom: emp.nom_prenom || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
          service: emp.functional_area || emp.department || emp.service || '',
          poste: emp.poste_actuel || emp.position || emp.poste || ''
        }));
        
        setEmployees(formattedEmployees);
        console.log('Employés formatés:', formattedEmployees);
      } else {
        throw new Error('Format de données employés invalide ou vide');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des employés:', err);
      // En cas d'erreur, utiliser des données de secours
      const fallbackEmployees = [
        { id: '1', nom_prenom: 'John Doe', service: 'Clinique', poste: 'Médecin' },
        { id: '2', nom_prenom: 'Jane Smith', service: 'Laboratoire', poste: 'Technicien' },
        { id: '3', nom_prenom: 'Robert Johnson', service: 'Accueil/Facturation', poste: 'Agent d\'accueil' }
      ];
      setEmployees(fallbackEmployees);
    }
  }, []);

  // Récupérer les absences et les employés au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger d'abord les employés pour qu'ils soient disponibles dans le formulaire
        await fetchEmployees();
        await fetchAbsences();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement des données. Veuillez actualiser la page.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchEmployees, fetchAbsences]);

  // Handle form submission for new absence
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Process the motif if "Autre" is selected
      let finalMotif = values.motif;
      if (values.motif === 'Autre' && values.other_motif) {
        finalMotif = values.other_motif;
      }
      
      // Calculate return date (one day after end date)
      const endDate = new Date(values.date_fin);
      const returnDate = new Date(endDate);
      returnDate.setDate(returnDate.getDate() + 1);
      const formattedReturnDate = returnDate.toISOString().split('T')[0];
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('nom_employe', values.employee);
      formData.append('service', values.service || '');
      formData.append('poste', values.poste || '');
      formData.append('type_absence', values.type_absence);
      formData.append('motif', finalMotif);
      formData.append('date_debut', values.date_debut);
      formData.append('date_fin', values.date_fin);
      formData.append('date_retour', values.date_retour || formattedReturnDate);
      formData.append('remuneration', values.remuneration || '');
      formData.append('statut', 'En attente');
      
      if (selectedFile) {
        formData.append('document', selectedFile);
      }
      
      // Send data to API
      const response = await absenceService.create(formData);
      
      // Add the new absence to the list
      setAbsences(prev => [response, ...prev]);
      
      // Success
      setSubmitSuccess(true);
      resetForm();
      setSelectedFile(null);
      showNotification('Absence enregistrée avec succès!');
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
      setError('Erreur lors de l\'enregistrement de l\'absence. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit absence
  const handleEditAbsence = async (id) => {
    try {
      setIsLoading(true);
      
      // Fetch the absence details
      const absence = await absenceService.getById(id);
      
      // Check if the motif is in our predefined list
      const isKnownMotif = motifs.includes(absence.motif);
      
      // If not, set it as "Autre" and store the custom motif
      if (!isKnownMotif) {
        absence.other_motif = absence.motif;
        absence.motif = 'Autre';
        setOtherMotifVisible(true);
      } else {
        setOtherMotifVisible(false);
      }
      
      setSelectedAbsence(absence);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'absence:', error);
      setError('Erreur lors du chargement des détails de l\'absence.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view absence details
  const handleViewDetails = async (id) => {
    try {
      setIsLoading(true);
      
      // Fetch the absence details
      const absence = await absenceService.getById(id);
      setSelectedAbsence(absence);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'absence:', error);
      setError('Erreur lors du chargement des détails de l\'absence.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle update absence
  const handleUpdateAbsence = async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Process the motif if "Autre" is selected
      let finalMotif = values.motif;
      if (values.motif === 'Autre' && values.other_motif) {
        finalMotif = values.other_motif;
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('nom_employe', values.nom_employe);
      formData.append('service', values.service || '');
      formData.append('poste', values.poste || '');
      formData.append('type_absence', values.type_absence);
      formData.append('motif', finalMotif);
      formData.append('date_debut', values.date_debut);
      formData.append('date_fin', values.date_fin);
      formData.append('date_retour', values.date_retour || '');
      formData.append('remuneration', values.remuneration || '');
      formData.append('statut', values.statut || 'En attente');
      formData.append('keep_document', values.keep_document ? 'true' : 'false');
      
      if (values.document) {
        formData.append('document', values.document);
      }
      
      // Send data to API
      const response = await absenceService.update(values.id, formData);
      
      // Update the absence in the list
      setAbsences(prev => 
        prev.map(absence => 
          absence.id === response.id ? response : absence
        )
      );
      
      // Success notification
      showNotification('Absence mise à jour avec succès!');
      
      // Close modal after success
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      setError('Erreur lors de la mise à jour de l\'absence.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmer la suppression d'une absence
  const confirmDeleteAbsence = (id) => {
    setDeleteId(id);
    setShowConfirmModal(true);
  };

  // Handle deleting an absence
  const handleDeleteAbsence = async () => {
    try {
      setIsLoading(true);
      await absenceService.delete(deleteId);
      
      // Remove the absence from the list
      setAbsences(prev => prev.filter(absence => absence.id !== deleteId));
      
      // Success notification
      showNotification('Absence supprimée avec succès!');
      setShowConfirmModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      setError('Erreur lors de la suppression de l\'absence.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approving an absence
  const handleApproveAbsence = async (id) => {
    try {
      setIsLoading(true);
      const response = await absenceService.processAbsence(id, 'Approuvé');
      
      // Update the absence in the list
      setAbsences(prev => prev.map(absence => 
        absence.id === id ? response : absence
      ));
      
      // If the details modal is open, update the selected absence
      if (showDetailsModal && selectedAbsence && selectedAbsence.id === id) {
        setSelectedAbsence(response);
      }
      
      // Success notification
      showNotification('Absence approuvée avec succès!');
    } catch (error) {
      console.error('Erreur lors de l\'approbation de l\'absence:', error);
      setError('Erreur lors de l\'approbation de l\'absence.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle rejecting an absence
  const handleRejectAbsence = async (id) => {
    try {
      setIsLoading(true);
      const response = await absenceService.processAbsence(id, 'Refusé');
      
      // Update the absence in the list
      setAbsences(prev => prev.map(absence => 
        absence.id === id ? response : absence
      ));
      
      // If the details modal is open, update the selected absence
      if (showDetailsModal && selectedAbsence && selectedAbsence.id === id) {
        setSelectedAbsence(response);
      }
      
      // Success notification
      showNotification('Absence refusée avec succès!');
    } catch (error) {
      console.error('Erreur lors du refus de l\'absence:', error);
      setError('Erreur lors du refus de l\'absence.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee selection
  const handleEmployeeChange = (e, setFieldValue) => {
    const selectedValue = e.target.value;
    setFieldValue('employee', selectedValue);
    
    // Find the selected employee
    const selectedEmployee = employees.find(emp => emp.nom_prenom === selectedValue);
    
    // Set service and poste if available
    if (selectedEmployee) {
      setFieldValue('service', selectedEmployee.service || '');
      setFieldValue('poste', selectedEmployee.poste || '');
    }
  };

  // Handle motif change
  const handleMotifChange = (e, setFieldValue) => {
    const selectedValue = e.target.value;
    setFieldValue('motif', selectedValue);
    
    // Show/hide other motif field
    setOtherMotifVisible(selectedValue === 'Autre');
  };

  // Handle file change
  const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Format de fichier non valide. Formats acceptés: PDF, JPG, PNG');
        return;
      }
      
      setSelectedFile(file);
      setFieldValue('document', file);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1; // Including the end day
  };

  // Get badge class for status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approuvé':
        return 'bg-success';
      case 'Refusé':
        return 'bg-danger';
      default:
        return 'bg-warning text-dark';
    }
  };

  // Get badge class for remuneration
  const getRemunerationBadgeClass = (remuneration) => {
    switch (remuneration) {
      case 'Rémunéré':
        return 'badge-remunerated';
      case 'Non rémunéré':
        return 'badge-not-remunerated';
      default:
        return 'badge-pending';
    }
  };

  // Get icon for absence type
  const getAbsenceTypeIcon = (type) => {
    switch (type) {
      case 'Arrêt maladie':
        return <i className="fas fa-procedures text-danger me-2"></i>;
      case 'Absence':
        return <i className="fas fa-calendar-times text-warning me-2"></i>;
      default:
        return <i className="fas fa-calendar-day text-secondary me-2"></i>;
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort absences
  const filteredAndSortedAbsences = React.useMemo(() => {
    let result = [...absences];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(absence => 
        absence.nom_employe.toLowerCase().includes(searchLower) ||
        absence.service?.toLowerCase().includes(searchLower) ||
        absence.motif?.toLowerCase().includes(searchLower) ||
        absence.type_absence?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(absence => absence.statut === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter) {
      result = result.filter(absence => absence.type_absence === typeFilter);
    }
    
    // Apply date range filter
    if (filterDateStart) {
      const startDate = new Date(filterDateStart);
      result = result.filter(absence => {
        const absenceStartDate = new Date(absence.date_debut);
        return absenceStartDate >= startDate;
      });
    }
    
    if (filterDateEnd) {
      const endDate = new Date(filterDateEnd);
      endDate.setHours(23, 59, 59); // End of the day
      result = result.filter(absence => {
        const absenceEndDate = new Date(absence.date_fin);
        return absenceEndDate <= endDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return result;
  }, [absences, searchTerm, statusFilter, typeFilter, filterDateStart, filterDateEnd, sortConfig]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setSortConfig({ key: 'date_debut', direction: 'desc' });
  };

  // Get class for row highlight
  const getRowHighlightClass = (absence) => {
    if (absence.statut === 'En attente') {
      return 'table-warning';
    }
    return '';
  };

  return (
    <>
      <div className="page-title-wrapper fade-in-up">
        <h1 className="page-title">Gestion des Absences</h1>
        <p className="page-subtitle">Consultez et gérez les demandes d'absences des employés</p>
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
      
      <div className="actions-bar fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus me-2"></i>Déclarer une absence
          </button>
          <button className="btn btn-outline-primary ms-2" onClick={() => window.print()}>
            <i className="fas fa-print me-2"></i>Imprimer
          </button>
        </div>
        <div>
          <button 
            className="btn btn-outline-secondary" 
            onClick={fetchAbsences}
          >
            <i className="fas fa-sync-alt me-2"></i>Actualiser
          </button>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="filters-container mb-4 fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="row g-3">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Rechercher par nom, service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {statutOptions.map((statut, index) => (
                <option key={index} value={statut}>{statut}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select 
              className="form-select" 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tous les types</option>
              {absenceTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input 
              type="date" 
              className="form-control" 
              placeholder="Date début" 
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <input 
              type="date" 
              className="form-control" 
              placeholder="Date fin" 
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
            />
          </div>
          <div className="col-md-1">
            <button className="btn btn-outline-secondary w-100" onClick={resetFilters} title="Réinitialiser les filtres">
              <i className="fas fa-filter-circle-xmark"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="data-card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="data-card-header">
          <h3 className="data-card-title">Absences</h3>
          {filteredAndSortedAbsences.length > 0 && (
            <span className="badge bg-info">
              {filteredAndSortedAbsences.length} {filteredAndSortedAbsences.length > 1 ? 'absences' : 'absence'}
            </span>
          )}
        </div>
        <div className="data-card-body">
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : filteredAndSortedAbsences.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times empty-icon"></i>
              <h4 className="empty-title">Aucune absence</h4>
              <p className="empty-text">
                {searchTerm || statusFilter || typeFilter || filterDateStart || filterDateEnd ? 
                  'Aucun résultat ne correspond à vos critères de recherche.' : 
                  'Il n\'y a aucune demande d\'absence à afficher pour le moment.'}
              </p>
              {searchTerm || statusFilter || typeFilter || filterDateStart || filterDateEnd ? (
                <button className="btn btn-outline-secondary" onClick={resetFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>Déclarer une absence
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('nom_employe')} className="sortable-header">
                      Employé
                      {sortConfig.key === 'nom_employe' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('service')} className="sortable-header">
                      Service
                      {sortConfig.key === 'service' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('type_absence')} className="sortable-header">
                      Type
                      {sortConfig.key === 'type_absence' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('motif')} className="sortable-header">
                      Motif
                      {sortConfig.key === 'motif' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('date_debut')} className="sortable-header">
                      Date Début
                      {sortConfig.key === 'date_debut' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('date_fin')} className="sortable-header">
                      Date Fin
                      {sortConfig.key === 'date_fin' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('remuneration')} className="sortable-header">
                      Rémunération
                      {sortConfig.key === 'remuneration' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('statut')} className="sortable-header">
                      Statut
                      {sortConfig.key === 'statut' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedAbsences.map((absence) => (
                    <tr key={absence.id} className={getRowHighlightClass(absence)}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2" style={{ 
                            width: 30, 
                            height: 30, 
                            fontSize: '0.75rem',
                            backgroundColor: `hsl(${absence.nom_employe.length * 15}, 70%, 50%)` 
                          }}>
                            {getInitials(absence.nom_employe)}
                          </div>
                          {absence.nom_employe}
                        </div>
                      </td>
                      <td>{absence.service || '-'}</td>
                      <td>
                        {getAbsenceTypeIcon(absence.type_absence)}
                        {absence.type_absence}
                      </td>
                      <td>{absence.motif}</td>
                      <td>{formatDate(absence.date_debut)}</td>
                      <td>{formatDate(absence.date_fin)}</td>
                      <td>
                        <span className={`badge ${getRemunerationBadgeClass(absence.remuneration)}`}>
                          {absence.remuneration || 'Non défini'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(absence.statut)}`}>
                          {absence.statut}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button 
                            className="btn btn-primary btn-sm me-1" 
                            onClick={() => handleViewDetails(absence.id)} 
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-warning btn-sm me-1" 
                            onClick={() => handleEditAbsence(absence.id)} 
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => confirmDeleteAbsence(absence.id)} 
                            title="Supprimer"
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

      {/* New Absence Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-calendar-plus me-2 text-primary"></i>
                Déclarer une absence
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setError(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              {submitSuccess && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle me-2"></i>
                  Absence enregistrée avec succès!
                </div>
              )}

              <Formik
                initialValues={{
                  employee: '',
                  service: '',
                  poste: '',
                  type_absence: '',
                  motif: '',
                  other_motif: '',
                  date_debut: '',
                  date_fin: '',
                  date_retour: '',
                  remuneration: '',
                  document: null
                }}
                validationSchema={absenceSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="employee" className="form-label">Employé <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          id="employee"
                          name="employee"
                          className={`form-select ${errors.employee && touched.employee ? 'is-invalid' : ''}`}
                          onChange={(e) => handleEmployeeChange(e, setFieldValue)}
                        >
                          <option value="">Sélectionner un employé</option>
                          {employees && employees.length > 0 ? (
                            employees.map((employee) => (
                              <option 
                                key={employee.id} 
                                value={employee.nom_prenom}
                              >
                                {employee.nom_prenom}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Chargement des employés...</option>
                          )}
                        </Field>
                        <ErrorMessage name="employee" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="service" className="form-label">Service</label>
                        <Field
                          as="select"
                          id="service"
                          name="service"
                          className="form-select"
                        >
                          <option value="">Sélectionner un service</option>
                          {services.map((service, index) => (
                            <option key={index} value={service}>{service}</option>
                          ))}
                        </Field>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="poste" className="form-label">Poste</label>
                        <Field
                          type="text"
                          id="poste"
                          name="poste"
                          className="form-control"
                          placeholder="Poste de l'employé"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="type_absence" className="form-label">Type d'absence <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          id="type_absence"
                          name="type_absence"
                          className={`form-select ${errors.type_absence && touched.type_absence ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionner un type</option>
                          {absenceTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="type_absence" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="motif" className="form-label">Motif <span className="text-danger">*</span></label>
                      <Field
                        as="select"
                        id="motif"
                        name="motif"
                        className={`form-select ${errors.motif && touched.motif ? 'is-invalid' : ''}`}
                        onChange={(e) => handleMotifChange(e, setFieldValue)}
                      >
                        <option value="">Sélectionner un motif</option>
                        {motifs.map((motif, index) => (
                          <option key={index} value={motif}>{motif}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="motif" component="div" className="invalid-feedback" />
                    </div>
                    
                    {otherMotifVisible && (
                      <div className="mb-3">
                        <label htmlFor="other_motif" className="form-label">Précision du motif <span className="text-danger">*</span></label>
                        <Field
                          type="text"
                          id="other_motif"
                          name="other_motif"
                          className={`form-control ${errors.other_motif && touched.other_motif ? 'is-invalid' : ''}`}
                          placeholder="Précisez le motif"
                        />
                        <ErrorMessage name="other_motif" component="div" className="invalid-feedback" />
                      </div>
                    )}
                    
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label htmlFor="date_debut" className="form-label">Date de début <span className="text-danger">*</span></label>
                        <Field
                          type="date"
                          id="date_debut"
                          name="date_debut"
                          className={`form-control ${errors.date_debut && touched.date_debut ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="date_debut" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="date_fin" className="form-label">Date de fin <span className="text-danger">*</span></label>
                        <Field
                          type="date"
                          id="date_fin"
                          name="date_fin"
                          className={`form-control ${errors.date_fin && touched.date_fin ? 'is-invalid' : ''}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldValue('date_fin', value);
                            
                            // Update return date (one day after end date)
                            if (value) {
                              const endDate = new Date(value);
                              const returnDate = new Date(endDate);
                              returnDate.setDate(returnDate.getDate() + 1);
                              const formattedReturnDate = returnDate.toISOString().split('T')[0];
                              setFieldValue('date_retour', formattedReturnDate);
                            }
                          }}
                        />
                        <ErrorMessage name="date_fin" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="date_retour" className="form-label">Date de retour</label>
                        <Field
                          type="date"
                          id="date_retour"
                          name="date_retour"
                          className="form-control"
                        />
                        <small className="text-muted">Calculée automatiquement</small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="remuneration" className="form-label">Rémunération</label>
                      <Field
                        as="select"
                        id="remuneration"
                        name="remuneration"
                        className="form-select"
                      >
                        <option value="">Sélectionner</option>
                        {remunerationOptions.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="document" className="form-label">Document justificatif</label>
                      <input
                        type="file"
                        id="document"
                        name="document"
                        className="form-control"
                        onChange={(event) => handleFileChange(event, setFieldValue)}
                      />
                      <div className="form-text">Format accepté: PDF, JPG, PNG (max 5MB)</div>
                      {selectedFile && (
                        <div className="mt-2">
                          <span className="badge badge-success">
                            <i className="fas fa-check me-1"></i>
                            Fichier sélectionné: {selectedFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setShowModal(false);
                          setSelectedFile(null);
                        }}
                      >
                        <i className="fas fa-times me-2"></i>
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={isSubmitting || !(isValid && dirty)}
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

      {/* View Details Modal */}
      {showDetailsModal && selectedAbsence && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Détails de l'absence
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDetailsModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="info-group mb-3">
                    <div className="info-label">Employé :</div>
                    <div className="info-value">
                      <div className="d-flex align-items-center">
                        <div className="user-avatar me-2" style={{ 
                          width: 30, 
                          height: 30, 
                          fontSize: '0.75rem',
                          backgroundColor: `hsl(${selectedAbsence.nom_employe.length * 15}, 70%, 50%)` 
                        }}>
                          {getInitials(selectedAbsence.nom_employe)}
                        </div>
                        <span className="fw-bold">{selectedAbsence.nom_employe}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Service :</div>
                    <div className="info-value">{selectedAbsence.service || '-'}</div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Poste :</div>
                    <div className="info-value">{selectedAbsence.poste || '-'}</div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Type d'absence :</div>
                    <div className="info-value">
                      {getAbsenceTypeIcon(selectedAbsence.type_absence)}
                      {selectedAbsence.type_absence}
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Motif :</div>
                    <div className="info-value">{selectedAbsence.motif}</div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="info-group mb-3">
                    <div className="info-label">Période :</div>
                    <div className="info-value">
                      Du {formatDate(selectedAbsence.date_debut)} au {formatDate(selectedAbsence.date_fin)}
                    </div>
                  </div>
                  
                  {selectedAbsence.date_retour && (
                    <div className="info-group mb-3">
                      <div className="info-label">Date de retour :</div>
                      <div className="info-value">{formatDate(selectedAbsence.date_retour)}</div>
                    </div>
                  )}
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Durée :</div>
                    <div className="info-value">
                      <span className="badge bg-info">
                        {calculateDuration(selectedAbsence.date_debut, selectedAbsence.date_fin)} jour(s)
                      </span>
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Rémunération :</div>
                    <div className="info-value">
                      <span className={`badge ${getRemunerationBadgeClass(selectedAbsence.remuneration)}`}>
                        {selectedAbsence.remuneration || 'Non défini'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Statut :</div>
                    <div className="info-value">
                      <span className={`badge ${getStatusBadgeClass(selectedAbsence.statut)}`}>
                        {selectedAbsence.statut}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedAbsence.date_traitement && (
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="info-group">
                      <div className="info-label">Date de traitement :</div>
                      <div className="info-value">{formatDate(selectedAbsence.date_traitement)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedAbsence.document_path && (
                <div className="row mb-3">
                  <div className="col-12">
                    <div className="info-group">
                      <div className="info-label">Document justificatif :</div>
                      <div className="info-value">
                        <a href={selectedAbsence.document_path} className="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer">
                          <i className="fas fa-file-download me-2"></i>Télécharger le document
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              {selectedAbsence.statut === 'En attente' && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveAbsence(selectedAbsence.id);
                    }}
                  >
                    <i className="fas fa-check-circle me-2"></i>Approuver
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      handleRejectAbsence(selectedAbsence.id);
                    }}
                  >
                    <i className="fas fa-times-circle me-2"></i>Refuser
                  </button>
                </>
              )}
              <button 
                type="button" 
                className="btn btn-outline-danger"
                onClick={() => {
                  setShowDetailsModal(false);
                  confirmDeleteAbsence(selectedAbsence.id);
                }}
              >
                <i className="fas fa-trash me-2"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAbsence && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2 text-warning"></i>
                Modifier l'absence
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
                  id: selectedAbsence.id,
                  nom_employe: selectedAbsence.nom_employe,
                  service: selectedAbsence.service || '',
                  poste: selectedAbsence.poste || '',
                  type_absence: selectedAbsence.type_absence,
                  motif: selectedAbsence.motif,
                  other_motif: selectedAbsence.other_motif || '',
                  date_debut: selectedAbsence.date_debut,
                  date_fin: selectedAbsence.date_fin,
                  date_retour: selectedAbsence.date_retour || '',
                  remuneration: selectedAbsence.remuneration || '',
                  statut: selectedAbsence.statut || 'En attente',
                  document: null,
                  keep_document: selectedAbsence.document_path ? true : false
                }}
                onSubmit={handleUpdateAbsence}
                validationSchema={absenceSchema}
              >
                {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="editNomEmploye" className="form-label">Employé <span className="text-danger">*</span></label>
                        <Field
                          type="text"
                          id="editNomEmploye"
                          name="nom_employe"
                          className={`form-control ${errors.nom_employe && touched.nom_employe ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="nom_employe" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="editService" className="form-label">Service</label>
                        <Field
                          as="select"
                          id="editService"
                          name="service"
                          className="form-select"
                        >
                          <option value="">Sélectionner un service</option>
                          {services.map((service, index) => (
                            <option key={index} value={service}>{service}</option>
                          ))}
                        </Field>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="editPoste" className="form-label">Poste</label>
                        <Field
                          type="text"
                          id="editPoste"
                          name="poste"
                          className="form-control"
                        />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="editTypeAbsence" className="form-label">Type d'absence <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          id="editTypeAbsence"
                          name="type_absence"
                          className={`form-select ${errors.type_absence && touched.type_absence ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionner un type</option>
                          {absenceTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="type_absence" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="editMotif" className="form-label">Motif <span className="text-danger">*</span></label>
                      <Field
                        as="select"
                        id="editMotif"
                        name="motif"
                        className={`form-select ${errors.motif && touched.motif ? 'is-invalid' : ''}`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFieldValue('motif', value);
                          setOtherMotifVisible(value === 'Autre');
                        }}
                      >
                        <option value="">Sélectionner un motif</option>
                        {motifs.map((motif, index) => (
                          <option key={index} value={motif}>{motif}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="motif" component="div" className="invalid-feedback" />
                    </div>
                    
                    {(values.motif === 'Autre' || otherMotifVisible) && (
                      <div className="mb-3">
                        <label htmlFor="editOtherMotif" className="form-label">Précision du motif <span className="text-danger">*</span></label>
                        <Field
                          type="text"
                          id="editOtherMotif"
                          name="other_motif"
                          className={`form-control ${errors.other_motif && touched.other_motif ? 'is-invalid' : ''}`}
                          placeholder="Précisez le motif"
                        />
                        <ErrorMessage name="other_motif" component="div" className="invalid-feedback" />
                      </div>
                    )}
                    
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label htmlFor="editDateDebut" className="form-label">Date de début <span className="text-danger">*</span></label>
                        <Field
                          type="date"
                          id="editDateDebut"
                          name="date_debut"
                          className={`form-control ${errors.date_debut && touched.date_debut ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="date_debut" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="editDateFin" className="form-label">Date de fin <span className="text-danger">*</span></label>
                        <Field
                          type="date"
                          id="editDateFin"
                          name="date_fin"
                          className={`form-control ${errors.date_fin && touched.date_fin ? 'is-invalid' : ''}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldValue('date_fin', value);
                            
                            // Update return date (one day after end date)
                            if (value) {
                              const endDate = new Date(value);
                              const returnDate = new Date(endDate);
                              returnDate.setDate(returnDate.getDate() + 1);
                              const formattedReturnDate = returnDate.toISOString().split('T')[0];
                              setFieldValue('date_retour', formattedReturnDate);
                            }
                          }}
                        />
                        <ErrorMessage name="date_fin" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="editDateRetour" className="form-label">Date de retour</label>
                        <Field
                          type="date"
                          id="editDateRetour"
                          name="date_retour"
                          className="form-control"
                        />
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="editRemuneration" className="form-label">Rémunération</label>
                        <Field
                          as="select"
                          id="editRemuneration"
                          name="remuneration"
                          className="form-select"
                        >
                          <option value="">Sélectionner</option>
                          {remunerationOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </Field>
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="editStatut" className="form-label">Statut</label>
                        <Field
                          as="select"
                          id="editStatut"
                          name="statut"
                          className="form-select"
                        >
                          {statutOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                          ))}
                        </Field>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="editDocument" className="form-label">Document justificatif</label>
                      <input
                        type="file"
                        id="editDocument"
                        name="document"
                        className="form-control"
                        onChange={(event) => handleFileChange(event, setFieldValue)}
                      />
                      
                      {selectedAbsence.document_path && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center">
                            <a 
                              href={selectedAbsence.document_path} 
                              className="btn btn-sm btn-outline-primary me-3" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <i className="fas fa-file-download me-2"></i>Document actuel
                            </a>
                            <div className="form-check">
                              <Field
                                type="checkbox"
                                id="keepDocument"
                                name="keep_document"
                                className="form-check-input"
                              />
                              <label className="form-check-label" htmlFor="keepDocument">
                                Conserver le document actuel
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="form-text">Format accepté: PDF, JPG, PNG (max 5MB)</div>
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
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

      {/* Confirmation Delete Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                Confirmer la suppression
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteId(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette absence ?</p>
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-circle me-2"></i>
                Cette action est irréversible. Toutes les données associées à cette absence seront définitivement supprimées.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowConfirmModal(false);
                  setDeleteId(null);
                }}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeleteAbsence}
              >
                <i className="fas fa-trash me-2"></i>
                Supprimer
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
          max-width: 800px;
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
        
        .info-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }
        
        .info-label {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .badge {
          padding: 6px 10px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 0.85rem;
        }
        
        .badge-remunerated {
          background-color: #28a745;
          color: white;
        }
        
        .badge-not-remunerated {
          background-color: #dc3545;
          color: white;
        }
        
        .badge-pending {
          background-color: #ffc107;
          color: #212529;
        }
        
        .badge-success {
          background-color: #28a745;
          color: white;
        }
        
        .user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          font-weight: bold;
        }
        
        .sortable-header {
          cursor: pointer;
          user-select: none;
          position: relative;
        }
        
        .sortable-header:hover {
          background-color: #f8f9fa;
        }
        
        .action-btns {
          display: flex;
          gap: 5px;
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

export default AbsenceManagement;
