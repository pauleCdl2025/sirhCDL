import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

const ToolCard = ({ title, icon, path }) => {
  return (
    <Link to={path} className="tool-card">
      <div className="tool-icon">
        <i className={icon}></i>
      </div>
      <h3 className="tool-title">{title}</h3>
    </Link>
  );
};

export default ToolCard;