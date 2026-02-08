import React from 'react';
import '../../../styles/EmployeePortal.css';

const RequestCard = ({ title, description, icon, type, onClick, delay = 0.1 }) => {
  const getIconClass = (type) => {
    switch (type) {
      case 'leave':
        return 'request-icon-leave';
      case 'absence':
        return 'request-icon-absence';
      case 'document':
        return 'request-icon-document';
      default:
        return 'request-icon-leave';
    }
  };

  return (
    <div className="request-card fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className="request-card-header">
        <div className={`request-icon ${getIconClass(type)}`}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        <h3 className="request-title">{title}</h3>
      </div>
      <div className="request-card-body">
        <p className="request-description">{description}</p>
        <div className="request-action">
          <button 
            className="btn btn-primary"
            onClick={onClick}
          >
            <i className="fas fa-plus-circle me-2"></i>Nouvelle demande
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;