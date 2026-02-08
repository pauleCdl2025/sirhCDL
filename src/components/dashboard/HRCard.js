import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

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

export default HRCard;