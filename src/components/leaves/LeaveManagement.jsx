import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { congeService } from '../../services/congeService';
import { employeeService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const LeaveManagement = () => {
  // États
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConge, setEditingConge] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [conges, setConges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConge, setSelectedConge] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date_demande', direction: 'desc' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Validation schema pour le formulaire de congé
  const congeSchema = Yup.object().shape({
    nom_employe: Yup.string().required('L\'employé est requis'),
    service: Yup.string().required('Le service est requis'),
    type_conge: Yup.string().required('Le type de congé est requis'),
    date_debut: Yup.date().required('La date de début est requise'),
    date_fin: Yup.date().required('La date de fin est requise')
      .min(
        Yup.ref('date_debut'), 
        'La date de fin doit être postérieure à la date de début'
      ),
    date_retour: Yup.date()
      .min(
        Yup.ref('date_fin'),
        'La date de retour doit être postérieure à la date de fin'
      ),
    motif: Yup.string().when('type_conge', {
      is: (val) => val === 'Maladie' || val === 'Congé sans solde' || val === 'Congé exceptionnel',
      then: () => Yup.string().required('Le motif est requis pour ce type de congé')
    }),
  });

  // Types de congés
  const leaveTypes = [
    'Congé payé',
    'Maladie',
    'Formation',
    'Congé sans solde',
    'Congé paternité',
    'Congé maternité',
    'Congé annuel',
    'Congé exceptionnel',
    'Autre'
  ];

  // Services
  const services = [
    'Clinique',
    'Laboratoire',
    'Accueil/Facturation',
    'Hotellerie/Hospitalité/Buanderie/Self',
    'Direction Générale',
    'Marketing/Communication',
    'Cotation'
  ];

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Fonction pour récupérer les congés - memoized avec useCallback
  const fetchConges = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const congesData = await congeService.getAll();
      setConges(congesData);
    } catch (error) {
      console.error('Erreur lors de la récupération des congés:', error);
      setError('Impossible de charger les données de congés. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour récupérer les employés - memoized avec useCallback
  const fetchEmployees = useCallback(async () => {
    try {
      const employeesData = await employeeService.getAll();
      console.log('Données des employés reçues:', employeesData);
      
      // Vérifier si les données des employés ont été correctement récupérées
      if (Array.isArray(employeesData) && employeesData.length > 0) {
        // Adapter le format selon la structure réelle des données
        const formattedEmployees = employeesData.map(emp => {
          // Vérifier le format des données d'employés et adapter en conséquence
          return {
            id: emp.id,
            // Si l'API renvoie directement nom_prenom au lieu de first_name/last_name
            nom_prenom: emp.nom_prenom || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            poste: emp.poste_actuel || emp.poste || '',
            service: emp.functional_area || emp.service || '',
            date_embauche: emp.date_entree || emp.date_embauche || '',
            jours_conges_annuels: emp.jours_conges_annuels || 30
          };
        });
        
        setEmployees(formattedEmployees);
        
        // Créer un objet pour un accès rapide aux détails des employés
        const employeeDetailsMap = {};
        formattedEmployees.forEach(emp => {
          const fullName = emp.nom_prenom;
          employeeDetailsMap[fullName] = {
            poste: emp.poste || '',
            service: emp.service || '',
            date_embauche: emp.date_embauche || '',
            jours_conges_annuels: emp.jours_conges_annuels || 30
          };
        });
        setEmployeeDetails(employeeDetailsMap);
        
        console.log('Employés formatés:', formattedEmployees);
      } else {
        throw new Error('Format de données employés invalide ou vide');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      
      // En cas d'erreur, utiliser des données de secours
      const fallbackEmployees = [
        { id: '1', nom_prenom: 'John Doe', poste: 'Médecin', service: 'Clinique' },
        { id: '2', nom_prenom: 'Jane Smith', poste: 'Infirmière', service: 'Laboratoire' },
        { id: '3', nom_prenom: 'Robert Johnson', poste: 'Technicien', service: 'Accueil/Facturation' }
      ];
      setEmployees(fallbackEmployees);
      
      const employeeDetailsMap = {};
      fallbackEmployees.forEach(emp => {
        employeeDetailsMap[emp.nom_prenom] = {
          poste: emp.poste || '',
          service: emp.service || '',
          date_embauche: '',
          jours_conges_annuels: 30
        };
      });
      setEmployeeDetails(employeeDetailsMap);
    }
  }, []);

  // Récupérer les congés et les employés au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger d'abord les employés pour qu'ils soient disponibles dans le formulaire
        await fetchEmployees();
        await fetchConges();
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError("Une erreur est survenue lors du chargement des données. Veuillez actualiser la page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchConges, fetchEmployees]);

  // Gérer la soumission du formulaire de congé
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Calculer les jours pris si non fournis
      const startDate = new Date(values.date_debut);
      const endDate = new Date(values.date_fin);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Préparer les données pour l'API
      const congeData = new FormData();
      
      // Ajouter les champs de base avec conversion des dates
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          // Exclure les champs calculés qui seront ajoutés séparément
          if (key === 'jours_pris' || key === 'jours_restants' || key === 'statut' || key === 'date_demande') {
            return; // Skip these fields
          }
          
          // Convertir les dates en format YYYY-MM-DD
          if (key.includes('date_')) {
            let dateValue = values[key];
            
            // Si c'est un objet Date, le convertir en string
            if (dateValue instanceof Date) {
              dateValue = dateValue.toISOString().split('T')[0];
            } else if (typeof dateValue === 'string') {
              // Si c'est une string ISO, la convertir en YYYY-MM-DD
              if (dateValue.includes('T') || dateValue.includes('Z')) {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                  dateValue = date.toISOString().split('T')[0];
                }
              }
              // Si c'est déjà au format YYYY-MM-DD, l'utiliser tel quel
            }
            
            congeData.append(key, dateValue);
          } else {
            congeData.append(key, values[key]);
          }
        }
      });
      
      // Ajouter les champs calculés
      congeData.append('jours_pris', diffDays);
      congeData.append('statut', 'En attente');
      congeData.append('date_demande', new Date().toISOString().split('T')[0]);
      
      // Ajouter les jours restants si les jours annuels sont définis
      if (values.jours_conges_annuels) {
        congeData.append('jours_restants', values.jours_conges_annuels - diffDays);
      }
      
      // Ajouter le fichier si présent
      if (selectedFile) {
        congeData.append('document', selectedFile);
      }
      
      // Envoyer les données à l'API
      const response = await congeService.create(congeData);
      
      // Ajouter le nouveau congé à la liste
      setConges(prev => [response, ...prev]);
      
      // Succès
      setSubmitSuccess(true);
      resetForm();
      showNotification('Demande de congé créée avec succès!');
      
      // Fermer le modal après succès
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setSelectedFile(null);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la soumission du congé:', error);
      setError('Une erreur est survenue lors de l\'enregistrement du congé.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approuver un congé
  const handleApprove = async (id) => {
    try {
      setIsLoading(true);
      const response = await congeService.approve(id);
      
      // Mettre à jour la liste des congés
      setConges(prev => 
        prev.map(conge => 
          conge.id === id ? response : conge
        )
      );
      
      showNotification('Congé approuvé avec succès!');
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'approbation du congé:', error);
      setError('Une erreur est survenue lors de l\'approbation du congé.');
      setIsLoading(false);
    }
  };

  // Ouvrir le modal de rejet
  const openRejectModal = (id) => {
    setSelectedConge(conges.find(conge => conge.id === id));
    setShowRejectModal(true);
  };

  // Ouvrir le modal de modification
  const openEditModal = async (id) => {
    try {
      const conge = await congeService.getById(id);
      setEditingConge(conge);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération du congé:', error);
      showNotification('Erreur lors de la récupération du congé', 'error');
    }
  };

  // Gérer la soumission de la modification
  const handleEditSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculer les jours pris si non fournis
      const startDate = new Date(values.date_debut);
      const endDate = new Date(values.date_fin);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // Préparer les données pour l'API
      const congeData = new FormData();
      
      // Ajouter les champs de base avec conversion des dates
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          // Convertir les dates en format YYYY-MM-DD
          if (key.includes('date_') && values[key] instanceof Date) {
            congeData.append(key, values[key].toISOString().split('T')[0]);
          } else if (key.includes('date_') && typeof values[key] === 'string') {
            // Si c'est déjà une string, s'assurer qu'elle est au bon format
            const dateValue = new Date(values[key]);
            if (!isNaN(dateValue.getTime())) {
              congeData.append(key, dateValue.toISOString().split('T')[0]);
            } else {
              congeData.append(key, values[key]);
            }
          } else {
            congeData.append(key, values[key]);
          }
        }
      });
      
      // Ajouter les champs calculés
      congeData.append('jours_pris', diffDays);
      
      // Ajouter les jours restants si les jours annuels sont définis
      if (values.jours_conges_annuels) {
        congeData.append('jours_restants', values.jours_conges_annuels - diffDays);
      }
      
      // Ajouter le fichier si présent
      if (selectedFile) {
        congeData.append('document', selectedFile);
      }
      
      // Envoyer les données à l'API
      const response = await congeService.update(editingConge.id, congeData);
      
      // Mettre à jour la liste des congés
      setConges(prev => prev.map(conge => 
        conge.id === editingConge.id ? response : conge
      ));
      
      // Succès
      showNotification('Congé modifié avec succès!');
      
      // Fermer le modal après succès
      setTimeout(() => {
        setShowEditModal(false);
        setEditingConge(null);
        setSelectedFile(null);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la modification du congé:', error);
      setError('Une erreur est survenue lors de la modification du congé.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Veuillez fournir un motif de refus.');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await congeService.reject(selectedConge.id, rejectReason);
      
      // Mettre à jour la liste des congés
      setConges(prev => 
        prev.map(conge => 
          conge.id === selectedConge.id ? response : conge
        )
      );
      
      setShowRejectModal(false);
      setRejectReason('');
      showNotification('Congé refusé avec succès!');
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du refus du congé:', error);
      setError('Une erreur est survenue lors du refus du congé.');
      setIsLoading(false);
    }
  };

  // Afficher les détails d'un congé
  const handleViewDetails = async (id) => {
    try {
      setIsLoading(true);
      const conge = await congeService.getById(id);
      setSelectedConge(conge);
      setShowDetailsModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du congé:', error);
      setError('Une erreur est survenue lors de la récupération des détails du congé.');
      setIsLoading(false);
    }
  };

  // Confirmer la suppression d'un congé
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Supprimer un congé
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await congeService.delete(deleteId);
      setConges(prev => prev.filter(conge => conge.id !== deleteId));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      showNotification('Congé supprimé avec succès!');
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors de la suppression du congé:', error);
      setError('Une erreur est survenue lors de la suppression du congé.');
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Gérer le changement de fichier
  const handleFileChange = (event) => {
    const file = event.target.files[0];
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
    }
  };

  // Calculer la classe CSS du badge en fonction du statut
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Approuvé':
        return 'badge-approved';
      case 'Refusé':
        return 'badge-rejected';
      default:
        return 'badge-pending';
    }
  };

  // Obtenir l'icône en fonction du type de congé
  const getLeaveTypeIcon = (type) => {
    switch(type) {
      case 'Congé payé':
        return <i className="fas fa-umbrella-beach text-primary me-2"></i>;
      case 'Maladie':
        return <i className="fas fa-procedures text-danger me-2"></i>;
      case 'Formation':
        return <i className="fas fa-graduation-cap text-info me-2"></i>;
      case 'Congé sans solde':
        return <i className="fas fa-calendar-times text-secondary me-2"></i>;
      case 'Congé paternité':
        return <i className="fas fa-baby text-success me-2"></i>;
      case 'Congé maternité':
        return <i className="fas fa-baby-carriage text-pink me-2"></i>;
      default:
        return <i className="fas fa-calendar-day text-warning me-2"></i>;
    }
  };

  // Calculer les initiales à partir du nom
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
    } else {
      return name.substring(0, 2).toUpperCase();
    }
  };

  // Calculer les jours en fonction des dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Formatter une date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Récupérer les détails de l'employé à partir de son nom
  const getEmployeeDetailsByName = (name) => {
    return employeeDetails[name] || { 
      poste: '', 
      service: '', 
      date_embauche: '', 
      jours_conges_annuels: 30 
    };
  };

  // Trier les congés
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrer et trier les congés
  const filteredAndSortedConges = React.useMemo(() => {
    // Filtrer par terme de recherche et statut
    let result = [...conges];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(conge => 
        conge.nom_employe.toLowerCase().includes(searchLower) ||
        conge.service?.toLowerCase().includes(searchLower) ||
        conge.type_conge.toLowerCase().includes(searchLower)
      );
    }
    
    if (statusFilter) {
      result = result.filter(conge => conge.statut === statusFilter);
    }
    
    // Trier
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
  }, [conges, searchTerm, statusFilter, sortConfig]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSortConfig({ key: 'date_demande', direction: 'desc' });
  };

  // Actualiser les données
  const refreshConges = () => {
    fetchConges();
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des Congés</h1>
          <p className="page-subtitle">Consultez et gérez les demandes de congés des employés</p>
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

      <div className="actions-bar fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i>Nouveau congé
          </button>
          <button className="btn btn-outline-primary ms-2" onClick={() => window.print()}>
            <i className="fas fa-print me-2"></i>Imprimer
          </button>
        </div>
        <div>
          <button className="btn btn-outline-secondary" onClick={refreshConges}>
            <i className="fas fa-sync-alt me-2"></i>Actualiser
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-container mb-4 fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Rechercher par nom, service ou type..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Approuvé">Approuvé</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={resetFilters}>
              <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="data-card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="data-card-header">
          <h3 className="data-card-title">Demandes de congés</h3>
          {filteredAndSortedConges.length > 0 && (
            <span className="badge badge-pill badge-info">
              {filteredAndSortedConges.length} {filteredAndSortedConges.length > 1 ? 'demandes' : 'demande'}
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
          ) : filteredAndSortedConges.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times empty-icon"></i>
              <h4 className="empty-title">Aucune demande de congé</h4>
              <p className="empty-text">
                {searchTerm || statusFilter ? 
                  'Aucun résultat ne correspond à vos critères de recherche.' : 
                  'Il n\'y a aucune demande de congé à afficher pour le moment.'}
              </p>
              {searchTerm || statusFilter ? (
                <button className="btn btn-outline-secondary" onClick={resetFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <i className="fas fa-plus me-2"></i>Nouveau congé
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table id="congesTable" className="table table-hover">
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
                    <th onClick={() => handleSort('type_conge')} className="sortable-header">
                      Type
                      {sortConfig.key === 'type_conge' && (
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
                    <th onClick={() => handleSort('jours_pris')} className="sortable-header">
                      Durée
                      {sortConfig.key === 'jours_pris' && (
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
                  {filteredAndSortedConges.map((conge) => (
                    <tr key={conge.id} className={conge.statut === 'En attente' ? 'table-row-highlight' : ''}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-2" style={{ 
                            width: '30px', 
                            height: '30px', 
                            fontSize: '0.75rem',
                            backgroundColor: `hsl(${conge.nom_employe.length * 15}, 70%, 50%)` 
                          }}>
                            {getInitials(conge.nom_employe)}
                          </div>
                          {conge.nom_employe}
                        </div>
                      </td>
                      <td>{conge.service || '-'}</td>
                      <td>
                        {getLeaveTypeIcon(conge.type_conge)}
                        {conge.type_conge}
                      </td>
                      <td>{formatDate(conge.date_debut)}</td>
                      <td>{formatDate(conge.date_fin)}</td>
                      <td>
                        <span className="badge badge-pill badge-info">
                          {conge.jours_pris ? `${conge.jours_pris} jour(s)` : `${calculateDays(conge.date_debut, conge.date_fin)} jour(s)`}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(conge.statut)}`}>
                          {conge.statut}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {conge.statut === 'En attente' && (
                            <>
                              <button 
                                onClick={() => handleApprove(conge.id)} 
                                className="btn btn-success btn-sm" 
                                title="Approuver"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                onClick={() => openRejectModal(conge.id)} 
                                className="btn btn-danger btn-sm" 
                                title="Refuser"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleViewDetails(conge.id)} 
                            className="btn btn-primary btn-sm" 
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            onClick={() => openEditModal(conge.id)} 
                            className="btn btn-warning btn-sm" 
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => confirmDelete(conge.id)} 
                            className="btn btn-danger btn-sm" 
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

      {/* Modal de nouveau congé */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-calendar-plus me-2 text-primary"></i>
                Nouvelle demande de congé
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
                  Congé enregistré avec succès!
                </div>
              )}

              <Formik
                initialValues={{
                  nom_employe: '',
                  service: '',
                  poste: '',
                  date_embauche: '',
                  jours_conges_annuels: '30',
                  date_demande: new Date().toISOString().split('T')[0],
                  date_debut: '',
                  date_fin: '',
                  date_retour: '',
                  jours_pris: '',
                  jours_restants: '',
                  date_prochaine_attribution: '',
                  type_conge: '',
                  motif: ''
                }}
                validationSchema={congeSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue, isValid, dirty }) => {
                  // Mise à jour des champs basés sur l'employé sélectionné
                  const handleEmployeeChange = (e) => {
                    const selectedEmployee = e.target.value;
                    setFieldValue('nom_employe', selectedEmployee);
                    
                    // Récupérer les détails de l'employé
                    const details = getEmployeeDetailsByName(selectedEmployee);
                    
                    if (details) {
                      setFieldValue('poste', details.poste);
                      setFieldValue('service', details.service);
                      setFieldValue('date_embauche', details.date_embauche);
                      setFieldValue('jours_conges_annuels', details.jours_conges_annuels);
                    }
                  };
                  
                  return (
                    <Form>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="nom_employe" className="form-label">Employé</label>
                          <Field 
                            as="select" 
                            name="nom_employe" 
                            className={`form-select ${errors.nom_employe && touched.nom_employe ? 'is-invalid' : ''}`}
                            onChange={handleEmployeeChange}
                          >
                            <option value="" disabled>Sélectionner un employé</option>
                            {employees && employees.length > 0 ? (
                              employees.map((employee) => (
                                <option key={employee.id} value={employee.nom_prenom}>
                                  {employee.nom_prenom}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>Chargement des employés...</option>
                            )}
                          </Field>
                          <ErrorMessage name="nom_employe" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="col-md-6">
                          <label htmlFor="service" className="form-label">Service</label>
                          <Field 
                            as="select" 
                            name="service" 
                            className={`form-select ${errors.service && touched.service ? 'is-invalid' : ''}`}
                          >
                            <option value="" disabled>Sélectionner un service</option>
                            {services.map((service, index) => (
                              <option key={index} value={service}>{service}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="service" component="div" className="invalid-feedback" />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label htmlFor="poste" className="form-label">Poste</label>
                          <Field 
                            type="text" 
                            name="poste" 
                            className="form-control" 
                            placeholder="Poste de l'employé" 
                          />
                        </div>
                        
                        <div className="col-md-6">
                          <label htmlFor="type_conge" className="form-label">Type de congé</label>
                          <Field 
                            as="select" 
                            name="type_conge" 
                            className={`form-select ${errors.type_conge && touched.type_conge ? 'is-invalid' : ''}`}
                          >
                            <option value="" disabled>Sélectionner un type</option>
                            {leaveTypes.map((type, index) => (
                              <option key={index} value={type}>{type}</option>
                            ))}
                          </Field>
                          <ErrorMessage name="type_conge" component="div" className="invalid-feedback" />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <label htmlFor="date_debut" className="form-label">Date de début</label>
                          <Field 
                            type="date" 
                            name="date_debut" 
                            className={`form-control ${errors.date_debut && touched.date_debut ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                              const value = e.target.value; // Format YYYY-MM-DD
                              setFieldValue('date_debut', value);
                              
                              // Mettre à jour les jours pris et la date de retour si la date de fin est définie
                              if (values.date_fin) {
                                const diffDays = calculateDays(value, values.date_fin);
                                
                                setFieldValue('jours_pris', diffDays);
                                
                                // Calculer la date de retour (jour après la date de fin)
                                const endDate = new Date(values.date_fin);
                                endDate.setDate(endDate.getDate() + 1);
                                setFieldValue('date_retour', endDate.toISOString().split('T')[0]);
                                
                                // Calculer les jours restants si les jours annuels sont définis
                                if (values.jours_conges_annuels) {
                                  setFieldValue('jours_restants', values.jours_conges_annuels - diffDays);
                                }
                              }
                            }}
                          />
                          <ErrorMessage name="date_debut" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="date_fin" className="form-label">Date de fin</label>
                          <Field 
                            type="date" 
                            name="date_fin" 
                            className={`form-control ${errors.date_fin && touched.date_fin ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                              const value = e.target.value; // Format YYYY-MM-DD
                              setFieldValue('date_fin', value);
                              
                              // Mettre à jour les jours pris et la date de retour si la date de début est définie
                              if (values.date_debut) {
                                const diffDays = calculateDays(values.date_debut, value);
                                
                                setFieldValue('jours_pris', diffDays);
                                
                                // Calculer la date de retour (jour après la date de fin)
                                const endDate = new Date(value);
                                endDate.setDate(endDate.getDate() + 1);
                                setFieldValue('date_retour', endDate.toISOString().split('T')[0]);
                                
                                // Calculer les jours restants si les jours annuels sont définis
                                if (values.jours_conges_annuels) {
                                  setFieldValue('jours_restants', values.jours_conges_annuels - diffDays);
                                }
                              }
                            }}
                          />
                          <ErrorMessage name="date_fin" component="div" className="invalid-feedback" />
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="date_retour" className="form-label">Date de retour</label>
                          <Field 
                            type="date" 
                            name="date_retour" 
                            className={`form-control ${errors.date_retour && touched.date_retour ? 'is-invalid' : ''}`} 
                          />
                          <ErrorMessage name="date_retour" component="div" className="invalid-feedback" />
                        </div>
                      </div>
                      
                      <div className="row mb-3">
                        <div className="col-md-4">
                          <label htmlFor="date_embauche" className="form-label">Date d'embauche</label>
                          <Field 
                            type="date" 
                            name="date_embauche" 
                            className="form-control" 
                          />
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="jours_conges_annuels" className="form-label">Jours de congés annuels</label>
                          <Field 
                            type="number" 
                            name="jours_conges_annuels" 
                            className="form-control" 
                            min="0" 
                          />
                        </div>
                        
                        <div className="col-md-4">
                          <label htmlFor="jours_pris" className="form-label">Jours pris</label>
                          <Field 
                            type="number" 
                            name="jours_pris" 
                            className="form-control" 
                            min="1"
                            readOnly 
                          />
                          <small className="text-muted">Calculé automatiquement</small>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="motif" className="form-label">
                          Motif
                          {(values.type_conge === 'Maladie' || values.type_conge === 'Congé sans solde' || values.type_conge === 'Congé exceptionnel') && (
                            <span className="text-danger">*</span>
                          )}
                        </label>
                        <Field 
                          as="textarea" 
                          name="motif" 
                          className={`form-control ${errors.motif && touched.motif ? 'is-invalid' : ''}`}
                          rows="3" 
                          placeholder="Précisez le motif du congé" 
                        />
                        <ErrorMessage name="motif" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="document" className="form-label">Document justificatif</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          id="document" 
                          name="document" 
                          onChange={handleFileChange} 
                          accept=".pdf,.jpg,.jpeg,.png" 
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
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails du congé */}
      {showDetailsModal && selectedConge && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Détails du congé
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
                          width: '30px', 
                          height: '30px', 
                          fontSize: '0.75rem',
                          backgroundColor: `hsl(${selectedConge.nom_employe.length * 15}, 70%, 50%)` 
                        }}>
                          {getInitials(selectedConge.nom_employe)}
                        </div>
                        <span className="fw-bold">{selectedConge.nom_employe}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Service :</div>
                    <div className="info-value">{selectedConge.service || '-'}</div>
                  </div>

                  <div className="info-group mb-3">
                    <div className="info-label">Poste :</div>
                    <div className="info-value">{selectedConge.poste || '-'}</div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Date d'embauche :</div>
                    <div className="info-value">{formatDate(selectedConge.date_embauche)}</div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Type de congé :</div>
                    <div className="info-value">
                      {getLeaveTypeIcon(selectedConge.type_conge)}
                      {selectedConge.type_conge}
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Date de demande :</div>
                    <div className="info-value">{formatDate(selectedConge.date_demande)}</div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="info-group mb-3">
                    <div className="info-label">Période :</div>
                    <div className="info-value">
                      Du {formatDate(selectedConge.date_debut)} au {formatDate(selectedConge.date_fin)}
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Date de retour :</div>
                    <div className="info-value">{formatDate(selectedConge.date_retour)}</div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Durée :</div>
                    <div className="info-value">
                      <span className="badge badge-pill badge-info">
                        {selectedConge.jours_pris ? 
                          `${selectedConge.jours_pris} jour(s)` : 
                          `${calculateDays(selectedConge.date_debut, selectedConge.date_fin)} jour(s)`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Jours annuels :</div>
                    <div className="info-value">
                      {selectedConge.jours_conges_annuels ? 
                        `${selectedConge.jours_conges_annuels} jour(s)` : 
                        '-'
                      }
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Jours restants :</div>
                    <div className="info-value">
                      {selectedConge.jours_restants ? 
                        `${selectedConge.jours_restants} jour(s)` : 
                        '-'
                      }
                    </div>
                  </div>
                  
                  <div className="info-group mb-3">
                    <div className="info-label">Statut :</div>
                    <div className="info-value">
                      <span className={`badge ${getStatusBadgeClass(selectedConge.statut)}`}>
                        {selectedConge.statut}
                      </span>
                      {selectedConge.statut === 'Refusé' && selectedConge.motif_refus && (
                        <div className="text-danger mt-1">
                          <small><i className="fas fa-info-circle me-1"></i> {selectedConge.motif_refus}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-md-12">
                  <div className="info-group mb-3">
                    <div className="info-label">Motif :</div>
                    <div className="info-value">
                      {selectedConge.motif ? (
                        <div className="card bg-light p-2">
                          {selectedConge.motif}
                        </div>
                      ) : '-'}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedConge.document_path && (
                <div className="row">
                  <div className="col-md-12">
                    <div className="info-group mb-3">
                      <div className="info-label">Document :</div>
                      <div className="info-value">
                        <a href={selectedConge.document_path} className="btn btn-sm btn-outline-primary" download>
                          <i className="fas fa-file-download me-2"></i>Télécharger le document
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {(selectedConge.date_traitement || selectedConge.statut !== 'En attente') && (
                <div className="row">
                  <div className="col-md-12">
                    <div className="info-group mb-3">
                      <div className="info-label">Traitement :</div>
                      <div className="info-value">
                        {selectedConge.date_traitement ? formatDate(selectedConge.date_traitement) : new Date().toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times me-2"></i>Fermer
              </button>
              {selectedConge.statut === 'En attente' && (
                <>
                  <button type="button" className="btn btn-success" onClick={() => {
                    handleApprove(selectedConge.id);
                    setShowDetailsModal(false);
                  }}>
                    <i className="fas fa-check me-2"></i>Approuver
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => {
                    setShowDetailsModal(false);
                    openRejectModal(selectedConge.id);
                  }}>
                    <i className="fas fa-times me-2"></i>Refuser
                  </button>
                </>
              )}
              <button type="button" className="btn btn-outline-danger" onClick={() => {
                setShowDetailsModal(false);
                confirmDelete(selectedConge.id);
              }}>
                <i className="fas fa-trash me-2"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet de congé */}
      {showRejectModal && selectedConge && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-times-circle text-danger me-2"></i>
                Refuser la demande de congé
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              ></button>
            </div>
            <div className="modal-body">
              <p>Vous êtes sur le point de refuser la demande de congé de <strong>{selectedConge.nom_employe}</strong>.</p>
              
              <div className="mb-3">
                <label htmlFor="rejectReason" className="form-label">Motif du refus <span className="text-danger">*</span></label>
                <textarea 
                  id="rejectReason" 
                  className="form-control" 
                  rows="3" 
                  placeholder="Veuillez indiquer la raison du refus..." 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                ></textarea>
                <div className="form-text">Cette information sera visible par l'employé.</div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                <i className="fas fa-arrow-left me-2"></i>Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <i className="fas fa-times me-2"></i>Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de congé */}
      {showEditModal && editingConge && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2 text-warning"></i>
                Modifier la demande de congé
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingConge(null);
                  setSelectedFile(null);
                  setError(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}
              
              <Formik
                initialValues={{
                  nom_employe: editingConge.nom_employe || '',
                  service: editingConge.service || '',
                  poste: editingConge.poste || '',
                  date_embauche: editingConge.date_embauche || '',
                  jours_conges_annuels: editingConge.jours_conges_annuels || 30,
                  date_debut: editingConge.date_debut ? editingConge.date_debut.split('T')[0] : '',
                  date_fin: editingConge.date_fin ? editingConge.date_fin.split('T')[0] : '',
                  date_retour: editingConge.date_retour ? editingConge.date_retour.split('T')[0] : '',
                  motif: editingConge.motif || '',
                  type_conge: editingConge.type_conge || 'Congé payé'
                }}
                validationSchema={congeSchema}
                onSubmit={handleEditSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="nom_employe" className="form-label">
                            <i className="fas fa-user me-2 text-primary"></i>
                            Employé *
                          </label>
                          <Field
                            as="select"
                            name="nom_employe"
                            className="form-select"
                            disabled
                          >
                            <option value="">Sélectionner un employé</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.nom_prenom}>
                                {emp.nom_prenom}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="nom_employe" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="service" className="form-label">
                            <i className="fas fa-building me-2 text-primary"></i>
                            Service *
                          </label>
                          <Field
                            as="select"
                            name="service"
                            className="form-select"
                          >
                            <option value="">Sélectionner un service</option>
                            {services.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="service" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="type_conge" className="form-label">
                            <i className="fas fa-calendar-alt me-2 text-primary"></i>
                            Type de congé *
                          </label>
                          <Field
                            as="select"
                            name="type_conge"
                            className="form-select"
                          >
                            {leaveTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name="type_conge" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="date_debut" className="form-label">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            Date de début *
                          </label>
                          <Field
                            type="date"
                            name="date_debut"
                            className="form-control"
                          />
                          <ErrorMessage name="date_debut" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="date_fin" className="form-label">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            Date de fin *
                          </label>
                          <Field
                            type="date"
                            name="date_fin"
                            className="form-control"
                          />
                          <ErrorMessage name="date_fin" component="div" className="text-danger small" />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label htmlFor="date_retour" className="form-label">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            Date de retour
                          </label>
                          <Field
                            type="date"
                            name="date_retour"
                            className="form-control"
                          />
                          <ErrorMessage name="date_retour" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="motif" className="form-label">
                            <i className="fas fa-comment me-2 text-primary"></i>
                            Motif
                          </label>
                          <Field
                            as="textarea"
                            name="motif"
                            className="form-control"
                            rows="3"
                            placeholder="Détails du motif..."
                          />
                          <ErrorMessage name="motif" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="jours_conges_annuels" className="form-label">
                            <i className="fas fa-calendar-check me-2 text-primary"></i>
                            Jours de congés annuels
                          </label>
                          <Field
                            type="number"
                            name="jours_conges_annuels"
                            className="form-control"
                            min="0"
                            max="365"
                          />
                          <ErrorMessage name="jours_conges_annuels" component="div" className="text-danger small" />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="document" className="form-label">
                            <i className="fas fa-file me-2 text-primary"></i>
                            Document (optionnel)
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <div className="form-text">
                            Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingConge(null);
                          setSelectedFile(null);
                          setError(null);
                        }}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-times me-2"></i>Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-warning" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Modification en cours...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>Enregistrer les modifications
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

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                Confirmer la suppression
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette demande de congé ?</p>
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-circle me-2"></i>
                Cette action est irréversible et supprimera définitivement cette demande.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                <i className="fas fa-times me-2"></i>Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash me-2"></i>Supprimer
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
        
        .badge-approved {
          background-color: #28a745;
          color: white;
        }
        
        .badge-rejected {
          background-color: #dc3545;
          color: white;
        }
        
        .badge-pending {
          background-color: #ffc107;
          color: #212529;
        }
        
        .badge-info {
          background-color: #17a2b8;
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
        
        .table-row-highlight {
          background-color: rgba(255, 243, 205, 0.3);
        }
        
        .table-row-highlight:hover {
          background-color: rgba(255, 243, 205, 0.5) !important;
        }
        
        .filters-container {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
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

export default LeaveManagement;
