import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/EmployeePortal.css';

const EmployeeSidebar = ({ collapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <img 
          src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1723636014/Centre_Diagnostic_logo_coucleur_ie6ywu.png" 
          alt="Centre Diagnostic Logo" 
        />
      </div>
      
      <ul className="nav-menu">
        <li className="nav-item">
          <Link to="/employee-portal" className="nav-link active">
            <div className="nav-icon"><i className="fas fa-tachometer-alt"></i></div>
            <span className="nav-text">Tableau de bord</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <a href="#" className="nav-link" data-bs-toggle="modal" data-bs-target="#codeModal">
            <div className="nav-icon"><i className="fas fa-balance-scale"></i></div>
            <span className="nav-text">Code du travail</span>
          </a>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/profile" className="nav-link">
            <div className="nav-icon"><i className="fas fa-user"></i></div>
            <span className="nav-text">Mon profil</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/leave" className="nav-link">
            <div className="nav-icon"><i className="fas fa-calendar-alt"></i></div>
            <span className="nav-text">Mes congés</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/payslips" className="nav-link">
            <div className="nav-icon"><i className="fas fa-file-invoice-dollar"></i></div>
            <span className="nav-text">Mes bulletins</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/documents" className="nav-link">
            <div className="nav-icon"><i className="fas fa-folder"></i></div>
            <span className="nav-text">Mes documents</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/team" className="nav-link">
            <div className="nav-icon"><i className="fas fa-users"></i></div>
            <span className="nav-text">Mon équipe</span>
          </Link>
        </li>
        
        <li className="nav-item">
          <Link to="/employee-portal/help" className="nav-link">
            <div className="nav-icon"><i className="fas fa-question-circle"></i></div>
            <span className="nav-text">Aide</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default EmployeeSidebar;