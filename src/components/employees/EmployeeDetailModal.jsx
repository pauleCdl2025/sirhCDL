import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/dateUtils';
import { decodeHtmlEntities } from '../../utils/textUtils';
import '../../styles/EmployeeDetailModal.css';

const EmployeeDetailModal = ({ employee, onClose, onEdit, onPrint }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format montant avec séparateur de milliers
  const formatMontant = (montant) => {
    if (!montant) return '0 FCFA';
    return parseFloat(montant).toLocaleString('fr-FR') + ' FCFA';
  };

  // Calculer la date de départ en retraite (60 ans après la naissance)
  const calculateRetirementDate = (birthDate) => {
    if (!birthDate || birthDate === '0000-00-00') return null;
    
    try {
      const birth = new Date(birthDate);
      const retirement = new Date(birth);
      retirement.setFullYear(birth.getFullYear() + 60);
      return retirement;
    } catch (e) {
      console.error('Erreur lors du calcul de la date de retraite:', e);
      return null;
    }
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (birthDate) => {
    if (!birthDate || birthDate === '0000-00-00') return null;
    
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (e) {
      console.error('Erreur lors du calcul de l\'âge:', e);
      return null;
    }
  };

  // Calculer l'ancienneté à partir de la date d'embauche
  const calculateSeniority = (hireDate) => {
    if (!hireDate || hireDate === '0000-00-00') return null;
    
    try {
      const hire = new Date(hireDate);
      const today = new Date();
      const years = today.getFullYear() - hire.getFullYear();
      let months = today.getMonth() - hire.getMonth();
      
      if (months < 0) {
        months += 12;
      }
      
      return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    } catch (e) {
      console.error('Erreur lors du calcul de l\'ancienneté:', e);
      return null;
    }
  };

  // Calculer les jours restants avant la fin du contrat
  const calculateRemainingDays = (endDate) => {
    if (!endDate || endDate === '0000-00-00') return null;
    
    try {
      const end = new Date(endDate);
      const today = new Date();
      
      // Si la date est déjà passée
      if (end < today) return -1;
      
      const diffTime = Math.abs(end - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      console.error('Erreur lors du calcul des jours restants:', e);
      return null;
    }
  };

  // Simuler la récupération des documents de l'employé
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoadingDocuments(true);
      setDocumentError(null);
      
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Documents fictifs basés sur le type de contrat et la présence de numéros CNSS/CNAMGS
        const mockDocuments = [];
        
        mockDocuments.push({
          id: 1,
          name: 'Contrat de travail',
          type: 'contrat',
          date: employee.date_entree,
          status: 'Signé'
        });
        
        if (employee.cnss_number) {
          mockDocuments.push({
            id: 2,
            name: 'Attestation CNSS',
            type: 'administratif',
            date: employee.date_entree,
            status: 'Validé'
          });
        }
        
        if (employee.cnamgs_number) {
          mockDocuments.push({
            id: 3,
            name: 'Attestation CNAMGS',
            type: 'administratif',
            date: employee.date_entree,
            status: 'Validé'
          });
        }
        
        mockDocuments.push({
          id: 4,
          name: 'Pièce d\'identité',
          type: 'identité',
          date: null,
          status: 'Archivé'
        });
        
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error);
        setDocumentError('Impossible de charger les documents. Veuillez réessayer.');
      } finally {
        setLoadingDocuments(false);
      }
    };
    
    if (activeTab === 'contact') {
      fetchDocuments();
    }
  }, [activeTab, employee.cnss_number, employee.cnamgs_number, employee.date_entree]);

  // Filtre les documents selon la recherche
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer les données supplémentaires
  const retirementDate = calculateRetirementDate(employee.date_naissance);
  const calculatedAge = calculateAge(employee.date_naissance) || employee.age || 'Non spécifié';
  const seniority = calculateSeniority(employee.date_entree) || employee.anciennete || 'Non spécifié';
  const remainingDays = calculateRemainingDays(employee.date_fin_contrat);
  
  // Calculer le montant total de la rémunération
  const totalRemuneration = () => {
    const salaire = parseFloat(employee.salaire_base) || 0;
    const primes = [
      parseFloat(employee.prime_responsabilite) || 0,
      parseFloat(employee.prime_penibilite) || 0,
      parseFloat(employee.prime_logement) || 0,
      parseFloat(employee.prime_transport) || 0,
      parseFloat(employee.prime_anciennete) || 0,
      parseFloat(employee.prime_enfant) || 0,
      parseFloat(employee.prime_representation) || 0,
      parseFloat(employee.prime_performance) || 0,
      parseFloat(employee.prime_astreinte) || 0,
      parseFloat(employee.honoraires) || 0,
      parseFloat(employee.indemnite_stage) || 0
    ];
    
    return salaire + primes.reduce((a, b) => a + b, 0);
  };

  // Gérer l'impression des détails de l'employé
  const handlePrint = () => {
    if (onPrint) {
      onPrint(employee);
    } else {
      // Version par défaut utilisant l'API du navigateur
      window.print();
    }
  };

  // Gérer le partage des infos de l'employé
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${decodeHtmlEntities(employee.nom_prenom)}`,
        text: `Profil employé de ${decodeHtmlEntities(employee.nom_prenom)}, ${decodeHtmlEntities(employee.poste_actuel)} à ${decodeHtmlEntities(employee.entity)}`,
        url: window.location.href
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      const shareText = `
Profil employé de ${decodeHtmlEntities(employee.nom_prenom)}
Poste: ${decodeHtmlEntities(employee.poste_actuel)}
Entité: ${decodeHtmlEntities(employee.entity)}
Email: ${employee.email}
      `.trim();
      
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Informations copiées dans le presse-papiers');
      });
    }
  };

  // Gérer la mise en plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`modal-backdrop ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className={`employee-detail-modal ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">
            <i className="fas fa-id-card me-2"></i>
            Détails de l'employé
          </h3>
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-icon" 
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              <i className={`fas fa-${isFullscreen ? 'compress-alt' : 'expand-alt'}`}></i>
            </button>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
        </div>
        
        <div className="modal-body">
          {/* En-tête du profil employé */}
          <div className="employee-header">
            <div className="employee-avatar">
              {employee.photo ? (
                <img src={employee.photo} alt={decodeHtmlEntities(employee.nom_prenom)} />
              ) : (
                <div className="avatar-placeholder">
                  {decodeHtmlEntities(employee.nom_prenom).split(' ').slice(0, 2).map(name => name.charAt(0)).join('').toUpperCase()}
                </div>
              )}
            </div>
            <div className="employee-main-info">
              <h4 className="employee-name">{decodeHtmlEntities(employee.nom_prenom)}</h4>
              <p className="employee-position">{decodeHtmlEntities(employee.poste_actuel) || 'Non spécifié'}</p>
              <div className="employee-meta">
                <span className={`badge contract-badge ${employee.type_contrat === 'CDI' ? 'bg-success' : employee.type_contrat === 'CDD' ? 'bg-warning text-dark' : 'bg-info'}`}>
                  {decodeHtmlEntities(employee.type_contrat) || 'Non spécifié'}
                </span>
                {employee.statut_employe && (
                  <span className="badge bg-secondary ms-2">
                    {employee.statut_employe}
                  </span>
                )}
                {employee.nationalite && (
                  <span className="badge bg-primary ms-2">
                    {employee.nationalite}
                  </span>
                )}
              </div>
            </div>
            
            <div className="employee-quick-actions">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowContactInfo(!showContactInfo)}
              >
                <i className={`fas fa-${showContactInfo ? 'eye-slash' : 'phone'} me-1`}></i>
                {showContactInfo ? 'Masquer contact' : 'Voir contact'}
              </button>
              {onEdit && (
                <button 
                  className="btn btn-sm btn-primary ms-2"
                  onClick={() => onEdit(employee)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Modifier
                </button>
              )}
            </div>
          </div>
          
          {/* Affichage conditionnel des informations de contact */}
          {showContactInfo && (
            <div className="contact-info-card animated fadeIn">
              <div className="contact-grid">
                {employee.email && (
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <a href={`mailto:${employee.email}`}>{employee.email}</a>
                  </div>
                )}
                {employee.telephone && (
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <a href={`tel:${employee.telephone}`}>{employee.telephone}</a>
                  </div>
                )}
                {employee.adresse && (
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{employee.adresse}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Indicateurs clés */}
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-birthday-cake"></i>
              </div>
              <div className="metric-content">
                <div className="metric-label">Âge</div>
                <div className="metric-value">{calculatedAge}</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-business-time"></i>
              </div>
              <div className="metric-content">
                <div className="metric-label">Ancienneté</div>
                <div className="metric-value">{seniority}</div>
              </div>
            </div>
            
            {employee.type_contrat === 'CDD' && remainingDays !== null && (
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="fas fa-hourglass-half"></i>
                </div>
                <div className="metric-content">
                  <div className="metric-label">Fin de contrat</div>
                  <div className={`metric-value ${remainingDays < 30 ? 'text-danger' : remainingDays < 90 ? 'text-warning' : ''}`}>
                    {remainingDays === -1 ? 
                      'Expiré' : 
                      `${remainingDays} jour${remainingDays > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>
            )}
            
            <div className="metric-card">
              <div className="metric-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="metric-content">
                <div className="metric-label">Rémunération</div>
                <div className="metric-value">{formatMontant(totalRemuneration())}</div>
              </div>
            </div>
          </div>

          {/* Onglets d'information */}
          <div className="detail-tabs">
            <ul className="nav nav-tabs custom-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="fas fa-user-circle me-2"></i>
                  Informations générales
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'contrat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contrat')}
                >
                  <i className="fas fa-file-contract me-2"></i>
                  Contrat & Rémunération
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  <i className="fas fa-folder-open me-2"></i>
                  Contact & Documents
                </button>
              </li>
            </ul>

            <div className="tab-content">
              {/* Informations générales */}
              {activeTab === 'info' && (
                <div className="tab-pane active animated fadeIn">
                  <div className="info-section">
                    <div className="section-header">
                      <h5 className="section-title">
                        <i className="fas fa-user me-2"></i>
                        Informations personnelles
                      </h5>
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Matricule</span>
                        <span className="info-value">{employee.matricule || 'Non assigné'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Genre</span>
                        <span className="info-value">{employee.genre || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date de naissance</span>
                        <span className="info-value">
                          {employee.date_naissance && employee.date_naissance !== '0000-00-00' 
                            ? formatDate(employee.date_naissance) 
                            : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Âge</span>
                        <span className="info-value">{calculatedAge}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Statut marital</span>
                        <span className="info-value">{employee.statut_marital || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Nombre d'enfants</span>
                        <span className="info-value">{employee.enfants || '0'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Nationalité</span>
                        <span className="info-value">{employee.nationalite || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Départ retraite</span>
                        <span className="info-value">
                          {retirementDate ? formatDate(retirementDate) : 'Non calculable'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-section mt-4">
                    <div className="section-header">
                      <h5 className="section-title">
                        <i className="fas fa-briefcase me-2"></i>
                        Informations professionnelles
                      </h5>
                    </div>
                    <div className="info-grid">
                      <div className="profile-info-item">
                        <span className="info-label">Département</span>
                        <span className="info-value">{decodeHtmlEntities(employee.functional_area) || 'Non spécifié'}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="info-label">Entité</span>
                        <span className="info-value">{decodeHtmlEntities(employee.entity) || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Responsable</span>
                        <span className="info-value">{employee.responsable || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Niveau d'étude</span>
                        <span className="info-value">{employee.niveau_etude || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Spécialisation</span>
                        <span className="info-value">{employee.specialisation || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Statut du dossier</span>
                        <span className="info-value">
                          <span className={`status-badge ${employee.statut_dossier === 'Actif' ? 'active' : employee.statut_dossier === 'Inactif' ? 'inactive' : 'pending'}`}>
                            {employee.statut_dossier || 'Non spécifié'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contrat & Rémunération */}
              {activeTab === 'contrat' && (
                <div className="tab-pane active animated fadeIn">
                  <div className="info-section">
                    <div className="section-header">
                      <h5 className="section-title">
                        <i className="fas fa-file-signature me-2"></i>
                        Informations de contrat
                      </h5>
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Type de contrat</span>
                        <span className="info-value">
                          <span className={`contract-type-badge ${employee.type_contrat === 'CDI' ? 'cdi' : employee.type_contrat === 'CDD' ? 'cdd' : 'autre'}`}>
                            {decodeHtmlEntities(employee.type_contrat) || 'Non spécifié'}
                          </span>
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Type d'employé</span>
                        <span className="info-value">{employee.employee_type || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date d'embauche</span>
                        <span className="info-value">
                          {employee.date_entree && employee.date_entree !== '0000-00-00' 
                            ? formatDate(employee.date_entree) 
                            : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Date de fin</span>
                        <span className="info-value">
                          {employee.date_fin_contrat && employee.date_fin_contrat !== '0000-00-00' 
                            ? (
                              <>
                                {formatDate(employee.date_fin_contrat)}
                                {remainingDays !== null && remainingDays >= 0 && (
                                  <span className={`days-remaining ${remainingDays < 30 ? 'danger' : remainingDays < 90 ? 'warning' : 'success'}`}>
                                    ({remainingDays} jour{remainingDays > 1 ? 's' : ''})
                                  </span>
                                )}
                              </>
                            )
                            : 'Indéterminée'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Ancienneté</span>
                        <span className="info-value">{seniority}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Catégorie</span>
                        <span className="info-value">{employee.categorie || 'Non spécifié'}</span>
                      </div>
                    </div>

                    <div className="remuneration-section mt-4">
                      <div className="section-header">
                        <h5 className="section-title">
                          <i className="fas fa-money-check-alt me-2"></i>
                          Rémunération
                        </h5>
                      </div>
                      
                      <div className="remuneration-overview">
                        <div className="remuneration-total">
                          <div className="total-label">Rémunération totale</div>
                          <div className="total-value">{formatMontant(totalRemuneration())}</div>
                        </div>
                        
                        <div className="remuneration-breakdown">
                          <div className="breakdown-item">
                            <div className="breakdown-label">Base</div>
                            <div className="breakdown-value">{formatMontant(employee.salaire_base)}</div>
                            <div className="breakdown-bar">
                              <div 
                                className="breakdown-fill" 
                                style={{ width: `${(parseFloat(employee.salaire_base) / totalRemuneration()) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {(employee.prime_responsabilite > 0 || 
                            employee.prime_penibilite > 0 || 
                            employee.prime_logement > 0 || 
                            employee.prime_transport > 0 || 
                            employee.prime_anciennete > 0 || 
                            employee.prime_enfant > 0 || 
                            employee.prime_representation > 0 || 
                            employee.prime_performance > 0 || 
                            employee.prime_astreinte > 0) && (
                            <div className="breakdown-item">
                              <div className="breakdown-label">Primes</div>
                              <div className="breakdown-value">
                                {formatMontant(
                                  (parseFloat(employee.prime_responsabilite) || 0) +
                                  (parseFloat(employee.prime_penibilite) || 0) +
                                  (parseFloat(employee.prime_logement) || 0) +
                                  (parseFloat(employee.prime_transport) || 0) +
                                  (parseFloat(employee.prime_anciennete) || 0) +
                                  (parseFloat(employee.prime_enfant) || 0) +
                                  (parseFloat(employee.prime_representation) || 0) +
                                  (parseFloat(employee.prime_performance) || 0) +
                                  (parseFloat(employee.prime_astreinte) || 0)
                                )}
                              </div>
                              <div className="breakdown-bar">
                                <div 
                                  className="breakdown-fill prime" 
                                  style={{ 
                                    width: `${(
                                      (parseFloat(employee.prime_responsabilite) || 0) +
                                      (parseFloat(employee.prime_penibilite) || 0) +
                                      (parseFloat(employee.prime_logement) || 0) +
                                      (parseFloat(employee.prime_transport) || 0) +
                                      (parseFloat(employee.prime_anciennete) || 0) +
                                      (parseFloat(employee.prime_enfant) || 0) +
                                      (parseFloat(employee.prime_representation) || 0) +
                                      (parseFloat(employee.prime_performance) || 0) +
                                      (parseFloat(employee.prime_astreinte) || 0)
                                    ) / totalRemuneration() * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {(employee.honoraires > 0 || employee.indemnite_stage > 0) && (
                            <div className="breakdown-item">
                              <div className="breakdown-label">Autres</div>
                              <div className="breakdown-value">
                                {formatMontant(
                                  (parseFloat(employee.honoraires) || 0) +
                                  (parseFloat(employee.indemnite_stage) || 0)
                                )}
                              </div>
                              <div className="breakdown-bar">
                                <div 
                                  className="breakdown-fill other" 
                                  style={{ 
                                    width: `${(
                                      (parseFloat(employee.honoraires) || 0) +
                                      (parseFloat(employee.indemnite_stage) || 0)
                                    ) / totalRemuneration() * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="info-grid mt-4">
                        <div className="info-item">
                          <span className="info-label">Type de rémunération</span>
                          <span className="info-value">{employee.type_remuneration || 'Non spécifié'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Mode de paiement</span>
                          <span className="info-value">{employee.payment_mode || 'Non spécifié'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Salaire de base</span>
                          <span className="info-value">{formatMontant(employee.salaire_base)}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Salaire net</span>
                          <span className="info-value">{formatMontant(employee.salaire_net)}</span>
                        </div>
                        {employee.honoraires > 0 && (
                          <div className="info-item">
                            <span className="info-label">Honoraires</span>
                            <span className="info-value">{formatMontant(employee.honoraires)}</span>
                          </div>
                        )}
                        {employee.indemnite_stage > 0 && (
                          <div className="info-item">
                            <span className="info-label">Indemnité de stage</span>
                            <span className="info-value">{formatMontant(employee.indemnite_stage)}</span>
                          </div>
                        )}
                      </div>

                      {(employee.prime_responsabilite > 0 || 
                        employee.prime_penibilite > 0 || 
                        employee.prime_logement > 0 || 
                        employee.prime_transport > 0 || 
                        employee.prime_anciennete > 0 || 
                        employee.prime_enfant > 0 || 
                        employee.prime_representation > 0 || 
                        employee.prime_performance > 0 || 
                        employee.prime_astreinte > 0) && (
                        <div className="primes-section mt-4">
                          <div className="section-header">
                            <h6 className="section-subtitle">
                              <i className="fas fa-star me-2"></i>
                              Détail des primes
                            </h6>
                          </div>
                          <div className="info-grid">
                            {employee.prime_responsabilite > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de responsabilité</span>
                                <span className="info-value">{formatMontant(employee.prime_responsabilite)}</span>
                              </div>
                            )}
                            {employee.prime_penibilite > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de pénibilité</span>
                                <span className="info-value">{formatMontant(employee.prime_penibilite)}</span>
                              </div>
                            )}
                            {employee.prime_logement > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de logement</span>
                                <span className="info-value">{formatMontant(employee.prime_logement)}</span>
                              </div>
                            )}
                            {employee.prime_transport > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de transport</span>
                                <span className="info-value">{formatMontant(employee.prime_transport)}</span>
                              </div>
                            )}
                            {employee.prime_anciennete > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime d'ancienneté</span>
                                <span className="info-value">{formatMontant(employee.prime_anciennete)}</span>
                              </div>
                            )}
                            {employee.prime_enfant > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime enfant</span>
                                <span className="info-value">{formatMontant(employee.prime_enfant)}</span>
                              </div>
                            )}
                            {employee.prime_representation > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de représentation</span>
                                <span className="info-value">{formatMontant(employee.prime_representation)}</span>
                              </div>
                            )}
                            {employee.prime_performance > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime de performance</span>
                                <span className="info-value">{formatMontant(employee.prime_performance)}</span>
                              </div>
                            )}
                            {employee.prime_astreinte > 0 && (
                              <div className="info-item">
                                <span className="info-label">Prime d'astreinte</span>
                                <span className="info-value">{formatMontant(employee.prime_astreinte)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact & Documents */}
              {activeTab === 'contact' && (
                <div className="tab-pane active animated fadeIn">
                  <div className="info-section">
                    <div className="section-header">
                      <h5 className="section-title">
                        <i className="fas fa-address-card me-2"></i>
                        Informations de contact
                      </h5>
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">
                          {employee.email ? (
                            <a href={`mailto:${employee.email}`} className="contact-link">
                              <i className="fas fa-envelope me-1"></i>
                              {employee.email}
                            </a>
                          ) : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Téléphone</span>
                        <span className="info-value">
                          {employee.telephone ? (
                            <a href={`tel:${employee.telephone}`} className="contact-link">
                              <i className="fas fa-phone me-1"></i>
                              {employee.telephone}
                            </a>
                          ) : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Adresse</span>
                        <span className="info-value">
                          {employee.adresse ? (
                            <>
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {employee.adresse}
                            </>
                          ) : 'Non spécifié'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Lieu</span>
                        <span className="info-value">{employee.lieu || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Contact d'urgence</span>
                        <span className="info-value">{employee.emergency_contact || 'Non spécifié'}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Téléphone d'urgence</span>
                        <span className="info-value">
                          {employee.emergency_phone ? (
                            <a href={`tel:${employee.emergency_phone}`} className="contact-link">
                              <i className="fas fa-phone me-1"></i>
                              {employee.emergency_phone}
                            </a>
                          ) : 'Non spécifié'}
                        </span>
                      </div>
                    </div>

                    <div className="documents-section mt-4">
                      <div className="section-header d-flex justify-content-between align-items-center">
                        <h5 className="section-title mb-0">
                          <i className="fas fa-file me-2"></i>
                          Documents administratifs
                        </h5>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-upload me-1"></i>
                          Ajouter un document
                        </button>
                      </div>

                      <div className="admin-docs mb-4">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Numéro CNSS</span>
                            <span className="info-value">{employee.cnss_number || 'Non spécifié'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Numéro CNAMGS</span>
                            <span className="info-value">{employee.cnamgs_number || 'Non spécifié'}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">ID TimeMoto</span>
                            <span className="info-value">{employee.timemoto_id || 'Non spécifié'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="documents-container">
                        <div className="documents-header">
                          <div className="search-container">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Rechercher un document..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                              <button 
                                className="search-clear" 
                                onClick={() => setSearchQuery('')}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                        </div>

                        {loadingDocuments ? (
                          <div className="documents-loading text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-2 text-muted">Chargement des documents...</p>
                          </div>
                        ) : documentError ? (
                          <div className="alert alert-danger">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {documentError}
                          </div>
                        ) : filteredDocuments.length === 0 ? (
                          <div className="no-documents text-center py-4">
                            {searchQuery ? (
                              <>
                                <i className="fas fa-search fa-2x text-muted mb-2"></i>
                                <p>Aucun document ne correspond à votre recherche.</p>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => setSearchQuery('')}
                                >
                                  Effacer la recherche
                                </button>
                              </>
                            ) : (
                              <>
                                <i className="fas fa-folder-open fa-2x text-muted mb-2"></i>
                                <p>Aucun document disponible pour cet employé.</p>
                                <button className="btn btn-sm btn-primary">
                                  <i className="fas fa-upload me-1"></i>
                                  Ajouter un document
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="documents-list">
                            {filteredDocuments.map(doc => (
                              <div className="document-card" key={doc.id}>
                                <div className="document-icon">
                                  <i className={`fas fa-file-${
                                    doc.type === 'contrat' ? 'contract' : 
                                    doc.type === 'administratif' ? 'alt' : 
                                    doc.type === 'identité' ? 'user' : 'pdf'
                                  }`}></i>
                                </div>
                                <div className="document-info">
                                  <div className="document-name">{doc.name}</div>
                                  <div className="document-meta">
                                    <span className="document-type">{doc.type}</span>
                                    {doc.date && (
                                      <span className="document-date">
                                        <i className="fas fa-calendar-alt me-1"></i>
                                        {formatDate(doc.date)}
                                      </span>
                                    )}
                                    <span className={`document-status ${
                                      doc.status === 'Signé' ? 'signed' : 
                                      doc.status === 'Validé' ? 'validated' : 
                                      doc.status === 'En attente' ? 'pending' : 'archived'
                                    }`}>
                                      {doc.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <button className="btn btn-sm btn-outline-primary" title="Télécharger">
                                    <i className="fas fa-download"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="footer-actions-left">
            <button 
              type="button" 
              className="btn btn-outline-primary me-2"
              onClick={handleShare}
            >
              <i className="fas fa-share-alt me-1"></i>
              Partager
            </button>
            <button 
              type="button" 
              className="btn btn-outline-primary"
              onClick={handlePrint}
            >
              <i className="fas fa-print me-1"></i>
              Imprimer
            </button>
          </div>
          
          <div className="footer-actions-right">
            {onEdit && (
              <button 
                type="button" 
                className="btn btn-primary me-2"
                onClick={() => onEdit(employee)}
              >
                <i className="fas fa-edit me-1"></i>
                Modifier
              </button>
            )}
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="fas fa-times me-1"></i>
              Fermer
            </button>
          </div>
        </div>
      </div>
      
      {/* Styles CSS supplémentaires */}
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .modal-backdrop.fullscreen {
          padding: 0;
        }
        
        .employee-detail-modal {
          background-color: white;
          border-radius: 8px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.3s ease;
          transition: all 0.3s ease;
        }
        
        .employee-detail-modal.fullscreen {
          max-width: 100%;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #dee2e6;
        }
        
        .modal-title {
          margin: 0;
          font-size: 18px;
          display: flex;
          align-items: center;
        }
        
        .modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .btn-icon {
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          font-size: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .btn-icon:hover {
          background-color: #f8f9fa;
          color: #495057;
        }
        
        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        
        .modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .footer-actions-left, .footer-actions-right {
          display: flex;
          align-items: center;
        }
        
        .employee-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .employee-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          margin-right: 20px;
          flex-shrink: 0;
        }
        
        .employee-avatar.large {
          width: 80px;
          height: 80px;
          font-size: 28px;
        }
        
        .employee-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          background-color: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
        
        .employee-main-info {
          flex: 1;
          min-width: 0;
        }
        
        .employee-name {
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 5px;
        }
        
        .employee-position {
          font-size: 16px;
          color: #6c757d;
          margin: 0 0 10px;
        }
        
        .employee-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        .employee-quick-actions {
          margin-left: auto;
          margin-top: 10px;
          display: flex;
          align-items: center;
        }
        
        .contact-info-card {
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .contact-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 20px;
        }
        
        .contact-item i {
          color: #007bff;
        }
        
        .contact-link {
          color: #007bff;
          text-decoration: none;
        }
        
        .contact-link:hover {
          text-decoration: underline;
        }
        
        .key-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .metric-card {
          flex: 1;
          min-width: 150px;
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }
        
        .metric-card:hover {
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-right: 15px;
        }
        
        .metric-content {
          flex: 1;
        }
        
        .metric-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 5px;
        }
        
        .metric-value {
          font-size: 16px;
          font-weight: 600;
        }
        
        .text-danger {
          color: #dc3545 !important;
        }
        
        .text-warning {
          color: #ffc107 !important;
        }
        
        .custom-tabs {
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
        }
        
        .custom-tabs .nav-link {
          border: none;
          color: #6c757d;
          padding: 10px 15px;
          margin-right: 5px;
          border-radius: 0;
          font-weight: 500;
          position: relative;
          transition: all 0.2s;
        }
        
        .custom-tabs .nav-link:hover {
          color: #007bff;
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .custom-tabs .nav-link.active {
          color: #007bff;
          background-color: transparent;
          font-weight: 600;
        }
        
        .custom-tabs .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #007bff;
        }
        
        .tab-pane {
          display: none;
        }
        
        .tab-pane.active {
          display: block;
        }
        
        .info-section {
          margin-bottom: 20px;
        }
        
        .section-header {
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #343a40;
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .section-subtitle {
          font-size: 14px;
          font-weight: 600;
          color: #343a40;
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 3px;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-badge.inactive {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .status-badge.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .contract-type-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .contract-type-badge.cdi {
          background-color: #d4edda;
          color: #155724;
        }
        
        .contract-type-badge.cdd {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .contract-type-badge.autre {
          background-color: #e2e3e5;
          color: #383d41;
        }
        
        .days-remaining {
          margin-left: 5px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .days-remaining.danger {
          color: #dc3545;
        }
        
        .days-remaining.warning {
          color: #ffc107;
        }
        
        .days-remaining.success {
          color: #28a745;
        }
        
        .remuneration-section {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .remuneration-overview {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 15px;
        }
        
        .remuneration-total {
          text-align: center;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .total-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 5px;
        }
        
        .total-value {
          font-size: 24px;
          font-weight: 600;
          color: #007bff;
        }
        
        .remuneration-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .breakdown-label {
          font-size: 13px;
          color: #6c757d;
        }
        
        .breakdown-value {
          font-size: 14px;
          font-weight: 500;
        }
        
        .breakdown-bar {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .breakdown-fill {
          height: 100%;
          background-color: #007bff;
          border-radius: 4px;
        }
        
        .breakdown-fill.prime {
          background-color: #28a745;
        }
        
        .breakdown-fill.other {
          background-color: #6610f2;
        }
        
        .documents-container {
          margin-top: 15px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .documents-header {
          padding: 10px 15px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        
        .search-container {
          position: relative;
        }
        
        .search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
        }
        
        .documents-list {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .document-card {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .document-card:hover {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }
        
        .document-icon {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-right: 15px;
        }
        
        .document-info {
          flex: 1;
          min-width: 0;
        }
        
        .document-name {
          font-weight: 500;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .document-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: #6c757d;
        }
        
        .document-status {
          padding: 1px 6px;
          border-radius: 10px;
          font-size: 11px;
        }
        
        .document-status.signed {
          background-color: #d4edda;
          color: #155724;
        }
        
        .document-status.validated {
          background-color: #cce5ff;
          color: #004085;
        }
        
        .document-status.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .document-status.archived {
          background-color: #e2e3e5;
          color: #383d41;
        }
        
        .document-actions {
          margin-left: 10px;
        }
        
        .animated {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        
        .fadeIn {
          animation-name: fadeIn;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .employee-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .employee-avatar {
            margin-bottom: 15px;
          }
          
          .employee-quick-actions {
            margin-left: 0;
            margin-top: 15px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .key-metrics {
            flex-direction: column;
          }
          
          .modal-footer {
            flex-direction: column-reverse;
            gap: 15px;
          }
          
          .footer-actions-left, .footer-actions-right {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media print {
          .modal-backdrop {
            position: static;
            background: none;
            padding: 0;
          }
          
          .employee-detail-modal {
            box-shadow: none;
            max-height: none;
            width: 100%;
            max-width: 100%;
          }
          
          .modal-actions, .employee-quick-actions, 
          .custom-tabs, .document-actions, .modal-footer,
          .btn, button {
            display: none !important;
          }
          
          .tab-pane {
            display: block !important;
          }
          
          .modal-body {
            padding: 0;
          }
          
          .info-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDetailModal;
