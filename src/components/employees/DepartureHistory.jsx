import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { departService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const DepartureHistory = () => {
  // États principaux
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departures, setDepartures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [departureToDelete, setDepartureToDelete] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Fonction pour générer un matricule automatique
  const generateMatricule = useCallback(() => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    return `CDL-${year}-${timestamp}`;
  }, []);
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    matricule: '',
    departement: '',
    statut: '',
    motif_depart: '',
    date_debut: '',
    date_fin: ''
  });

  // Données de référence pour les filtres
  const [departments, setDepartments] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [departureReasons] = useState([
    'Démission',
    'Licenciement',
    'Rupture conventionnelle',
    'Fin de contrat',
    'Fin de période d\'essai',
    'Retraite',
    'Abandon de poste',
    'Mutation',
    'Décès',
    'Autre'
  ]);

  // Validation schema pour l'ajout/modification d'un départ
  const departureSchema = Yup.object().shape({
    nom: Yup.string().required('Le nom est requis'),
    prenom: Yup.string().required('Le prénom est requis'),
    matricule: Yup.string()
      .required('Le matricule est requis')
      .matches(/^CDL-\d{4}-\d{4}$/, 'Le matricule doit être au format CDL-YYYY-XXXX (ex: CDL-2025-0001)'),
    departement: Yup.string().required('Le département est requis'),
    statut: Yup.string().required('Le statut est requis'),
    poste: Yup.string().required('Le poste est requis'),
    date_depart: Yup.date().required('La date de départ est requise'),
    motif_depart: Yup.string().required('Le motif de départ est requis'),
    commentaire: Yup.string()
  });

  // Validation schema pour l'import
  const importSchema = Yup.object().shape({
    file: Yup.mixed()
      .required('Un fichier est requis')
      .test('fileSize', 'Le fichier est trop volumineux (max 5MB)', 
        (value) => !value || value.size <= 5 * 1024 * 1024)
      .test('fileType', 'Format de fichier non supporté. Utilisez .xlsx, .csv ou .txt', 
        (value) => !value || ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain'].includes(value.type))
  });

  // Fonction pour afficher une notification temporaire
  const showTemporaryMessage = useCallback((message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);

  // Fonction pour récupérer les départs (memoized)
  const fetchDepartures = useCallback(async () => {
    setIsLoading(true);
    try {
      // Appel à l'API réelle
      let response;
      
      // Si des filtres sont appliqués, utilisez la méthode de recherche
      if (filters.search || filters.matricule || filters.departement || filters.statut || filters.motif_depart || filters.date_debut || filters.date_fin) {
        response = await departService.search(filters);
      } else {
        response = await departService.getAll();
      }
      
      console.log('📋 Données reçues de l\'API:', response.length, 'départ(s)');
      console.log('📋 Recherche de IFOUNGA:', response.filter(d => 
        d.nom?.includes('IFOUNGA') || d.prenom?.includes('Réginalde') || d.prenom?.includes('Réginalde')
      ));
      
      // Calculer la pagination
      const totalItems = response.length;
      const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
      
      setPagination(p => ({
        ...p,
        totalItems,
        totalPages
      }));
      
      // Paginer les résultats
      const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const endIndex = startIndex + pagination.itemsPerPage;
      const paginatedDepartures = response.slice(startIndex, endIndex);
      
      console.log('📋 Départs paginés:', paginatedDepartures.length, 'sur la page', pagination.currentPage);
      console.log('📋 Total items:', totalItems, 'Total pages:', totalPages);
      
      setDepartures(paginatedDepartures);
      setErrorMessage('');
    } catch (error) {
      console.error('Erreur lors de la récupération des départs:', error);
      setErrorMessage('Une erreur est survenue lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Fonction pour récupérer les données de référence (memoized)
  const fetchReferenceData = useCallback(async () => {
    try {
      // Dans une application réelle, ce serait un appel API pour récupérer les listes de référence
      const allDepartures = await departService.getAll();
      
      // Extraire les départements uniques
      const uniqueDepartments = [...new Set(allDepartures
        .map(d => d.departement)
        .filter(d => d && d.trim() !== '')
      )].sort();
      
      // Extraire les types de contrat uniques
      const uniqueStatuts = [...new Set(allDepartures
        .map(d => d.statut)
        .filter(s => s && s.trim() !== '')
      )].sort();
      
      setDepartments(uniqueDepartments.length > 0 ? uniqueDepartments : [
        'Administration',
        'Ressources Humaines',
        'Finance',
        'Marketing',
        'Informatique',
        'Production',
        'Logistique',
        'Commercial',
        'Médical',
        'Clinique',
        'Laboratoire',
        'Accueil/Facturation'
      ]);
      
      setContractTypes(uniqueStatuts.length > 0 ? uniqueStatuts : [
        'CDI',
        'CDD',
        'Intérim',
        'Stage',
        'Prestation'
      ]);
    } catch (error) {
      console.error('Erreur lors de la récupération des données de référence:', error);
    }
  }, []);

  // Charger les données lors du chargement initial
  useEffect(() => {
    fetchDepartures();
    fetchReferenceData();
  }, [fetchDepartures, fetchReferenceData]);

  // Charger les données lorsque les filtres ou la pagination changent
  useEffect(() => {
    fetchDepartures();
  }, [pagination.currentPage, fetchDepartures]);

  // Gestion des filtres
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Appliquer les filtres
  const applyFilters = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Revenir à la première page lors du filtrage
    }));
    fetchDepartures();
  }, [fetchDepartures]);

  // Réinitialisation des filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      matricule: '',
      departement: '',
      statut: '',
      motif_depart: '',
      date_debut: '',
      date_fin: ''
    });
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    setTimeout(() => fetchDepartures(), 0);
  }, [fetchDepartures]);

  // Changer de page
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  // Gestion du tri
  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  // Trier les départs
  const sortedDepartures = useMemo(() => {
    if (!sortConfig.key) return departures;
    
    return [...departures].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [departures, sortConfig]);

  // Formatage de la date pour l'affichage
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "Non spécifiée";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Traitement de l'ajout d'un départ
  const handleAddDeparture = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Appel à l'API réelle
      await departService.create(values);
      
      // Ajouter le nouveau départ à la liste et rafraîchir
      setSubmitSuccess(true);
      showTemporaryMessage('Le départ a été ajouté avec succès');
      resetForm();
      
      // Fermer le modal
      setTimeout(() => {
        setShowAddModal(false);
        fetchDepartures();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du départ:', error);
      setErrorMessage('Une erreur est survenue lors de l\'ajout du départ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Traitement de la modification d'un départ
  const handleUpdateDeparture = async (values) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Appel à l'API réelle
      await departService.update(values.id, values);
      
      // Succès
      setSubmitSuccess(true);
      showTemporaryMessage('Le départ a été mis à jour avec succès');
      
      // Fermer le modal et rafraîchir
      setTimeout(() => {
        setShowEditModal(false);
        fetchDepartures();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du départ:', error);
      setErrorMessage('Une erreur est survenue lors de la mise à jour du départ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher les détails d'un départ
  const handleViewDeparture = async (id) => {
    try {
      const departure = await departService.getById(id);
      setSelectedDeparture(departure);
      setShowViewModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du départ:', error);
      setErrorMessage('Erreur lors de la récupération des détails du départ');
    }
  };

  // Afficher le formulaire d'édition
  const handleEditDeparture = async (id) => {
    try {
      const departure = await departService.getById(id);
      setSelectedDeparture(departure);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du départ:', error);
      setErrorMessage('Erreur lors de la récupération des détails du départ');
    }
  };

  // Confirmation avant suppression
  const confirmDeleteDeparture = useCallback((departure) => {
    setDepartureToDelete(departure);
    setShowConfirmDeleteModal(true);
  }, []);

  // Supprimer un départ
  const handleDeleteDeparture = async () => {
    if (!departureToDelete) return;
    
    setIsSubmitting(true);
    try {
      await departService.delete(departureToDelete.id);
      showTemporaryMessage(`Le départ de ${departureToDelete.nom} ${departureToDelete.prenom} a été supprimé avec succès`);
      
      // Fermer les modals et rafraîchir
      setShowConfirmDeleteModal(false);
      if (showViewModal) setShowViewModal(false);
      fetchDepartures();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setErrorMessage('Une erreur est survenue lors de la suppression');
    } finally {
      setIsSubmitting(false);
      setDepartureToDelete(null);
    }
  };

  // Gérer le changement de fichier pour l'import
  const handleFileChange = useCallback((event) => {
    const file = event.currentTarget.files[0];
    setImportFile(file);
  }, []);

  // Traitement de l'importation
  const handleImport = async () => {
    if (!importFile) {
      setErrorMessage('Veuillez sélectionner un fichier à importer');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      
      // Appel à l'API d'importation
      const result = await departService.import(formData);
      
      showTemporaryMessage(`${result.imported} départs ont été importés avec succès`);
      setShowImportModal(false);
      setImportFile(null);
      fetchDepartures();
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      setErrorMessage('Une erreur est survenue lors de l\'importation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Exportation des données
  const handleExport = async () => {
    setIsLoading(true);
    try {
      await departService.export();
      showTemporaryMessage('Exportation réussie. Le téléchargement va commencer.');
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      setErrorMessage('Une erreur est survenue lors de l\'exportation');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir la couleur du badge en fonction du motif de départ
  const getDepartureReasonBadgeClass = useCallback((reason) => {
    if (!reason) return 'bg-secondary';
    
    const reasonLower = reason.toLowerCase();
    
    if (reasonLower.includes('démission')) {
      return 'bg-warning text-dark';
    } else if (reasonLower.includes('licenciement')) {
      return 'bg-danger';
    } else if (reasonLower.includes('fin de contrat') || reasonLower.includes('fin')) {
      return 'bg-info';
    } else if (reasonLower.includes('rupture')) {
      return 'bg-primary';
    } else if (reasonLower.includes('retraite')) {
      return 'bg-success';
    } else {
      return 'bg-secondary';
    }
  }, []);

  return (
    <>
      <div className="page-title-wrapper fade-in-up">
        <h1 className="page-title">Historique des départs</h1>
        <p className="page-subtitle">Suivez les départs des collaborateurs de votre entreprise</p>
      </div>
      
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i> {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i> {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}
      
      {/* Actions */}
      <div className="card fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-header">
          <h3 className="card-title"><i className="fas fa-cogs me-2"></i>Actions</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <button 
                className="btn btn-danger mb-3" 
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-user-minus btn-icon"></i>Ajouter un départ
              </button>
            </div>
            <div className="col-md-6 text-md-end">
              <button 
                className="btn btn-outline-danger mb-3 me-2" 
                onClick={() => setShowImportModal(true)}
              >
                <i className="fas fa-file-import btn-icon"></i>Importer des départs
              </button>
              <button 
                className="btn btn-outline-success mb-3" 
                onClick={handleExport}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="fas fa-file-export btn-icon"></i>
                )}
                Exporter (Excel)
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtres */}
      <div className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title"><i className="fas fa-filter me-2"></i>Filtres</h3>
          <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
            <i className="fas fa-redo-alt me-1"></i>Réinitialiser
          </button>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="search" className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="search" 
                  name="search" 
                  placeholder="Nom, prénom, poste..." 
                  value={filters.search}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="matricule" className="form-label">Matricule</label>
              <input 
                type="text" 
                className="form-control" 
                id="matricule" 
                name="matricule" 
                placeholder="CDL-2025-0001" 
                value={filters.matricule}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="departement" className="form-label">Département</label>
              <select 
                className="form-select" 
                id="departement" 
                name="departement"
                value={filters.departement}
                onChange={handleFilterChange}
              >
                <option value="">Tous les départements</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="statut" className="form-label">Type de contrat</label>
              <select 
                className="form-select" 
                id="statut" 
                name="statut"
                value={filters.statut}
                onChange={handleFilterChange}
              >
                <option value="">Tous les types</option>
                {contractTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="motif_depart" className="form-label">Motif de départ</label>
              <select 
                className="form-select" 
                id="motif_depart" 
                name="motif_depart"
                value={filters.motif_depart}
                onChange={handleFilterChange}
              >
                <option value="">Tous les motifs</option>
                {departureReasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 mb-3">
              <label htmlFor="date_debut" className="form-label">Date de départ (début)</label>
              <input 
                type="date" 
                className="form-control" 
                id="date_debut" 
                name="date_debut"
                value={filters.date_debut}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3 mb-3">
              <label htmlFor="date_fin" className="form-label">Date de départ (fin)</label>
              <input 
                type="date" 
                className="form-control" 
                id="date_fin" 
                name="date_fin"
                value={filters.date_fin}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="text-center">
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={applyFilters}
            >
              <i className="fas fa-search btn-icon"></i>Filtrer
            </button>
          </div>
        </div>
      </div>
      
      {/* Tableau des résultats */}
      <div className="card fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title"><i className="fas fa-list me-2"></i>Résultats</h3>
          <span className="badge bg-danger rounded-pill">{pagination.totalItems} départ(s)</span>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover" id="tableDepartures">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('nom')}>
                      Nom & Prénom
                      {sortConfig.key === 'nom' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('matricule')}>
                      Matricule
                      {sortConfig.key === 'matricule' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('date_depart')}>
                      Date de départ
                      {sortConfig.key === 'date_depart' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('departement')}>
                      Département
                      {sortConfig.key === 'departement' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('poste')}>
                      Poste
                      {sortConfig.key === 'poste' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('statut')}>
                      Type de contrat
                      {sortConfig.key === 'statut' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th className="sortable" onClick={() => handleSort('motif_depart')}>
                      Motif
                      {sortConfig.key === 'motif_depart' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDepartures.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <div className="empty-state">
                          <i className="fas fa-search fa-3x text-muted mb-3"></i>
                          <h5>Aucun départ trouvé</h5>
                          <p className="text-muted">
                            {(filters.search || filters.departement || filters.statut || filters.motif_depart || filters.date_debut || filters.date_fin) ? 
                              'Aucun résultat ne correspond à vos critères de recherche.' : 
                              'Aucun départ n\'a été enregistré pour le moment.'
                            }
                          </p>
                          {(filters.search || filters.departement || filters.statut || filters.motif_depart || filters.date_debut || filters.date_fin) && (
                            <button className="btn btn-outline-secondary mt-2" onClick={resetFilters}>
                              <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedDepartures.map(departure => {
                      // Debug: log pour vérifier les données
                      if (departure.nom?.includes('IFOUNGA')) {
                        console.log('🔍 IFOUNGA trouvé dans sortedDepartures:', departure);
                      }
                      return (
                        <tr key={departure.id} className="departure-row">
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-circle me-2" style={{
                              backgroundColor: `hsl(${(departure.nom?.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                            }}>
                              {departure.nom?.charAt(0) || ''}{departure.prenom?.charAt(0) || ''}
                            </div>
                            <div>
                              <div className="fw-bold">{departure.nom || '-'}</div>
                              <div>{departure.prenom || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{departure.matricule && departure.matricule !== 'N/A' ? departure.matricule : 'Non assigné'}</span>
                        </td>
                        <td>{formatDate(departure.date_depart)}</td>
                        <td>{departure.departement && departure.departement !== 'Département inconnu' ? departure.departement : '-'}</td>
                        <td>{departure.poste && departure.poste !== 'Poste inconnu' ? departure.poste : '-'}</td>
                        <td>{departure.statut && departure.statut !== '-' ? departure.statut : '-'}</td>
                        <td>
                          <span className={`badge ${getDepartureReasonBadgeClass(departure.motif_depart)}`}>
                            {departure.motif_depart || 'Non spécifié'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-outline-primary me-1" 
                              onClick={() => handleViewDeparture(departure.id)}
                              title="Voir détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-warning me-1" 
                              onClick={() => handleEditDeparture(departure.id)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => confirmDeleteDeparture(departure)}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  {pagination.currentPage > 1 && (
                    <li className="page-item">
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        aria-label="Précédent"
                      >
                        <span aria-hidden="true">&laquo;</span>
                      </button>
                    </li>
                  )}
                  
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    // Afficher les 5 pages autour de la page courante
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      (pageNumber >= pagination.currentPage - 2 && pageNumber <= pagination.currentPage + 2)
                    ) {
                      return (
                        <li 
                          key={i} 
                          className={`page-item ${pageNumber === pagination.currentPage ? 'active' : ''}`}
                        >
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    }
                    // Afficher des points de suspension pour les pages omises
                    if (
                      (pageNumber === pagination.currentPage - 3 && pagination.currentPage > 3) ||
                      (pageNumber === pagination.currentPage + 3 && pagination.currentPage < pagination.totalPages - 2)
                    ) {
                      return (
                        <li key={i} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    return null;
                  })}
                  
                  {pagination.currentPage < pagination.totalPages && (
                    <li className="page-item">
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        aria-label="Suivant"
                      >
                        <span aria-hidden="true">&raquo;</span>
                      </button>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="fas fa-user-minus me-2"></i>
                Ajouter un départ
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{
                nom: '',
                prenom: '',
                matricule: generateMatricule(),
                departement: '',
                statut: '',
                poste: '',
                date_depart: '',
                motif_depart: '',
                commentaire: ''
              }}
              validationSchema={departureSchema}
              onSubmit={handleAddDeparture}
            >
              {({ errors, touched, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    {submitSuccess && (
                      <div className="alert alert-success" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        Le départ a été ajouté avec succès!
                      </div>
                    )}
                    
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="nom" className="form-label">Nom <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.nom && touched.nom ? 'is-invalid' : ''}`}
                          id="nom" 
                          name="nom" 
                          placeholder="Entrez le nom de famille"
                        />
                        <ErrorMessage name="nom" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="prenom" className="form-label">Prénom <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.prenom && touched.prenom ? 'is-invalid' : ''}`}
                          id="prenom" 
                          name="prenom" 
                          placeholder="Entrez le prénom"
                        />
                        <ErrorMessage name="prenom" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="matricule" className="form-label">Matricule <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.matricule && touched.matricule ? 'is-invalid' : ''}`}
                          id="matricule" 
                          name="matricule" 
                          placeholder="CDL-2025-0001"
                        />
                        <ErrorMessage name="matricule" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="departement" className="form-label">Département <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.departement && touched.departement ? 'is-invalid' : ''}`}
                          id="departement" 
                          name="departement" 
                        >
                          <option value="">Sélectionnez un département</option>
                          {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="departement" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="statut" className="form-label">Type de contrat <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.statut && touched.statut ? 'is-invalid' : ''}`}
                          id="statut" 
                          name="statut" 
                        >
                          <option value="">Sélectionnez un type de contrat</option>
                          {contractTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="statut" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="poste" className="form-label">Poste <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.poste && touched.poste ? 'is-invalid' : ''}`}
                          id="poste" 
                          name="poste" 
                          placeholder="Intitulé du poste"
                        />
                        <ErrorMessage name="poste" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="date_depart" className="form-label">Date de départ <span className="text-danger">*</span></label>
                        <Field 
                          type="date" 
                          className={`form-control ${errors.date_depart && touched.date_depart ? 'is-invalid' : ''}`}
                          id="date_depart" 
                          name="date_depart" 
                        />
                        <ErrorMessage name="date_depart" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="motif_depart" className="form-label">Motif de départ <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.motif_depart && touched.motif_depart ? 'is-invalid' : ''}`}
                          id="motif_depart" 
                          name="motif_depart" 
                        >
                          <option value="">Sélectionnez un motif</option>
                          {departureReasons.map((reason, index) => (
                            <option key={index} value={reason}>{reason}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="motif_depart" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="commentaire" className="form-label">Commentaire</label>
                        <Field 
                          as="textarea"
                          className="form-control"
                          id="commentaire" 
                          name="commentaire" 
                          rows="3"
                          placeholder="Informations complémentaires sur le départ"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowAddModal(false)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger"
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
                          Ajouter
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* Modal d'importation */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="fas fa-file-import me-2"></i>
                Importer des départs
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowImportModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{ file: null }}
              validationSchema={importSchema}
              onSubmit={handleImport}
            >
              {({ errors, touched, setFieldValue, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i> 
                      Importez une liste de départs depuis un fichier Excel ou CSV.
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="importFile" className="form-label">Fichier à importer <span className="text-danger">*</span></label>
                      <input 
                        type="file" 
                        className={`form-control ${errors.file && touched.file ? 'is-invalid' : ''}`}
                        id="importFile" 
                        name="file"
                        accept=".xlsx,.csv,.txt"
                        onChange={(e) => {
                          handleFileChange(e);
                          setFieldValue('file', e.currentTarget.files[0]);
                        }}
                      />
                      <ErrorMessage name="file" component="div" className="invalid-feedback" />
                      <div className="form-text">Formats acceptés: .xlsx, .csv, .txt (max 5MB)</div>
                    </div>
                    
                    <div className="file-format-info p-3 bg-light rounded mt-3">
                      <h6 className="mb-2">Format attendu:</h6>
                      <p className="mb-2">Le fichier doit contenir les colonnes suivantes:</p>
                      <ul className="mb-2">
                        <li><strong>Nom</strong> - Nom de famille de l'employé</li>
                        <li><strong>Prenom</strong> - Prénom de l'employé</li>
                        <li><strong>Matricule</strong> - Matricule de l'employé (format CDL-2025-0001)</li>
                        <li><strong>Departement</strong> - Département de l'employé</li>
                        <li><strong>Statut</strong> - Type de contrat</li>
                        <li><strong>Poste</strong> - Intitulé du poste</li>
                        <li><strong>Date_depart</strong> - Date de départ (format YYYY-MM-DD)</li>
                        <li><strong>Motif_depart</strong> - Motif du départ</li>
                        <li><strong>Commentaire</strong> - Commentaires (optionnel)</li>
                      </ul>
                      <p className="mb-0">
                        <button 
                          type="button"
                          className="btn btn-link text-primary p-0 border-0"
                          onClick={() => {
                            // TODO: Implémenter le téléchargement du modèle
                            console.log('Téléchargement du modèle');
                          }}
                        >
                          <i className="fas fa-download me-1"></i>
                          Télécharger un modèle
                        </button>
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                      }}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger"
                      disabled={isSubmitting || !importFile}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Importation...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-import me-2"></i>
                          Importer
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* Modal de visualisation */}
      {showViewModal && selectedDeparture && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2"></i>
                Détails du départ
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="text-center mb-4">
                <div className="avatar-circle avatar-lg mx-auto mb-3" style={{
                  backgroundColor: `hsl(${(selectedDeparture.nom.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                }}>
                  {selectedDeparture.nom.charAt(0)}{selectedDeparture.prenom.charAt(0)}
                </div>
                <h4 className="mb-0">{selectedDeparture.nom} {selectedDeparture.prenom}</h4>
                <p className="text-muted">{selectedDeparture.poste}</p>
                <span className={`badge ${getDepartureReasonBadgeClass(selectedDeparture.motif_depart)} px-3 py-2`}>
                  {selectedDeparture.motif_depart || 'Non spécifié'}
                </span>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-id-card me-2 text-primary"></i>
                      Matricule
                    </div>
                    <div className="info-value">{selectedDeparture.matricule || 'Non assigné'}</div>
                  </div>
                  
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-building me-2 text-primary"></i>
                      Département
                    </div>
                    <div className="info-value">{selectedDeparture.departement || '-'}</div>
                  </div>
                  
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-briefcase me-2 text-primary"></i>
                      Type de contrat
                    </div>
                    <div className="info-value">{selectedDeparture.statut || '-'}</div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-calendar-day me-2 text-primary"></i>
                      Date de départ
                    </div>
                    <div className="info-value">{formatDate(selectedDeparture.date_depart)}</div>
                  </div>
                  
                  <div className="info-group">
                    <div className="info-label">
                      <i className="fas fa-calendar-check me-2 text-primary"></i>
                      Date de création
                    </div>
                    <div className="info-value">{formatDate(selectedDeparture.date_creation)}</div>
                  </div>
                </div>
              </div>
              
              {selectedDeparture.commentaire && (
                <div className="mt-4">
                  <div className="info-label">
                    <i className="fas fa-comment me-2 text-primary"></i>
                    Commentaires
                  </div>
                  <div className="p-3 bg-light rounded">
                    {selectedDeparture.commentaire}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Fermer
              </button>
              <button 
                type="button" 
                className="btn btn-warning"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditDeparture(selectedDeparture.id);
                }}
              >
                <i className="fas fa-edit me-2"></i>
                Modifier
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => confirmDeleteDeparture(selectedDeparture)}
              >
                <i className="fas fa-trash me-2"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'édition */}
      {showEditModal && selectedDeparture && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2"></i>
                Modifier un départ
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{
                id: selectedDeparture.id,
                nom: selectedDeparture.nom,
                prenom: selectedDeparture.prenom,
                matricule: selectedDeparture.matricule || generateMatricule(),
                departement: selectedDeparture.departement || '',
                statut: selectedDeparture.statut || '',
                poste: selectedDeparture.poste || '',
                date_depart: selectedDeparture.date_depart ? new Date(selectedDeparture.date_depart).toISOString().split('T')[0] : '',
                motif_depart: selectedDeparture.motif_depart || '',
                commentaire: selectedDeparture.commentaire || ''
              }}
              validationSchema={departureSchema}
              onSubmit={handleUpdateDeparture}
            >
              {({ errors, touched, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    {submitSuccess && (
                      <div className="alert alert-success" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        Le départ a été mis à jour avec succès!
                      </div>
                    )}
                    
                    <input type="hidden" name="id" />
                    
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label htmlFor="nom" className="form-label">Nom <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.nom && touched.nom ? 'is-invalid' : ''}`}
                          id="nom" 
                          name="nom" 
                        />
                        <ErrorMessage name="nom" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="prenom" className="form-label">Prénom <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.prenom && touched.prenom ? 'is-invalid' : ''}`}
                          id="prenom" 
                          name="prenom" 
                        />
                        <ErrorMessage name="prenom" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="matricule" className="form-label">Matricule <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.matricule && touched.matricule ? 'is-invalid' : ''}`}
                          id="matricule" 
                          name="matricule" 
                        />
                        <ErrorMessage name="matricule" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="departement" className="form-label">Département <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.departement && touched.departement ? 'is-invalid' : ''}`}
                          id="departement" 
                          name="departement" 
                        >
                          <option value="">Sélectionnez un département</option>
                          {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="departement" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="statut" className="form-label">Type de contrat <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.statut && touched.statut ? 'is-invalid' : ''}`}
                          id="statut" 
                          name="statut" 
                        >
                          <option value="">Sélectionnez un type de contrat</option>
                          {contractTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="statut" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="poste" className="form-label">Poste <span className="text-danger">*</span></label>
                        <Field 
                          type="text" 
                          className={`form-control ${errors.poste && touched.poste ? 'is-invalid' : ''}`}
                          id="poste" 
                          name="poste" 
                        />
                        <ErrorMessage name="poste" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="date_depart" className="form-label">Date de départ <span className="text-danger">*</span></label>
                        <Field 
                          type="date" 
                          className={`form-control ${errors.date_depart && touched.date_depart ? 'is-invalid' : ''}`}
                          id="date_depart" 
                          name="date_depart" 
                        />
                        <ErrorMessage name="date_depart" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="motif_depart" className="form-label">Motif de départ <span className="text-danger">*</span></label>
                        <Field 
                          as="select"
                          className={`form-select ${errors.motif_depart && touched.motif_depart ? 'is-invalid' : ''}`}
                          id="motif_depart" 
                          name="motif_depart" 
                        >
                          <option value="">Sélectionnez un motif</option>
                          {departureReasons.map((reason, index) => (
                            <option key={index} value={reason}>{reason}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="motif_depart" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-12 mb-3">
                        <label htmlFor="commentaire" className="form-label">Commentaire</label>
                        <Field 
                          as="textarea"
                          className="form-control"
                          id="commentaire" 
                          name="commentaire" 
                          rows="3"
                        />
                      </div>
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
                      className="btn btn-warning"
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
      )}

      {/* Modal de confirmation de suppression */}
      {showConfirmDeleteModal && departureToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content modal-sm">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="fas fa-trash me-2"></i>
                Confirmation de suppression
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setDepartureToDelete(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Cette action est irréversible.
              </div>
              <p>
                Êtes-vous sûr de vouloir supprimer le départ de
                <strong> {departureToDelete.nom} {departureToDelete.prenom}</strong> ?
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowConfirmDeleteModal(false);
                  setDepartureToDelete(null);
                }}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={handleDeleteDeparture}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Suppression...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash me-2"></i>
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS */}
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
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          width: 100%;
          max-width: 700px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }
        
        .modal-sm {
          max-width: 500px;
        }
        
        .modal-lg {
          max-width: 800px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
        }
        
        .avatar-lg {
          width: 80px;
          height: 80px;
          font-size: 28px;
        }
        
        .card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .card-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #eaeaea;
          padding: 16px 20px;
        }
        
        .info-group {
          margin-bottom: 20px;
        }
        
        .info-label {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 5px;
          font-weight: 600;
        }
        
        .info-value {
          font-size: 16px;
        }
        
        .btn-icon {
          margin-right: 8px;
        }
        
        .sortable {
          cursor: pointer;
          position: relative;
        }
        
        .sortable:hover {
          background-color: #f8f9fa;
        }
        
        .action-buttons {
          display: flex;
          justify-content: center;
        }
        
        .departure-row:hover {
          background-color: #f8f9fb;
        }
        
        .empty-state {
          padding: 40px 20px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
};

export default DepartureHistory;
