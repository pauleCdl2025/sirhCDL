import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import './Offboarding.css';

const Offboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeInfo: {
      employee_id: '',
      matricule: '',
      nom_prenom: '',
      poste_actuel: '',
      entity: '',
      departement: '',
      type_contrat: '',
      date_entree: '',
      date_depart: '',
      motif_depart: '',
      type_depart: ''
    },
    checklist: {
      materiel_retourne: false,
      acces_revoque: false,
      documents_recuperes: false,
      entretien_sortie: false,
      calcul_solde: false,
      formation_transfert: false,
      inventaire_bureau: false,
      cles_retournees: false
    },
    documents: [],
    notes: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const steps = [
    { 
      id: 1, 
      title: '👤 Sélection de l\'employé', 
      description: 'Identifier l\'employé concerné par le départ',
      icon: 'fas fa-user-search'
    },
    { 
      id: 2, 
      title: '📋 Informations de départ', 
      description: 'Détails du départ et procédures',
      icon: 'fas fa-sign-out-alt'
    },
    { 
      id: 3, 
      title: '✅ Checklist de sortie', 
      description: 'Procédures obligatoires de sortie',
      icon: 'fas fa-tasks'
    },
    { 
      id: 4, 
      title: '📁 Documents de sortie', 
      description: 'Téléchargement des documents',
      icon: 'fas fa-file-upload'
    },
    { 
      id: 5, 
      title: '🎯 Validation finale', 
      description: 'Récapitulatif et finalisation',
      icon: 'fas fa-check-circle'
    }
  ];

  useEffect(() => {
    // Charger la liste des employés depuis la base de données
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.EMPLOYEES.ACTIVE), {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setEmployees(response.data.employees || []);
          console.log('✅ Employés chargés depuis la base de données:', response.data.employees.length);
        } else {
          console.error('❌ Erreur API:', response.data.message);
          setError('Impossible de récupérer la liste des employés depuis la base de données');
          setEmployees([]);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des employés:', err);
        setError('Erreur de connexion à la base de données. Vérifiez votre connexion et réessayez.');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleChecklistChange = (field, checked) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: checked
      }
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files.map(file => ({
        file,
        type: file.name.split('.').pop(),
        name: file.name,
        size: file.size
      }))]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const selectEmployee = (employee) => {
    setFormData(prev => ({
      ...prev,
      employeeInfo: {
        ...prev.employeeInfo,
        employee_id: employee.id,
        matricule: employee.matricule,
        nom_prenom: employee.nom_prenom,
        poste_actuel: employee.poste_actuel,
        entity: employee.entity,
        departement: employee.departement,
        type_contrat: employee.type_contrat,
        date_entree: employee.date_entree
      }
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.employeeInfo.employee_id;
      case 2:
        return formData.employeeInfo.date_depart && 
               formData.employeeInfo.motif_depart && 
               formData.employeeInfo.type_depart;
      case 3:
        return Object.values(formData.checklist).some(Boolean);
      case 4:
        return true; // Documents optionnels
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Créer un FormData pour l'envoi
      const submitData = new FormData();
      
      // Ajouter les données de base
      submitData.append('offboardingData', JSON.stringify({
        ...formData.employeeInfo,
        checklist: formData.checklist,
        notes: formData.notes
      }));
      
      // Ajouter les documents
      formData.documents.forEach((doc, index) => {
        submitData.append('documents', doc.file);
        submitData.append('documentTypes', doc.type);
      });

      // Appel API (à adapter selon votre backend)
      const response = await axios.post(API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.EMPLOYEES.OFFBOARDING), submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Supprimer l'employé de la liste locale
        setEmployees(prev => prev.filter(emp => emp.id !== formData.employeeInfo.employee_id));
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/employees');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'offboarding');
      }
    } catch (err) {
      console.error('Erreur offboarding:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'offboarding. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.poste_actuel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStep1 = () => (
    <div className="offboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-user-search"></i> Sélection de l'employé</h3>
        <p>Sélectionnez l'employé qui quitte l'organisation</p>
      </div>
      
      <div className="employee-selection">
        <div className="search-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {formData.employeeInfo.employee_id && (
          <div className="selected-employee">
            <h4>Employé sélectionné :</h4>
            <div className="employee-card selected">
              <div className="employee-info">
                <div className="employee-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="employee-details">
                  <h5>{formData.employeeInfo.nom_prenom}</h5>
                  <p><strong>Matricule:</strong> {formData.employeeInfo.matricule}</p>
                  <p><strong>Poste:</strong> {formData.employeeInfo.poste_actuel}</p>
                  <p><strong>Entité:</strong> {formData.employeeInfo.entity} - {formData.employeeInfo.departement}</p>
                  <p><strong>Type de contrat:</strong> {formData.employeeInfo.type_contrat}</p>
                  <p><strong>Date d'entrée:</strong> {formData.employeeInfo.date_entree}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, employeeInfo: { ...prev.employeeInfo, employee_id: '' } }))}
                className="change-employee-btn"
              >
                <i className="fas fa-edit"></i> Changer
              </button>
            </div>
          </div>
        )}

        {!formData.employeeInfo.employee_id && (
          <div className="employees-list">
            <h4>Liste des employés ({filteredEmployees.length})</h4>
            
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Chargement des employés depuis la base de données...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="no-employees-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Aucun employé trouvé dans la base de données</p>
                <small>Vérifiez que votre base de données contient des employés actifs</small>
              </div>
            ) : (
              <div className="employees-grid">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="employee-card"
                    onClick={() => selectEmployee(employee)}
                  >
                    <div className="employee-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="employee-details">
                      <h5>{employee.nom_prenom}</h5>
                      <p><strong>Matricule:</strong> {employee.matricule}</p>
                      <p><strong>Poste:</strong> {employee.poste_actuel}</p>
                      <p><strong>Entité:</strong> {employee.entity} - {employee.departement}</p>
                      <p><strong>Type:</strong> {employee.type_contrat}</p>
                      <p><strong>Entrée:</strong> {employee.date_entree}</p>
                    </div>
                    <div className="select-indicator">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="offboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-sign-out-alt"></i> Informations de départ</h3>
        <p>Détails du départ et procédures à suivre</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="date_depart">Date de départ *</label>
          <input
            type="date"
            id="date_depart"
            value={formData.employeeInfo.date_depart}
            onChange={(e) => handleInputChange('employeeInfo', 'date_depart', e.target.value)}
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type_depart">Type de départ *</label>
          <select
            id="type_depart"
            value={formData.employeeInfo.type_depart}
            onChange={(e) => handleInputChange('employeeInfo', 'type_depart', e.target.value)}
            required
            className="form-control"
          >
            <option value="">Sélectionner un type</option>
            <option value="Démission">Démission</option>
            <option value="Licenciement">Licenciement</option>
            <option value="Fin de contrat">Fin de contrat</option>
            <option value="Retraite">Retraite</option>
            <option value="Décès">Décès</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="motif_depart">Motif du départ *</label>
          <textarea
            id="motif_depart"
            value={formData.employeeInfo.motif_depart}
            onChange={(e) => handleInputChange('employeeInfo', 'motif_depart', e.target.value)}
            required
            placeholder="Détaillez les raisons du départ..."
            rows="4"
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes additionnelles</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Informations complémentaires, observations..."
            rows="3"
            className="form-control"
          />
        </div>
      </div>

      <div className="departure-info">
        <h4><i className="fas fa-info-circle"></i> Informations importantes</h4>
        <div className="info-grid">
          <div className="info-item">
            <i className="fas fa-calendar-alt"></i>
            <div>
              <h5>Préavis</h5>
              <p>Respecter le délai de préavis selon le type de contrat</p>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-file-contract"></i>
            <div>
              <h5>Documents obligatoires</h5>
              <p>Attestation de travail, certificat de travail</p>
            </div>
          </div>
          <div className="info-item">
            <i className="fas fa-handshake"></i>
            <div>
              <h5>Entretien de sortie</h5>
              <p>Organiser un entretien de sortie obligatoire</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="offboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-tasks"></i> Checklist de sortie</h3>
        <p>Cochez les éléments qui ont été réalisés</p>
      </div>
      
      <div className="checklist-section">
        <div className="checklist-grid">
          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.materiel_retourne}
              onChange={(e) => handleChecklistChange('materiel_retourne', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Matériel retourné</h4>
              <p>Ordinateur, téléphone, badge, clés, etc.</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.acces_revoque}
              onChange={(e) => handleChecklistChange('acces_revoque', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Accès révoqués</h4>
              <p>Accès informatique, badges, comptes utilisateur</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.documents_recuperes}
              onChange={(e) => handleChecklistChange('documents_recuperes', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Documents récupérés</h4>
              <p>Documents confidentiels, manuels, procédures</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.entretien_sortie}
              onChange={(e) => handleChecklistChange('entretien_sortie', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Entretien de sortie</h4>
              <p>Entretien réalisé avec le responsable RH</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.calcul_solde}
              onChange={(e) => handleChecklistChange('calcul_solde', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Calcul du solde</h4>
              <p>Salaire, congés, indemnités calculés</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.formation_transfert}
              onChange={(e) => handleChecklistChange('formation_transfert', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Formation transfert</h4>
              <p>Transfert des connaissances et procédures</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.inventaire_bureau}
              onChange={(e) => handleChecklistChange('inventaire_bureau', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Inventaire bureau</h4>
              <p>Vérification et nettoyage du poste de travail</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.cles_retournees}
              onChange={(e) => handleChecklistChange('cles_retournees', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Clés retournées</h4>
              <p>Clés de bureau, armoires, locaux</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="offboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-file-upload"></i> Documents de sortie</h3>
        <p>Téléchargez les documents liés au départ</p>
      </div>
      
      <div className="documents-section">
        <div className="document-upload-area">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="upload-label">
            <i className="fas fa-cloud-upload-alt"></i>
            <span>Cliquez pour sélectionner des fichiers</span>
            <small>Formats acceptés: PDF, DOC, DOCX, JPG, PNG</small>
          </label>
        </div>

        {formData.documents.length > 0 && (
          <div className="documents-list">
            <h4>Documents sélectionnés ({formData.documents.length})</h4>
            {formData.documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-info">
                  <i className="fas fa-file"></i>
                  <span className="document-name">{doc.name}</span>
                  <span className="document-size">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="remove-document"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="required-documents">
          <h4>Documents recommandés</h4>
          <ul>
            <li><i className="fas fa-check"></i> Lettre de démission (si applicable)</li>
            <li><i className="fas fa-check"></i> Procès-verbal d'entretien de sortie</li>
            <li><i className="fas fa-check"></i> Inventaire du matériel retourné</li>
            <li><i className="fas fa-check"></i> Attestation de départ</li>
            <li><i className="fas fa-check"></i> Certificat de travail</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="offboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-check-circle"></i> Validation finale</h3>
        <p>Vérifiez toutes les informations avant finalisation</p>
      </div>
      
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card">
            <h4><i className="fas fa-user"></i> Employé concerné</h4>
            <div className="summary-content">
              <p><strong>Nom:</strong> {formData.employeeInfo.nom_prenom}</p>
              <p><strong>Matricule:</strong> {formData.employeeInfo.matricule}</p>
              <p><strong>Poste:</strong> {formData.employeeInfo.poste_actuel}</p>
              <p><strong>Entité:</strong> {formData.employeeInfo.entity} - {formData.employeeInfo.departement}</p>
            </div>
          </div>

          <div className="summary-card">
            <h4><i className="fas fa-sign-out-alt"></i> Informations de départ</h4>
            <div className="summary-content">
              <p><strong>Date de départ:</strong> {formData.employeeInfo.date_depart}</p>
              <p><strong>Type de départ:</strong> {formData.employeeInfo.type_depart}</p>
              <p><strong>Motif:</strong> {formData.employeeInfo.motif_depart}</p>
            </div>
          </div>

          <div className="summary-card">
            <h4><i className="fas fa-tasks"></i> Checklist</h4>
            <div className="summary-content">
              {Object.entries(formData.checklist).map(([key, value]) => (
                <p key={key}>
                  <i className={`fas ${value ? 'fa-check text-success' : 'fa-times text-danger'}`}></i>
                  {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              ))}
            </div>
          </div>

          <div className="summary-card">
            <h4><i className="fas fa-file"></i> Documents</h4>
            <div className="summary-content">
              <p><strong>Nombre de documents:</strong> {formData.documents.length}</p>
              {formData.documents.map((doc, index) => (
                <p key={index}><i className="fas fa-file"></i> {doc.name}</p>
              ))}
            </div>
          </div>
        </div>

        {formData.notes && (
          <div className="notes-section">
            <h4><i className="fas fa-sticky-note"></i> Notes additionnelles</h4>
            <p>{formData.notes}</p>
          </div>
        )}

        <div className="warning-section">
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="warning-content">
              <h4>⚠️ Attention - Action irréversible</h4>
              <p>En finalisant cet offboarding, l'employé sera <strong>définitivement supprimé de l'effectif</strong> et retiré du système.</p>
              <p>Cette action ne peut pas être annulée. Assurez-vous que toutes les informations sont correctes.</p>
            </div>
          </div>
        </div>

        <div className="final-actions">
          <button
            type="button"
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={loading}
          >
            <i className="fas fa-arrow-left"></i> Précédent
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Traitement...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Finaliser l'offboarding
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  if (success) {
    return (
      <div className="offboarding-success">
        <div className="success-content">
          <i className="fas fa-check-circle"></i>
          <h2>Offboarding terminé avec succès !</h2>
          <p>L'employé a été supprimé de l'effectif et retiré du système.</p>
          <p>Redirection vers la liste des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="offboarding-container">
      <div className="offboarding-header">
        <h1><i className="fas fa-user-minus"></i> Processus d'Offboarding</h1>
        <p>Gestion du départ d'un employé de l'organisation</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="offboarding-progress">
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
            >
              <div className="step-number">
                {currentStep > step.id ? (
                  <i className="fas fa-check"></i>
                ) : (
                  step.id
                )}
              </div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="offboarding-content">
        {renderCurrentStep()}
      </div>

      {currentStep < 5 && (
        <div className="offboarding-navigation">
          <button
            type="button"
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={currentStep === 1}
          >
            <i className="fas fa-arrow-left"></i> Précédent
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            disabled={!validateStep(currentStep)}
          >
            Suivant <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Offboarding;

