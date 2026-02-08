import React from 'react';
import '../../styles/Dashboard.css';

const StatCard = ({ value, label, icon, color, delay = 0.1 }) => {
  return (
    <div className="stat-card fade-in-up" style={{ animationDelay: `${delay}s` }}>
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;