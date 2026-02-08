import React, { useState, useEffect, useMemo } from 'react';
import '../../styles/AdminUsersManagement.css';
import { FaUsers, FaTrash, FaSearch, FaFilter, FaKey, FaEnvelope, FaIdCard, FaEye, FaEyeSlash, FaBan, FaCheckCircle } from 'react-icons/fa';
import api from '../../services/api';

const AdminUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('all');
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      let url = 'admin/users/all?limit=500';
      if (filterUserType !== 'all') {
        url += `&userType=${filterUserType}`;
      }
      console.log('📥 Récupération des utilisateurs depuis:', url);
      const response = await api.get(url);
      console.log('✅ Utilisateurs récupérés:', response.data?.length || 0);
      console.log('📊 Données:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      console.error('❌ Détails:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filterUserType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.matricule && user.matricule.toLowerCase().includes(searchLower)) ||
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.nom_prenom && user.nom_prenom.toLowerCase().includes(searchLower)) ||
        (user.identifier && user.identifier.toLowerCase().includes(searchLower));
      
      return matchesSearch;
    });
  }, [users, searchTerm]);

  const handleResetPassword = async () => {
    if (!resetPasswordModal) return;

    // Validation
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setPasswordError('');
      const { user_type, id } = resetPasswordModal;
      
      const url = user_type === 'rh' 
        ? `admin/users/rh/${id}/reset-password`
        : `admin/employees/${id}/reset-password`;

      await api.post(url, { newPassword });

      alert('Mot de passe réinitialisé avec succès');
      setResetPasswordModal(null);
      setNewPassword('');
      setConfirmPassword('');
      fetchUsers();
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordError(error.response?.data?.error || 'Erreur lors de la réinitialisation');
    }
  };

  const handleToggleBlock = async (user) => {
    if (!window.confirm(
      `Êtes-vous sûr de vouloir ${user.status === 'suspended' || user.status === 'inactive' || user.statut_employe === 'Inactif' ? 'débloquer' : 'bloquer'} cet utilisateur ?`
    )) {
      return;
    }

    try {
      const currentStatus = user.status || user.statut_employe;
      let newStatus;
      
      if (user.user_type === 'rh') {
        // Pour les RH: active <-> suspended
        newStatus = currentStatus === 'suspended' || currentStatus === 'inactive' ? 'active' : 'suspended';
      } else {
        // Pour les employés: Actif <-> Inactif
        newStatus = currentStatus === 'Inactif' ? 'Actif' : 'Inactif';
      }

      await api.patch(`admin/users/${user.user_type}/${user.id}/toggle-status`, { status: newStatus });
      
      alert(`Utilisateur ${newStatus === 'active' || newStatus === 'Actif' ? 'débloqué' : 'bloqué'} avec succès`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(error.response?.data?.error || 'Erreur lors du blocage/déblocage');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.name || user.nom_prenom || user.email} ?`)) {
      return;
    }

    try {
      await api.delete(`admin/users/${user.user_type}/${user.id}`);
      alert('Utilisateur supprimé avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getUserTypeIcon = (userType) => {
    return userType === 'rh' ? <FaEnvelope /> : <FaIdCard />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-users-management">
      <div className="admin-page-header">
        <h1>
          <FaUsers /> Gestion des Utilisateurs
        </h1>
        <button className="btn-primary" onClick={fetchUsers}>
          Actualiser
        </button>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FaFilter />
          <select value={filterUserType} onChange={(e) => setFilterUserType(e.target.value)}>
            <option value="all">Tous les types</option>
            <option value="rh">Utilisateurs RH</option>
            <option value="employee">Employés</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Identifiant</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle/Poste</th>
                <th>Dernière connexion</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">Aucun utilisateur trouvé</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={`${user.user_type}-${user.id}`}>
                    <td>
                      <span className={`user-type-badge type-${user.user_type}`}>
                        {getUserTypeIcon(user.user_type)}
                        {user.user_type === 'rh' ? 'RH' : 'Employé'}
                      </span>
                    </td>
                    <td>
                      <div className="identifier-cell">
                        {user.email || user.matricule || user.identifier}
                      </div>
                    </td>
                    <td>{user.name || user.nom_prenom || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      {user.role ? (
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      ) : (
                        user.poste_actuel || '-'
                      )}
                    </td>
                    <td className="last-login">
                      {formatDate(user.last_login)}
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status || user.statut_employe || 'active'}`}>
                        {user.status === 'suspended' ? 'Bloqué' : 
                         user.status === 'inactive' ? 'Inactif' :
                         user.status === 'active' ? 'Actif' :
                         user.statut_employe === 'Inactif' ? 'Bloqué' :
                         user.statut_employe || 'Actif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-primary"
                          title="Réinitialiser le mot de passe"
                          onClick={() => setResetPasswordModal(user)}
                        >
                          <FaKey />
                        </button>
                        <button
                          className={`btn-icon ${user.status === 'suspended' || user.status === 'inactive' || user.statut_employe === 'Inactif' ? 'btn-success' : 'btn-warning'}`}
                          title={user.status === 'suspended' || user.status === 'inactive' || user.statut_employe === 'Inactif' ? 'Débloquer l\'accès' : 'Bloquer l\'accès'}
                          onClick={() => handleToggleBlock(user)}
                        >
                          {user.status === 'suspended' || user.status === 'inactive' || user.statut_employe === 'Inactif' ? <FaCheckCircle /> : <FaBan />}
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Supprimer"
                          onClick={() => handleDeleteUser(user)}
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
          setConfirmPassword('');
          setPasswordError('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Réinitialiser le mot de passe</h2>
              <button className="modal-close" onClick={() => {
                setResetPasswordModal(null);
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Utilisateur:</label>
                <input
                  type="text"
                  value={resetPasswordModal.name || resetPasswordModal.nom_prenom || resetPasswordModal.email || resetPasswordModal.matricule}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    title={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe:</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Confirmer le mot de passe"
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => {
                  setResetPasswordModal(null);
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
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

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{filteredUsers.filter(u => u.user_type === 'rh').length}</div>
          <div className="stat-label">Utilisateurs RH</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredUsers.filter(u => u.user_type === 'employee').length}</div>
          <div className="stat-label">Employés</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{filteredUsers.filter(u => u.status === 'active' || u.statut_employe === 'Actif').length}</div>
          <div className="stat-label">Actifs</div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersManagement;
