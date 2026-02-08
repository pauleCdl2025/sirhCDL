import React, { useState, useEffect } from 'react';
import { performanceService, employeeService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const PerformanceManagement = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    evaluation_date: new Date().toISOString().split('T')[0],
    period: '',
    overall_rating: '',
    comments: '',
    goals: '',
    achievements: '',
    areas_for_improvement: ''
  });

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [evaluationsData, employeesData] = await Promise.all([
          performanceService.getAll().catch(() => []),
          employeeService.getAll().catch(() => [])
        ]);
        setEvaluations(evaluationsData);
        setEmployees(employeesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Ouvrir la modale d'ajout
  const openAddModal = () => {
    setSelectedEvaluation(null);
    setFormData({
      employee_id: '',
      evaluation_date: new Date().toISOString().split('T')[0],
      period: '',
      overall_rating: '',
      comments: '',
      goals: '',
      achievements: '',
      areas_for_improvement: ''
    });
    setShowModal(true);
  };

  // Ouvrir la modale d'édition
  const openEditModal = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setFormData({
      employee_id: evaluation.employee_id || '',
      evaluation_date: evaluation.evaluation_date ? evaluation.evaluation_date.split('T')[0] : new Date().toISOString().split('T')[0],
      period: evaluation.period || '',
      overall_rating: evaluation.overall_rating || '',
      comments: evaluation.comments || '',
      goals: evaluation.goals || '',
      achievements: evaluation.achievements || '',
      areas_for_improvement: evaluation.areas_for_improvement || ''
    });
    setShowModal(true);
  };

  // Fermer la modale
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvaluation(null);
    setError(null);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (selectedEvaluation) {
        // Mise à jour
        await performanceService.update(selectedEvaluation.id, formData);
      } else {
        // Création
        await performanceService.create(formData);
      }

      // Recharger les données
      const evaluationsData = await performanceService.getAll();
      setEvaluations(evaluationsData);
      closeModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Erreur lors de la sauvegarde de l\'évaluation');
    }
  };

  // Supprimer une évaluation
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      return;
    }

    try {
      await performanceService.delete(id);
      const evaluationsData = await performanceService.getAll();
      setEvaluations(evaluationsData);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'évaluation');
    }
  };

  // Obtenir le nom de l'employé
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.nom_prenom : 'Employé non trouvé';
  };

  // Formater la note
  const formatRating = (rating) => {
    const ratings = {
      'excellent': 'Excellent',
      'very_good': 'Très bien',
      'good': 'Bien',
      'satisfactory': 'Satisfaisant',
      'needs_improvement': 'À améliorer'
    };
    return ratings[rating] || rating;
  };

  // Obtenir la couleur de la note
  const getRatingColor = (rating) => {
    const colors = {
      'excellent': 'success',
      'very_good': 'info',
      'good': 'primary',
      'satisfactory': 'warning',
      'needs_improvement': 'danger'
    };
    return colors[rating] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des Performances</h1>
          <p className="page-subtitle">Gérez les évaluations de performance des employés.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <i className="fas fa-plus me-2"></i>
          Nouvelle Évaluation
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="card table-card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-chart-line me-2"></i>
            Évaluations de Performance
          </h5>
        </div>
        <div className="card-body">
          {evaluations.length === 0 ? (
            <div className="text-center p-5">
              <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucune évaluation trouvée</h5>
              <p className="text-muted">Commencez par créer une nouvelle évaluation de performance.</p>
              <button className="btn btn-primary" onClick={openAddModal}>
                <i className="fas fa-plus me-2"></i>
                Nouvelle Évaluation
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Employé</th>
                    <th>Date d'évaluation</th>
                    <th>Période</th>
                    <th>Note globale</th>
                    <th>Commentaires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((evaluation) => (
                    <tr key={evaluation.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                            style={{ width: '32px', height: '32px', fontSize: '12px' }}
                          >
                            {getEmployeeName(evaluation.employee_id).split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div>
                            <div className="fw-bold">{getEmployeeName(evaluation.employee_id)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {evaluation.evaluation_date 
                          ? new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </td>
                      <td>{evaluation.period || '-'}</td>
                      <td>
                        <span className={`badge bg-${getRatingColor(evaluation.overall_rating)}`}>
                          {formatRating(evaluation.overall_rating)}
                        </span>
                      </td>
                      <td>
                        {evaluation.comments 
                          ? (evaluation.comments.length > 50 
                              ? evaluation.comments.substring(0, 50) + '...' 
                              : evaluation.comments)
                          : '-'
                        }
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(evaluation)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(evaluation.id)}
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

      {/* Modale d'ajout/édition */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-chart-line me-2"></i>
                  {selectedEvaluation ? 'Modifier l\'évaluation' : 'Nouvelle évaluation'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Employé <span className="text-danger">*</span></label>
                      <select
                        name="employee_id"
                        className="form-select"
                        value={formData.employee_id}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Sélectionner un employé</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.nom_prenom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date d'évaluation <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        name="evaluation_date"
                        className="form-control"
                        value={formData.evaluation_date}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Période</label>
                      <input
                        type="text"
                        name="period"
                        className="form-control"
                        value={formData.period}
                        onChange={handleFormChange}
                        placeholder="Ex: Trimestre 1 2025"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Note globale <span className="text-danger">*</span></label>
                      <select
                        name="overall_rating"
                        className="form-select"
                        value={formData.overall_rating}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Sélectionner une note</option>
                        <option value="excellent">Excellent</option>
                        <option value="very_good">Très bien</option>
                        <option value="good">Bien</option>
                        <option value="satisfactory">Satisfaisant</option>
                        <option value="needs_improvement">À améliorer</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Objectifs</label>
                      <textarea
                        name="goals"
                        className="form-control"
                        rows="3"
                        value={formData.goals}
                        onChange={handleFormChange}
                        placeholder="Objectifs fixés pour cette période..."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Réalisations</label>
                      <textarea
                        name="achievements"
                        className="form-control"
                        rows="3"
                        value={formData.achievements}
                        onChange={handleFormChange}
                        placeholder="Réalisations et accomplissements..."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Axes d'amélioration</label>
                      <textarea
                        name="areas_for_improvement"
                        className="form-control"
                        rows="3"
                        value={formData.areas_for_improvement}
                        onChange={handleFormChange}
                        placeholder="Points à améliorer..."
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Commentaires</label>
                      <textarea
                        name="comments"
                        className="form-control"
                        rows="4"
                        value={formData.comments}
                        onChange={handleFormChange}
                        placeholder="Commentaires généraux sur la performance..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {selectedEvaluation ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceManagement;
