import React from 'react';
import './ServerDiagnostic.css';

const ServerDiagnostic = ({ diagnostic, onRetry }) => {
  if (!diagnostic) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'success':
        return '✅';
      case 'unhealthy':
      case 'disconnected':
      case 'failed':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'success':
        return 'success';
      case 'unhealthy':
      case 'disconnected':
      case 'failed':
        return 'danger';
      default:
        return 'warning';
    }
  };

  return (
    <div className="server-diagnostic">
      <h4>🔍 Diagnostic du Serveur</h4>
      
      <div className="diagnostic-grid">
        {/* Statut réseau */}
        <div className={`diagnostic-card ${getStatusColor(diagnostic.network?.status)}`}>
          <div className="diagnostic-header">
            <span className="status-icon">{getStatusIcon(diagnostic.network?.status)}</span>
            <h5>Connexion Réseau</h5>
          </div>
                     <div className="diagnostic-content">
             <p><strong>Statut:</strong> {diagnostic.network?.status || 'Inconnu'}</p>
             {diagnostic.network?.responseTime && (
               <p><strong>Temps de réponse:</strong> {diagnostic.network.responseTime}</p>
             )}
             {diagnostic.network?.note && (
               <p className="info-text"><strong>Note:</strong> {diagnostic.network.note}</p>
             )}
             {diagnostic.network?.error && (
               <p className="error-text"><strong>Erreur:</strong> {diagnostic.network.error}</p>
             )}
           </div>
        </div>

        {/* Statut serveur */}
        <div className={`diagnostic-card ${getStatusColor(diagnostic.server?.status)}`}>
          <div className="diagnostic-header">
            <span className="status-icon">{getStatusIcon(diagnostic.server?.status)}</span>
            <h5>Serveur API</h5>
          </div>
                     <div className="diagnostic-content">
             <p><strong>Statut:</strong> {diagnostic.server?.status || 'Inconnu'}</p>
             {diagnostic.server?.responseTime && (
               <p><strong>Temps de réponse:</strong> {diagnostic.server.responseTime}</p>
             )}
             {diagnostic.server?.note && (
               <p className="info-text"><strong>Note:</strong> {diagnostic.server.note}</p>
             )}
             {diagnostic.server?.error && (
               <p className="error-text"><strong>Erreur:</strong> {diagnostic.server.error}</p>
             )}
           </div>
        </div>

        {/* Performance */}
        <div className={`diagnostic-card ${getStatusColor(diagnostic.performance?.successRate >= 80 ? 'success' : 'warning')}`}>
          <div className="diagnostic-header">
            <span className="status-icon">{getStatusIcon(diagnostic.performance?.successRate >= 80 ? 'success' : 'warning')}</span>
            <h5>Performance</h5>
          </div>
          <div className="diagnostic-content">
            <p><strong>Taux de succès:</strong> {diagnostic.performance?.successRate?.toFixed(1)}%</p>
            <p><strong>Temps moyen:</strong> {diagnostic.performance?.averageResponseTime?.toFixed(0)}ms</p>
            <p><strong>Tests réussis:</strong> {diagnostic.performance?.tests?.filter(t => t.status === 'success').length}/{diagnostic.performance?.tests?.length}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="diagnostic-actions">
        <button 
          onClick={onRetry}
          className="btn btn-primary btn-sm"
        >
          🔄 Relancer le diagnostic
        </button>
        <small className="text-muted">
          Dernière vérification: {new Date(diagnostic.timestamp).toLocaleTimeString()}
        </small>
      </div>

      {/* Recommandations */}
      {diagnostic.network?.status === 'disconnected' && (
        <div className="diagnostic-recommendation warning">
          <h6>⚠️ Recommandation</h6>
          <p>Vérifiez votre connexion internet et réessayez.</p>
        </div>
      )}

      {diagnostic.server?.status === 'unhealthy' && (
        <div className="diagnostic-recommendation danger">
          <h6>🚨 Recommandation</h6>
          <p>Le serveur est temporairement indisponible. Veuillez réessayer dans quelques minutes ou contactez l'administrateur.</p>
        </div>
      )}

      {diagnostic.performance?.successRate < 80 && (
        <div className="diagnostic-recommendation warning">
          <h6>⚠️ Recommandation</h6>
          <p>La performance du serveur est dégradée. L'opération peut prendre plus de temps que d'habitude.</p>
        </div>
      )}
    </div>
  );
};

export default ServerDiagnostic;
