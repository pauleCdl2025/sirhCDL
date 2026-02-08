import React, { useState, useEffect } from 'react';
import { FaTasks, FaCalendarAlt, FaUser, FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { taskService } from '../../services/taskService';
import '../../styles/TaskManagement.css';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // États pour le formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    category: '',
    estimated_hours: '',
    notes: ''
  });

  // Charger les tâches depuis la base de données
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getAllTasks();
        setTasks(data);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
        // En cas d'erreur, on peut afficher un message ou utiliser des données par défaut
      }
    };

    loadTasks();
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
      if (editingTask) {
        // Mise à jour
        const updatedTask = await taskService.updateTask(editingTask.id, formData);
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? updatedTask : task
        ));
      } else {
        // Création
        const newTask = await taskService.createTask(formData);
        setTasks(prev => [newTask, ...prev]);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        category: '',
        estimated_hours: '',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la tâche');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await taskService.deleteTask(id);
        setTasks(prev => prev.filter(task => task.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la tâche');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(id, newStatus);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleProgressUpdate = async (id, newProgress) => {
    try {
      const updatedTask = await taskService.updateTaskProgress(id, newProgress);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      alert('Erreur lors de la mise à jour de la progression');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssignee = !selectedAssignee || task.assignee === selectedAssignee;
    
    return matchesFilter && matchesSearch && matchesAssignee;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#3498db';
      case 'in_progress': return '#f39c12';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnue';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const getAssignees = () => {
    const assignees = [...new Set(tasks.map(task => task.assignee))];
    return assignees;
  };

  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, pending: 0, overdue: 0 });

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await taskService.getTaskStats();
        setStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        // En cas d'erreur, calculer les stats localement
        const localStats = {
          total: tasks.length,
          completed: tasks.filter(task => task.status === 'completed').length,
          inProgress: tasks.filter(task => task.status === 'in_progress').length,
          pending: tasks.filter(task => task.status === 'pending').length,
          overdue: tasks.filter(task => isOverdue(task.due_date)).length
        };
        setStats(localStats);
      }
    };

    loadStats();
  }, [tasks]);

  return (
    <div className="task-management">
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des Tâches</h1>
          <p className="page-subtitle">Suivez et gérez les tâches de l'équipe RH</p>
        </div>
        <button 
          className="add-task-btn"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Nouvelle Tâche
        </button>
      </div>

      {/* Statistiques */}
      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaTasks />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Terminées</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgress}</h3>
            <p>En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.overdue}</h3>
            <p>En retard</p>
          </div>
        </div>
      </div>

      <div className="task-controls">
        <div className="filters-section">
          <div className="filter-group">
            <label>Statut :</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Toutes</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Assigné à :</label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="filter-select"
            >
              <option value="">Tous</option>
              {getAssignees().map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Rechercher par titre, description ou assigné..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <div key={task.id} className={`task-card ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
            <div className="task-header">
              <div className="task-title-section">
                <h3>{task.title}</h3>
                <div className="task-meta">
                  <span className="category">{task.category}</span>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                    {getPriorityText(task.priority)}
                  </span>
                </div>
              </div>
              <div className="status-badge" style={{ backgroundColor: getStatusColor(task.status) }}>
                {getStatusText(task.status)}
              </div>
            </div>

            <div className="task-description">
              <p>{task.description}</p>
            </div>

            <div className="task-details">
              <div className="detail-item">
                <FaUser className="detail-icon" />
                <span>{task.assignee}</span>
              </div>
                             <div className="detail-item">
                 <FaCalendarAlt className="detail-icon" />
                 <span className={isOverdue(task.due_date) ? 'overdue-date' : ''}>
                   {new Date(task.due_date).toLocaleDateString('fr-FR')}
                 </span>
               </div>
                             <div className="detail-item">
                 <FaClock className="detail-icon" />
                 <span>{task.estimated_hours}h estimées</span>
               </div>
            </div>

            <div className="task-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              <span className="progress-text">{task.progress}%</span>
            </div>

            {task.notes && (
              <div className="task-notes">
                <p>{task.notes}</p>
              </div>
            )}

            <div className="task-actions">
              <button 
                className="action-btn view-btn"
                onClick={() => handleEdit(task)}
              >
                <FaEye /> Voir
              </button>
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEdit(task)}
              >
                <FaEdit /> Modifier
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDelete(task.id)}
              >
                <FaTrash /> Supprimer
              </button>
              
              {task.status !== 'completed' && task.status !== 'cancelled' && (
                <div className="status-actions">
                  <button 
                    className="status-btn complete-btn"
                    onClick={() => handleStatusChange(task.id, 'completed')}
                  >
                    <FaCheck /> Terminer
                  </button>
                  <button 
                    className="status-btn progress-btn"
                    onClick={() => handleProgressUpdate(task.id, Math.min(task.progress + 25, 100))}
                  >
                    <FaClock /> +25%
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="no-tasks">
          <p>Aucune tâche trouvée</p>
        </div>
      )}

      {/* Modal pour ajouter/modifier une tâche */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
              <button 
                className="close-btn"
                                 onClick={() => {
                   setShowModal(false);
                   setEditingTask(null);
                   setFormData({
                     title: '',
                     description: '',
                     assignee: '',
                     priority: 'medium',
                     status: 'pending',
                     due_date: '',
                     category: '',
                     estimated_hours: '',
                     notes: ''
                   });
                 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Titre de la tâche *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assigné à *</label>
                  <input
                    type="text"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner</option>
                                         <option value="RH">RH</option>
                     <option value="Recrutement">Recrutement</option>
                     <option value="Formation">Formation</option>
                     <option value="Administration">Administration</option>
                     <option value="Médical">Médical</option>
                     <option value="Qualité">Qualité</option>
                     <option value="Technique">Technique</option>
                     <option value="Pharmacie">Pharmacie</option>
                     <option value="Laboratoire">Laboratoire</option>
                     <option value="Radiologie">Radiologie</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priorité</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                  </select>
                </div>
                                 <div className="form-group">
                   <label>Date d'échéance *</label>
                   <input
                     type="date"
                     name="due_date"
                     value={formData.due_date}
                     onChange={handleInputChange}
                     required
                   />
                 </div>
              </div>

                             <div className="form-group">
                 <label>Heures estimées</label>
                 <input
                   type="number"
                   name="estimated_hours"
                   value={formData.estimated_hours}
                   onChange={handleInputChange}
                   min="1"
                   placeholder="Ex: 8"
                 />
               </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  {editingTask ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
