import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaBuilding, FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { interviewService } from '../../services/interviewService';
import '../../styles/InterviewManagement.css';

const InterviewManagement = () => {
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // États pour le formulaire
  const [formData, setFormData] = useState({
    candidate_name: '',
    position: '',
    interviewer: '',
    interview_date: '',
    interview_time: '',
    duration: '60',
    interview_type: 'face_to_face',
    status: 'scheduled',
    notes: '',
    location: '',
    department: ''
  });

  // Charger les entretiens depuis la base de données
  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const data = await interviewService.getAllInterviews();
        setInterviews(data);
      } catch (error) {
        console.error('Erreur lors du chargement des entretiens:', error);
        // En cas d'erreur, on peut afficher un message ou utiliser des données par défaut
      }
    };

    loadInterviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInterview) {
        // Mise à jour
        const updatedInterview = await interviewService.updateInterview(editingInterview.id, formData);
        setInterviews(prev => prev.map(interview => 
          interview.id === editingInterview.id ? updatedInterview : interview
        ));
      } else {
        // Création
        const newInterview = await interviewService.createInterview(formData);
        setInterviews(prev => [newInterview, ...prev]);
      }
      setShowModal(false);
      setEditingInterview(null);
      setFormData({
        candidate_name: '',
        position: '',
        interviewer: '',
        interview_date: '',
        interview_time: '',
        duration: '60',
        interview_type: 'face_to_face',
        status: 'scheduled',
        notes: '',
        location: '',
        department: ''
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'entretien');
    }
  };

  const handleEdit = (interview) => {
    setEditingInterview(interview);
    setFormData(interview);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      try {
        await interviewService.deleteInterview(id);
        setInterviews(prev => prev.filter(interview => interview.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'entretien');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedInterview = await interviewService.updateInterviewStatus(id, newStatus);
      setInterviews(prev => prev.map(interview => 
        interview.id === id ? updatedInterview : interview
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesFilter = filter === 'all' || interview.status === filter;
    const matchesSearch = interview.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !selectedDate || interview.interview_date === selectedDate;
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3498db';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      case 'no_show': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'no_show': return 'Absent';
      default: return 'Inconnu';
    }
  };

  // Fonction réservée pour usage futur
  // eslint-disable-next-line no-unused-vars
  const getTypeText = (type) => {
    switch (type) {
      case 'face_to_face': return 'En présentiel';
      case 'video': return 'Vidéo';
      case 'phone': return 'Téléphonique';
      default: return 'Autre';
    }
  };

  return (
    <div className="interview-management">
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des Entretiens</h1>
          <p className="page-subtitle">Planifiez et suivez les entretiens de recrutement</p>
        </div>
        <button 
          className="add-interview-btn"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Nouvel Entretien
        </button>
      </div>

      <div className="interview-controls">
        <div className="filters-section">
          <div className="filter-group">
            <label>Statut :</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous</option>
              <option value="scheduled">Programmés</option>
              <option value="completed">Terminés</option>
              <option value="cancelled">Annulés</option>
              <option value="no_show">Absents</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Date :</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Rechercher par candidat, poste ou intervieweur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="interviews-grid">
        {filteredInterviews.map(interview => (
          <div key={interview.id} className="interview-card">
            <div className="interview-header">
                           <div className="candidate-info">
               <h3>{interview.candidate_name}</h3>
               <p className="position">{interview.position}</p>
             </div>
              <div className="status-badge" style={{ backgroundColor: getStatusColor(interview.status) }}>
                {getStatusText(interview.status)}
              </div>
            </div>

            <div className="interview-details">
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <span>{interview.interviewer}</span>
              </div>
                             <div className="detail-item">
                 <FaCalendarAlt className="detail-icon" />
                 <span>{new Date(interview.interview_date).toLocaleDateString('fr-FR')}</span>
               </div>
                             <div className="detail-item">
                 <FaClock className="detail-icon" />
                 <span>{interview.interview_time} ({interview.duration} min)</span>
               </div>
              <div className="detail-item">
                <FaBuilding className="detail-icon" />
                <span>{interview.department}</span>
              </div>
            </div>

            <div className="interview-notes">
              <p>{interview.notes}</p>
            </div>

            <div className="interview-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => handleEdit(interview)}
              >
                <FaEye /> Voir
              </button>
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEdit(interview)}
              >
                <FaEdit /> Modifier
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDelete(interview.id)}
              >
                <FaTrash /> Supprimer
              </button>
              
              {interview.status === 'scheduled' && (
                <div className="status-actions">
                  <button 
                    className="status-btn complete-btn"
                    onClick={() => handleStatusChange(interview.id, 'completed')}
                  >
                    <FaCheck /> Terminer
                  </button>
                  <button 
                    className="status-btn cancel-btn"
                    onClick={() => handleStatusChange(interview.id, 'cancelled')}
                  >
                    <FaTimes /> Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="no-interviews">
          <p>Aucun entretien trouvé</p>
        </div>
      )}

      {/* Modal pour ajouter/modifier un entretien */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingInterview ? 'Modifier l\'entretien' : 'Nouvel entretien'}</h2>
              <button 
                className="close-btn"
                                 onClick={() => {
                   setShowModal(false);
                   setEditingInterview(null);
                   setFormData({
                     candidate_name: '',
                     position: '',
                     interviewer: '',
                     interview_date: '',
                     interview_time: '',
                     duration: '60',
                     interview_type: 'face_to_face',
                     status: 'scheduled',
                     notes: '',
                     location: '',
                     department: ''
                   });
                 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="interview-form">
              <div className="form-row">
                                 <div className="form-group">
                   <label>Nom du candidat *</label>
                   <input
                     type="text"
                     name="candidate_name"
                     value={formData.candidate_name}
                     onChange={handleInputChange}
                     required
                   />
                 </div>
                <div className="form-group">
                  <label>Poste *</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Intervieweur *</label>
                  <input
                    type="text"
                    name="interviewer"
                    value={formData.interviewer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Département</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

                             <div className="form-row">
                 <div className="form-group">
                   <label>Date *</label>
                   <input
                     type="date"
                     name="interview_date"
                     value={formData.interview_date}
                     onChange={handleInputChange}
                     required
                   />
                 </div>
                 <div className="form-group">
                   <label>Heure *</label>
                   <input
                     type="time"
                     name="interview_time"
                     value={formData.interview_time}
                     onChange={handleInputChange}
                     required
                   />
                 </div>
               </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Durée (minutes)</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>
                                 <div className="form-group">
                   <label>Type d'entretien</label>
                   <select
                     name="interview_type"
                     value={formData.interview_type}
                     onChange={handleInputChange}
                   >
                     <option value="face_to_face">En présentiel</option>
                     <option value="video">Vidéo</option>
                     <option value="phone">Téléphonique</option>
                   </select>
                 </div>
              </div>

              <div className="form-group">
                <label>Lieu</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Salle de réunion, Zoom, etc."
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {editingInterview ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
