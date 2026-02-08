import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContratPDFManager.css';

const ContratPDFManager = () => {
  const [logo, setLogo] = useState(null);
  const [contrats, setContrats] = useState([]);
  const [generatedPDFs, setGeneratedPDFs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchContrats();
    fetchGeneratedPDFs();
  }, []);

  const fetchContrats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contrats');
      if (response.ok) {
        const data = await response.json();
        setContrats(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      setMessage('Erreur lors de la récupération des contrats');
    }
  };

  const fetchGeneratedPDFs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contrats-pdf/list');
      if (response.ok) {
        const data = await response.json();
        setGeneratedPDFs(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des PDFs:', error);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/contrats-pdf/upload-logo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setLogo(URL.createObjectURL(file));
        setMessage('Logo uploadé avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erreur lors de l\'upload du logo');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setMessage('Erreur lors de l\'upload du logo');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (contrat) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/contrats-pdf/generate/${contrat.id}`, {
        method: 'POST'
      });

      if (response.ok) {
        setMessage('Contrat PDF généré avec succès !');
        setTimeout(() => setMessage(''), 3000);
        fetchGeneratedPDFs();
      } else {
        setMessage('Erreur lors de la génération du PDF');
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      setMessage('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  const viewPDF = (filename) => {
    window.open(`http://localhost:5000/uploads/contrats/${filename}`, '_blank');
  };

  const downloadPDF = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contrats-pdf/download/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setMessage('Erreur lors du téléchargement');
    }
  };

  const deletePDF = async (filename) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce PDF ?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/contrats-pdf/delete/${filename}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('PDF supprimé avec succès !');
        setTimeout(() => setMessage(''), 3000);
        fetchGeneratedPDFs();
      } else {
        setMessage('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('Erreur lors de la suppression');
    }
  };

  const openContratModal = (contrat) => {
    setSelectedContrat(contrat);
  };

  const closeContratModal = () => {
    setSelectedContrat(null);
  };

  const filteredContrats = contrats.filter(contrat => {
    const matchesSearch = contrat.nom_prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrat.poste?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contrat.service?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && contrat.statut === 'Actif';
    if (filterStatus === 'inactive') return matchesSearch && contrat.statut !== 'Actif';
    
    return matchesSearch;
  });

  const stats = {
    total: contrats.length,
    active: contrats.filter(c => c.statut === 'Actif').length,
    generated: generatedPDFs.length,
    pending: contrats.filter(c => !generatedPDFs.some(pdf => pdf.filename.includes(c.id.toString()))).length
  };

  return (
    <div className="contrat-pdf-manager">
      {/* Header Professionnel */}
      <div className="manager-header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fas fa-file-contract"></i>
          </div>
          <div className="header-text">
            <h1>Gestion des Contrats PDF</h1>
            <p>Générez des contrats professionnels avec le logo de votre centre de santé</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/contrats')}
            className="btn btn-outline-light"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Retour aux Contrats
          </button>
        </div>
      </div>

      {/* Messages de notification */}
      {message && (
        <div className={`notification ${message.includes('succès') ? 'success' : 'error'}`}>
          <i className={`fas ${message.includes('succès') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="notification-close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Contrats</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Contrats Actifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon generated">
            <i className="fas fa-file-pdf"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.generated}</h3>
            <p>PDFs Générés</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>En Attente</p>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-tachometer-alt me-2"></i>
          Vue d'ensemble
        </button>
        <button 
          className={`tab-button ${activeTab === 'contrats' ? 'active' : ''}`}
          onClick={() => setActiveTab('contrats')}
        >
          <i className="fas fa-file-contract me-2"></i>
          Contrats ({contrats.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pdfs' ? 'active' : ''}`}
          onClick={() => setActiveTab('pdfs')}
        >
          <i className="fas fa-file-pdf me-2"></i>
          PDFs Générés ({generatedPDFs.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Section Logo */}
            <div className="logo-section">
              <div className="section-header">
                <h2><i className="fas fa-building me-2"></i>Logo du Centre</h2>
                <p>Personnalisez l'identité visuelle de vos contrats</p>
              </div>
              <div className="logo-content">
                <div className="logo-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={loading}
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="upload-button">
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt me-2"></i>
                        Choisir un logo
                      </>
                    )}
                  </label>
                  <p className="upload-hint">Formats acceptés : PNG, JPG, JPEG (max 5MB)</p>
                </div>
                {logo && (
                  <div className="logo-preview">
                    <img src={logo} alt="Logo du centre" />
                    <div className="logo-info">
                      <h4>Logo actuel</h4>
                      <p>Prêt pour la génération de contrats</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Actions Rapides */}
            <div className="quick-actions">
              <div className="section-header">
                <h2><i className="fas fa-bolt me-2"></i>Actions Rapides</h2>
                <p>Générez rapidement des contrats pour vos employés</p>
              </div>
              <div className="actions-grid">
                <button 
                  onClick={() => setActiveTab('contrats')}
                  className="action-card"
                >
                  <i className="fas fa-file-contract"></i>
                  <h4>Gérer les Contrats</h4>
                  <p>Consultez et modifiez tous vos contrats</p>
                </button>
                <button 
                  onClick={() => setActiveTab('pdfs')}
                  className="action-card"
                >
                  <i className="fas fa-file-pdf"></i>
                  <h4>Voir les PDFs</h4>
                  <p>Accédez à tous vos contrats générés</p>
                </button>
                <button 
                  onClick={() => navigate('/contrats')}
                  className="action-card"
                >
                  <i className="fas fa-plus"></i>
                  <h4>Nouveau Contrat</h4>
                  <p>Créez un nouveau contrat d'emploi</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contrats' && (
          <div className="contrats-tab">
            <div className="section-header">
              <h2><i className="fas fa-file-contract me-2"></i>Contrats Disponibles</h2>
              <p>Générez des PDFs pour tous vos contrats existants</p>
            </div>
            
            {/* Filtres et recherche */}
            <div className="filters-section">
              <div className="search-box">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Rechercher par nom, poste ou service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Tous ({contrats.length})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('active')}
                >
                  Actifs ({stats.active})
                </button>
                <button 
                  className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactifs ({contrats.length - stats.active})
                </button>
              </div>
            </div>

            {/* Liste des contrats */}
            <div className="contrats-grid">
              {filteredContrats.slice(0, 12).map((contrat) => (
                <div key={contrat.id} className="contrat-card">
                  <div className="contrat-header">
                    <div className="contrat-status">
                      <span className={`status-badge ${contrat.statut === 'Actif' ? 'active' : 'inactive'}`}>
                        {contrat.statut}
                      </span>
                    </div>
                    <div className="contrat-type">
                      <i className="fas fa-file-contract"></i>
                      {contrat.type_contrat}
                    </div>
                  </div>
                  <div className="contrat-body">
                    <h4 className="employee-name">{contrat.nom_prenom || 'Nom non défini'}</h4>
                    <div className="contrat-details">
                      <p><i className="fas fa-briefcase me-2"></i>{contrat.poste || 'Non défini'}</p>
                      <p><i className="fas fa-building me-2"></i>{contrat.service || 'Non défini'}</p>
                      <p><i className="fas fa-calendar me-2"></i>Début: {contrat.date_debut || 'Non définie'}</p>
                    </div>
                  </div>
                  <div className="contrat-actions">
                    <button 
                      onClick={() => openContratModal(contrat)}
                      className="btn btn-outline-info btn-sm"
                    >
                      <i className="fas fa-eye me-1"></i>
                      Détails
                    </button>
                    <button 
                      onClick={() => generatePDF(contrat)}
                      className="btn btn-primary btn-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-1"></i>
                          Génération...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-file-pdf me-1"></i>
                          Générer PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredContrats.length > 12 && (
              <div className="load-more">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-chevron-down me-2"></i>
                  Voir plus de contrats ({filteredContrats.length - 12} restants)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pdfs' && (
          <div className="pdfs-tab">
            <div className="section-header">
              <h2><i className="fas fa-file-pdf me-2"></i>Contrats PDF Générés</h2>
              <p>Gérez et accédez à tous vos contrats PDF</p>
            </div>
            
            <div className="pdfs-content">
              {generatedPDFs.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-file-pdf empty-icon"></i>
                  <h3>Aucun contrat PDF généré</h3>
                  <p>Commencez par générer des contrats PDF pour vos employés</p>
                  <button 
                    onClick={() => setActiveTab('contrats')}
                    className="btn btn-primary"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Générer mon premier contrat
                  </button>
                </div>
              ) : (
                <div className="pdfs-grid">
                  {generatedPDFs.map((pdf) => (
                    <div key={pdf.filename} className="pdf-card">
                      <div className="pdf-header">
                        <div className="pdf-icon">
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <div className="pdf-info">
                          <h4 className="pdf-filename">{pdf.filename}</h4>
                          <p className="pdf-meta">
                            <span><i className="fas fa-weight me-1"></i>{pdf.size} bytes</span>
                            <span><i className="fas fa-calendar me-1"></i>{new Date(pdf.created).toLocaleDateString('fr-FR')}</span>
                          </p>
                        </div>
                      </div>
                      <div className="pdf-actions">
                        <button 
                          onClick={() => viewPDF(pdf.filename)}
                          className="btn btn-outline-info btn-sm"
                          title="Voir le PDF"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          onClick={() => downloadPDF(pdf.filename)}
                          className="btn btn-outline-success btn-sm"
                          title="Télécharger"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button 
                          onClick={() => deletePDF(pdf.filename)}
                          className="btn btn-outline-danger btn-sm"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails du contrat */}
      {selectedContrat && (
        <div className="modal-overlay" onClick={closeContratModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-file-contract me-2"></i>Détails du Contrat</h3>
              <button onClick={closeContratModal} className="close-button">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="contrat-details">
                <div className="detail-row">
                  <label><i className="fas fa-user me-2"></i>Employé:</label>
                  <span>{selectedContrat.nom_prenom || 'Non défini'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-file-contract me-2"></i>Type de contrat:</label>
                  <span>{selectedContrat.type_contrat}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-calendar me-2"></i>Date de début:</label>
                  <span>{selectedContrat.date_debut || 'Non définie'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-calendar-check me-2"></i>Date de fin:</label>
                  <span>{selectedContrat.date_fin || 'Non définie'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-briefcase me-2"></i>Poste:</label>
                  <span>{selectedContrat.poste || 'Non défini'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-building me-2"></i>Service:</label>
                  <span>{selectedContrat.service || 'Non défini'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-money-bill-wave me-2"></i>Salaire:</label>
                  <span>{selectedContrat.salaire ? `${selectedContrat.salaire} XAF` : 'Non défini'}</span>
                </div>
                <div className="detail-row">
                  <label><i className="fas fa-info-circle me-2"></i>Statut:</label>
                  <span className={`status-badge ${selectedContrat.statut === 'Actif' ? 'active' : 'inactive'}`}>
                    {selectedContrat.statut || 'Non défini'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeContratModal} className="btn btn-secondary">
                <i className="fas fa-times me-2"></i>
                Fermer
              </button>
              <button 
                onClick={() => {
                  generatePDF(selectedContrat);
                  closeContratModal();
                }}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Génération...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf me-2"></i>
                    Générer PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratPDFManager;
