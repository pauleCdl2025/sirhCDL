import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { evenementService, noteService } from '../../services/api';
import { usePendingRequestsCount } from '../../hooks/usePendingRequestsCount';
import EventsComponent from '../common/EventsComponent';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState(null);
  const { pendingCount } = usePendingRequestsCount();

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        // Récupérer les événements depuis l'API
        const eventsData = await evenementService.getUpcoming();
        setEvents(eventsData);

        // Récupérer les notes de service publiques depuis l'API
        setLoadingNotes(true);
        try {
          // Utiliser le service API pour récupérer uniquement les notes publiques
          const notesData = await noteService.getPublicNotes();
          setNotes(notesData);
          setNotesError(null);
        } catch (noteError) {
          console.error('Error fetching public notes:', noteError);
          setNotesError('Impossible de charger les notes de service.');
          // En cas d'erreur, utiliser des données fictives pour la démo
          setNotes([
            {
              id: 1,
              full_note_number: 'NS-2025-001',
              category: 'Information',
              title: 'Nouveau processus de congés',
              content: 'Suite à la réunion du comité de direction, nous mettons en place un nouveau processus de demande de congés à partir du 1er juillet 2025.',
              created_at: '2025-06-20T10:30:00Z',
              created_by: 'Admin RH'
            },
            {
              id: 2,
              full_note_number: 'NS-2025-002',
              category: 'Organisation',
              title: 'Horaires d\'été',
              content: 'Les horaires d\'été seront appliqués du 1er juillet au 31 août 2025. Les bureaux seront ouverts de 8h à 16h du lundi au vendredi.',
              created_at: '2025-06-22T14:15:00Z',
              created_by: 'Admin RH'
            }
          ]);
        } finally {
          setLoadingNotes(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Stats data
  const stats = [
    { 
      value: 1, 
      label: 'Collaborateurs', 
      icon: 'fas fa-users', 
      color: 'blue' 
    },
    { 
      value: 0, 
      label: 'Congés en attente', 
      icon: 'fas fa-calendar-check', 
      color: 'green' 
    },
    { 
      value: 4, 
      label: 'Entreprises', 
      icon: 'fas fa-building', 
      color: 'orange' 
    },
    { 
      value: events.length, 
      label: 'Évènements cette semaine', 
      icon: 'fas fa-calendar-day', 
      color: 'red' 
    }
  ];

  // Tools data
  const tools = [
    {
      title: 'Notes de service',
      icon: 'fas fa-file-alt',
      path: '/service-notes'
    },
    {
      title: 'Gestion de contrats',
      icon: 'fas fa-file-signature',
      path: '/contrats'
    },
    {
      title: 'Gestion des sanctions',
      icon: 'fas fa-gavel',
      path: '/sanctions'
    },
    {
      title: 'Demandes employés',
      icon: 'fas fa-file-alt',
      path: '/employee-requests',
      notificationCount: pendingCount
    }
    
  ];

  // HR cards data
  const hrCards = [
    {
      title: 'Congés et absences',
      icon: 'fas fa-calendar-alt',
      text: 'Vous n\'avez aucune demande de congé en attente',
      buttonText: 'Déclarer un congé',
      buttonIcon: 'far fa-calendar-check',
      buttonPath: '/leave-management',
      buttonVariant: 'outline-primary'
    },
    {
      title: 'Gestion des collaborateurs',
      icon: 'fas fa-users',
      count: 1,
      countLabel: 'Collaborateur',
      buttons: [
        {
          text: 'Ajouter un employé',
          icon: 'fas fa-user-plus',
          path: '/new-employee',
          variant: 'primary'
        },
        {
          text: 'Déclarer un départ',
          icon: 'fas fa-user-minus',
          path: '/departure-history',
          variant: 'outline-danger'
        }
      ]
    }
  ];

  // Formatter la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir la classe CSS pour la catégorie de note
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

  // Stat Card Component (inline)
  const StatCard = ({ value, label, icon, color, delay = 0.1 }) => {
    return (
      <div className="stat-card fade-in-up" style={{ animationDelay: `${delay}s` }}>
        <div className={`stat-icon-wrapper stat-icon-${color}`}>
          <i className={icon}></i>
        </div>
        <div className="stat-content">
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    );
  };

  // Tool Card Component (inline)
  const ToolCard = ({ title, icon, path, notificationCount }) => {
    return (
      <Link to={path} className="tool-card">
        <div className="tool-icon">
          <i className={icon}></i>
          {notificationCount > 0 && (
            <span className="tool-notification-badge">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </div>
        <h3 className="tool-title">{title}</h3>
      </Link>
    );
  };

  // HR Card Component (inline)
  const HRCard = ({ 
    title, 
    icon, 
    text, 
    count, 
    countLabel, 
    buttonText, 
    buttonIcon, 
    buttonPath, 
    buttonVariant = 'primary',
    buttons
  }) => {
    return (
      <div className="hr-card">
        <div className="hr-icon">
          <i className={icon}></i>
        </div>
        <h3 className="hr-title">{title}</h3>
        
        {text && <p className="hr-text">{text}</p>}
        
        {count !== undefined && (
          <div className="hr-count">
            {count} <span>{countLabel}</span>
          </div>
        )}
        
        {buttonText && buttonPath && (
          <Link to={buttonPath} className={`btn btn-${buttonVariant}`}>
            {buttonIcon && <i className={`${buttonIcon} btn-icon`}></i>}
            {buttonText}
          </Link>
        )}
        
        {buttons && buttons.length > 0 && (
          <div className="d-grid gap-2">
            {buttons.map((button, index) => (
              <Link 
                key={index}
                to={button.path} 
                className={`btn btn-${button.variant} ${index > 0 ? 'mt-2' : ''}`}
              >
                {button.icon && <i className={`${button.icon} btn-icon`}></i>}
                {button.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Bienvenue sur votre portail RH</h1>
          <p className="page-subtitle">Gérez efficacement toutes les ressources humaines de votre entreprise.</p>
        </div>
       
      </div>
      
      <div className="stats-row">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            value={stat.value}
            label={stat.label}
            icon={stat.icon}
            color={stat.color}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>
      
      <div className="tools-section fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-tools"></i>
          </div>
          <h2 className="section-title">Outils RH</h2>
        </div>
        
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <ToolCard 
              key={index}
              title={tool.title}
              icon={tool.icon}
              path={tool.path}
              notificationCount={tool.notificationCount}
            />
          ))}
        </div>
      </div>
      
      <div className="main-grid fade-in-up" style={{ animationDelay: '0.6s' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-tasks"></i>
            </div>
            <h3 className="card-title">Mes démarches</h3>
          </div>
          <div className="card-body">
            <div className="welcome-wrapper">
              <img 
                src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1725893934/flat-lay-minimalistic-geometrical-figures-with-copy-space_1_rmazpl.jpg" 
                alt="Welcome" 
                className="welcome-image"
              />
              
              <div className="welcome-content">
                <h4 className="welcome-title">Bienvenue sur votre espace !</h4>
                <p className="welcome-text">
                  Vous n'avez aucun employé inscrit et aucune entreprise. Ajoutez de nouveaux employés et vos autres entités.
                </p>
                
                <div className="action-buttons">
                  <Link to="/new-employee" className="btn btn-primary">
                    <i className="fas fa-user-plus btn-icon"></i>Ajouter un employé
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Card - Utilisation du composant réutilisable */}
        <EventsComponent />
      </div>
      
      {/* Service Note Card */}
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
            <Link to="/service-notes" className="btn-sm">Voir tout</Link>
          </div>
          <div className="card-body">
            <div className="note-decoration decoration-3"></div>
            <div className="note-decoration decoration-4"></div>
            
            {loadingNotes ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : notesError ? (
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {notesError}
              </div>
            ) : notes && notes.length > 0 ? (
              <ul className="note-list list-unstyled">
                {notes.slice(0, 3).map((note) => (
                  <li key={note.id} className="note-item">
                    <div className="note-meta">
                      <span className="note-meta-date">
                        <i className="far fa-calendar-alt me-1"></i> {formatDate(note.created_at)}
                      </span>
                      <span className={`note-meta-category ${getCategoryClass(note.category)}`}>
                        {note.category}
                      </span>
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
          </div>
        </div>
      </div>
      
      <div className="hr-section fade-in-up" style={{ animationDelay: '0.7s' }}>
        <div className="section-header">
          <div className="section-icon">
            <i className="fas fa-user-tie"></i>
          </div>
          <h2 className="section-title">Ressources humaines</h2>
        </div>
        
        <div className="hr-grid">
          {hrCards.map((card, index) => (
            <HRCard 
              key={index}
              {...card}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;