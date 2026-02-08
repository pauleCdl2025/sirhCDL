import React, { useState, useEffect } from 'react';
import { evenementService } from '../../services/api';
import '../../styles/EventCard.css'; // Assurez-vous d'avoir ce fichier CSS ou utilisez les styles existants

const EventsComponent = ({ limit = 3, showTitle = true, className = '' }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await evenementService.getUpcoming();
        // Si limit est défini, limitez le nombre d'événements
        const limitedData = limit > 0 ? data.slice(0, limit) : data;
        setEvents(limitedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Impossible de charger les événements. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [limit]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      // Si la date est déjà formatée (comme "24/06/2025")
      if (dateString.includes('/')) {
        return dateString;
      }
      
      // Sinon, formater la date
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

  return (
    <div className={`event-card-component ${className}`}>
      {showTitle && (
        <div className="event-card-header">
          <div className="card-icon">
            <i className="fas fa-calendar-week"></i>
          </div>
          <h3 className="card-title">Événements à venir</h3>
        </div>
      )}
      
      <div className="event-card-body">
        <div className="event-decoration decoration-1"></div>
        <div className="event-decoration decoration-2"></div>
        
        {isLoading ? (
          <div className="text-center p-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-2 p-2" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-events">
            <i className="far fa-calendar-times empty-icon"></i>
            <p className="empty-text">Aucun événement prévu prochainement.</p>
          </div>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-meta">
                  <span className="event-meta-date">
                    <i className="far fa-calendar-alt"></i> {event.formatted_date || formatDate(event.date)}
                  </span>
                  <span className="event-meta-location">
                    <i className="fas fa-map-marker-alt"></i> {event.location}
                  </span>
                </div>
                <h4 className="event-name">{event.name}</h4>
                <p className="event-description">
                  {event.description.length > 150 
                    ? `${event.description.substring(0, 150)}...` 
                    : event.description
                  }
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventsComponent;