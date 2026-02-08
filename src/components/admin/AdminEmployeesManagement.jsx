import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminEmployeesManagement.css';
import { 
  FaUserTie, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaKey, 
  FaPlus, FaDownload, FaFileExport, FaBan, FaCheckCircle, FaEyeSlash
} from 'react-icons/fa';
import api from '../../services/api';

const AdminEmployeesManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    contractType: 'all',
    department: 'all',
    entity: 'all'
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    cdi: 0,
    cdd: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('employees');
      let data = response.data || [];

      // Calculer les statistiques
      const total = data.length;
      const active = data.filter(e => e.statut_employe === 'Actif').length;
      const inactive = data.filter(e => e.statut_employe === 'Inactif').length;
      const cdi = data.filter(e => e.type_contrat === 'CDI').length;
      const cdd = data.filter(e => e.type_contrat === 'CDD').length;

      setStats({ total, active, inactive, cdi, cdd });
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      (emp.nom_prenom && emp.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.matricule && emp.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.poste_actuel && emp.poste_actuel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filters.status === 'all' || emp.statut_employe === filters.status;
    const matchesContract = filters.contractType === 'all' || emp.type_contrat === filters.contractType;
    const matchesDept = filters.department === 'all' || emp.functional_area === filters.department;
    const matchesEntity = filters.entity === 'all' || emp.entity === filters.entity;

    return matchesSearch && matchesStatus && matchesContract && matchesDept && matchesEntity;
  });

  const handleResetPassword = async () => {
    if (!resetPasswordModal) return;

    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await api.post(`admin/employees/${resetPasswordModal.id}/reset-password`, { newPassword });
      alert('Mot de passe réinitialisé avec succès');
      setResetPasswordModal(null);
      setNewPassword('');
      setShowPassword(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Erreur lors de la réinitialisation');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${employee.nom_prenom} (${employee.matricule}) ?`)) {
      return;
    }

    try {
      await api.delete(`admin/users/employee/${employee.id}`);
      alert('Employé supprimé avec succès');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getUniqueValues = (key) => {
    const values = employees.map(emp => emp[key]).filter(Boolean);
    return [...new Set(values)].sort();
  };

  return (
    <div className="admin-employees-management">
      <div className="admin-page-header">
        <h1>
          <FaUserTie /> Gestion des Employés
        </h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/new-employee')}>
            <FaPlus /> Ajouter un employé
          </button>
          <button className="btn-secondary">
            <FaDownload /> Exporter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUserTie />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Employés</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Actifs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FaBan />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactifs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon contract">
            <FaFileExport />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.cdi}</div>
            <div className="stat-label">CDI</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>

          <select value={filters.contractType} onChange={(e) => setFilters({...filters, contractType: e.target.value})}>
            <option value="all">Tous les contrats</option>
            {getUniqueValues('type_contrat').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})}>
            <option value="all">Tous les départements</option>
            {getUniqueValues('functional_area').map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select value={filters.entity} onChange={(e) => setFilters({...filters, entity: e.target.value})}>
            <option value="all">Toutes les entités</option>
            {getUniqueValues('entity').map(entity => (
              <option key={entity} value={entity}>{entity}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : (
        <div className="employees-table-container">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Email</th>
                <th>Poste</th>
                <th>Département</th>
                <th>Type Contrat</th>
                <th>Statut</th>
                <th>Date Entrée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">Aucun employé trouvé</td>
                </tr>
              ) : (
                filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td className="matricule-cell">{employee.matricule || '-'}</td>
                    <td className="name-cell">{employee.nom_prenom || '-'}</td>
                    <td>{employee.email || '-'}</td>
                    <td>{employee.poste_actuel || '-'}</td>
                    <td>{employee.functional_area || '-'}</td>
                    <td>
                      <span className={`contract-badge ${employee.type_contrat?.toLowerCase() || 'default'}`}>
                        {employee.type_contrat || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${employee.statut_employe?.toLowerCase() || 'actif'}`}>
                        {employee.statut_employe || 'Actif'}
                      </span>
                    </td>
                    <td>{formatDate(employee.date_entree)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          title="Voir détails"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowDetailModal(true);
                          }}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          title="Modifier"
                          onClick={() => navigate(`/edit-employee/${employee.id}`)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-key"
                          title="Réinitialiser mot de passe"
                          onClick={() => setResetPasswordModal(employee)}
                        >
                          <FaKey />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          title="Supprimer"
                          onClick={() => handleDeleteEmployee(employee)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de réinitialisation de mot de passe */}
      {resetPasswordModal && (
        <div className="modal-overlay" onClick={() => {
          setResetPasswordModal(null);
          setNewPassword('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Réinitialiser le mot de passe</h2>
              <button className="modal-close" onClick={() => {
                setResetPasswordModal(null);
                setNewPassword('');
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Employé:</label>
                <input
                  type="text"
                  value={`${resetPasswordModal.nom_prenom} (${resetPasswordModal.matricule})`}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <FaEyeSlash className="eye-icon" /> : <FaEye className="eye-icon" />}
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setResetPasswordModal(null);
                  setNewPassword('');
                }}>
                  Annuler
                </button>
                <button className="btn-primary" onClick={handleResetPassword}>
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'employé</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Matricule:</strong>
                  <span>{selectedEmployee.matricule}</span>
                </div>
                <div className="detail-item">
                  <strong>Nom & Prénom:</strong>
                  <span>{selectedEmployee.nom_prenom}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{selectedEmployee.email || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Téléphone:</strong>
                  <span>{selectedEmployee.telephone || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Poste:</strong>
                  <span>{selectedEmployee.poste_actuel || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Département:</strong>
                  <span>{selectedEmployee.functional_area || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Type de contrat:</strong>
                  <span>{selectedEmployee.type_contrat || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Statut:</strong>
                  <span>{selectedEmployee.statut_employe || '-'}</span>
                </div>
                <div className="detail-item">
                  <strong>Date d'entrée:</strong>
                  <span>{formatDate(selectedEmployee.date_entree)}</span>
                </div>
                <div className="detail-item">
                  <strong>Date de fin contrat:</strong>
                  <span>{formatDate(selectedEmployee.date_fin_contrat) || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeesManagement;

