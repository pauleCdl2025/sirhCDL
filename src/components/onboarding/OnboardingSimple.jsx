import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Onboarding.css';

const OnboardingSimple = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    matricule: '',
    nom_prenom: '',
    email: '',
    telephone: '',
    poste_actuel: '',
    type_contrat: '',
    date_entree: '',
    entity: '',
    departement: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Générer un matricule automatique - exécuté une seule fois
  useEffect(() => {
    const generateMatricule = () => {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      return `CDL-${year}-${timestamp}`;
    };

    if (!formData.matricule) {
      setFormData(prev => ({
        ...prev,
        matricule: generateMatricule()
      }));
    }
  }, []); // Dépendances vides = exécuté une seule fois

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur de validation pour ce champ
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateStep = useCallback((step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.nom_prenom || formData.nom_prenom.trim().length < 2) {
          errors.nom_prenom = 'Le nom et prénom sont obligatoires (min 2 caractères)';
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'L\'email est obligatoire et doit être valide';
        }
        if (!formData.telephone || formData.telephone.trim().length < 8) {
          errors.telephone = 'Le numéro de téléphone est obligatoire (min 8 chiffres)';
        }
        break;
      case 2:
        if (!formData.poste_actuel || formData.poste_actuel.trim().length < 2) {
          errors.poste_actuel = 'Le poste actuel est obligatoire (min 2 caractères)';
        }
        if (!formData.type_contrat) {
          errors.type_contrat = 'Le type de contrat est obligatoire';
        }
        if (!formData.date_entree) {
          errors.date_entree = 'La date d\'entrée est obligatoire';
        }
        break;
      case 3:
        if (!formData.entity) {
          errors.entity = 'L\'entité est obligatoire';
        }
        if (!formData.departement) {
          errors.departement = 'Le département est obligatoire';
        }
        break;
      default:
        break;
    }
    
    return errors;
  }, [formData]);

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    setValidationErrors(stepErrors);
    
    if (Object.keys(stepErrors).length === 0 && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors({});
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Validation finale
    const finalErrors = validateStep(currentStep);
    if (Object.keys(finalErrors).length > 0) {
      setValidationErrors(finalErrors);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('/api/employees/onboarding', {
        employeeData: JSON.stringify(formData)
      }, {
        headers: {
          'Content-Type': 'application/json',
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
      setError(err.response?.data?.message || 'Erreur lors de l\'onboarding. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }, [formData, currentStep, validateStep, navigate]);

  const renderStep1 = () => (
    <div className="onboarding-step">
      <h3>Informations personnelles</h3>
      
      <div className="form-group">
        <label htmlFor="matricule">Matricule</label>
        <input
          type="text"
          id="matricule"
          value={formData.matricule}
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
          value={formData.nom_prenom}
          onChange={(e) => handleInputChange('nom_prenom', e.target.value)}
          className="form-control"
          placeholder="Nom et prénom complet"
        />
        {validationErrors.nom_prenom && (
          <div className="invalid-feedback">{validationErrors.nom_prenom}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="form-control"
          placeholder="email@exemple.com"
        />
        {validationErrors.email && (
          <div className="invalid-feedback">{validationErrors.email}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="telephone">Téléphone *</label>
        <input
          type="tel"
          id="telephone"
          value={formData.telephone}
          onChange={(e) => handleInputChange('telephone', e.target.value)}
          className="form-control"
          placeholder="Numéro de téléphone"
        />
        {validationErrors.telephone && (
          <div className="invalid-feedback">{validationErrors.telephone}</div>
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
          value={formData.poste_actuel}
          onChange={(e) => handleInputChange('poste_actuel', e.target.value)}
          className="form-control"
          placeholder="Titre du poste"
        />
        {validationErrors.poste_actuel && (
          <div className="invalid-feedback">{validationErrors.poste_actuel}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="type_contrat">Type de contrat *</label>
        <select
          id="type_contrat"
          value={formData.type_contrat}
          onChange={(e) => handleInputChange('type_contrat', e.target.value)}
          className="form-control"
        >
          <option value="">Sélectionner un type</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Stage">Stage</option>
          <option value="Alternance">Alternance</option>
        </select>
        {validationErrors.type_contrat && (
          <div className="invalid-feedback">{validationErrors.type_contrat}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="date_entree">Date d'entrée *</label>
        <input
          type="date"
          id="date_entree"
          value={formData.date_entree}
          onChange={(e) => handleInputChange('date_entree', e.target.value)}
          className="form-control"
        />
        {validationErrors.date_entree && (
          <div className="invalid-feedback">{validationErrors.date_entree}</div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <h3>Informations organisationnelles</h3>
      
      <div className="form-group">
        <label htmlFor="entity">Entité *</label>
        <select
          id="entity"
          value={formData.entity}
          onChange={(e) => handleInputChange('entity', e.target.value)}
          className="form-control"
        >
          <option value="">Sélectionner une entité</option>
          <option value="Siège">Siège</option>
          <option value="Agence">Agence</option>
          <option value="Filiale">Filiale</option>
        </select>
        {validationErrors.entity && (
          <div className="invalid-feedback">{validationErrors.entity}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="departement">Département *</label>
        <input
          type="text"
          id="departement"
          value={formData.departement}
          onChange={(e) => handleInputChange('departement', e.target.value)}
          className="form-control"
          placeholder="Nom du département"
        />
        {validationErrors.departement && (
          <div className="invalid-feedback">{validationErrors.departement}</div>
        )}
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
        <p>Étape {currentStep} sur 3</p>
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
        
        {currentStep < 3 ? (
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

export default OnboardingSimple;

