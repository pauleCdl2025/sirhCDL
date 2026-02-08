import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { recrutementService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const RecruitmentHistory = () => {
  // États principaux
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [recruitments, setRecruitments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecruitment, setSelectedRecruitment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'applicationDate', direction: 'desc' });

  // États de recherche
  const [searchParams, setSearchParams] = useState({
    name: '',
    department: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Validation schema for recruitment form
  const recruitmentSchema = Yup.object().shape({
    fullName: Yup.string().required('Le nom complet est requis'),
    position: Yup.string().required('Le poste est requis'),
    department: Yup.string().required('Le département est requis'),
    source: Yup.string().required('La source de recrutement est requise'),
    status: Yup.string().required('Le statut est requis'),
    applicationDate: Yup.date().required('La date de candidature est requise'),
    hiringDate: Yup.date().nullable(),
    notes: Yup.string(),
    recruiter: Yup.string()
  });

  // Departments
  const departments = [
    'Administration',
    'Ressources Humaines',
    'Finance',
    'Marketing',
    'Informatique',
    'Production',
    'Logistique',
    'Commercial',
    'Recherche et Développement',
    'Médical',
    'Clinique',
    'Laboratoire',
    'Accueil/Facturation',
    'Cotation',
    'Vente',
    'Achats/Stock',
    'Hotellerie/Hospitalité/Buanderie/Self',
    'RH'
  ];

  // Recruitment sources
  const sources = [
    'Création de poste',
    'Remplacement',
    'Basculement en CDD',
    'Recrutement standard',
    'Site web de l\'entreprise',
    'LinkedIn',
    'Indeed',
    'Référence interne',
    'Cabinet de recrutement',
    'Salon de l\'emploi',
    'Candidature spontanée',
    'Autre'
  ];

  // Recruitment statuses (contract types)
  const statuses = [
    'CDI',
    'CDD',
    'Prestation',
    'Stage',
    'Stage PNPE'
  ];

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  }, []);

  // Fetch recruitments from API
  const fetchRecruitments = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await recrutementService.getAll();
      setRecruitments(data);
    } catch (err) {
      console.error('Error fetching recruitments:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recruitments on component mount
  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // Handle search
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await recrutementService.search(searchParams);
      setRecruitments(data);
    } catch (err) {
      console.error('Error searching recruitments:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Fetch recruitments on component mount
  useEffect(() => {
    fetchRecruitments();
  }, [fetchRecruitments]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  }, []);

  // Reset search filters
  const resetSearchFilters = useCallback(() => {
    setSearchParams({
      name: '',
      department: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchRecruitments();
  }, [fetchRecruitments]);

  // Handle recruitment submission
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      
      // Add CV file if it exists
      if (selectedFile) {
        formData.append('cv', selectedFile);
      }
      
      // Send data to API
      const response = await recrutementService.create(formData);
      
      // Add the new recruitment to the list
      setRecruitments(prev => [response, ...prev]);
      
      // Success
      setSubmitSuccess(true);
      resetForm();
      setSelectedFile(null);
      showNotification('Candidature enregistrée avec succès!');
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting recruitment:', error);
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update recruitment
  const handleUpdateRecruitment = async (values) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData object for file upload
      const formData = new FormData();
      
      // Add form fields to FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });
      
      // Add CV file if it exists
      if (selectedFile) {
        formData.append('cv', selectedFile);
      }
      
      // Add keep_cv flag
      formData.append('keep_cv', values.keep_cv ? 'true' : 'false');
      
      // Send data to API
      const response = await recrutementService.update(values.id, formData);
      
      // Update the item in the list
      setRecruitments(prev => prev.map(item => 
        item.id === response.id ? response : item
      ));
      
      // Success
      showNotification('Candidature mise à jour avec succès!');
      setSelectedFile(null);
      
      // Close modal after success
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating recruitment:', error);
      setError('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view recruitment details
  const handleViewDetails = async (id) => {
    try {
      setIsLoading(true);
      const recruitment = await recrutementService.getById(id);
      setSelectedRecruitment(recruitment);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching recruitment details:', error);
      setError('Erreur lors du chargement des détails.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit recruitment
  const handleEditRecruitment = async (id) => {
    try {
      setIsLoading(true);
      const recruitment = await recrutementService.getById(id);
      setSelectedRecruitment(recruitment);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching recruitment details for edit:', error);
      setError('Erreur lors du chargement des détails pour modification.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file change
  const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }
      
      // Check file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Format de fichier non valide. Formats acceptés: PDF, DOC, DOCX');
        return;
      }
      
      setSelectedFile(file);
      if (setFieldValue) {
        setFieldValue('cv', file);
      }
    }
  };

  // Handle CV download
  const handleDownloadCV = async (id) => {
    try {
      setIsLoading(true);
      await recrutementService.downloadCV(id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error downloading CV:', error);
      setError('Erreur lors du téléchargement du CV.');
      setIsLoading(false);
    }
  };

  // Confirm delete recruitment
  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirmDelete(true);
  };

  // Handle recruitment delete
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await recrutementService.delete(deleteId);
      setRecruitments(prev => prev.filter(r => r.id !== deleteId));
      
      if (showViewModal && selectedRecruitment?.id === deleteId) {
        setShowViewModal(false);
      }
      
      showNotification('Candidature supprimée avec succès!');
      setShowConfirmDelete(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting recruitment:', error);
      setError('Erreur lors de la suppression.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get badge color based on status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'CDI':
        return 'success';
      case 'CDD':
        return 'warning';
      case 'Prestation':
        return 'info';
      case 'Stage':
        return 'secondary';
      case 'Stage PNPE':
        return 'primary';
      default:
        return 'secondary';
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

  // Filter and sort recruitments
  const filteredAndSortedRecruitments = useMemo(() => {
    let result = [...recruitments];
    
    // Apply search filters in memory (in case API doesn't support some filters)
    if (searchParams.name) {
      const searchLower = searchParams.name.toLowerCase();
      result = result.filter(item => item.fullName.toLowerCase().includes(searchLower));
    }
    
    if (searchParams.department) {
      result = result.filter(item => item.department === searchParams.department);
    }
    
    if (searchParams.status) {
      result = result.filter(item => item.status === searchParams.status);
    }
    
    if (searchParams.dateFrom) {
      const fromDate = new Date(searchParams.dateFrom);
      result = result.filter(item => new Date(item.applicationDate) >= fromDate);
    }
    
    if (searchParams.dateTo) {
      const toDate = new Date(searchParams.dateTo);
      toDate.setHours(23, 59, 59);
      result = result.filter(item => new Date(item.applicationDate) <= toDate);
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
  }, [recruitments, searchParams, sortConfig]);

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Historique de recrutement</h1>
          <p className="page-subtitle">Suivez l'historique des recrutements et le statut des candidatures.</p>
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

      <div className="card table-card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="card-icon">
              <i className="fas fa-user-tie"></i>
            </div>
            <h3 className="card-title">Candidatures</h3>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setShowModal(true);
              setSelectedFile(null);
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Nouvelle candidature
          </button>
        </div>
        
        <div className="card-body">
          <div className="table-filters mb-4">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text"><i className="fas fa-search"></i></span>
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom..." 
                    className="form-control" 
                    name="name"
                    value={searchParams.name}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select 
                  className="form-select"
                  name="department"
                  value={searchParams.department}
                  onChange={handleSearchChange}
                >
                  <option value="">Tous les départements</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <select 
                  className="form-select"
                  name="status"
                  value={searchParams.status}
                  onChange={handleSearchChange}
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <input 
                  type="date" 
                  className="form-control" 
                  placeholder="Date début" 
                  name="dateFrom"
                  value={searchParams.dateFrom}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-md-2">
                <input 
                  type="date" 
                  className="form-control" 
                  placeholder="Date fin" 
                  name="dateTo"
                  value={searchParams.dateTo}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-md-1 d-flex">
                <button 
                  className="btn btn-outline-primary w-100" 
                  onClick={handleSearch}
                  title="Rechercher"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={resetSearchFilters}
              >
                <i className="fas fa-filter-circle-xmark me-2"></i>
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : filteredAndSortedRecruitments.length === 0 ? (
            <div className="empty-state text-center p-5">
              <i className="fas fa-user-slash empty-icon text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h4 className="mb-3">Aucune candidature trouvée</h4>
              <p className="text-muted mb-4">
                {searchParams.name || searchParams.department || searchParams.status || searchParams.dateFrom || searchParams.dateTo ? 
                  'Aucun résultat ne correspond à vos critères de recherche.' : 
                  'Aucune candidature n\'a été enregistrée pour le moment.'}
              </p>
              {searchParams.name || searchParams.department || searchParams.status || searchParams.dateFrom || searchParams.dateTo ? (
                <button className="btn btn-outline-secondary" onClick={resetSearchFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>Nouvelle candidature
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('fullName')} className="sortable-header">
                      Nom
                      {sortConfig.key === 'fullName' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('position')} className="sortable-header">
                      Poste
                      {sortConfig.key === 'position' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('department')} className="sortable-header">
                      Département
                      {sortConfig.key === 'department' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('source')} className="sortable-header">
                      Source
                      {sortConfig.key === 'source' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('applicationDate')} className="sortable-header">
                      Date de recrutement
                      {sortConfig.key === 'applicationDate' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable-header">
                      Type de contrat
                      {sortConfig.key === 'status' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRecruitments.map((recruitment) => (
                    <tr key={recruitment.id}>
                      <td>{recruitment.fullName}</td>
                      <td>{recruitment.position}</td>
                      <td>{recruitment.department}</td>
                      <td>{recruitment.source}</td>
                      <td>{formatDate(recruitment.applicationDate)}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadgeColor(recruitment.status)}`}>
                          {recruitment.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button 
                            className="btn btn-sm btn-info me-1" 
                            onClick={() => handleViewDetails(recruitment.id)}
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-primary me-1" 
                            onClick={() => handleEditRecruitment(recruitment.id)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {recruitment.cv_path && (
                            <button 
                              className="btn btn-sm btn-secondary me-1" 
                              title="Télécharger CV"
                              onClick={() => handleDownloadCV(recruitment.id)}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-danger" 
                            title="Supprimer"
                            onClick={() => confirmDelete(recruitment.id)}
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

      {/* New Recruitment Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-user-plus me-2 text-primary"></i>
                Nouvelle candidature
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
                  Candidature enregistrée avec succès!
                </div>
              )}

              <Formik
                initialValues={{
                  fullName: '',
                  position: '',
                  department: '',
                  source: 'Création de poste',
                  status: 'CDD',
                  applicationDate: new Date().toISOString().split('T')[0],
                  hiringDate: '',
                  notes: '',
                  recruiter: 'Direction générale',
                  cv: null
                }}
                validationSchema={recruitmentSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label htmlFor="fullName" className="form-label">Nom complet <span className="text-danger">*</span></label>
                        <Field
                          name="fullName"
                          type="text"
                          className={`form-control ${errors.fullName && touched.fullName ? 'is-invalid' : ''}`}
                          placeholder="Nom et prénom du candidat"
                        />
                        <ErrorMessage name="fullName" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="position" className="form-label">Poste <span className="text-danger">*</span></label>
                        <Field
                          name="position"
                          type="text"
                          className={`form-control ${errors.position && touched.position ? 'is-invalid' : ''}`}
                          placeholder="Intitulé du poste"
                        />
                        <ErrorMessage name="position" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="department" className="form-label">Département <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="department"
                          className={`form-select ${errors.department && touched.department ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un département</option>
                          {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="department" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="source" className="form-label">Source <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="source"
                          className={`form-select ${errors.source && touched.source ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez une source</option>
                          {sources.map((source, index) => (
                            <option key={index} value={source}>{source}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="source" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="status" className="form-label">Type de contrat <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="status"
                          className={`form-select ${errors.status && touched.status ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un type</option>
                          {statuses.map((status, index) => (
                            <option key={index} value={status}>{status}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="status" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="applicationDate" className="form-label">Date de recrutement <span className="text-danger">*</span></label>
                        <Field
                          name="applicationDate"
                          type="date"
                          className={`form-control ${errors.applicationDate && touched.applicationDate ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="applicationDate" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="recruiter" className="form-label">Supérieur hiérarchique</label>
                        <Field
                          name="recruiter"
                          type="text"
                          className={`form-control ${errors.recruiter && touched.recruiter ? 'is-invalid' : ''}`}
                          placeholder="Nom du responsable"
                        />
                        <ErrorMessage name="recruiter" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes</label>
                      <Field
                        as="textarea"
                        name="notes"
                        className={`form-control ${errors.notes && touched.notes ? 'is-invalid' : ''}`}
                        rows="3"
                        placeholder="Informations complémentaires"
                      />
                      <ErrorMessage name="notes" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">CV</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        onChange={(event) => handleFileChange(event, setFieldValue)}
                        accept=".pdf,.doc,.docx"
                      />
                      <div className="form-text">Formats acceptés : PDF, DOC, DOCX (Max. 5 MB)</div>
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
                        className="btn btn-outline-secondary" 
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

      {/* Edit Recruitment Modal */}
      {showEditModal && selectedRecruitment && (
        <div className="modal-backdrop">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2 text-warning"></i>
                Modifier la candidature
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedFile(null);
                  setError(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <Formik
                initialValues={{
                  id: selectedRecruitment.id,
                  fullName: selectedRecruitment.fullName || '',
                  position: selectedRecruitment.position || '',
                  department: selectedRecruitment.department || '',
                  source: selectedRecruitment.source || '',
                  status: selectedRecruitment.status || '',
                  applicationDate: selectedRecruitment.applicationDate ? selectedRecruitment.applicationDate.split('T')[0] : '',
                  hiringDate: selectedRecruitment.hiringDate ? selectedRecruitment.hiringDate.split('T')[0] : '',
                  notes: selectedRecruitment.notes || '',
                  recruiter: selectedRecruitment.recruiter || '',
                  cv: null,
                  keep_cv: selectedRecruitment.cv_path ? true : false
                }}
                validationSchema={recruitmentSchema}
                onSubmit={handleUpdateRecruitment}
              >
                {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
                  <Form>
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <label htmlFor="fullName" className="form-label">Nom complet <span className="text-danger">*</span></label>
                        <Field
                          name="fullName"
                          type="text"
                          className={`form-control ${errors.fullName && touched.fullName ? 'is-invalid' : ''}`}
                          placeholder="Nom et prénom du candidat"
                        />
                        <ErrorMessage name="fullName" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="position" className="form-label">Poste <span className="text-danger">*</span></label>
                        <Field
                          name="position"
                          type="text"
                          className={`form-control ${errors.position && touched.position ? 'is-invalid' : ''}`}
                          placeholder="Intitulé du poste"
                        />
                        <ErrorMessage name="position" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="department" className="form-label">Département <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="department"
                          className={`form-select ${errors.department && touched.department ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un département</option>
                          {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="department" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="source" className="form-label">Source <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="source"
                          className={`form-select ${errors.source && touched.source ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez une source</option>
                          {sources.map((source, index) => (
                            <option key={index} value={source}>{source}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="source" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="status" className="form-label">Type de contrat <span className="text-danger">*</span></label>
                        <Field
                          as="select"
                          name="status"
                          className={`form-select ${errors.status && touched.status ? 'is-invalid' : ''}`}
                        >
                          <option value="">Sélectionnez un type</option>
                          {statuses.map((status, index) => (
                            <option key={index} value={status}>{status}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="status" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="applicationDate" className="form-label">Date de recrutement <span className="text-danger">*</span></label>
                        <Field
                          name="applicationDate"
                          type="date"
                          className={`form-control ${errors.applicationDate && touched.applicationDate ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="applicationDate" component="div" className="invalid-feedback" />
                      </div>
                      
                      <div className="col-md-6">
                        <label htmlFor="recruiter" className="form-label">Supérieur hiérarchique</label>
                        <Field
                          name="recruiter"
                          type="text"
                          className={`form-control ${errors.recruiter && touched.recruiter ? 'is-invalid' : ''}`}
                          placeholder="Nom du responsable"
                        />
                        <ErrorMessage name="recruiter" component="div" className="invalid-feedback" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes</label>
                      <Field
                        as="textarea"
                        name="notes"
                        className={`form-control ${errors.notes && touched.notes ? 'is-invalid' : ''}`}
                        rows="3"
                        placeholder="Informations complémentaires"
                      />
                      <ErrorMessage name="notes" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">CV</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        onChange={(event) => handleFileChange(event, setFieldValue)}
                        accept=".pdf,.doc,.docx"
                      />
                      
                      {selectedRecruitment.cv_path && (
                        <div className="mt-2">
                          <div className="d-flex align-items-center">
                            <button 
                              type="button"
                              className="btn btn-sm btn-outline-primary me-3"
                              onClick={() => handleDownloadCV(selectedRecruitment.id)}
                            >
                              <i className="fas fa-file-download me-2"></i>Document actuel
                            </button>
                            <div className="form-check">
                              <Field
                                type="checkbox"
                                id="keepCV"
                                name="keep_cv"
                                className="form-check-input"
                              />
                              <label className="form-check-label" htmlFor="keepCV">
                                Conserver le CV actuel
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="form-text">Formats acceptés : PDF, DOC, DOCX (Max. 5 MB)</div>
                      {selectedFile && (
                        <div className="mt-2">
                          <span className="badge badge-success">
                            <i className="fas fa-check me-1"></i>
                            Nouveau fichier sélectionné: {selectedFile.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => {
                          setShowEditModal(false);
                          setSelectedFile(null);
                        }}
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

      {/* View Recruitment Modal */}
      {showViewModal && selectedRecruitment && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Détails de la candidature
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-4">
                <div className="col-md-12 text-center mb-3">
                  <span className={`badge bg-${getStatusBadgeColor(selectedRecruitment.status)} fs-6 px-4 py-2`}>
                    {selectedRecruitment.status}
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="info-group mb-3">
                    <div className="info-label">Nom :</div>
                    <div className="info-value">{selectedRecruitment.fullName}</div>
                  </div>
                  <div className="info-group mb-3">
                    <div className="info-label">Poste :</div>
                    <div className="info-value">{selectedRecruitment.position}</div>
                  </div>
                  <div className="info-group mb-3">
                    <div className="info-label">Département :</div>
                    <div className="info-value">{selectedRecruitment.department}</div>
                  </div>
                  <div className="info-group mb-3">
                    <div className="info-label">Source :</div>
                    <div className="info-value">{selectedRecruitment.source}</div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-group mb-3">
                    <div className="info-label">Date de recrutement :</div>
                    <div className="info-value">{formatDate(selectedRecruitment.applicationDate)}</div>
                  </div>
                  <div className="info-group mb-3">
                    <div className="info-label">Date d'embauche :</div>
                    <div className="info-value">{formatDate(selectedRecruitment.hiringDate) || '-'}</div>
                  </div>
                  <div className="info-group mb-3">
                    <div className="info-label">Supérieur hiérarchique :</div>
                    <div className="info-value">{selectedRecruitment.recruiter || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <h6 className="mb-0">Notes</h6>
                </div>
                <div className="card-body">
                  {selectedRecruitment.notes ? (
                    <p>{selectedRecruitment.notes}</p>
                  ) : (
                    <p className="text-muted fst-italic">Aucune note disponible</p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Documents</h6>
                </div>
                <div className="card-body">
                  {selectedRecruitment.cv_path ? (
                    <div className="list-group">
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <i className="far fa-file-pdf text-danger me-2"></i>
                          CV_{selectedRecruitment.fullName.replace(/\s+/g, '_')}.pdf
                        </div>
                        <div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleDownloadCV(selectedRecruitment.id)}
                          >
                            <i className="fas fa-download me-2"></i>Télécharger
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted fst-italic">Aucun document disponible</p>
                  )}
                </div>
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
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditRecruitment(selectedRecruitment.id);
                  }}
                >
                  <i className="fas fa-edit me-2"></i>
                  Modifier
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger ms-2"
                  onClick={() => {
                    setShowViewModal(false);
                    confirmDelete(selectedRecruitment.id);
                  }}
                >
                  <i className="fas fa-trash me-2"></i>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
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
                  setShowConfirmDelete(false);
                  setDeleteId(null);
                }}
              ></button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette candidature ?</p>
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-circle me-2"></i>
                Cette action est irréversible. Toutes les données associées à cette candidature seront définitivement supprimées.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => {
                  setShowConfirmDelete(false);
                  setDeleteId(null);
                }}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDelete}
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
        
        .badge-success {
          background-color: #28a745;
          color: white;
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
          justify-content: center;
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
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
        }
        
        @media print {
          .actions-bar, .table-filters, .action-btns, .modal-backdrop, button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default RecruitmentHistory;
