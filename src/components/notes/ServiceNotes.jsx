import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { noteService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const ServiceNotes = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [error, setError] = useState(null);

  // Validation schema for service note form
  const noteSchema = Yup.object().shape({
    title: Yup.string().required('Le titre est requis'),
    category: Yup.string().required('La catégorie est requise'),
    content: Yup.string().required('Le contenu est requis'),
    is_public: Yup.boolean()
  });

  // Note categories
  const categories = [
    'Information',
    'Organisation',
    'Rappel',
    'Procédure',
    'Évènement',
    'Recrutement',
    'Autre'
  ];

  useEffect(() => {
    // Fetch notes from API
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const notesData = await noteService.getAll();
        setNotes(notesData);
        setError(null);
      } catch (error) {
        console.error('Error fetching notes:', error);
        setError('Erreur lors du chargement des notes. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Handle note submission
  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Send data to API
      const response = await noteService.create({
        category: values.category,
        title: values.title,
        content: values.content,
        is_public: values.is_public || false
      });
      
      // Add the new note to the list
      setNotes(prev => [response, ...prev]);
      
      // Success
      setSubmitSuccess(true);
      resetForm();
      
      // Close modal after success
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting note:', error);
      setError('Erreur lors de l\'enregistrement de la note. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view note details
  const handleViewDetails = (id) => {
    const note = notes.find(n => n.id === id);
    setSelectedNote(note);
    setShowViewModal(true);
  };

  // Handle toggling note public status
  const handleTogglePublic = async (id) => {
    try {
      const result = await noteService.togglePublic(id);
      
      // Update the note in the list
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, is_public: !note.is_public } : note
      ));
      
      // If the note is currently being viewed, update it
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(prev => ({ ...prev, is_public: !prev.is_public }));
      }
      
      // Show success message
      alert(result.message);
    } catch (error) {
      console.error('Error toggling note public status:', error);
      setError('Erreur lors de la modification du statut de publication.');
    }
  };

  // Handle delete note
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }
    
    try {
      await noteService.delete(id);
      
      // Remove the note from the list
      setNotes(prev => prev.filter(note => note.id !== id));
      
      // Close view modal if the deleted note is being viewed
      if (selectedNote && selectedNote.id === id) {
        setShowViewModal(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Erreur lors de la suppression de la note.');
    }
  };

  // Get badge color based on category
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Information':
        return 'info';
      case 'Organisation':
        return 'primary';
      case 'Rappel':
        return 'warning';
      case 'Procédure':
        return 'secondary';
      case 'Évènement':
        return 'success';
      case 'Recrutement':
        return 'danger';
      default:
        return 'dark';
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Notes de service</h1>
          <p className="page-subtitle">Créez et gérez les notes de service pour communiquer avec vos employés.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="card table-card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="card-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <h3 className="card-title">Notes de service</h3>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Nouvelle note
          </button>
        </div>
        
        <div className="card-body">
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : notes.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="fas fa-info-circle me-2"></i>
              Aucune note de service trouvée.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th>Numéro</th>
                    <th>Titre</th>
                    <th>Catégorie</th>
                    <th>Date</th>
                    <th>Visible aux employés</th>
                    <th>Créée par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.full_note_number}</td>
                      <td>{note.title}</td>
                      <td>
                        <span className={`badge bg-${getCategoryBadgeColor(note.category)}`}>
                          {note.category}
                        </span>
                      </td>
                      <td>{formatDate(note.created_at)}</td>
                      <td>
                        <span className={`badge bg-${note.is_public ? 'success' : 'secondary'}`}>
                          {note.is_public ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td>{note.created_by || 'Admin RH'}</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-info me-1" 
                            onClick={() => handleViewDetails(note.id)}
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-warning me-1" 
                            onClick={() => handleTogglePublic(note.id)}
                            title={note.is_public ? "Masquer aux employés" : "Publier aux employés"}
                          >
                            <i className={`fas ${note.is_public ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary me-1" 
                            title="Télécharger PDF"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(note.id)}
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

      {/* New Note Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nouvelle note de service</h5>
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
                  Note de service enregistrée avec succès!
                </div>
              )}

              <Formik
                initialValues={{
                  title: '',
                  category: '',
                  content: '',
                  is_public: false
                }}
                validationSchema={noteSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, values, setFieldValue }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Titre <span className="text-danger">*</span></label>
                      <Field
                        name="title"
                        type="text"
                        className={`form-control ${errors.title && touched.title ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="title" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">Catégorie <span className="text-danger">*</span></label>
                      <Field
                        as="select"
                        name="category"
                        className={`form-select ${errors.category && touched.category ? 'is-invalid' : ''}`}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="content" className="form-label">Contenu <span className="text-danger">*</span></label>
                      <Field
                        as="textarea"
                        name="content"
                        className={`form-control ${errors.content && touched.content ? 'is-invalid' : ''}`}
                        rows="10"
                      />
                      <ErrorMessage name="content" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3 form-check">
                      <Field
                        type="checkbox"
                        name="is_public"
                        id="is_public"
                        className="form-check-input"
                      />
                      <label className="form-check-label" htmlFor="is_public">
                        Publier immédiatement (visible par tous les employés)
                      </label>
                    </div>

                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary" 
                        onClick={() => setShowModal(false)}
                      >
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

      {/* View Note Modal */}
      {showViewModal && selectedNote && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{selectedNote.full_note_number}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <h4 className="note-view-title">{selectedNote.title}</h4>
                <div className="note-view-meta">
                  <span className={`badge bg-${getCategoryBadgeColor(selectedNote.category)} me-2`}>
                    {selectedNote.category}
                  </span>
                  <span className="text-muted">
                    <i className="far fa-calendar-alt me-1"></i> {formatDate(selectedNote.created_at)}
                  </span>
                  <span className="text-muted ms-2">
                    <i className="far fa-user me-1"></i> {selectedNote.created_by || 'Admin RH'}
                  </span>
                  <span className={`badge ms-2 bg-${selectedNote.is_public ? 'success' : 'secondary'}`}>
                    {selectedNote.is_public ? 'Visible aux employés' : 'Non publiée'}
                  </span>
                </div>
              </div>
              
              <div className="note-view-content">
                {selectedNote.content.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={() => setShowViewModal(false)}
                >
                  Fermer
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => handleTogglePublic(selectedNote.id)}
                >
                  <i className={`fas ${selectedNote.is_public ? 'fa-eye-slash' : 'fa-eye'} me-2`}></i>
                  {selectedNote.is_public ? 'Masquer aux employés' : 'Publier aux employés'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                >
                  <i className="fas fa-download me-2"></i>
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceNotes;