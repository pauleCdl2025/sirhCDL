import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDropdown = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'RH';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userName = user?.name || user?.nom || user?.prenom || 'Admin RH';
  const userRole = user?.role || user?.poste || user?.fonction || 'Administration';
  const userEmail = user?.email || 'admin@centre-diagnostic.com';

  const handleProfileClick = (e) => {
    e.preventDefault();
    navigate('/profile');
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    navigate('/settings');
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="dropdown-menu user-dropdown">
      <div className="user-dropdown-header">
        <div className="user-dropdown-user-info">
          <div className="user-avatar">
            {getInitials(userName)}
          </div>
          <div className="user-details">
            <div className="user-name">{userName}</div>
            <div className="user-role">{userRole}</div>
            <div className="user-email">{userEmail}</div>
          </div>
        </div>
      </div>
      
      <div className="dropdown-menu-items">
        <a href="/profile" className="dropdown-item" onClick={handleProfileClick}>
          <i className="fas fa-user-circle"></i>
          <span>Mon profil</span>
        </a>
        <a href="/settings" className="dropdown-item" onClick={handleSettingsClick}>
          <i className="fas fa-cog"></i>
          <span>Paramètres</span>
        </a>
        <a href="/help" className="dropdown-item">
          <i className="fas fa-question-circle"></i>
          <span>Aide</span>
        </a>
        <div className="dropdown-divider"></div>
        <button onClick={handleLogoutClick} className="dropdown-item text-danger">
          <i className="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
