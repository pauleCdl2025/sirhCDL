import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { decodeHtmlEntities } from '../../utils/textUtils';
import './ContractAlerts.css';

const ContractAlerts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // Calculate days remaining and get status class
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getStatusClass = (daysRemaining) => {
    if (daysRemaining < 0) return 'status-expired';
    if (daysRemaining < 15) return 'status-critical';
    if (daysRemaining < 30) return 'status-warning';
    return 'status-ok';
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Créer un son d'alerte simple avec Web Audio API
  const createAlertSound = () => {
    try {
      // Gestion des préfixes navigateur pour AudioContext
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      if (typeof AudioContextClass === 'undefined') {
        throw new Error('Web Audio API non supportée');
      }

      const audioContext = new AudioContextClass();
      
      // Créer un oscillateur pour générer un son
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configuration du son
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // 600 Hz après 0.1s
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2); // Retour à 800 Hz
      
      // Configuration du volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Connexions
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Démarrer et arrêter le son
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      return true;
    } catch (error) {
      console.warn('Erreur lors de la création du son:', error.message);
      return false;
    }
  };


  // Initialiser l'audio au montage
  useEffect(() => {
    const initializeAudio = () => {
      try {
        if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
          setSoundLoaded(true);
          setAudioError(false);
          console.log("Web Audio API supportée - Son prêt");
        } else {
          throw new Error('Web Audio API non supportée');
        }
      } catch (error) {
        console.warn("Audio non supporté:", error.message);
        setAudioError(true);
        setSoundLoaded(false);
      }
    };

    const timeoutId = setTimeout(initializeAudio, 100);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Récupérer les contrats
  useEffect(() => {
    const fetchExpiringContracts = async () => {
      try {
        setLoading(true);
        
        const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = sessionStorage.getItem('token');
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await axios.get(`${baseURL}/employees/alerts/expiring-contracts`, {
          params: { daysThreshold: 60 },
          headers,
          timeout: 15000
        });
        
        const transformedContracts = response.data.map(employee => ({
          id: employee.id,
          employeeId: employee.id,
          endDate: employee.date_fin_contrat,
          startDate: employee.date_entree,
          daysUntilExpiry: getDaysRemaining(employee.date_fin_contrat),
          type: decodeHtmlEntities(employee.type_contrat),
          employee: {
            firstName: decodeHtmlEntities(employee.nom_prenom || '').split(' ')[0] || '',
            lastName: decodeHtmlEntities(employee.nom_prenom || '').split(' ').slice(1).join(' ') || ''
          }
        }));
        
        setContracts(transformedContracts);
        setSoundPlayed(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching expiring contracts:', err);
        setError('Impossible de charger les contrats expirants. Veuillez réessayer plus tard.');
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringContracts();
    const intervalId = setInterval(fetchExpiringContracts, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Jouer le son si nécessaire
  useEffect(() => {
    if (!loading && contracts.length > 0 && soundLoaded && !audioError) {
      const expiredCount = contracts.filter(contract => getDaysRemaining(contract.endDate) < 0).length;
      const criticalCount = contracts.filter(contract => {
        const days = getDaysRemaining(contract.endDate);
        return days >= 0 && days < 15;
      }).length;

      if ((expiredCount > 0 || criticalCount > 0) && !soundPlayed) {
        const timeoutId = setTimeout(() => {
          // Jouer le son d'alerte directement
          const success = createAlertSound();
          if (success) {
            console.log("Son d'alerte joué avec succès");
            setSoundPlayed(true);
          } else {
            console.warn("Impossible de jouer le son");
          }
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [contracts, loading, soundLoaded, soundPlayed, audioError]);



  // Regrouper les contrats par statut
  const groupedContracts = {
    expired: contracts.filter(c => getDaysRemaining(c.endDate) < 0),
    critical: contracts.filter(c => {
      const days = getDaysRemaining(c.endDate);
      return days >= 0 && days < 15;
    }),
    warning: contracts.filter(c => {
      const days = getDaysRemaining(c.endDate);
      return days >= 15 && days < 30;
    }),
    ok: contracts.filter(c => getDaysRemaining(c.endDate) >= 30)
  };

  // Afficher une section de contrats
  const renderContractSection = (title, contracts, iconClass) => {
    if (contracts.length === 0) return null;

    return (
      <div className={`contract-section ${iconClass}`} key={iconClass}>
        <h3 className="section-title">
          <span className="section-icon" role="img" aria-label={`${title}`}>
            {iconClass === 'expired' ? '⛔' : iconClass === 'critical' ? '🔴' : iconClass === 'warning' ? '⚠️' : '✅'}
          </span>
          {title} ({contracts.length})
        </h3>
        <div className="table-container">
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Type de contrat</th>
                <th>Date de début</th>
                <th>Date de fin</th>
                <th>Jours restants</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => {
                const daysRemaining = getDaysRemaining(contract.endDate);
                
                return (
                  <tr key={`${contract.id}-${contract.endDate}`}>
                    <td>
                      {contract.employee ? 
                        `${decodeHtmlEntities(contract.employee.firstName)} ${decodeHtmlEntities(contract.employee.lastName)}` : 
                        'Employé inconnu'}
                    </td>
                    <td>{decodeHtmlEntities(contract.type)}</td>
                    <td>{formatDate(contract.startDate)}</td>
                    <td>{formatDate(contract.endDate)}</td>
                    <td className="days-remaining">
                      <span className={`status-chip ${getStatusClass(daysRemaining)}`}>
                        {daysRemaining < 0 ? 
                          `Expiré il y a ${Math.abs(daysRemaining)} jours` : 
                          `${daysRemaining} jours`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="contract-alerts-card">
      <div className="card-header">
        <div className="card-title">
          <span className="warning-icon" role="img" aria-label="Alerte">⚠️</span>
          <h2>Alertes d'expiration de contrats</h2>
          {soundLoaded && !audioError && (
            <span className="sound-indicator" title="Alertes sonores activées">
              🔊
            </span>
          )}
        </div>
      </div>
      
      <div className="card-content">
        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Chargement des contrats...</p>
          </div>
        )}
        
        {error && (
          <div className="error-alert">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        )}
        
        {!loading && !error && contracts.length === 0 && (
          <div className="info-alert">
            <i className="fas fa-check-circle"></i>
            <p>Aucun contrat n'expire prochainement. Tous les contrats sont en règle.</p>
          </div>
        )}


        
        {!loading && !error && contracts.length > 0 && (
          <div className="contracts-summary">
            <div className="summary-header">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-value">{contracts.length}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-item critical">
                  <span className="stat-value">{groupedContracts.expired.length}</span>
                  <span className="stat-label">Expirés</span>
                </div>
                <div className="stat-item warning">
                  <span className="stat-value">{groupedContracts.critical.length}</span>
                  <span className="stat-label">Critiques</span>
                </div>
                <div className="stat-item info">
                  <span className="stat-value">{groupedContracts.warning.length}</span>
                  <span className="stat-label">En alerte</span>
                </div>
              </div>
            </div>

            {renderContractSection("Contrats expirés", groupedContracts.expired, "expired")}
            {renderContractSection("Contrats critiques (moins de 15 jours)", groupedContracts.critical, "critical")}
            {renderContractSection("Contrats en alerte (moins de 30 jours)", groupedContracts.warning, "warning")}
            {renderContractSection("Contrats à venir", groupedContracts.ok, "ok")}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAlerts;