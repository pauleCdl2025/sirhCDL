import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  // Critères de sécurité
  const criteria = [
    {
      label: 'Au moins 8 caractères',
      test: () => password.length >= 8,
      color: '#e74c3c'
    },
    {
      label: 'Au moins une minuscule',
      test: () => /[a-z]/.test(password),
      color: '#f39c12'
    },
    {
      label: 'Au moins une majuscule',
      test: () => /[A-Z]/.test(password),
      color: '#f39c12'
    },
    {
      label: 'Au moins un chiffre',
      test: () => /\d/.test(password),
      color: '#3498db'
    },
    {
      label: 'Au moins un caractère spécial',
      test: () => /[@$!%*?&]/.test(password),
      color: '#9b59b6'
    }
  ];

  // Calculer le score de force
  const calculateStrength = () => {
    const validCriteria = criteria.filter(criterion => criterion.test());
    const score = (validCriteria.length / criteria.length) * 100;
    
    if (score < 40) return { level: 'faible', color: '#e74c3c', class: 'strength-weak' };
    if (score < 80) return { level: 'moyen', color: '#f39c12', class: 'strength-medium' };
    return { level: 'fort', color: '#27ae60', class: 'strength-strong' };
  };

  const strength = calculateStrength();
  const validCriteria = criteria.filter(criterion => criterion.test());

  if (!password) return null;

  return (
    <div className="password-strength-indicator">
      {/* Barre de force */}
      <div className="strength-header">
        <span className="strength-label">Force du mot de passe :</span>
        <span className={`strength-level ${strength.class}`}>
          {strength.level.toUpperCase()}
        </span>
      </div>
      
      {/* Barres de progression */}
      <div className="strength-bars">
        {criteria.map((criterion, index) => (
          <div
            key={index}
            className={`strength-bar ${criterion.test() ? 'active' : ''}`}
            style={{
              backgroundColor: criterion.test() ? criterion.color : 'var(--medium-gray)'
            }}
            title={criterion.label}
          />
        ))}
      </div>

      {/* Critères détaillés */}
      <div className="strength-criteria">
        <div className="criteria-title">Critères de sécurité :</div>
        <ul className="criteria-list">
          {criteria.map((criterion, index) => (
            <li
              key={index}
              className={`criteria-item ${criterion.test() ? 'valid' : ''}`}
            >
              <i className={`fas ${criterion.test() ? 'fa-check-circle' : 'fa-circle'}`}></i>
              <span className="criteria-text">{criterion.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Score numérique */}
      <div className="strength-score">
        <div className="score-bar">
          <div 
            className="score-fill"
            style={{ 
              width: `${(validCriteria.length / criteria.length) * 100}%`,
              backgroundColor: strength.color
            }}
          ></div>
        </div>
        <span className="score-text">
          {validCriteria.length} / {criteria.length} critères respectés
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;












