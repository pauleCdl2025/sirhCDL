import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverHealthCheck } from '../../utils/serverHealthCheck';
import { retryHandler } from '../../utils/retryHandler';
import ServerDiagnostic from '../common/ServerDiagnostic';
import './Onboarding.css';

const Onboarding = () => {
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
      cnamgs_number: '',
      contact_urgence: '',
      telephone_urgence: ''
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
      specialisation: '',
      type_remuneration: 'Mensuel',
      mode_paiement: 'Virement bancaire',
      periode_essai: '',
      date_fin_essai: '',
      lieu_travail: '',
      horaires_travail: '8h-17h',
      conditions_particulieres: '',
      avantages_sociaux: '',
      date_signature: '',
      notes: ''
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverStatus, setServerStatus] = useState(null);

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
    const generateMatricule = () => {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-4);
      return `CDL-${year}-${timestamp}`;
    };

    // Générer le matricule seulement si il n'existe pas déjà
    if (!formData.employeeInfo.matricule) {
      const newMatricule = generateMatricule();
      setFormData(prev => ({
        ...prev,
        employeeInfo: {
          ...prev.employeeInfo,
          matricule: newMatricule
        }
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuté une seule fois au montage pour générer le matricule

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
    // Retry count reset (réservé pour usage futur)
    
    // Validation finale avant soumission
    const finalErrors = validateFormData();
    if (Object.keys(finalErrors).length > 0) {
      setValidationErrors(finalErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Diagnostic du serveur avant soumission
      console.log('🔍 Vérification de la santé du serveur...');
      const diagnostic = await serverHealthCheck.runFullDiagnostic();
      setServerStatus(diagnostic);
      
      if (diagnostic.network.status === 'disconnected') {
        throw new Error('Aucune connexion réseau détectée. Vérifiez votre connexion internet.');
      }
      
      if (diagnostic.server.status === 'unhealthy') {
        throw new Error('Le serveur est temporairement indisponible. Veuillez réessayer plus tard.');
      }
      
      // Si le serveur est accessible mais nécessite une authentification, c'est normal
      if (diagnostic.server.status === 'healthy' && diagnostic.server.note) {
        console.log('Serveur accessible:', diagnostic.server.note);
      }
      
      console.log('✅ Serveur prêt, démarrage de l\'onboarding...');
      
      // Utiliser le retry handler pour l'onboarding
      const response = await retryHandler.onboardingWithRetry(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      );

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
      
      // Gestion spécifique des erreurs de timeout et retry
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('⏰ Le serveur prend trop de temps à répondre. Cela peut être dû à la taille des fichiers. Veuillez réessayer ou réduire la taille des documents.');
      } else if (err.response?.status === 504) {
        setError('🚨 Erreur de gateway timeout. Le serveur est temporairement indisponible. Veuillez réessayer dans quelques minutes.');
      } else if (err.message.includes('connexion réseau')) {
        setError('🌐 Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.');
      } else if (err.message.includes('serveur est temporairement indisponible')) {
        setError('🔧 Le serveur est temporairement indisponible. Veuillez réessayer dans quelques minutes.');
      } else if (err.response?.data?.errors) {
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
        setError(err.response?.data?.message || '❌ Erreur lors de l\'onboarding. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [formData, validateFormData, navigate]);

  const renderStep1 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-user"></i> Informations personnelles</h3>
        <p>Renseignez les informations de base du nouvel employé</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="matricule">Matricule *</label>
          <input
            type="text"
            id="matricule"
            value={formData.employeeInfo.matricule}
            onChange={(e) => handleInputChange('employeeInfo', 'matricule', e.target.value)}
            required
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
            required
            placeholder="Nom et prénom complet"
            className="form-control"
          />
          {validationErrors['employeeInfo.nom_prenom'] && (
            <div className="invalid-feedback">{validationErrors['employeeInfo.nom_prenom']}</div>
          )}
        </div>

        <div className="form-group">
          <label>Genre *</label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="genre"
                value="Homme"
                checked={formData.employeeInfo.genre === 'Homme'}
                onChange={(e) => handleInputChange('employeeInfo', 'genre', e.target.value)}
              />
              <span>Homme</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="genre"
                value="Femme"
                checked={formData.employeeInfo.genre === 'Femme'}
                onChange={(e) => handleInputChange('employeeInfo', 'genre', e.target.value)}
              />
              <span>Femme</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date_naissance">Date de naissance *</label>
          <input
            type="date"
            id="date_naissance"
            value={formData.employeeInfo.date_naissance}
            onChange={(e) => handleInputChange('employeeInfo', 'date_naissance', e.target.value)}
            required
            className="form-control"
          />
          {validationErrors['employeeInfo.date_naissance'] && (
            <div className="invalid-feedback">{validationErrors['employeeInfo.date_naissance']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lieu_naissance">Lieu de naissance</label>
          <input
            type="text"
            id="lieu_naissance"
            value={formData.employeeInfo.lieu_naissance}
            onChange={(e) => handleInputChange('employeeInfo', 'lieu_naissance', e.target.value)}
            placeholder="Ville, pays"
            className="form-control"
          />
          {validationErrors['employeeInfo.lieu_naissance'] && (
            <div className="invalid-feedback">{validationErrors['employeeInfo.lieu_naissance']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="nationalite">Nationalité</label>
          <select
            id="nationalite"
            value={formData.employeeInfo.nationalite}
            onChange={(e) => handleInputChange('employeeInfo', 'nationalite', e.target.value)}
            className="form-control"
          >
            <option value="Gabon">Gabon</option>
            <option value="Cameroun">Cameroun</option>
            <option value="Congo">Congo</option>
            <option value="RDC">RDC</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="situation_maritale">Situation maritale</label>
          <select
            id="situation_maritale"
            value={formData.employeeInfo.situation_maritale}
            onChange={(e) => handleInputChange('employeeInfo', 'situation_maritale', e.target.value)}
            className="form-control"
          >
            <option value="Célibataire">Célibataire</option>
            <option value="Marié(e)">Marié(e)</option>
            <option value="Divorcé(e)">Divorcé(e)</option>
            <option value="Veuf/Veuve">Veuf/Veuve</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="nbr_enfants">Nombre d'enfants</label>
          <input
            type="number"
            id="nbr_enfants"
            value={formData.employeeInfo.nbr_enfants}
            onChange={(e) => handleInputChange('employeeInfo', 'nbr_enfants', parseInt(e.target.value) || 0)}
            min="0"
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="adresse">Adresse complète</label>
          <textarea
            id="adresse"
            value={formData.employeeInfo.adresse}
            onChange={(e) => handleInputChange('employeeInfo', 'adresse', e.target.value)}
            placeholder="Adresse complète"
            rows="3"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone *</label>
          <input
            type="tel"
            id="telephone"
            value={formData.employeeInfo.telephone}
            onChange={(e) => handleInputChange('employeeInfo', 'telephone', e.target.value)}
            required
            placeholder="+241 XX XX XX XX"
            className="form-control"
          />
          {validationErrors['employeeInfo.telephone'] && (
            <div className="invalid-feedback">{validationErrors['employeeInfo.telephone']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={formData.employeeInfo.email}
            onChange={(e) => handleInputChange('employeeInfo', 'email', e.target.value)}
            required
            placeholder="email@exemple.com"
            className="form-control"
          />
          {validationErrors['employeeInfo.email'] && (
            <div className="invalid-feedback">{validationErrors['employeeInfo.email']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cnss_number">Numéro CNSS</label>
          <input
            type="text"
            id="cnss_number"
            value={formData.employeeInfo.cnss_number}
            onChange={(e) => handleInputChange('employeeInfo', 'cnss_number', e.target.value)}
            placeholder="Numéro CNSS"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cnamgs_number">Numéro CNAMGS</label>
          <input
            type="text"
            id="cnamgs_number"
            value={formData.employeeInfo.cnamgs_number}
            onChange={(e) => handleInputChange('employeeInfo', 'cnamgs_number', e.target.value)}
            placeholder="Numéro CNAMGS"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_urgence">Contact d'urgence</label>
          <input
            type="text"
            id="contact_urgence"
            value={formData.employeeInfo.contact_urgence}
            onChange={(e) => handleInputChange('employeeInfo', 'contact_urgence', e.target.value)}
            placeholder="Nom et prénom du contact"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone_urgence">Téléphone d'urgence</label>
          <input
            type="tel"
            id="telephone_urgence"
            value={formData.employeeInfo.telephone_urgence}
            onChange={(e) => handleInputChange('employeeInfo', 'telephone_urgence', e.target.value)}
            placeholder="+241 XX XX XX XX"
            className="form-control"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-briefcase"></i> Informations professionnelles</h3>
        <p>Détails du poste, du contrat et de la rémunération</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="poste_actuel">Poste actuel *</label>
          <input
            type="text"
            id="poste_actuel"
            value={formData.professionalInfo.poste_actuel}
            onChange={(e) => handleInputChange('professionalInfo', 'poste_actuel', e.target.value)}
            required
            placeholder="Intitulé du poste"
            className="form-control"
          />
          {validationErrors['professionalInfo.poste_actuel'] && (
            <div className="invalid-feedback">{validationErrors['professionalInfo.poste_actuel']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="domaine_fonctionnel">Domaine fonctionnel</label>
          <select
            id="domaine_fonctionnel"
            value={formData.professionalInfo.domaine_fonctionnel}
            onChange={(e) => handleInputChange('professionalInfo', 'domaine_fonctionnel', e.target.value)}
            className="form-control"
          >
            <option value="">Sélectionner un domaine</option>
            <option value="Clinique">Clinique</option>
            <option value="Accueil/Facturation">Accueil/Facturation</option>
            <option value="Laboratoire">Laboratoire</option>
            <option value="Informatique">Informatique</option>
            <option value="Administration">Administration</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="RH">Ressources Humaines</option>
            <option value="Autre">Autre</option>
          </select>
          {validationErrors['professionalInfo.domaine_fonctionnel'] && (
            <div className="invalid-feedback">{validationErrors['professionalInfo.domaine_fonctionnel']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="entity">Entité</label>
          <select
            id="entity"
            value={formData.professionalInfo.entity}
            onChange={(e) => handleInputChange('professionalInfo', 'entity', e.target.value)}
            className="form-control"
          >
            <option value="">Sélectionner une entité</option>
            <option value="CDL">Centre Diagnostic</option>
            <option value="Optikah">Optikah</option>
            <option value="Centre Wellness">Centre Wellness</option>
            <option value="Café Walhya">Café Walhya</option>
          </select>
          {validationErrors['professionalInfo.entity'] && (
            <div className="invalid-feedback">{validationErrors['professionalInfo.entity']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="departement">Département</label>
          <input
            type="text"
            id="departement"
            value={formData.professionalInfo.departement}
            onChange={(e) => handleInputChange('professionalInfo', 'departement', e.target.value)}
            placeholder="Ex: IT, RH, Finance"
            className="form-control"
          />
          {validationErrors['professionalInfo.departement'] && (
            <div className="invalid-feedback">{validationErrors['professionalInfo.departement']}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="type_contrat">Type de contrat *</label>
          <select
            id="type_contrat"
            value={formData.professionalInfo.type_contrat}
            onChange={(e) => handleInputChange('professionalInfo', 'type_contrat', e.target.value)}
            required
            className="form-control"
          >
            <option value="">Sélectionner un type</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Prestataire">Prestataire</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
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
            required
            className="form-control"
          />
          {validationErrors['professionalInfo.date_entree'] && (
            <div className="invalid-feedback">{validationErrors['professionalInfo.date_entree']}</div>
          )}
        </div>

        {formData.professionalInfo.type_contrat !== 'CDI' && (
          <div className="form-group">
            <label htmlFor="date_fin_contrat">Date de fin de contrat</label>
            <input
              type="date"
              id="date_fin_contrat"
              value={formData.professionalInfo.date_fin_contrat}
              onChange={(e) => handleInputChange('professionalInfo', 'date_fin_contrat', e.target.value)}
              className="form-control"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="salaire_base">Salaire de base</label>
          <input
            type="number"
            id="salaire_base"
            value={formData.professionalInfo.salaire_base}
            onChange={(e) => handleInputChange('professionalInfo', 'salaire_base', e.target.value)}
            placeholder="Montant en FCFA"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categorie">Catégorie</label>
          <select
            id="categorie"
            value={formData.professionalInfo.categorie}
            onChange={(e) => handleInputChange('professionalInfo', 'categorie', e.target.value)}
            className="form-control"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Cadre">Cadre</option>
            <option value="Agent de maîtrise">Agent de maîtrise</option>
            <option value="Employé">Employé</option>
            <option value="Ouvrier">Ouvrier</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="responsable">Responsable hiérarchique</label>
          <input
            type="text"
            id="responsable"
            value={formData.professionalInfo.responsable}
            onChange={(e) => handleInputChange('professionalInfo', 'responsable', e.target.value)}
            placeholder="Nom du responsable"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="niveau_etude">Niveau d'étude</label>
          <select
            id="niveau_etude"
            value={formData.professionalInfo.niveau_etude}
            onChange={(e) => handleInputChange('professionalInfo', 'niveau_etude', e.target.value)}
            className="form-control"
          >
            <option value="">Sélectionner un niveau</option>
            <option value="Bac">Bac</option>
            <option value="Bac+2">Bac+2</option>
            <option value="Bac+3">Bac+3</option>
            <option value="Bac+4">Bac+4</option>
            <option value="Bac+5">Bac+5</option>
            <option value="Bac+8">Bac+8</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="specialisation">Spécialisation</label>
          <input
            type="text"
            id="specialisation"
            value={formData.professionalInfo.specialisation}
            onChange={(e) => handleInputChange('professionalInfo', 'specialisation', e.target.value)}
            placeholder="Domaine de spécialisation"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="salaire_propose">Salaire proposé (optionnel)</label>
          <input
            type="number"
            id="salaire_propose"
            value={formData.professionalInfo.salaire_propose}
            onChange={(e) => handleInputChange('professionalInfo', 'salaire_propose', e.target.value)}
            placeholder="Montant en FCFA"
            min="0"
            step="1000"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="source_recrutement">Source de recrutement</label>
          <select
            id="source_recrutement"
            value={formData.professionalInfo.source_recrutement}
            onChange={(e) => handleInputChange('professionalInfo', 'source_recrutement', e.target.value)}
            className="form-control"
          >
            <option value="">Sélectionner une source</option>
            <option value="Onboarding direct">Onboarding direct</option>
            <option value="Candidature spontanée">Candidature spontanée</option>
            <option value="Recrutement externe">Recrutement externe</option>
            <option value="Promotion interne">Promotion interne</option>
            <option value="Recommandation">Recommandation</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="type_remuneration">Type de rémunération</label>
          <select
            id="type_remuneration"
            value={formData.professionalInfo.type_remuneration}
            onChange={(e) => handleInputChange('professionalInfo', 'type_remuneration', e.target.value)}
            className="form-control"
          >
            <option value="Mensuel">Mensuel</option>
            <option value="Horaire">Horaire</option>
            <option value="Journalier">Journalier</option>
            <option value="Forfaitaire">Forfaitaire</option>
            <option value="Commission">Commission</option>
            <option value="Mixte">Mixte</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="mode_paiement">Mode de paiement</label>
          <select
            id="mode_paiement"
            value={formData.professionalInfo.mode_paiement}
            onChange={(e) => handleInputChange('professionalInfo', 'mode_paiement', e.target.value)}
            className="form-control"
          >
            <option value="Virement bancaire">Virement bancaire</option>
            <option value="Chèque">Chèque</option>
            <option value="Espèces">Espèces</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="periode_essai">Période d'essai (jours)</label>
          <input
            type="number"
            id="periode_essai"
            value={formData.professionalInfo.periode_essai}
            onChange={(e) => handleInputChange('professionalInfo', 'periode_essai', e.target.value)}
            placeholder="Ex: 90"
            min="0"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_fin_essai">Date de fin de période d'essai</label>
          <input
            type="date"
            id="date_fin_essai"
            value={formData.professionalInfo.date_fin_essai}
            onChange={(e) => handleInputChange('professionalInfo', 'date_fin_essai', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="lieu_travail">Lieu de travail</label>
          <input
            type="text"
            id="lieu_travail"
            value={formData.professionalInfo.lieu_travail}
            onChange={(e) => handleInputChange('professionalInfo', 'lieu_travail', e.target.value)}
            placeholder="Ex: CDL Libreville"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="horaires_travail">Horaires de travail</label>
          <input
            type="text"
            id="horaires_travail"
            value={formData.professionalInfo.horaires_travail}
            onChange={(e) => handleInputChange('professionalInfo', 'horaires_travail', e.target.value)}
            placeholder="Ex: 8h-17h"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date_signature">Date de signature du contrat</label>
          <input
            type="date"
            id="date_signature"
            value={formData.professionalInfo.date_signature}
            onChange={(e) => handleInputChange('professionalInfo', 'date_signature', e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="conditions_particulieres">Conditions particulières</label>
          <textarea
            id="conditions_particulieres"
            value={formData.professionalInfo.conditions_particulieres}
            onChange={(e) => handleInputChange('professionalInfo', 'conditions_particulieres', e.target.value)}
            placeholder="Conditions particulières du contrat..."
            rows="3"
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="avantages_sociaux">Avantages sociaux</label>
          <textarea
            id="avantages_sociaux"
            value={formData.professionalInfo.avantages_sociaux}
            onChange={(e) => handleInputChange('professionalInfo', 'avantages_sociaux', e.target.value)}
            placeholder="Avantages sociaux inclus..."
            rows="3"
            className="form-control"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Notes additionnelles</label>
          <textarea
            id="notes"
            value={formData.professionalInfo.notes}
            onChange={(e) => handleInputChange('professionalInfo', 'notes', e.target.value)}
            placeholder="Notes additionnelles sur le contrat..."
            rows="3"
            className="form-control"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-file-upload"></i> Documents requis</h3>
        <p>Téléchargez les documents nécessaires pour l'intégration</p>
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
          <h4>Documents obligatoires</h4>
          <ul>
            <li><i className="fas fa-check"></i> CV/Resume</li>
            <li><i className="fas fa-check"></i> Lettre de motivation</li>
            <li><i className="fas fa-check"></i> Copie de la carte d'identité</li>
            <li><i className="fas fa-check"></i> Diplômes et certificats</li>
            <li><i className="fas fa-check"></i> Attestation de travail (si applicable)</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-tasks"></i> Checklist d'intégration</h3>
        <p>Cochez les éléments qui ont été réalisés</p>
      </div>
      
      <div className="checklist-section">
        <div className="checklist-grid">
          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.contrat_signature}
              onChange={(e) => handleChecklistChange('contrat_signature', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Signature du contrat</h4>
              <p>Contrat de travail signé par les deux parties</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.documents_verifies}
              onChange={(e) => handleChecklistChange('documents_verifies', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Vérification des documents</h4>
              <p>Tous les documents requis ont été vérifiés</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.acces_configure}
              onChange={(e) => handleChecklistChange('acces_configure', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Configuration des accès</h4>
              <p>Accès informatique, badges et clés configurés</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.formation_initiale}
              onChange={(e) => handleChecklistChange('formation_initiale', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Formation initiale</h4>
              <p>Formation sur les procédures et outils</p>
            </div>
          </label>

          <label className="checklist-item">
            <input
              type="checkbox"
              checked={formData.checklist.presentation_equipe}
              onChange={(e) => handleChecklistChange('presentation_equipe', e.target.checked)}
            />
            <span className="checkmark"></span>
            <div className="checklist-content">
              <h4>Présentation à l'équipe</h4>
              <p>Présentation officielle au sein de l'équipe</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <h3><i className="fas fa-check-circle"></i> Validation finale</h3>
        <p>Vérifiez toutes les informations avant finalisation</p>
      </div>
      
      <div className="summary-section">
        <div className="summary-grid">
          <div className="summary-card">
            <h4><i className="fas fa-user"></i> Informations personnelles</h4>
            <div className="summary-content">
              <p><strong>Matricule:</strong> {formData.employeeInfo.matricule}</p>
              <p><strong>Nom:</strong> {formData.employeeInfo.nom_prenom}</p>
              <p><strong>Email:</strong> {formData.employeeInfo.email}</p>
              <p><strong>Téléphone:</strong> {formData.employeeInfo.telephone}</p>
              <p><strong>Contact d'urgence:</strong> {formData.employeeInfo.contact_urgence || 'Non renseigné'}</p>
              <p><strong>Téléphone d'urgence:</strong> {formData.employeeInfo.telephone_urgence || 'Non renseigné'}</p>
            </div>
          </div>

          <div className="summary-card">
            <h4><i className="fas fa-briefcase"></i> Informations professionnelles</h4>
            <div className="summary-content">
              <p><strong>Poste:</strong> {formData.professionalInfo.poste_actuel}</p>
              <p><strong>Type de contrat:</strong> {formData.professionalInfo.type_contrat}</p>
              <p><strong>Date d'entrée:</strong> {formData.professionalInfo.date_entree}</p>
              <p><strong>Entité:</strong> {formData.professionalInfo.entity}</p>
              <p><strong>Département:</strong> {formData.professionalInfo.departement}</p>
              <p><strong>Type de rémunération:</strong> {formData.professionalInfo.type_remuneration}</p>
              <p><strong>Mode de paiement:</strong> {formData.professionalInfo.mode_paiement}</p>
              <p><strong>Lieu de travail:</strong> {formData.professionalInfo.lieu_travail || 'Non renseigné'}</p>
              <p><strong>Horaires:</strong> {formData.professionalInfo.horaires_travail}</p>
              <p><strong>Période d'essai:</strong> {formData.professionalInfo.periode_essai ? `${formData.professionalInfo.periode_essai} jours` : 'Non renseignée'}</p>
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
                <i className="fas fa-check"></i> Finaliser l'onboarding
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
      <div className="onboarding-success">
        <div className="success-content">
          <i className="fas fa-check-circle"></i>
          <h2>Onboarding terminé avec succès !</h2>
          <p>L'employé a été intégré avec succès dans le système.</p>
          <p>Redirection vers la liste des employés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1><i className="fas fa-user-plus"></i> Processus d'Onboarding</h1>
        <p>Intégration d'un nouvel employé dans l'organisation</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {loading && uploadProgress > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="progress-text">Envoi en cours... {uploadProgress}%</p>
        </div>
      )}

      {serverStatus && (
        <ServerDiagnostic 
          diagnostic={serverStatus}
          onRetry={async () => {
            const newDiagnostic = await serverHealthCheck.runFullDiagnostic();
            setServerStatus(newDiagnostic);
          }}
        />
      )}

      <div className="onboarding-progress">
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

      <div className="onboarding-content">
        {renderCurrentStep()}
      </div>

      {currentStep < 5 && (
        <div className="onboarding-navigation">
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

export default Onboarding;

