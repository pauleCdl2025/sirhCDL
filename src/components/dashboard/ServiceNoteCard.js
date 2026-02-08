import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

const ServiceNoteCard = ({ notes, isLoading }) => {
  return (
    <div className="notes-section fade-in-up" style={{ animationDelay: '0.65s', marginBottom: '35px' }}>
      <div className="section-header">
        <div className="section-icon">
          <i className="fas fa-file-alt"></i>
        </div>
        <h2 className="section-title">Notes de service récentes</h2>
      </div>
      
      <div className="card note-card">
        <div className="card-header">
          <div className="card-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h3 className="card-title">Dernières communications</h3>
        </div>
        <div className="card-body">
          <div className="note-decoration decoration-3"></div>
          <div className="note-decoration decoration-4"></div>
          
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : notes && notes.length > 0 ? (
            <ul className="note-list list-unstyled">
              {notes.map((note) => (
                <li key={note.id} className="note-item">
                  <div className="note-meta">
                    <span className="note-meta-date">
                      <i className="far fa-calendar-alt me-1"></i> {note.formatted_date}
                    </span>
                    <span className="note-meta-category">{note.category}</span>
                  </div>
                  <div className="note-number">{note.full_note_number}</div>
                  <h4 className="note-title">{note.title}</h4>
                  <p className="note-content">
                    {note.content.length > 150 
                      ? `${note.content.substring(0, 150)}...` 
                      : note.content
                    }
                  </p>
                  <div className="mt-2">
                    <Link to={`/service-notes/${note.id}`} className="btn btn-sm btn-outline-primary">
                      <i className="fas fa-eye me-1"></i> Voir détails
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-notes">
              <i className="fas fa-file-alt empty-icon"></i>
              <p className="empty-text">Aucune note de service disponible.</p>
            </div>
          )}
          
          <Link to="/service-notes/new" className="add-note-btn" title="Ajouter une note">
            <i className="fas fa-plus"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceNoteCard;