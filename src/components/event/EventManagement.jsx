import React, { useState, useEffect, useCallback } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { evenementService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';
import './EventManagement.css';

const EventManagement = () => {
  // États principaux
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les notifications
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Validation schema amélioré pour l'événement
  const eventSchema = Yup.object().shape({
    name: Yup.string()
      .required('Le nom est requis')
      .min(3, 'Le nom doit contenir au moins 3 caractères')
      .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    date: Yup.date()
      .required('La date est requise')
      .typeError('Veuillez entrer une date valide')
      .min(new Date(), 'La date ne peut pas être dans le passé'),
    location: Yup.string()
      .required('Le lieu est requis')
      .min(3, 'Le lieu doit contenir au moins 3 caractères')
      .max(200, 'Le lieu ne peut pas dépasser 200 caractères'),
    description: Yup.string()
      .required('La description est requise')
      .min(10, 'La description doit contenir au moins 10 caractères')
      .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
    type: Yup.string()
      .required('Le type d\'événement est requis'),
    capacity: Yup.number()
      .min(1, 'La capacité doit être d\'au moins 1')
      .max(10000, 'La capacité ne peut pas dépasser 10000'),
    organizer: Yup.string()
      .required('L\'organisateur est requis')
      .min(2, 'L\'organisateur doit contenir au moins 2 caractères')
  });

  // Types d'événements
  const eventTypes = [
    'Réunion',
    'Formation',
    'Conférence',
    'Séminaire',
    'Atelier',
    'Événement social',
    'Cérémonie',
    'Exposition',
    'Autre'
  ];

  // Fonction pour afficher une notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  }, []);

  // Fonction pour récupérer les événements - memoized avec useCallback
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await evenementService.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Erreur lors du chargement des événements. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Récupérer les événements au chargement du composant
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Fonction pour filtrer et trier les événements
  const getFilteredAndSortedEvents = useCallback(() => {
    let filteredEvents = [...events];

    // Filtre par terme de recherche
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateFilter) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateFilter;
      });
    }

    // Filtre par lieu
    if (locationFilter) {
      filteredEvents = filteredEvents.filter(event =>
        event.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Tri
    filteredEvents.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filteredEvents;
  }, [events, searchTerm, dateFilter, locationFilter, sortConfig]);

  // Fonction pour gérer le tri
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Gérer la soumission du formulaire d'événement
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);

    try {
      // Préparer les données pour l'API
      const eventData = new FormData();
      
      // Ajouter les champs de base avec conversion des dates
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
          // Convertir les dates en format YYYY-MM-DD
          if (key.includes('date_') || key === 'date') {
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
            
            eventData.append(key, dateValue);
          } else {
            eventData.append(key, values[key]);
          }
        }
      });

      let response;
      
      if (editMode && selectedEvent) {
        // Mettre à jour l'événement existant
        response = await evenementService.update(selectedEvent.id, eventData);
        
        // Mettre à jour la liste des événements
        setEvents(prev => 
          prev.map(event => event.id === selectedEvent.id ? response : event)
        );
        
        showNotification('Événement modifié avec succès!');
      } else {
        // Créer un nouvel événement
        response = await evenementService.create(eventData);
        
        // Ajouter le nouvel événement à la liste
        setEvents(prev => [response, ...prev]);
        
        showNotification('Événement créé avec succès!');
      }
      
      // Succès
      setSubmitSuccess(true);
      resetForm();
      
      // Fermer le modal après succès
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
        setEditMode(false);
        setSelectedEvent(null);
      }, 1500);
    } catch (error) {
      console.error('Error submitting event:', error);
      console.error('Error details:', error.response?.data);
      setError(`Erreur lors de l'enregistrement de l'événement: ${error.response?.data?.error || error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer la modification d'un événement
  const handleEdit = (event) => {
    setSelectedEvent(event);
    setEditMode(true);
    setError(null);
    setShowModal(true);
  };

  // Gérer la suppression d'un événement
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      try {
        await evenementService.delete(id);
        
        // Mettre à jour la liste des événements
        setEvents(prev => prev.filter(event => event.id !== id));
        
        showNotification('Événement supprimé avec succès!');
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Erreur lors de la suppression de l\'événement.');
      }
    }
  };

  // Gérer l'affichage des détails d'un événement
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setEditMode(false);
    setError(null);
    setShowModal(true);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setLocationFilter('');
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  // Obtenir les événements filtrés et triés
  const filteredEvents = getFilteredAndSortedEvents();

  return (
    <div className="container mt-4">
      {/* Notification */}
      {notification.show && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show position-fixed top-0 end-0 m-3`} style={{ zIndex: 9999 }}>
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
          {notification.message}
          <button type="button" className="btn-close" onClick={() => setNotification({ show: false, message: '', type: '' })}></button>
        </div>
      )}

      {/* Page Title Banner */}
      <div className="page-title-wrapper" style={{ background: 'linear-gradient(135deg, #3a8eba 0%, #00d1b2 100%)', marginBottom: '30px' }}>
        <div className="title-content">
          <h1 className="page-title">Gestion des Événements</h1>
          <p className="page-subtitle">Créez et gérez les événements pour organiser des activités et communiquer avec vos employés.</p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #3a8eba 0%, #295785 100%)', color: 'white' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <span className="badge" style={{ 
                background: 'rgba(255,255,255,0.25)', 
                color: 'white',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <i className="fas fa-calendar-check me-1"></i>
                {events.length} événement{events.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm" 
                onClick={() => setShowFilters(!showFilters)}
                title="Filtres"
                style={{ 
                  background: 'white', 
                  color: '#3a8eba',
                  border: '2px solid white',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <i className="fas fa-filter me-1"></i>
                Filtres
              </button>
              <button 
                className="btn btn-sm" 
              onClick={() => {
                setEditMode(false);
                setSelectedEvent(null);
                setError(null);
                setShowModal(true);
              }}
                style={{ 
                  background: 'white', 
                  color: '#3a8eba',
                  border: 'none',
                  fontWeight: '500'
                }}
              >
                <i className="fas fa-plus me-2"></i>
                Nouvel Événement
              </button>
            </div>
          </div>
        </div>
        
        {/* Filtres */}
        {showFilters && (
          <div className="card-body border-bottom bg-light">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Recherche</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom, description, lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Lieu</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filtrer par lieu..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button 
                  className="btn btn-outline-secondary btn-sm" 
                  onClick={resetFilters}
                >
                  <i className="fas fa-times me-1"></i>
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="card-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-2 text-muted">Chargement des événements...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="fas fa-info-circle me-2"></i>
              {events.length === 0 ? 'Aucun événement trouvé.' : 'Aucun événement ne correspond aux critères de recherche.'}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Nom
                      {sortConfig.key === 'name' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortConfig.key === 'date' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th 
                      className="cursor-pointer"
                      onClick={() => handleSort('location')}
                    >
                      Lieu
                      {sortConfig.key === 'location' && (
                        <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </th>
                    <th>Type</th>
                    <th>Organisateur</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="fw-medium">{event.name}</td>
                      <td>
                        <span className="badge" style={{ background: '#3a8eba', color: 'white' }}>
                          {new Date(event.date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td>{event.location}</td>
                      <td>
                        <span className="badge" style={{ background: '#17a2b8', color: 'white' }}>
                          {event.type || 'Non spécifié'}
                        </span>
                      </td>
                      <td>{event.organizer || 'Non spécifié'}</td>
                      <td>
                        {event.description.length > 50
                          ? `${event.description.substring(0, 50)}...`
                          : event.description}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleViewDetails(event)}
                            title="Voir détails"
                            style={{ 
                              background: '#3a8eba', 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleEdit(event)}
                            title="Modifier"
                            style={{ 
                              background: '#ffc107', 
                              color: '#212529',
                              border: 'none'
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm" 
                            onClick={() => handleDelete(event.id)}
                            title="Supprimer"
                            style={{ 
                              background: '#dc3545', 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Statistiques */}
              <div className="mt-3 text-muted small">
                <i className="fas fa-info-circle me-1"></i>
                {filteredEvents.length} événement(s) affiché(s) sur {events.length} au total
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'événement */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #3a8eba 0%, #295785 100%)', color: 'white' }}>
                <h5 className="modal-title">
                  <i className="fas fa-calendar-plus me-2"></i>
                  {editMode ? 'Modifier l\'événement' : 'Nouvel événement'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  aria-label="Close"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                    setSelectedEvent(null);
                    setError(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {submitSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    Événement {editMode ? 'modifié' : 'créé'} avec succès!
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <Formik
                  initialValues={{
                    name: selectedEvent?.name || '',
                    date: selectedEvent?.date ? (selectedEvent.date instanceof Date ? selectedEvent.date.toISOString().split('T')[0] : new Date(selectedEvent.date).toISOString().split('T')[0]) : '',
                    location: selectedEvent?.location || '',
                    description: selectedEvent?.description || '',
                    type: selectedEvent?.type || 'Réunion',
                    capacity: selectedEvent?.capacity || '',
                    organizer: selectedEvent?.organizer || ''
                  }}
                  validationSchema={eventSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize={true}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="name" className="form-label">
                              Nom de l'événement <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="name"
                              type="text"
                              className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`}
                              placeholder="Ex: Réunion mensuelle"
                            />
                            <ErrorMessage name="name" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="type" className="form-label">
                              Type d'événement <span className="text-danger">*</span>
                            </label>
                            <Field
                              as="select"
                              name="type"
                              className={`form-control ${errors.type && touched.type ? 'is-invalid' : ''}`}
                            >
                              {eventTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </Field>
                            <ErrorMessage name="type" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                              Date <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="date"
                              type="date"
                              className={`form-control ${errors.date && touched.date ? 'is-invalid' : ''}`}
                            />
                            <ErrorMessage name="date" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="capacity" className="form-label">
                              Capacité
                            </label>
                            <Field
                              name="capacity"
                              type="number"
                              className={`form-control ${errors.capacity && touched.capacity ? 'is-invalid' : ''}`}
                              placeholder="Nombre de participants"
                              min="1"
                            />
                            <ErrorMessage name="capacity" component="div" className="invalid-feedback" />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="location" className="form-label">
                          Lieu <span className="text-danger">*</span>
                        </label>
                        <Field
                          name="location"
                          type="text"
                          className={`form-control ${errors.location && touched.location ? 'is-invalid' : ''}`}
                          placeholder="Ex: Salle de conférence A"
                        />
                        <ErrorMessage name="location" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="organizer" className="form-label">
                          Organisateur <span className="text-danger">*</span>
                        </label>
                        <Field
                          name="organizer"
                          type="text"
                          className={`form-control ${errors.organizer && touched.organizer ? 'is-invalid' : ''}`}
                          placeholder="Nom de l'organisateur"
                        />
                        <ErrorMessage name="organizer" component="div" className="invalid-feedback" />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                          Description <span className="text-danger">*</span>
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          rows="4"
                          className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`}
                          placeholder="Description détaillée de l'événement..."
                        />
                        <ErrorMessage name="description" component="div" className="invalid-feedback" />
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button 
                          type="button" 
                          className="btn btn-secondary me-2" 
                          onClick={() => {
                            setShowModal(false);
                            setEditMode(false);
                            setSelectedEvent(null);
                            setError(null);
                          }}
                        >
                          <i className="fas fa-times me-2"></i>
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          className="btn" 
                          disabled={isSubmitting}
                          style={{ 
                            background: 'linear-gradient(135deg, #3a8eba 0%, #295785 100%)', 
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              {editMode ? 'Mettre à jour' : 'Enregistrer'}
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
          <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;