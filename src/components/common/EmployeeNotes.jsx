import React, { useState, useEffect } from 'react';
import { noteService } from '../../services/api';

const EmployeeNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Charger les notes publiques au chargement du composant
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const notesData = await noteService.getPublicNotes();
        setNotes(notesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching public notes:', err);
        setError('Erreur lors du chargement des notes de service. Veuillez réessayer plus tard.');
        // En cas d'erreur, définir des données de test
        setNotes([
          {
            id: 1,
            full_note_number: 'NS-2025-001',
            category: 'Information',
            title: 'Nouveau processus de congés',
            content: 'Suite à la réunion du comité de direction, nous mettons en place un nouveau processus de demande de congés à partir du 1er juillet 2025. Désormais, toutes les demandes devront être soumises au moins 2 semaines à l\'avance via le portail RH. Les managers auront 48 heures pour valider ou refuser les demandes. Ce changement vise à améliorer la planification des ressources et à garantir une meilleure continuité de service.',
            created_at: '2025-06-20T10:30:00Z',
            created_by: 'Admin RH'
          },
          {
            id: 2,
            full_note_number: 'NS-2025-002',
            category: 'Organisation',
            title: 'Horaires d\'été',
            content: 'Les horaires d\'été seront appliqués du 1er juillet au 31 août 2025. Les bureaux seront ouverts de 8h à 16h du lundi au vendredi. Cette modification permettra à chacun de profiter davantage des journées ensoleillées tout en maintenant notre productivité. N\'oubliez pas que le télétravail reste possible selon les modalités habituelles, après accord de votre responsable.',
            created_at: '2025-06-22T14:15:00Z',
            created_by: 'Admin RH'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Ouvrir la modal de détails pour une note
  const viewNoteDetails = (note) => {
    setSelectedNote(note);
    setShowNoteModal(true);
  };

  // Fermer la modal de détails
  const closeNoteModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
  };

  // Formatter une date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", dateString, error);
      return dateString;
    }
  };

  // Obtenir la classe CSS pour la catégorie
  const getCategoryClass = (category) => {
    switch (category) {
      case 'Information':
        return 'category-info';
      case 'Organisation':
        return 'category-organisation';
      case 'Rappel':
        return 'category-reminder';
      case 'Procédure':
        return 'category-procedure';
      case 'Évènement':
        return 'category-event';
      case 'Recrutement':
        return 'category-recruitment';
      default:
        return 'category-other';
    }
  };

  return (
    <>
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

      <div className="notes-header">
        <h3>Notes de service</h3>
        {notes.length > 0 && (
          <p className="notes-subheader">Communications importantes de la direction</p>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des notes de service...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-file-alt empty-icon"></i>
          <p className="empty-text">Aucune note de service disponible pour le moment.</p>
        </div>
      ) : (
        <div className="service-notes-grid">
          {notes.map((note) => (
            <div className="note-card" key={note.id}>
              <div className="note-header">
                <div className="note-number">{note.full_note_number}</div>
                <span className={`note-category ${getCategoryClass(note.category)}`}>
                  {note.category}
                </span>
              </div>
              <h4 className="note-title">{note.title}</h4>
              <p className="note-content">
                {note.content.length > 200 
                  ? `${note.content.substring(0, 200)}...` 
                  : note.content
                }
              </p>
              <div className="note-footer">
                <div className="note-meta">
                  <span className="note-date">
                    <i className="far fa-calendar-alt me-1"></i> {formatDate(note.created_at)}
                  </span>
                  {note.created_by && (
                    <span className="note-author">
                      <i className="far fa-user me-1"></i> {note.created_by}
                    </span>
                  )}
                </div>
                <button 
                  className="btn-view-details"
                  onClick={() => viewNoteDetails(note)}
                >
                  <i className="fas fa-eye me-1"></i> Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails de note */}
      {showNoteModal && selectedNote && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{selectedNote.full_note_number}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeNoteModal}
              ></button>
            </div>
            <div className="modal-body">
              <div className="note-detail-header">
                <h4>{selectedNote.title}</h4>
                <span className={`note-category ${getCategoryClass(selectedNote.category)}`}>
                  {selectedNote.category}
                </span>
              </div>
              <div className="note-meta">
                <span className="note-date">
                  <i className="far fa-calendar-alt me-1"></i> {formatDate(selectedNote.created_at)}
                </span>
                {selectedNote.created_by && (
                  <span className="note-author">
                    <i className="far fa-user me-1"></i> {selectedNote.created_by}
                  </span>
                )}
              </div>
              <div className="note-detail-content">
                {selectedNote.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={closeNoteModal}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeNotes;