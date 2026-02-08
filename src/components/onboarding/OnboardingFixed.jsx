import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Onboarding.css';

const OnboardingFixed = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeInfo: {
      matricule: '',
      nom_prenom: '',
      genre: 'Homme',
      date_naissance: '',
      lieu_naissance: '',
      nationalite: 'Gabon',
      situation_maritale: 'Célibataire',
      nbr_enfants: 0,
      adresse: '',
      telephone: '',
      email: '',
      cnss_number: '',
      cnamgs_number: ''
    },
    professionalInfo: {
      poste_actuel: '',
      domaine_fonctionnel: '',
      entity: '',
      departement: '',
      type_contrat: '',
      date_entree: '',
      date_fin_contrat: '',
      salaire_base: '',
      salaire_propose: '',
      source_recrutement: '',
      categorie: '',
      responsable: '',
      niveau_etude: '',
      specialisation: ''
    },
    documents: [],
    checklist: {
      contrat_signature: false,
      documents_verifies: false,
      acces_configure: false,
      formation_initiale: false,
      presentation_equipe: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Utiliser useRef pour éviter les re-rendus inutiles
  const matriculeGenerated = useRef(false);

  const steps = [
    { 
      id: 1, 
      title: '📋 Informations personnelles', 
      description: 'Données de base et coordonnées',
      icon: 'fas fa-user'
    },
    { 
      id: 2, 
      title: '💼 Informations professionnelles', 
      description: 'Poste, contrat et rémunération',
      icon: 'fas fa-briefcase'
    },
    { 
      id: 3, 
      title: '📁 Documents requis', 
      description: 'Téléchargement des documents',
      icon: 'fas fa-file-upload'
    },
    { 
      id: 4, 
      title: '✅ Checklist d\'intégration', 
      description: 'Procédures d\'accueil',
      icon: 'fas fa-tasks'
    },
    { 
      id: 5, 
      title: '🎯 Validation finale', 
      description: 'Récapitulatif et finalisation',
      icon: 'fas fa-check-circle'
    }
  ];

  // Générer un matricule automatique - exécuté une seule fois au montage
  useEffect(() => {
    if (!matriculeGenerated.current) {
      const generateMatricule = () => {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-4);
        return `CDL-${year}-${timestamp}`;
      };

      const newMatricule = generateMatricule();
      setFormData(prev => ({
        ...prev,
        employeeInfo: {
          ...prev.employeeInfo,
          matricule: newMatricule
        }
      }));
      
      matriculeGenerated.current = true;
    }
  }, []); // Dépendances vides = exécuté une seule fois

  const handleInputChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[`${section}.${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleChecklistChange = useCallback((field, checked) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [field]: checked
      }
    }));
  }, []);

  const handleFileUpload = useCallback((e) => {
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
  }, []);

  const removeDocument = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  }, []);

  // Validation complète des données - utilisant useCallback pour éviter les re-créations
  const validateFormData = useCallback(() => {
    const errors = {};
    
    // Validation des informations personnelles
    if (!formData.employeeInfo.nom_prenom || formData.employeeInfo.nom_prenom.trim().length < 2) {
      errors['employeeInfo.nom_prenom'] = 'Le nom et prénom sont obligatoires (min 2 caractères)';
    }
    
    if (!formData.employeeInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employeeInfo.email)) {
      errors['employeeInfo.email'] = 'L\'email est obligatoire et doit être valide';
    }
    
    if (!formData.employeeInfo.telephone || formData.employeeInfo.telephone.trim().length < 8) {
      errors['employeeInfo.telephone'] = 'Le numéro de téléphone est obligatoire (min 8 chiffres)';
    }
    
    if (!formData.employeeInfo.date_naissance) {
      errors['employeeInfo.date_naissance'] = 'La date de naissance est obligatoire';
    }
    
    if (!formData.employeeInfo.lieu_naissance) {
      errors['employeeInfo.lieu_naissance'] = 'Le lieu de naissance est obligatoire';
    }
    
    // Validation des informations professionnelles
    if (!formData.professionalInfo.poste_actuel || formData.professionalInfo.poste_actuel.trim().length < 2) {
      errors['professionalInfo.poste_actuel'] = 'Le poste actuel est obligatoire (min 2 caractères)';
    }
    
    if (!formData.professionalInfo.type_contrat) {
      errors['professionalInfo.type_contrat'] = 'Le type de contrat est obligatoire';
    }
    
    if (!formData.professionalInfo.date_entree) {
      errors['professionalInfo.date_entree'] = 'La date d\'entrée est obligatoire';
    }
    
    if (!formData.professionalInfo.entity) {
      errors['professionalInfo.entity'] = 'L\'entité est obligatoire';
    }
    
    if (!formData.professionalInfo.departement) {
      errors['professionalInfo.departement'] = 'Le département est obligatoire';
    }
    
    if (!formData.professionalInfo.domaine_fonctionnel) {
      errors['professionalInfo.domaine_fonctionnel'] = 'Le domaine fonctionnel est obligatoire';
    }
    
    // Validation des documents
    if (formData.documents.length === 0) {
      errors['documents'] = 'Au moins un document est requis';
    }
    
    // Validation de la checklist
    const checklistValues = Object.values(formData.checklist);
    if (!checklistValues.some(Boolean)) {
      errors['checklist'] = 'Au moins une étape de la checklist doit être validée';
    }
    
    return errors;
  }, [formData]);

  const validateStep = useCallback((step) => {
    const stepErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.employeeInfo.nom_prenom || formData.employeeInfo.nom_prenom.trim().length < 2) {
          stepErrors['employeeInfo.nom_prenom'] = 'Le nom et prénom sont obligatoires (min 2 caractères)';
        }
        if (!formData.employeeInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employeeInfo.email)) {
          stepErrors['employeeInfo.email'] = 'L\'email est obligatoire et doit être valide';
        }
        if (!formData.employeeInfo.telephone || formData.employeeInfo.telephone.trim().length < 8) {
          stepErrors['employeeInfo.telephone'] = 'Le numéro de téléphone est obligatoire (min 8 chiffres)';
        }
        if (!formData.employeeInfo.date_naissance) {
          stepErrors['employeeInfo.date_naissance'] = 'La date de naissance est obligatoire';
        }
        if (!formData.employeeInfo.lieu_naissance) {
          stepErrors['employeeInfo.lieu_naissance'] = 'Le lieu de naissance est obligatoire';
        }
        break;
      case 2:
        if (!formData.professionalInfo.poste_actuel || formData.professionalInfo.poste_actuel.trim().length < 2) {
          stepErrors['professionalInfo.poste_actuel'] = 'Le poste actuel est obligatoire (min 2 caractères)';
        }
        if (!formData.professionalInfo.type_contrat) {
          stepErrors['professionalInfo.type_contrat'] = 'Le type de contrat est obligatoire';
        }
        if (!formData.professionalInfo.date_entree) {
          stepErrors['professionalInfo.date_entree'] = 'La date d\'entrée est obligatoire';
        }
        if (!formData.professionalInfo.entity) {
          stepErrors['professionalInfo.entity'] = 'L\'entité est obligatoire';
        }
        if (!formData.professionalInfo.departement) {
          stepErrors['professionalInfo.departement'] = 'Le département est obligatoire';
        }
        if (!formData.professionalInfo.domaine_fonctionnel) {
          stepErrors['professionalInfo.domaine_fonctionnel'] = 'Le domaine fonctionnel est obligatoire';
        }
        break;
      case 3:
        if (formData.documents.length === 0) {
          stepErrors['documents'] = 'Au moins un document est requis';
        }
        break;
      case 4:
        const checklistValues = Object.values(formData.checklist);
        if (!checklistValues.some(Boolean)) {
          stepErrors['checklist'] = 'Au moins une étape de la checklist doit être validée';
        }
        break;
      default:
        break;
    }
    
    return stepErrors;
  }, [formData]);

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    setValidationErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0 && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Effacer les erreurs de l'étape précédente
      setValidationErrors({});
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Validation finale avant soumission
    const finalErrors = validateFormData();
    if (Object.keys(finalErrors).length > 0) {
      setValidationErrors(finalErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Créer un FormData pour l'envoi
      const submitData = new FormData();
      
      // Ajouter les données de base
      submitData.append('employeeData', JSON.stringify({
        ...formData.employeeInfo,
        ...formData.professionalInfo,
        checklist: formData.checklist
      }));
      
      // Ajouter les documents
      formData.documents.forEach((doc, index) => {
        submitData.append('documents', doc.file);
        submitData.append('documentTypes', doc.type);
      });

      // Appel API avec timeout étendu pour l'onboarding
      const response = await axios.post('/api/employees/onboarding', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        timeout: 60000 // 60 secondes pour l'onboarding
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/employees');
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'onboarding');
      }
    } catch (err) {
      console.error('Erreur onboarding:', err);
      
      // Gestion des erreurs de validation du serveur
      if (err.response?.data?.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          // Mapper les erreurs du serveur aux champs du formulaire
          if (error.includes('nom_prenom')) serverErrors['employeeInfo.nom_prenom'] = error;
          else if (error.includes('email')) serverErrors['employeeInfo.email'] = error;
          else if (error.includes('telephone')) serverErrors['employeeInfo.telephone'] = error;
          else if (error.includes('poste_actuel')) serverErrors['professionalInfo.poste_actuel'] = error;
          else if (error.includes('type_contrat')) serverErrors['professionalInfo.type_contrat'] = error;
          else if (error.includes('date_entree')) serverErrors['professionalInfo.date_entree'] = error;
          else if (error.includes('entity')) serverErrors['professionalInfo.entity'] = error;
          else if (error.includes('departement')) serverErrors['professionalInfo.departement'] = error;
          else if (error.includes('domaine_fonctionnel')) serverErrors['professionalInfo.domaine_fonctionnel'] = error;
          else if (error.includes('matricule')) serverErrors['employeeInfo.matricule'] = error;
          else serverErrors['general'] = error;
        });
        setValidationErrors(serverErrors);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de l\'onboarding. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateFormData, navigate]);

  const renderStep1 = () => (
    <div className="onboarding-step">
      <h3>Informations personnelles</h3>
      
      <div className="form-group">
        <label htmlFor="matricule">Matricule</label>
        <input
          type="text"
          id="matricule"
          value={formData.employeeInfo.matricule}
          readOnly
          className="form-control readonly"
        />
        <small>Généré automatiquement</small>
      </div>

      <div className="form-group">
        <label htmlFor="nom_prenom">Nom et prénom *</label>
        <input
          type="text"
          id="nom_prenom"
          value={formData.employeeInfo.nom_prenom}
          onChange={(e) => handleInputChange('employeeInfo', 'nom_prenom', e.target.value)}
          className="form-control"
          placeholder="Nom et prénom complet"
        />
        {validationErrors['employeeInfo.nom_prenom'] && (
          <div className="invalid-feedback">{validationErrors['employeeInfo.nom_prenom']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="genre">Genre</label>
        <select
          id="genre"
          value={formData.employeeInfo.genre}
          onChange={(e) => handleInputChange('employeeInfo', 'genre', e.target.value)}
          className="form-control"
        >
          <option value="Homme">Homme</option>
          <option value="Femme">Femme</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date_naissance">Date de naissance *</label>
        <input
          type="date"
          id="date_naissance"
          value={formData.employeeInfo.date_naissance}
          onChange={(e) => handleInputChange('employeeInfo', 'date_naissance', e.target.value)}
          className="form-control"
        />
        {validationErrors['employeeInfo.date_naissance'] && (
          <div className="invalid-feedback">{validationErrors['employeeInfo.date_naissance']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lieu_naissance">Lieu de naissance *</label>
        <input
          type="text"
          id="lieu_naissance"
          value={formData.employeeInfo.lieu_naissance}
          onChange={(e) => handleInputChange('employeeInfo', 'lieu_naissance', e.target.value)}
          className="form-control"
          placeholder="Ville de naissance"
        />
        {validationErrors['employeeInfo.lieu_naissance'] && (
          <div className="invalid-feedback">{validationErrors['employeeInfo.lieu_naissance']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={formData.employeeInfo.email}
          onChange={(e) => handleInputChange('employeeInfo', 'email', e.target.value)}
          className="form-control"
          placeholder="email@exemple.com"
        />
        {validationErrors['employeeInfo.email'] && (
          <div className="invalid-feedback">{validationErrors['employeeInfo.email']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="telephone">Téléphone *</label>
        <input
          type="tel"
          id="telephone"
          value={formData.employeeInfo.telephone}
          onChange={(e) => handleInputChange('employeeInfo', 'telephone', e.target.value)}
          className="form-control"
          placeholder="Numéro de téléphone"
        />
        {validationErrors['employeeInfo.telephone'] && (
          <div className="invalid-feedback">{validationErrors['employeeInfo.telephone']}</div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <h3>Informations professionnelles</h3>
      
      <div className="form-group">
        <label htmlFor="poste_actuel">Poste actuel *</label>
        <input
          type="text"
          id="poste_actuel"
          value={formData.professionalInfo.poste_actuel}
          onChange={(e) => handleInputChange('professionalInfo', 'poste_actuel', e.target.value)}
          className="form-control"
          placeholder="Titre du poste"
        />
        {validationErrors['professionalInfo.poste_actuel'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.poste_actuel']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="type_contrat">Type de contrat *</label>
        <select
          id="type_contrat"
          value={formData.professionalInfo.type_contrat}
          onChange={(e) => handleInputChange('professionalInfo', 'type_contrat', e.target.value)}
          className="form-control"
        >
          <option value="">Sélectionner un type</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Alternance">Alternance</option>
        </select>
        {validationErrors['professionalInfo.type_contrat'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.type_contrat']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date_entree">Date d'entrée *</label>
        <input
          type="date"
          id="date_entree"
          value={formData.professionalInfo.date_entree}
          onChange={(e) => handleInputChange('professionalInfo', 'date_entree', e.target.value)}
          className="form-control"
        />
        {validationErrors['professionalInfo.date_entree'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.date_entree']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="entity">Entité *</label>
        <select
          id="entity"
          value={formData.professionalInfo.entity}
          onChange={(e) => handleInputChange('professionalInfo', 'entity', e.target.value)}
          className="form-control"
        >
          <option value="">Sélectionner une entité</option>
          <option value="Siège">Siège</option>
          <option value="Agence">Agence</option>
          <option value="Filiale">Filiale</option>
        </select>
        {validationErrors['professionalInfo.entity'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.entity']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="departement">Département *</label>
        <input
          type="text"
          id="departement"
          value={formData.professionalInfo.departement}
          onChange={(e) => handleInputChange('professionalInfo', 'departement', e.target.value)}
          className="form-control"
          placeholder="Nom du département"
        />
        {validationErrors['professionalInfo.departement'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.departement']}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="domaine_fonctionnel">Domaine fonctionnel *</label>
        <input
          type="text"
          id="domaine_fonctionnel"
          value={formData.professionalInfo.domaine_fonctionnel}
          onChange={(e) => handleInputChange('professionalInfo', 'domaine_fonctionnel', e.target.value)}
          className="form-control"
          placeholder="Domaine d'expertise"
        />
        {validationErrors['professionalInfo.domaine_fonctionnel'] && (
          <div className="invalid-feedback">{validationErrors['professionalInfo.domaine_fonctionnel']}</div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <h3>Documents requis</h3>
      
      <div className="form-group">
        <label htmlFor="documents">Documents *</label>
        <input
          type="file"
          id="documents"
          multiple
          onChange={handleFileUpload}
          className="form-control"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <small>Formats acceptés: PDF, DOC, DOCX, JPG, JPEG, PNG</small>
        {validationErrors['documents'] && (
          <div className="invalid-feedback">{validationErrors['documents']}</div>
        )}
      </div>

      {formData.documents.length > 0 && (
        <div className="documents-list">
          <h4>Documents sélectionnés:</h4>
          {formData.documents.map((doc, index) => (
            <div key={index} className="document-item">
              <span>{doc.name}</span>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="btn btn-sm btn-danger"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="onboarding-step">
      <h3>Checklist d'intégration</h3>
      
      <div className="checklist-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.checklist.contrat_signature}
            onChange={(e) => handleChecklistChange('contrat_signature', e.target.checked)}
          />
          Contrat signé
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.checklist.documents_verifies}
            onChange={(e) => handleChecklistChange('documents_verifies', e.target.checked)}
          />
          Documents vérifiés
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.checklist.acces_configure}
            onChange={(e) => handleChecklistChange('acces_configure', e.target.checked)}
          />
          Accès configuré
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.checklist.formation_initiale}
            onChange={(e) => handleChecklistChange('formation_initiale', e.target.checked)}
          />
          Formation initiale
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.checklist.presentation_equipe}
            onChange={(e) => handleChecklistChange('presentation_equipe', e.target.checked)}
          />
          Présentation équipe
        </label>
      </div>

      {validationErrors['checklist'] && (
        <div className="invalid-feedback">{validationErrors['checklist']}</div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="onboarding-step">
      <h3>Validation finale</h3>
      
      <div className="summary">
        <h4>Récapitulatif des informations</h4>
        <div className="summary-item">
          <strong>Matricule:</strong> {formData.employeeInfo.matricule}
        </div>
        <div className="summary-item">
          <strong>Nom et prénom:</strong> {formData.employeeInfo.nom_prenom}
        </div>
        <div className="summary-item">
          <strong>Email:</strong> {formData.employeeInfo.email}
        </div>
        <div className="summary-item">
          <strong>Poste:</strong> {formData.professionalInfo.poste_actuel}
        </div>
        <div className="summary-item">
          <strong>Documents:</strong> {formData.documents.length} fichier(s)
        </div>
      </div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle"></i>
        Vérifiez que toutes les informations sont correctes avant de finaliser l'onboarding.
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  if (success) {
    return (
      <div className="onboarding-container">
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <span>Onboarding terminé avec succès ! Redirection en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h2>Onboarding - Nouvel Employé</h2>
        <p>Étape {currentStep} sur {steps.length}</p>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="onboarding-content">
        {renderCurrentStep()}
      </div>

      <div className="onboarding-actions">
        {currentStep > 1 && (
          <button 
            type="button" 
            onClick={handlePrevious}
            className="btn btn-secondary"
            disabled={loading}
          >
            Précédent
          </button>
        )}
        
        {currentStep < steps.length ? (
          <button 
            type="button" 
            onClick={handleNext}
            className="btn btn-primary"
            disabled={loading}
          >
            Suivant
          </button>
        ) : (
          <button 
            type="button" 
            onClick={handleSubmit}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Terminer l\'onboarding'}
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFixed;

