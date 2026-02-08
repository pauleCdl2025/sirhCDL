import React, { useState, useEffect, useRef } from 'react';

const EmployeeStatsCards = ({ employees, previousMonthData = null, onCardClick }) => {
  const [stats, setStats] = useState({
    total: 0,
    cdi: 0,
    cdd: 0,
    prestataires: 0,
    stagiaires: 0,
    hommes: 0,
    femmes: 0,
    bientotRetraite: 0,
    nouveauxCeMois: 0,
    finContratProche: 0,
    departementsData: {}
  });

  const [showExtendedStats, setShowExtendedStats] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    cdi: 0,
    cdd: 0,
    prestataires: 0,
    stagiaires: 0
  });

  const animationTimeoutRef = useRef(null);
  const chartCanvasRef = useRef(null);

  // Calcul des statistiques
  useEffect(() => {
    if (!employees || !employees.length) {
      setStats({
        total: 0,
        cdi: 0,
        cdd: 0,
        prestataires: 0,
        stagiaires: 0,
        hommes: 0,
        femmes: 0,
        bientotRetraite: 0,
        nouveauxCeMois: 0,
        finContratProche: 0,
        departementsData: {}
      });
      return;
    }
    
    // Date actuelle pour les calculs de date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    
    // Date 5 ans avant la retraite (55 ans)
    const retraiteProche = new Date();
    retraiteProche.setFullYear(retraiteProche.getFullYear() - 55);
    
    // Récupérer le premier jour du mois en cours
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Initialiser les départements
    const departements = {};
    
    // Compteurs
    let totalEmployees = employees.length;
    let cdiCount = 0;
    let cddCount = 0;
    let prestatairesCount = 0;
    let stagiairesCount = 0;
    let hommesCount = 0;
    let femmesCount = 0;
    let bientotRetraiteCount = 0;
    let nouveauxCeMoisCount = 0;
    let finContratProcheCount = 0;
    
    // Calcul des statistiques
    employees.forEach(emp => {
      // Compter par type de contrat
      if (emp.type_contrat === 'CDI') {
        cdiCount++;
      } else if (emp.type_contrat === 'CDD') {
        cddCount++;
        
        // Vérifier si le contrat se termine dans les 3 prochains mois
        if (emp.date_fin_contrat) {
          const finContrat = new Date(emp.date_fin_contrat);
          if (finContrat <= threeMonthsLater && finContrat >= currentDate) {
            finContratProcheCount++;
          }
        }
      } else if (emp.type_contrat === 'Prestataire') {
        prestatairesCount++;
      } else if (
        emp.type_contrat === 'stage PNPE' || 
        emp.type_contrat === 'Stage' || 
        emp.type_contrat === 'Alternance'
      ) {
        stagiairesCount++;
      }
      
      // Compter par genre
      if (emp.genre === 'Homme') {
        hommesCount++;
      } else if (emp.genre === 'Femme') {
        femmesCount++;
      }
      
      // Vérifier si proche de la retraite (55 ans et plus)
      if (emp.date_naissance) {
        const dateNaissance = new Date(emp.date_naissance);
        if (dateNaissance <= retraiteProche) {
          bientotRetraiteCount++;
        }
      }
      
      // Vérifier si nouvel employé ce mois-ci
      if (emp.date_entree) {
        const dateEntree = new Date(emp.date_entree);
        if (dateEntree >= firstDayOfMonth) {
          nouveauxCeMoisCount++;
        }
      }
      
      // Compter par département
      const departement = emp.functional_area || 'Non défini';
      if (!departements[departement]) {
        departements[departement] = 0;
      }
      departements[departement]++;
    });
    
    // Mettre à jour les statistiques
    setStats({
      total: totalEmployees,
      cdi: cdiCount,
      cdd: cddCount,
      prestataires: prestatairesCount,
      stagiaires: stagiairesCount,
      hommes: hommesCount,
      femmes: femmesCount,
      bientotRetraite: bientotRetraiteCount,
      nouveauxCeMois: nouveauxCeMoisCount,
      finContratProche: finContratProcheCount,
      departementsData: departements
    });
    
    // Réinitialiser l'animation
    clearTimeout(animationTimeoutRef.current);
    setAnimatedStats({
      total: 0,
      cdi: 0,
      cdd: 0,
      prestataires: 0,
      stagiaires: 0
    });
    
    // Démarrer l'animation
    startCountAnimation({
      total: totalEmployees,
      cdi: cdiCount,
      cdd: cddCount,
      prestataires: prestatairesCount,
      stagiaires: stagiairesCount
    });
    
  }, [employees]);

  // Animation des compteurs
  const startCountAnimation = (targetStats) => {
    // Durée de l'animation en ms
    const animationDuration = 1500;
    const fps = 30;
    const totalFrames = animationDuration / (1000 / fps);
    let currentFrame = 0;
    
    const animate = () => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      
      setAnimatedStats({
        total: Math.round(targetStats.total * progress),
        cdi: Math.round(targetStats.cdi * progress),
        cdd: Math.round(targetStats.cdd * progress),
        prestataires: Math.round(targetStats.prestataires * progress),
        stagiaires: Math.round(targetStats.stagiaires * progress)
      });
      
      if (currentFrame < totalFrames) {
        animationTimeoutRef.current = setTimeout(animate, 1000 / fps);
      } else {
        // S'assurer que les valeurs finales sont exactes
        setAnimatedStats(targetStats);
      }
    };
    
    animate();
  };

  // Calculer les tendances par rapport au mois précédent
  const calculateTrend = (current, field) => {
    if (!previousMonthData) return { value: 0, icon: 'minus', color: 'neutral' };
    
    const previous = previousMonthData[field] || 0;
    if (previous === 0) return { value: current > 0 ? 100 : 0, icon: 'arrow-up', color: 'positive' };
    
    const diff = current - previous;
    const percentage = Math.round((diff / previous) * 100);
    
    if (percentage === 0) return { value: 0, icon: 'minus', color: 'neutral' };
    
    return {
      value: Math.abs(percentage),
      icon: percentage > 0 ? 'arrow-up' : 'arrow-down',
      color: percentage > 0 ? 'positive' : 'negative'
    };
  };

  // Créer un graphique de répartition par département
  useEffect(() => {
    if (!chartCanvasRef.current || !stats.departementsData) return;
    
    const ctx = chartCanvasRef.current.getContext('2d');
    
    // Effacer le canvas
    ctx.clearRect(0, 0, chartCanvasRef.current.width, chartCanvasRef.current.height);
    
    // Données pour le graphique
    const departments = Object.keys(stats.departementsData);
    if (departments.length === 0) return;
    
    // Définir des couleurs pour chaque département
    const colors = [
      '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', 
      '#00bcd4', '#ff5722', '#8bc34a', '#3f51b5', '#607d8b'
    ];
    
    // Calculer l'angle total et l'angle de départ
    const total = departments.reduce((acc, dept) => acc + stats.departementsData[dept], 0);
    let startAngle = -0.5 * Math.PI; // Commencer à midi
    
    // Dessiner le graphique
    departments.forEach((dept, index) => {
      const value = stats.departementsData[dept];
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(100, 100); // Centre du cercle
      ctx.arc(100, 100, 80, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Préparer l'angle pour la prochaine tranche
      startAngle += sliceAngle;
    });
    
    // Ajouter un cercle blanc au centre pour créer un donut
    ctx.beginPath();
    ctx.arc(100, 100, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Ajouter le total au centre
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, 100, 100);
    
  }, [stats.departementsData]);

  // Fonction pour construire la classe CSS de tendance
  const getTrendClass = (trend) => {
    return `trend-${trend.color}`;
  };

  // Fonction pour construire l'icône de tendance
  const getTrendIcon = (trend) => {
    if (trend.icon === 'arrow-up') return 'fa-arrow-up';
    if (trend.icon === 'arrow-down') return 'fa-arrow-down';
    return 'fa-minus';
  };

  // Gérer le clic sur une carte
  const handleCardClick = (type) => {
    if (onCardClick) {
      onCardClick(type);
    }
  };

  return (
    <div className="employee-stats-container mb-4">
      <div className="stats-header">
        <h3 className="stats-title">Statistiques des effectifs</h3>
        <button 
          className="btn-toggle-extended" 
          onClick={() => setShowExtendedStats(!showExtendedStats)}
          aria-label={showExtendedStats ? 'Masquer les statistiques avancées' : 'Afficher plus de statistiques'}
        >
          <i className={`fas fa-${showExtendedStats ? 'minus' : 'plus'}-circle`}></i>
          {showExtendedStats ? 'Masquer' : 'Plus de statistiques'}
        </button>
      </div>
      
      {/* Cartes principales */}
      <div className="row g-3">
        <div className="col-12 col-md-4 col-lg">
          <div className="stat-card total-card" onClick={() => handleCardClick('total')}>
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value animated-value">{animatedStats.total}</div>
                <div className="stat-card-label">Effectif total</div>
              </div>
            </div>
            <div className="stat-card-footer">
              <div className="stat-card-trend">
                <i className="fas fa-chart-line"></i>
                Personnel actif
              </div>
              {previousMonthData && (
                <div className={`trend-indicator ${getTrendClass(calculateTrend(stats.total, 'total'))}`}>
                  <i className={`fas ${getTrendIcon(calculateTrend(stats.total, 'total'))}`}></i>
                  {calculateTrend(stats.total, 'total').value}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg">
          <div className="stat-card cdi-card" onClick={() => handleCardClick('cdi')}>
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <i className="fas fa-file-signature"></i>
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value animated-value">{animatedStats.cdi}</div>
                <div className="stat-card-label">CDI</div>
              </div>
            </div>
            <div className="stat-card-footer">
              <div className="stat-card-trend">
                <i className="fas fa-percentage"></i>
                {stats.total ? Math.round((stats.cdi / stats.total) * 100) : 0}% de l'effectif
              </div>
              {previousMonthData && (
                <div className={`trend-indicator ${getTrendClass(calculateTrend(stats.cdi, 'cdi'))}`}>
                  <i className={`fas ${getTrendIcon(calculateTrend(stats.cdi, 'cdi'))}`}></i>
                  {calculateTrend(stats.cdi, 'cdi').value}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg">
          <div className="stat-card cdd-card" onClick={() => handleCardClick('cdd')}>
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value animated-value">{animatedStats.cdd}</div>
                <div className="stat-card-label">CDD</div>
              </div>
            </div>
            <div className="stat-card-footer">
              <div className="stat-card-trend">
                <i className="fas fa-percentage"></i>
                {stats.total ? Math.round((stats.cdd / stats.total) * 100) : 0}% de l'effectif
              </div>
              {previousMonthData && (
                <div className={`trend-indicator ${getTrendClass(calculateTrend(stats.cdd, 'cdd'))}`}>
                  <i className={`fas ${getTrendIcon(calculateTrend(stats.cdd, 'cdd'))}`}></i>
                  {calculateTrend(stats.cdd, 'cdd').value}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg">
          <div className="stat-card prestataire-card" onClick={() => handleCardClick('prestataires')}>
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <i className="fas fa-briefcase"></i>
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value animated-value">{animatedStats.prestataires}</div>
                <div className="stat-card-label">Prestataires</div>
              </div>
            </div>
            <div className="stat-card-footer">
              <div className="stat-card-trend">
                <i className="fas fa-percentage"></i>
                {stats.total ? Math.round((stats.prestataires / stats.total) * 100) : 0}% de l'effectif
              </div>
              {previousMonthData && (
                <div className={`trend-indicator ${getTrendClass(calculateTrend(stats.prestataires, 'prestataires'))}`}>
                  <i className={`fas ${getTrendIcon(calculateTrend(stats.prestataires, 'prestataires'))}`}></i>
                  {calculateTrend(stats.prestataires, 'prestataires').value}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-4 col-lg">
          <div className="stat-card stagiaire-card" onClick={() => handleCardClick('stagiaires')}>
            <div className="stat-card-content">
              <div className="stat-card-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="stat-card-info">
                <div className="stat-card-value animated-value">{animatedStats.stagiaires}</div>
                <div className="stat-card-label">Stagiaires</div>
              </div>
            </div>
            <div className="stat-card-footer">
              <div className="stat-card-trend">
                <i className="fas fa-percentage"></i>
                {stats.total ? Math.round((stats.stagiaires / stats.total) * 100) : 0}% de l'effectif
              </div>
              {previousMonthData && (
                <div className={`trend-indicator ${getTrendClass(calculateTrend(stats.stagiaires, 'stagiaires'))}`}>
                  <i className={`fas ${getTrendIcon(calculateTrend(stats.stagiaires, 'stagiaires'))}`}></i>
                  {calculateTrend(stats.stagiaires, 'stagiaires').value}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques étendues */}
      {showExtendedStats && (
        <div className="extended-stats animated-fade-in">
          <div className="extended-stats-header">
            <h4>Statistiques supplémentaires</h4>
          </div>

          <div className="row g-3 mt-3">
            {/* Cartes supplémentaires */}
            <div className="col-md-4">
              <div className="stat-card gender-card" onClick={() => handleCardClick('genre')}>
                <div className="stat-card-content">
                  <div className="stat-card-icon">
                    <i className="fas fa-venus-mars"></i>
                  </div>
                  <div className="stat-card-info">
                    <div className="gender-stats">
                      <div className="gender-stats-item">
                        <span className="gender-label">Hommes</span>
                        <span className="gender-value">{stats.hommes}</span>
                        <span className="gender-percent">
                          {stats.total ? Math.round((stats.hommes / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="gender-stats-item">
                        <span className="gender-label">Femmes</span>
                        <span className="gender-value">{stats.femmes}</span>
                        <span className="gender-percent">
                          {stats.total ? Math.round((stats.femmes / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stat-card-footer">
                  <div className="gender-ratio-bar">
                    <div 
                      className="gender-ratio-male" 
                      style={{ 
                        width: `${stats.total ? (stats.hommes / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                    <div 
                      className="gender-ratio-female" 
                      style={{ 
                        width: `${stats.total ? (stats.femmes / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card alert-card" onClick={() => handleCardClick('alertes')}>
                <div className="stat-card-content">
                  <div className="stat-card-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-card-info">
                    <div className="alert-stats">
                      <div className="alert-stats-item">
                        <span className="alert-label">Contrats à renouveler</span>
                        <span className="alert-value">{stats.finContratProche}</span>
                      </div>
                      <div className="alert-stats-item">
                        <span className="alert-label">Départs retraite prévus</span>
                        <span className="alert-value">{stats.bientotRetraite}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stat-card-footer">
                  <div className="stat-card-trend">
                    <i className="fas fa-bell"></i>
                    Alertes de gestion
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="stat-card movement-card" onClick={() => handleCardClick('mouvements')}>
                <div className="stat-card-content">
                  <div className="stat-card-icon">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <div className="stat-card-info">
                    <div className="movement-stats">
                      <div className="movement-stats-item">
                        <span className="movement-label">Nouveaux ce mois</span>
                        <span className="movement-value">{stats.nouveauxCeMois}</span>
                      </div>
                      <div className="movement-stats-item">
                        <span className="movement-label">Taux de rotation</span>
                        <span className="movement-value">
                          {stats.total ? Math.round((stats.nouveauxCeMois / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stat-card-footer">
                  <div className="stat-card-trend">
                    <i className="fas fa-history"></i>
                    Mouvements du personnel
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique de répartition par département */}
          <div className="row mt-4">
            <div className="col-md-6">
              <div className="stat-card department-card">
                <div className="stat-card-header">
                  <h5 className="stat-card-title">Répartition par département</h5>
                </div>
                <div className="stat-card-content chart-content">
                  <div className="department-chart">
                    <canvas ref={chartCanvasRef} width="200" height="200"></canvas>
                  </div>
                  <div className="department-legend">
                    {Object.keys(stats.departementsData).map((dept, index) => (
                      <div className="department-legend-item" key={dept}>
                        <span 
                          className="department-color-dot" 
                          style={{ 
                            backgroundColor: [
                              '#4caf50', '#2196f3', '#ff9800', '#e91e63', '#9c27b0', 
                              '#00bcd4', '#ff5722', '#8bc34a', '#3f51b5', '#607d8b'
                            ][index % 10] 
                          }}
                        ></span>
                        <span className="department-name">{dept}</span>
                        <span className="department-count">{stats.departementsData[dept]}</span>
                        <span className="department-percent">
                          {stats.total ? Math.round((stats.departementsData[dept] / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-6">
              <div className="stat-card summary-card">
                <div className="stat-card-header">
                  <h5 className="stat-card-title">Indicateurs clés</h5>
                </div>
                <div className="stat-card-content">
                  <div className="key-indicators">
                    <div className="key-indicator">
                      <div className="key-indicator-label">Taux de CDI</div>
                      <div className="key-indicator-value">
                        {stats.total ? Math.round((stats.cdi / stats.total) * 100) : 0}%
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${stats.total ? (stats.cdi / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="key-indicator">
                      <div className="key-indicator-label">Taux de CDD</div>
                      <div className="key-indicator-value">
                        {stats.total ? Math.round((stats.cdd / stats.total) * 100) : 0}%
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar bg-warning" 
                          style={{ width: `${stats.total ? (stats.cdd / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="key-indicator">
                      <div className="key-indicator-label">Parité H/F</div>
                      <div className="key-indicator-value">
                        {stats.hommes && stats.femmes ? 
                          Math.round((Math.min(stats.hommes, stats.femmes) / Math.max(stats.hommes, stats.femmes)) * 100) : 0}%
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar bg-info" 
                          style={{ 
                            width: `${stats.hommes && stats.femmes ? 
                              (Math.min(stats.hommes, stats.femmes) / Math.max(stats.hommes, stats.femmes)) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="key-indicator">
                      <div className="key-indicator-label">Stabilité des effectifs</div>
                      <div className="key-indicator-value">
                        {stats.total && stats.cdi ? 
                          Math.round(((stats.total - stats.nouveauxCeMois) / stats.total) * 100) : 0}%
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ 
                            width: `${stats.total ? 
                              ((stats.total - stats.nouveauxCeMois) / stats.total) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .employee-stats-container {
          margin-top: 20px;
        }
        
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .stats-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }
        
        .btn-toggle-extended {
          background: none;
          border: none;
          color: #3f51b5;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }
        
        .btn-toggle-extended:hover {
          color: #303f9f;
        }
        
        .stat-card {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
        
        .total-card {
          border-top: 4px solid #3f51b5;
        }
        
        .cdi-card {
          border-top: 4px solid #4caf50;
        }
        
        .cdd-card {
          border-top: 4px solid #ff9800;
        }
        
        .prestataire-card {
          border-top: 4px solid #9c27b0;
        }
        
        .stagiaire-card {
          border-top: 4px solid #2196f3;
        }
        
        .gender-card {
          border-top: 4px solid #e91e63;
        }
        
        .alert-card {
          border-top: 4px solid #f44336;
        }
        
        .movement-card {
          border-top: 4px solid #009688;
        }
        
        .department-card, .summary-card {
          border-top: 4px solid #607d8b;
        }
        
        .stat-card-content {
          padding: 20px;
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .chart-content {
          display: block;
          padding: 0;
        }
        
        .stat-card-header {
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
        }
        
        .stat-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .stat-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          margin-right: 15px;
          font-size: 20px;
          flex-shrink: 0;
        }
        
        .total-card .stat-card-icon {
          background-color: rgba(63, 81, 181, 0.1);
          color: #3f51b5;
        }
        
        .cdi-card .stat-card-icon {
          background-color: rgba(76, 175, 80, 0.1);
          color: #4caf50;
        }
        
        .cdd-card .stat-card-icon {
          background-color: rgba(255, 152, 0, 0.1);
          color: #ff9800;
        }
        
        .prestataire-card .stat-card-icon {
          background-color: rgba(156, 39, 176, 0.1);
          color: #9c27b0;
        }
        
        .stagiaire-card .stat-card-icon {
          background-color: rgba(33, 150, 243, 0.1);
          color: #2196f3;
        }
        
        .gender-card .stat-card-icon {
          background-color: rgba(233, 30, 99, 0.1);
          color: #e91e63;
        }
        
        .alert-card .stat-card-icon {
          background-color: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }
        
        .movement-card .stat-card-icon {
          background-color: rgba(0, 150, 136, 0.1);
          color: #009688;
        }
        
        .stat-card-info {
          flex-grow: 1;
          min-width: 0;
        }
        
        .stat-card-value {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          line-height: 1.2;
        }
        
        .animated-value {
          transition: all 0.2s ease;
        }
        
        .stat-card-label {
          font-size: 14px;
          color: #666;
          margin-top: 2px;
        }
        
        .stat-card-footer {
          background-color: #f8f9fa;
          padding: 10px 20px;
          border-top: 1px solid #eee;
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .stat-card-trend {
          font-size: 13px;
          color: #666;
          display: flex;
          align-items: center;
        }
        
        .stat-card-trend i {
          margin-right: 5px;
          font-size: 12px;
        }
        
        .trend-indicator {
          font-size: 12px;
          font-weight: 600;
          padding: 3px 6px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .trend-positive {
          color: #4caf50;
          background-color: rgba(76, 175, 80, 0.1);
        }
        
        .trend-negative {
          color: #f44336;
          background-color: rgba(244, 67, 54, 0.1);
        }
        
        .trend-neutral {
          color: #607d8b;
          background-color: rgba(96, 125, 139, 0.1);
        }
        
        .extended-stats {
          margin-top: 20px;
          transition: all 0.3s ease;
        }
        
        .animated-fade-in {
          animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .extended-stats-header {
          margin-bottom: 10px;
        }
        
        .extended-stats-header h4 {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
          margin: 0;
        }
        
        .gender-stats {
          width: 100%;
        }
        
        .gender-stats-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .gender-label {
          font-weight: 500;
        }
        
        .gender-value {
          font-weight: 600;
          margin: 0 10px;
        }
        
        .gender-percent {
          font-size: 12px;
          color: #666;
        }
        
        .gender-ratio-bar {
          display: flex;
          height: 4px;
          width: 100%;
          overflow: hidden;
          border-radius: 2px;
        }
        
        .gender-ratio-male {
          background-color: #2196f3;
          height: 100%;
        }
        
        .gender-ratio-female {
          background-color: #e91e63;
          height: 100%;
        }
        
        .alert-stats, .movement-stats {
          width: 100%;
        }
        
        .alert-stats-item, .movement-stats-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .alert-label, .movement-label {
          font-weight: 500;
        }
        
        .alert-value, .movement-value {
          font-weight: 600;
        }
        
        .department-chart {
          display: flex;
          justify-content: center;
          padding: 20px;
        }
        
        .department-legend {
          padding: 0 20px 20px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .department-legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 13px;
        }
        
        .department-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .department-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .department-count {
          font-weight: 600;
          margin: 0 10px;
        }
        
        .department-percent {
          font-size: 12px;
          color: #666;
          width: 40px;
          text-align: right;
        }
        
        .key-indicators {
          width: 100%;
        }
        
        .key-indicator {
          margin-bottom: 15px;
        }
        
        .key-indicator-label {
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .key-indicator-value {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .progress {
          height: 6px;
          border-radius: 3px;
          background-color: #f5f5f5;
        }
        
        .progress-bar {
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        @media (max-width: 992px) {
          .stat-card-value {
            font-size: 24px;
          }
          
          .stat-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .trend-indicator {
            margin-top: 5px;
          }
        }
        
        @media (max-width: 768px) {
          .department-chart {
            padding: 10px;
          }
          
          .stats-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .btn-toggle-extended {
            align-self: flex-start;
          }
        }
        
        @media print {
          .btn-toggle-extended {
            display: none;
          }
          
          .stat-card {
            box-shadow: none;
            border: 1px solid #ddd;
          }
          
          .extended-stats {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeStatsCards;