import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratService, employeeService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const ContractManagement = () => {
  // États principaux
  const [contrats, setContrats] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // États des modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState(null);

  // États de filtrage et pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterService, setFilterService] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // États du formulaire
  const [formData, setFormData] = useState({
    employee_id: '',
    type_contrat: '',
    poste: '',
    service: '',
    date_debut: '',
    date_fin: '',
    salaire: '',
    statut: 'Actif'
  });

  // Types de contrat et services
  const contractTypes = ['CDI', 'CDD', 'Prestataire', 'Stage', 'Stage PNPE', 'Local', 'expatrié'];
  const services = [
    'Administration', 'IT', 'RH', 'Finance', 'Marketing', 'Ventes', 'Production', 'Logistique'
  ];

  // Récupérer les contrats
  const fetchContrats = useCallback(async () => {
    try {
      const contratsData = await contratService.getAll();
      console.log('Contrats récupérés:', contratsData);
      setContrats(contratsData);
    } catch (err) {
      console.error('Erreur lors de la récupération des contrats:', err);
      setError('Erreur lors du chargement des contrats.');
    }
  }, []);

  // Récupérer les employés
  const fetchEmployees = useCallback(async () => {
    try {
      const employeesData = await employeeService.getAll();
      console.log('Employés récupérés:', employeesData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Erreur lors de la récupération des employés:', err);
      setError('Erreur lors du chargement des employés.');
    }
  }, []);

  // Charger les données au chargement du composant
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchContrats(), fetchEmployees()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchContrats, fetchEmployees]);

  // Combiner les contrats avec les noms des employés
  const contratsAvecNoms = useMemo(() => {
    if (!contrats.length || !employees.length) return [];
    
    return contrats.map(contrat => {
      const employee = employees.find(emp => emp.id === contrat.employee_id);
      
      // Nettoyer les données pour éliminer les anciennes valeurs par défaut
      let cleanContrat = {
        ...contrat,
        nom_employe: employee ? employee.nom_prenom : 'Employé non trouvé'
      };
      
      // Nettoyer le poste
      if (contrat.poste && contrat.poste !== 'Poste non défini') {
        cleanContrat.poste = contrat.poste;
      } else {
        cleanContrat.poste = null;
      }
      
      // Nettoyer la date de fin
      if (contrat.date_fin && contrat.date_fin !== 'Date fin non définie') {
        cleanContrat.date_fin = contrat.date_fin;
      } else {
        cleanContrat.date_fin = null;
      }
      
      // Nettoyer le service
      if (contrat.service && contrat.service !== 'Service non défini') {
        cleanContrat.service = contrat.service;
      } else {
        cleanContrat.service = null;
      }
      
      // Nettoyer le salaire
      if (contrat.salaire && contrat.salaire !== 'Salaire non défini') {
        cleanContrat.salaire = contrat.salaire;
      } else {
        cleanContrat.salaire = null;
      }
      
      return cleanContrat;
    });
  }, [contrats, employees]);

  // Filtrer et paginer les contrats
  const filteredContrats = useMemo(() => {
    let result = [...contratsAvecNoms];
    
    // Filtre par recherche
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(contrat => 
        contrat.nom_employe.toLowerCase().includes(lowerSearch) ||
        contrat.poste.toLowerCase().includes(lowerSearch) ||
        contrat.service.toLowerCase().includes(lowerSearch) ||
        contrat.type_contrat.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Filtre par type
    if (filterType) {
      result = result.filter(contrat => contrat.type_contrat === filterType);
    }
    
    // Filtre par service
    if (filterService) {
      result = result.filter(contrat => contrat.service === filterService);
    }
    
    return result;
  }, [contratsAvecNoms, searchTerm, filterType, filterService]);

  // Pagination
  const totalPages = Math.ceil(filteredContrats.length / itemsPerPage);
  const currentContrats = filteredContrats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterService('');
    setCurrentPage(1);
  };

  // Ouvrir la modale d'ajout
  const openAddModal = () => {
    setFormData({
      employee_id: '',
      type_contrat: '',
      poste: '',
      service: '',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: '',
      salaire: '',
      statut: 'Actif'
    });
    setShowAddModal(true);
    setError(null);
  };

  // Ouvrir la modale de modification
  const openEditModal = (contrat) => {
    setSelectedContrat(contrat);
    
    // Nettoyer les données avant de les mettre dans le formulaire
    const cleanPoste = contrat.poste && contrat.poste !== 'Poste non défini' ? contrat.poste : '';
    const cleanService = contrat.service && contrat.service !== 'Service non défini' ? contrat.service : '';
    const cleanSalaire = contrat.salaire && contrat.salaire !== 'Salaire non défini' ? contrat.salaire.toString() : '';
    
    setFormData({
      employee_id: contrat.employee_id,
      type_contrat: contrat.type_contrat,
      poste: cleanPoste,
      service: cleanService,
      date_debut: contrat.date_debut ? contrat.date_debut.split('T')[0] : '',
      date_fin: contrat.date_fin && contrat.date_fin !== 'Date fin non définie' ? contrat.date_fin.split('T')[0] : '',
      salaire: cleanSalaire,
      statut: contrat.statut || 'Actif'
    });
    setShowEditModal(true);
    setError(null);
  };

  // Ouvrir la modale de visualisation
  const openViewModal = (contrat) => {
    setSelectedContrat(contrat);
    setShowViewModal(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteModal = (contrat) => {
    setSelectedContrat(contrat);
    setShowDeleteModal(true);
  };

  // Fermer toutes les modales
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedContrat(null);
    setError(null);
  };

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Nettoyer les données avant l'envoi à l'API
  const cleanDataForAPI = (data) => {
    const cleaned = { ...data };
    
    // Convertir les chaînes vides en null
    if (cleaned.date_fin === '') cleaned.date_fin = null;
    if (cleaned.poste === '') cleaned.poste = null;
    if (cleaned.service === '') cleaned.service = null;
    
    // Convertir le salaire en nombre
    if (cleaned.salaire) {
      cleaned.salaire = parseInt(cleaned.salaire);
      if (isNaN(cleaned.salaire)) cleaned.salaire = null;
    }
    
    return cleaned;
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!formData.employee_id) {
      setError('Veuillez sélectionner un employé');
      return false;
    }
    if (!formData.type_contrat) {
      setError('Veuillez sélectionner un type de contrat');
      return false;
    }
    if (!formData.poste) {
      setError('Veuillez saisir le poste');
      return false;
    }
    if (!formData.service) {
      setError('Veuillez sélectionner un service');
      return false;
    }
    if (!formData.date_debut) {
      setError('Veuillez saisir la date de début');
      return false;
    }
    if (formData.date_fin && formData.date_fin <= formData.date_debut) {
      setError('La date de fin doit être postérieure à la date de début');
      return false;
    }
    if (!formData.salaire || isNaN(parseInt(formData.salaire)) || parseInt(formData.salaire) <= 0) {
      setError('Veuillez saisir un salaire valide (nombre positif)');
      return false;
    }
    return true;
  };

  // Ajouter un nouveau contrat
  const handleAddContrat = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Nettoyer et préparer les données
      const cleanedData = cleanDataForAPI(formData);
      
      const newContrat = await contratService.create(cleanedData);
      
      // Ajouter le nouveau contrat à la liste
      setContrats(prev => [newContrat, ...prev]);
      
      setSuccessMessage('Contrat ajouté avec succès !');
      closeModals();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du contrat:', err);
      setError('Erreur lors de l\'ajout du contrat');
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier un contrat existant
  const handleEditContrat = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      // Nettoyer et préparer les données
      const cleanedData = cleanDataForAPI(formData);
      
      const updatedContrat = await contratService.update(selectedContrat.id, cleanedData);
      
      // Mettre à jour le contrat dans la liste
      setContrats(prev => prev.map(contrat => 
        contrat.id === selectedContrat.id ? updatedContrat : contrat
      ));
      
      setSuccessMessage('Contrat modifié avec succès !');
      closeModals();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la modification du contrat:', err);
      setError('Erreur lors de la modification du contrat');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un contrat
  const handleDeleteContrat = async () => {
    try {
      setIsLoading(true);
      await contratService.delete(selectedContrat.id);
      
      // Supprimer le contrat de la liste
      setContrats(prev => prev.filter(contrat => contrat.id !== selectedContrat.id));
      
      setSuccessMessage('Contrat supprimé avec succès !');
      closeModals();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la suppression du contrat:', err);
      setError('Erreur lors de la suppression du contrat');
    } finally {
      setIsLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Formater le salaire
  const formatSalary = (salary) => {
    if (!salary) return '-';
    return `${parseInt(salary).toLocaleString()} FCFA`;
  };

  if (isLoading && contrats.length === 0) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3 text-muted">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* En-tête de la page */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-primary text-white p-4 rounded mb-3" style={{background: 'linear-gradient(135deg, #3a7bd5, #00d1b2)'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="h2 mb-2 text-white">Gestion des Contrats</h1>
                <p className="text-white mb-3 opacity-75 fs-5">
                  {contrats.length} contrats trouvés • {employees.length} employés
                </p>
                {/* Badge de notification pour les contrats */}
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-white text-primary fs-6 px-3 py-2">
                    <i className="fas fa-file-contract me-2"></i>
                    {contrats.filter(c => c.statut === 'Actif').length} Contrats Actifs
                  </span>
                  <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                    <i className="fas fa-clock me-2"></i>
                    {contrats.filter(c => c.date_fin && new Date(c.date_fin) < new Date()).length} Contrats Expirés
                  </span>
                  <span className="badge bg-info fs-6 px-3 py-2">
                    <i className="fas fa-users me-2"></i>
                    {contrats.filter(c => c.type_contrat === 'CDI').length} CDI
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={openAddModal}
                  style={{backgroundColor: '#3a7bd5', borderColor: '#3a7bd5', color: 'white'}}
                >
                  <i className="btn-icon fas fa-plus me-2"></i>
                  Nouveau Contrat
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => navigate('/contrats-pdf')}
                  style={{backgroundColor: '#00d1b2', borderColor: '#00d1b2', color: 'white'}}
                >
                  <i className="btn-icon fas fa-file-pdf me-2"></i>
                  Générer PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Recherche</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nom, poste, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Type de contrat</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {contractTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Service</label>
              <select
                className="form-select"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
              >
                <option value="">Tous les services</option>
                {services.map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={resetFilters}
              >
                <i className="fas fa-undo me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des contrats */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-file-signature me-2"></i>
            Liste des Contrats
          </h5>
        </div>
        <div className="card-body">
          {filteredContrats.length === 0 ? (
            <div className="text-center p-5">
              <i className="fas fa-file-signature fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun contrat trouvé</h5>
              <p className="text-muted">
                {searchTerm || filterType || filterService 
                  ? 'Aucun résultat ne correspond à vos critères de recherche.'
                  : 'Commencez par ajouter de nouveaux contrats.'
                }
              </p>
              {searchTerm || filterType || filterService ? (
                <button className="btn btn-outline-secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </button>
              ) : (
                <button className="btn btn-primary" onClick={openAddModal}>
                  <i className="fas fa-plus me-2"></i>
                  Nouveau Contrat
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Employé</th>
                      <th>Type</th>
                      <th>Poste</th>
                      <th>Service</th>
                      <th>Date Début</th>
                      <th>Date Fin</th>
                      <th>Salaire</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentContrats.map((contrat) => (
                      <tr key={contrat.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '32px', height: '32px', fontSize: '12px' }}
                            >
                              {contrat.nom_employe.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <div>
                              <div className="fw-bold">{contrat.nom_employe}</div>
                              <small className="text-muted">ID: {contrat.employee_id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            contrat.type_contrat === 'CDI' ? 'bg-success' :
                            contrat.type_contrat === 'CDD' ? 'bg-warning' :
                            contrat.type_contrat === 'Stage' ? 'bg-info' :
                            'bg-secondary'
                          }`}>
                            {contrat.type_contrat}
                          </span>
                        </td>
                        <td>
                          {contrat.poste ? (
                            <span>{contrat.poste}</span>
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic' }}>Non défini</span>
                          )}
                        </td>
                        <td>
                          {contrat.service ? (
                            <span>{contrat.service}</span>
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic' }}>Non défini</span>
                          )}
                        </td>
                        <td>{formatDate(contrat.date_debut)}</td>
                        <td>
                          {contrat.date_fin ? (
                            formatDate(contrat.date_fin)
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic' }}>
                              {contrat.type_contrat === 'CDI' ? 'Durée indéterminée' : 'Non défini'}
                            </span>
                          )}
                        </td>
                        <td>
                          {contrat.salaire ? (
                            formatSalary(contrat.salaire)
                          ) : (
                            <span className="text-muted" style={{ fontStyle: 'italic' }}>Non défini</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            contrat.statut === 'Actif' ? 'bg-success' : 'bg-danger'
                          }`}>
                            {contrat.statut}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-info"
                              onClick={() => openViewModal(contrat)}
                              title="Voir détails"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEditModal(contrat)}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => openDeleteModal(contrat)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="Navigation des pages" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      );
                    })}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modale d'ajout de contrat */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2 text-primary"></i>
                  Nouveau Contrat
                </h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Employé <span className="text-danger">*</span></label>
                    <select
                      name="employee_id"
                      className="form-select"
                      value={formData.employee_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un employé</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.nom_prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Type de contrat <span className="text-danger">*</span></label>
                    <select
                      name="type_contrat"
                      className="form-select"
                      value={formData.type_contrat}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un type</option>
                      {contractTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Poste <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="poste"
                      className="form-control"
                      value={formData.poste}
                      onChange={handleFormChange}
                      placeholder="Ex: Développeur, Manager..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Service <span className="text-danger">*</span></label>
                    <select
                      name="service"
                      className="form-select"
                      value={formData.service}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de début <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      name="date_debut"
                      className="form-control"
                      value={formData.date_debut}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de fin</label>
                    <input
                      type="date"
                      name="date_fin"
                      className="form-control"
                      value={formData.date_fin}
                      onChange={handleFormChange}
                      disabled={formData.type_contrat === 'CDI'}
                    />
                    {formData.type_contrat === 'CDI' && (
                      <small className="form-text text-muted">Non applicable pour un CDI</small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salaire (FCFA) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      name="salaire"
                      className="form-control"
                      value={formData.salaire}
                      onChange={handleFormChange}
                      placeholder="Ex: 500000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Statut</label>
                    <select
                      name="statut"
                      className="form-select"
                      value={formData.statut}
                      onChange={handleFormChange}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddContrat}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
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
            </div>
          </div>
        </div>
      )}

      {/* Modale de modification de contrat */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2 text-primary"></i>
                  Modifier le Contrat
                </h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Employé <span className="text-danger">*</span></label>
                    <select
                      name="employee_id"
                      className="form-select"
                      value={formData.employee_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un employé</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.nom_prenom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Type de contrat <span className="text-danger">*</span></label>
                    <select
                      name="type_contrat"
                      className="form-select"
                      value={formData.type_contrat}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un type</option>
                      {contractTypes.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Poste <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="poste"
                      className="form-control"
                      value={formData.poste}
                      onChange={handleFormChange}
                      placeholder="Ex: Développeur, Manager..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Service <span className="text-danger">*</span></label>
                    <select
                      name="service"
                      className="form-select"
                      value={formData.service}
                      onChange={handleFormChange}
                    >
                      <option value="">Sélectionner un service</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de début <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      name="date_debut"
                      className="form-control"
                      value={formData.date_debut}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de fin</label>
                    <input
                      type="date"
                      name="date_fin"
                      className="form-control"
                      value={formData.date_fin}
                      onChange={handleFormChange}
                      disabled={formData.type_contrat === 'CDI'}
                    />
                    {formData.type_contrat === 'CDI' && (
                      <small className="form-text text-muted">Non applicable pour un CDI</small>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Salaire (FCFA) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      name="salaire"
                      className="form-control"
                      value={formData.salaire}
                      onChange={handleFormChange}
                      placeholder="Ex: 500000"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Statut</label>
                    <select
                      name="statut"
                      className="form-select"
                      value={formData.statut}
                      onChange={handleFormChange}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleEditContrat}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
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
            </div>
          </div>
        </div>
      )}

      {/* Modale de visualisation de contrat */}
      {showViewModal && selectedContrat && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-eye me-2 text-primary"></i>
                  Détails du Contrat
                </h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-primary">Informations de l'employé</h6>
                    <div className="mb-3">
                      <label className="fw-bold">Nom :</label>
                      <p>{selectedContrat.nom_employe}</p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Poste :</label>
                      <p>{selectedContrat.poste && selectedContrat.poste !== 'Poste non défini' ? selectedContrat.poste : 'Non défini'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Service :</label>
                      <p>{selectedContrat.service && selectedContrat.service !== 'Service non défini' ? selectedContrat.service : 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-primary">Détails du contrat</h6>
                    <div className="mb-3">
                      <label className="fw-bold">Type :</label>
                      <p>
                        <span className={`badge ${
                          selectedContrat.type_contrat === 'CDI' ? 'bg-success' :
                          selectedContrat.type_contrat === 'CDD' ? 'bg-warning' :
                          selectedContrat.type_contrat === 'Stage' ? 'bg-info' :
                          'bg-secondary'
                        }`}>
                          {selectedContrat.type_contrat}
                        </span>
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Date de début :</label>
                      <p>{formatDate(selectedContrat.date_debut)}</p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Date de fin :</label>
                      <p>
                        {selectedContrat.date_fin ? (
                          formatDate(selectedContrat.date_fin)
                        ) : (
                          <span className="text-muted" style={{ fontStyle: 'italic' }}>
                            {selectedContrat.type_contrat === 'CDI' ? 'Durée indéterminée' : 'Non définie'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Salaire :</label>
                      <p>{selectedContrat.salaire ? formatSalary(selectedContrat.salaire) : 'Non défini'}</p>
                    </div>
                    <div className="mb-3">
                      <label className="fw-bold">Statut :</label>
                      <p>
                        <span className={`badge ${
                          selectedContrat.statut === 'Actif' ? 'bg-success' : 'bg-danger'
                        }`}>
                          {selectedContrat.statut}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Fermer
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModals();
                    openEditModal(selectedContrat);
                  }}
                >
                  <i className="fas fa-edit me-2"></i>
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {showDeleteModal && selectedContrat && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Confirmer la suppression
                </h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer le contrat de <strong>{selectedContrat.nom_employe}</strong> ?</p>
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  Cette action est irréversible et supprimera définitivement le contrat.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModals}>
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeleteContrat}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
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
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
