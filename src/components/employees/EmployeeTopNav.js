import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/EmployeePortal.css';

const EmployeeTopNav = ({ toggleSidebar, employee }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('employeeUser');
    // Redirect to login page
    navigate('/employee-login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="top-nav">
      <button className="toggle-sidebar" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      
      <div className="top-nav-search">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fas fa-search search-icon"></i>
        </form>
      </div>
      
      <div className="top-nav-actions">
        <div className="dropdown">
          <div 
            className="user-profile" 
            id="userProfile" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <div className="user-avatar">{getInitials(employee?.nom_prenom)}</div>
            <div className="user-info">
              <div className="user-name">{employee?.nom_prenom || 'Utilisateur'}</div>
              <div className="user-title">{employee?.poste_actuel || 'Employé'}</div>
            </div>
            <i className="fas fa-chevron-down ms-2 small"></i>
          </div>
          
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="userProfile">
            <li>
              <div className="dropdown-item-text py-2">
                <div className="fw-bold">{employee?.nom_prenom || 'Utilisateur'}</div>
                <div className="text-muted small">{employee?.email || ''}</div>
              </div>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item"><i className="fas fa-user-circle me-2"></i>Mon profil</button></li>
            <li><button className="dropdown-item"><i className="fas fa-cog me-2"></i>Paramètres</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default EmployeeTopNav;