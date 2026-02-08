import React from 'react';
import StatisticsCharts from './StatisticsCharts';
import './ChartsPage.css';

const ChartsPage = () => {
  return (
    <div className="charts-page">
      <div className="charts-page-header">
        <div className="header-content">
          <h1>📊 Tableau de Bord - Graphiques Statistiques</h1>
          <p>Visualisez vos données RH en temps réel avec des graphiques interactifs</p>
        </div>
      </div>

      <div className="charts-content">
        <StatisticsCharts />
      </div>

      <div className="charts-footer">
        <div className="footer-info">
          <div className="info-item">
            <i className="fas fa-clock"></i>
            <span>Dernière mise à jour : {new Date().toLocaleString('fr-FR')}</span>
          </div>
          <div className="info-item">
            <i className="fas fa-sync-alt"></i>
            <span>Rafraîchissement automatique toutes les 5 minutes</span>
          </div>
        </div>
        
        <div className="footer-actions">
          <button 
            className="btn btn-outline-primary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo"></i>
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartsPage;
