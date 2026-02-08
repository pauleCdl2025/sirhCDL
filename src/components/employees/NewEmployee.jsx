import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import '../../styles/Forms.css';
import '../../styles/Tables.css';
import '../../styles/PhotoUpload.css';

const NewEmployee = () => {
    const navigate = useNavigate();
    const [showAdvancedPayment, setShowAdvancedPayment] = useState(false);
    const [documents, setDocuments] = useState([
        { type: '', file: null }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Ajoutez cette fonction de calcul du total de rémunération dans votre composant
    const calculateTotalRemuneration = () => {
        const compensationFields = [
            'salaire_base', 'sursalaire', 'prime_responsabilite', 
            'transport', 'logement', 'prime_assiduite', 'primes_diverses', 
            'panier', 'prime_ca', 'ind_caisse', 'ind_domesticite', 
            'ind_eau_electricite', 'ind_voiture', 'prime_salissure', 
            'honoraires', 'ind_stage'
        ];

        return compensationFields.reduce((total, field) => {
            return total + (parseFloat(employeeData[field] || 0));
        }, 0);
    };

    const [employeeData, setEmployeeData] = useState({
        // Informations générales
        genre: 'Homme',
        noms: '',
        situation_maritale: 'Célibataire',
        nbr_enfants: 0,
        date_naissance: '',
        age: '',
        lieu: '',

        // Coordonnées
        adresse: '',
        telephone: '',
        email: '',
        cnss_number: '',
        cnamgs_number: '',

        // Informations professionnelles
        domaine_fonctionnel: '',
        entity: '',
        departement: '',
        date_embauche: '',
        poste_actuel: '',
        attachement_hierarchique: '',
        type_contrat: '',
        categorie: '',
        date_fin_contrat: '',
        statut_local_expat: '',
        pays: 'Gabon',
        niveau_academique: '',
        diplome: '',
        anciennete_entreprise: '0 ans 0 mois',

        // Informations de retraite
        admission_retraite_dans: '',
        date_depart_retraite: '',

        // Rémunération
        pay: 'Salaire',
        payment_mode: '',
        categorie_convention: '',
        salaire_base: 0,
        sursalaire: 0,
        prime_responsabilite: 0,
        transport: 35000,
        logement: 0,

        // Éléments de rémunération avancés
        prime_assiduite: 0,
        primes_diverses: 0,
        panier: 0,
        prime_ca: 0,
        ind_caisse: 0,
        ind_domesticite: 0,
        ind_eau_electricite: 0,
        ind_voiture: 0,
        prime_salissure: 0,
        honoraires: 0,
        ind_stage: 0
    });

    // Calculer l'âge et la date de retraite
    useEffect(() => {
        if (employeeData.date_naissance) {
            const birthDate = new Date(employeeData.date_naissance);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Calculer la date de retraite (60 ans)
            const retirementDate = new Date(birthDate);
            retirementDate.setFullYear(birthDate.getFullYear() + 60);

            setEmployeeData(prev => ({
                ...prev,
                age: age.toString(),
                admission_retraite_dans: `${60 - age} ans`,
                date_depart_retraite: retirementDate.toISOString().split('T')[0]
            }));
        }
    }, [employeeData.date_naissance]);

    // Gérer les changements de date d'embauche pour l'ancienneté
    useEffect(() => {
        if (employeeData.date_embauche) {
            const hireDate = new Date(employeeData.date_embauche);
            const today = new Date();

            const years = today.getFullYear() - hireDate.getFullYear();
            let months = today.getMonth() - hireDate.getMonth();

            if (months < 0) {
                months += 12;
            }

            setEmployeeData(prev => ({
                ...prev,
                anciennete_entreprise: `${years} ans ${months} mois`
            }));
        }
    }, [employeeData.date_embauche]);

    // Gérer les changements de formulaire
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Vérifier la taille du fichier (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError('La photo ne doit pas dépasser 5MB');
                return;
            }

            // Vérifier le type de fichier
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Seules les images sont autorisées (JPEG, JPG, PNG, GIF, WebP)');
                return;
            }

            setPhoto(file);
            
            // Créer une prévisualisation
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
            
            // Effacer les erreurs précédentes
            setError(null);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    // Ajouter un document
    const handleAddDocument = () => {
        setDocuments([...documents, { type: '', file: null }]);
    };

    // Modifier un document
    const handleDocumentChange = (index, field, value) => {
        const newDocuments = [...documents];
        newDocuments[index][field] = value;
        setDocuments(newDocuments);
    };

    // Supprimer un document
    const handleRemoveDocument = (index) => {
        const newDocuments = documents.filter((_, i) => i !== index);
        setDocuments(newDocuments);
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Créer un FormData pour inclure les documents
        const formData = new FormData();

        // Ajouter les données de l'employé
        Object.keys(employeeData).forEach(key => {
            if (employeeData[key] !== null && employeeData[key] !== undefined) {
                formData.append(key, employeeData[key]);
            }
        });

        // Ajouter les documents
        documents.forEach((doc, index) => {
            if (doc.file) {
                formData.append('documents', doc.file);
                formData.append('document_types', doc.type);
            }
        });

        // Ajouter la photo si elle existe
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            console.log('Envoi des données...', formData);
            const response = await employeeService.createEmployee(formData);

            if (response.success) {
                // Rediriger ou afficher un message de succès
                alert('Employé créé avec succès !');
                navigate('/employees');
            } else {
                // Gérer l'erreur
                setError(response.message || 'Une erreur est survenue lors de la création de l\'employé');
            }
        } catch (error) {
            console.error('Erreur lors de la création de l\'employé:', error);
            setError('Une erreur est survenue lors de la création de l\'employé');
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="layout-container">
          <div className="page-content">
              <div className="page-title-wrapper">
                  <h1 className="page-title">Ajout d'un nouvel employé</h1>
                  <p className="page-subtitle">Créez un nouveau profil d'employé en complétant les informations ci-dessous</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
              )}

              <div className="form-container">
                  <form onSubmit={handleSubmit}>
                      {/* Informations générales */}
                      <h3 className="form-section-title">Informations générales</h3>

                      <div className="form-group">
                          <label className="form-label">Genre</label>
                          <div className="inline-group">
                              <div className="form-check form-check-inline">
                                  <input 
                                      className="form-check-input" 
                                      type="radio" 
                                      id="genre-homme" 
                                      name="genre" 
                                      value="Homme" 
                                      checked={employeeData.genre === 'Homme'}
                                      onChange={handleInputChange}
                                  />
                                  <label className="form-check-label" htmlFor="genre-homme">Homme</label>
                              </div>
                              <div className="form-check form-check-inline">
                                  <input 
                                      className="form-check-input" 
                                      type="radio" 
                                      id="genre-femme" 
                                      name="genre" 
                                      value="Femme"
                                      checked={employeeData.genre === 'Femme'}
                                      onChange={handleInputChange}
                                  />
                                  <label className="form-check-label" htmlFor="genre-femme">Femme</label>
                              </div>
                          </div>
                      </div>

                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="noms">Nom prénom</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="noms" 
                                  name="noms"
                                  value={employeeData.noms}
                                  onChange={handleInputChange}
                                  required 
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="situation_maritale">Situation maritale</label>
                              <select 
                                  className="form-select" 
                                  id="situation_maritale" 
                                  name="situation_maritale"
                                  value={employeeData.situation_maritale}
                                  onChange={handleInputChange}
                              >
                                  <option value="Célibataire">Célibataire</option>
                                  <option value="Marié">Marié(e)</option>
                                  <option value="Divorcé">Divorcé(e)</option>
                                  <option value="Veuf">Veuf(ve)</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="nbr_enfants">Nombre d'enfants</label>
                              <input 
                                  type="number" 
                                  className="form-control" 
                                  id="nbr_enfants" 
                                  name="nbr_enfants"
                                  value={employeeData.nbr_enfants}
                                  onChange={handleInputChange}
                                  min="0" 
                              />
                          </div>
                      </div>

                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="date_naissance">Date de naissance</label>
                              <input 
                                  type="date" 
                                  className="form-control" 
                                  id="date_naissance" 
                                  name="date_naissance"
                                  value={employeeData.date_naissance}
                                  onChange={handleInputChange}
                                  required 
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="age">Âge</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="age" 
                                  name="age"
                                  value={employeeData.age}
                                  readOnly 
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="lieu">Lieu</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="lieu" 
                                  name="lieu"
                                  value={employeeData.lieu}
                                  onChange={handleInputChange}
                                  required 
                              />
                          </div>
                      </div>

                      {/* Section Photo de profil */}
                      <h3 className="form-section-title mt-5">Photo de profil</h3>
                      
                      <div className="form-group">
                          <label className="form-label">Photo de l'employé</label>
                          <div className="photo-upload-container">
                              <div className="photo-upload-area">
                                  <input 
                                      type="file" 
                                      id="photo" 
                                      name="photo"
                                      accept="image/*"
                                      onChange={handlePhotoChange}
                                      className="photo-input"
                                  />
                                  <label htmlFor="photo" className="photo-upload-label">
                                      <i className="fas fa-camera"></i>
                                      <span>Cliquez pour sélectionner une photo</span>
                                      <small>Formats acceptés: JPEG, PNG, GIF, WebP (max 5MB)</small>
                                  </label>
                              </div>
                              
                              {photoPreview && (
                                  <div className="photo-preview">
                                      <img src={photoPreview} alt="Aperçu" className="preview-image" />
                                      <button 
                                          type="button" 
                                          className="btn btn-sm btn-danger remove-photo-btn"
                                          onClick={removePhoto}
                                      >
                                          <i className="fas fa-times"></i> Supprimer
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Informations professionnelles */}
                      <h3 className="form-section-title mt-5">Informations professionnelles</h3>

                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="domaine_fonctionnel">Domaine fonctionnel</label>
                              <select 
                                  className="form-select" 
                                  id="domaine_fonctionnel" 
                                  name="domaine_fonctionnel"
                                  value={employeeData.domaine_fonctionnel}
                                  onChange={handleInputChange}
                                  required
                              >
                                  <option value="">Sélectionner un domaine</option>
                                  <option value="Clinique">Clinique</option>
                                  <option value="Accueil/Facturation">Accueil/Facturation</option>
                                  <option value="Laboratoire">Laboratoire</option>
                                  <option value="Informatique">Informatique</option>
                                  <option value="Autre">Autre</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="entity">Entité</label>
                              <select 
                                  className="form-select" 
                                  id="entity" 
                                  name="entity"
                                  value={employeeData.entity}
                                  onChange={handleInputChange}
                                  required
                              >
                                  <option value="">Sélectionner une entité</option>
                                  <option value="CDL">Centre Diagnostic</option>
                                  <option value="Optikah">Optikah</option>
                                  <option value="Centre Wellness">Centre Wellness</option>
                                  <option value="Café Walhya">Café Walhya</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="departement">Département</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="departement" 
                                  name="departement"
                                  value={employeeData.departement}
                                  onChange={handleInputChange}
                                  placeholder="Ex: IT, RH, Finance"
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="date_embauche">Date d'embauche</label>
                              <input 
                                  type="date" 
                                  className="form-control" 
                                  id="date_embauche" 
                                  name="date_embauche"
                                  value={employeeData.date_embauche}
                                  onChange={handleInputChange}
                                  required 
                              />
                          </div>
                      </div>

                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="poste_actuel">Poste actuel</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="poste_actuel" 
                                  name="poste_actuel"
                                  value={employeeData.poste_actuel}
                                  onChange={handleInputChange}
                                  required 
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="type_contrat">Type de contrat</label>
                              <select 
                                  className="form-select" 
                                  id="type_contrat" 
                                  name="type_contrat"
                                  value={employeeData.type_contrat}
                                  onChange={handleInputChange}
                                  required
                              >
                                  <option value="">Sélectionner un type</option>
                                  <option value="CDI">CDI</option>
                                  <option value="CDD">CDD</option>
                                  <option value="Prestataire">Prestataire</option>
                                  <option value="Stage">Stage</option>
                              </select>
                          </div>

                          {employeeData.type_contrat !== 'CDI' && (
                              <div className="form-group">
                                  <label className="form-label" htmlFor="date_fin_contrat">Date de fin de contrat</label>
                                  <input 
                                      type="date" 
                                      className="form-control" 
                                      id="date_fin_contrat" 
                                      name="date_fin_contrat"
                                      value={employeeData.date_fin_contrat || ''}
                                      onChange={handleInputChange}
                                      required={employeeData.type_contrat !== 'CDI'}
                                  />
                              </div>
                          )}
                      </div>

                      {/* Informations personnelles supplémentaires */}
                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="adresse">Adresse</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="adresse" 
                                  name="adresse"
                                  value={employeeData.adresse}
                                  onChange={handleInputChange}
                                  placeholder="Adresse complète"
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="telephone">Numéro de téléphone</label>
                              <input 
                                  type="tel" 
                                  className="form-control" 
                                  id="telephone" 
                                  name="telephone"
                                  value={employeeData.telephone}
                                  onChange={handleInputChange}
                                  placeholder="+241 XX XX XX XX"
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="email">Email</label>
                              <input 
                                  type="email" 
                                  className="form-control" 
                                  id="email" 
                                  name="email"
                                  value={employeeData.email}
                                  onChange={handleInputChange}
                                  placeholder="email@exemple.com"
                              />
                          </div>
                      </div>

                      {/* Informations complémentaires */}
                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="cnss_number">Numéro CNSS</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="cnss_number" 
                                  name="cnss_number"
                                  value={employeeData.cnss_number}
                                  onChange={handleInputChange}
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="cnamgs_number">Numéro CNAMGS</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="cnamgs_number" 
                                  name="cnamgs_number"
                                  value={employeeData.cnamgs_number}
                                  onChange={handleInputChange}
                              />
                          </div>
                      </div>

                      {/* Informations de catégorisation */}
                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="statut_local_expat">Type d'employé</label>
                              <select 
                                  className="form-select" 
                                  id="statut_local_expat" 
                                  name="statut_local_expat"
                                  value={employeeData.statut_local_expat}
                                  onChange={handleInputChange}
                                  required
                              >
                                  <option value="">Sélectionner un type</option>
                                  <option value="Local">Local</option>
                                  <option value="expatrié">Expatrié</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="pays">Pays d'origine</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="pays" 
                                  name="pays"
                                  value={employeeData.pays}
                                  onChange={handleInputChange}
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="niveau_academique">Niveau académique</label>
                              <select 
                                  className="form-select" 
                                  id="niveau_academique" 
                                  name="niveau_academique"
                                  value={employeeData.niveau_academique}
                                  onChange={handleInputChange}
                              >
                                  <option value="">Sélectionner un niveau</option>
                                  <option value="Niveau élémentaire">Niveau élémentaire</option>
                                  <option value="Niveau Bac">Niveau Bac</option>
                                  <option value="Bac+2/3">Bac+2/3</option>
                                  <option value="Bac+3/4">Bac+3/4</option>
                                  <option value="Bac+4/5 - Ingénieur-Master">Bac+4/5 - Ingénieur/Master</option>
                                  <option value="Doctorat">Doctorat</option>
                              </select>
                          </div>
                      </div>

                      {/* Informations de spécialisation et ancienneté */}
                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="diplome">Diplôme/Formation</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="diplome" 
                                  name="diplome"
                                  value={employeeData.diplome}
                                  onChange={handleInputChange}
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="anciennete_entreprise">Ancienneté</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="anciennete_entreprise" 
                                  name="anciennete_entreprise"
                                  value={employeeData.anciennete_entreprise}
                                  readOnly
                              />
                          </div>
                      </div>

                      {/* Informations de retraite */}
                      <div className="form-group-row">
                          <div className="form-group">
                              <label className="form-label" htmlFor="admission_retraite_dans">Départ à la retraite dans</label>
                              <input 
                                  type="text" 
                                  className="form-control" 
                                  id="admission_retraite_dans" 
                                  name="admission_retraite_dans"
                                  value={employeeData.admission_retraite_dans}
                                  readOnly
                              />
                          </div>

                          <div className="form-group">
                              <label className="form-label" htmlFor="date_depart_retraite">Date de départ en retraite</label>
                              <input 
                                  type="date" 
                                  className="form-control" 
                                  id="date_depart_retraite" 
                                  name="date_depart_retraite"
                                  value={employeeData.date_depart_retraite}
                                  readOnly
                              />
                          </div>
                      </div>

                      {/* Informations de rémunération de base */}
                      <div className="card mb-4">
                          <div className="card-header d-flex justify-content-between align-items-center">
                              <h3 className="card-title">
                                  <i className="fas fa-money-check-alt me-2"></i>
                                  Informations de Rémunération
                              </h3>
                              <div className="d-flex align-items-center">
                                  <span className="me-3 text-muted">
                                      Total Rémunération: 
                                      <strong className="ms-2 text-primary">
                                          {calculateTotalRemuneration().toLocaleString()} FCFA
                                      </strong>
                                  </span>
                                  <div className="form-check form-switch">
                                      <input 
                                          type="checkbox" 
                                          className="form-check-input" 
                                          id="showAdvancedPayment"
                                          checked={showAdvancedPayment}
                                          onChange={() => setShowAdvancedPayment(!showAdvancedPayment)}
                                      />
                                      <label className="form-check-label" htmlFor="showAdvancedPayment">
                                          Options avancées
                                      </label>
                                  </div>
                              </div>
                          </div>
                          <div className="card-body">
                              {/* Champs de rémunération de base */}
                              <div className="form-group-row">
                                  <div className="form-group">
                                      <label className="form-label" htmlFor="pay">Type de rémunération</label>
                                      <select 
                                          className="form-select" 
                                          id="pay" 
                                          name="pay"
                                          value={employeeData.pay}
                                          onChange={handleInputChange}
                                          required
                                      >
                                          <option value="">Sélectionner un type</option>
                                          <option value="Salaire">Salaire</option>
                                          <option value="Honoraires">Honoraires</option>
                                          <option value="Indemnité de Stage">Indemnité de Stage</option>
                                      </select>
                                  </div>

                                  <div className="form-group">
                                      <label className="form-label" htmlFor="payment_mode">Mode de paiement</label>
                                      <select 
                                          className="form-select" 
                                          id="payment_mode" 
                                          name="payment_mode"
                                          value={employeeData.payment_mode}
                                          onChange={handleInputChange}
                                          required
                                      >
                                          <option value="">Sélectionner un mode</option>
                                          <option value="virement cdl">Virement bancaire</option>
                                          <option value="espèces">Espèces</option>
                                          <option value="cheque">Chèque</option>
                                      </select>
                                  </div>

                                  <div className="form-group">
                                      <label className="form-label" htmlFor="categorie_convention">Catégorie convention</label>
                                      <input 
                                          type="text" 
                                          className="form-control" 
                                          id="categorie_convention" 
                                          name="categorie_convention"
                                          value={employeeData.categorie_convention}
                                          onChange={handleInputChange}
                                      />
                                  </div>
                              </div>

                              <div className="form-group-row">
                                  <div className="form-group">
                                      <label className="form-label" htmlFor="salaire_base">Salaire de base</label>
                                      <input 
                                          type="number" 
                                          className="form-control" 
                                          id="salaire_base" 
                                          name="salaire_base"
                                          value={employeeData.salaire_base}
                                          onChange={handleInputChange}
                                      />
                                  </div>

                                  <div className="form-group">
                                      <label className="form-label" htmlFor="sursalaire">Sursalaire</label>
                                      <input 
                                          type="number" 
                                          className="form-control" 
                                          id="sursalaire" 
                                          name="sursalaire"
                                          value={employeeData.sursalaire}
                                          onChange={handleInputChange}
                                      />
                                  </div>
                              </div>

                              {/* Champs de rémunération avancés */}
                              {showAdvancedPayment && (
                                  <div>
                                      <h4 className="mt-4 mb-3">Éléments de rémunération avancés</h4>

                                      <div className="form-group-row">
                                          <div className="form-group">
                                              <label className="form-label" htmlFor="prime_responsabilite">Prime de responsabilité</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="prime_responsabilite" 
                                                  name="prime_responsabilite"
                                                  value={employeeData.prime_responsabilite}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="transport">Transport</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="transport" 
                                                  name="transport"
                                                  value={employeeData.transport}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="logement">Logement</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="logement" 
                                                  name="logement"
                                                  value={employeeData.logement}
                                                  onChange={handleInputChange}
                                              />
                                          </div>
                                      </div>

                                      <div className="form-group-row">
                                          <div className="form-group">
                                              <label className="form-label" htmlFor="prime_assiduite">Prime d'assiduité</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="prime_assiduite" 
                                                  name="prime_assiduite"
                                                  value={employeeData.prime_assiduite}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="primes_diverses">Primes diverses</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="primes_diverses" 
                                                  name="primes_diverses"
                                                  value={employeeData.primes_diverses}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="panier">Panier</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="panier" 
                                                  name="panier"
                                                  value={employeeData.panier}
                                                  onChange={handleInputChange}
                                              />
                                          </div>
                                      </div>

                                      <div className="form-group-row">
                                          <div className="form-group">
                                              <label className="form-label" htmlFor="prime_ca">Prime CA</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="prime_ca" 
                                                  name="prime_ca"
                                                  value={employeeData.prime_ca}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="ind_caisse">Indemnité caisse</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="ind_caisse" 
                                                  name="ind_caisse"
                                                  value={employeeData.ind_caisse}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="ind_domesticite">Indemnité domesticité</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="ind_domesticite" 
                                                  name="ind_domesticite"
                                                  value={employeeData.ind_domesticite}
                                                  onChange={handleInputChange}
                                              />
                                          </div>
                                      </div>

                                      <div className="form-group-row">
                                          <div className="form-group">
                                              <label className="form-label" htmlFor="ind_eau_electricite">Indemnité eau/électricité</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="ind_eau_electricite" 
                                                  name="ind_eau_electricite"
                                                  value={employeeData.ind_eau_electricite}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="ind_voiture">Indemnité voiture</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="ind_voiture" 
                                                  name="ind_voiture"
                                                  value={employeeData.ind_voiture}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="prime_salissure">Prime de salissure</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="prime_salissure" 
                                                  name="prime_salissure"
                                                  value={employeeData.prime_salissure}
                                                  onChange={handleInputChange}
                                              />
                                          </div>
                                      </div>

                                      <div className="form-group-row">
                                          <div className="form-group">
                                              <label className="form-label" htmlFor="honoraires">Honoraires</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="honoraires" 
                                                  name="honoraires"
                                                  value={employeeData.honoraires}
                                                  onChange={handleInputChange}
                                              />
                                          </div>

                                          <div className="form-group">
                                              <label className="form-label" htmlFor="ind_stage">Indemnité de stage</label>
                                              <input 
                                                  type="number" 
                                                  className="form-control" 
                                                  id="ind_stage" 
                                                  name="ind_stage"
                                                  value={employeeData.ind_stage}
                                                  onChange={handleInputChange}
                                              />
                                          </div>
                                      </div>

                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Section Documents */}
                      <h3 className="form-section-title mt-5">Documents du dossier employé</h3>
                      <div className="document-upload-container">
                          {documents.map((doc, index) => (
                              <div key={index} className="document-item mb-3">
                                  <div className="form-group-row">
                                      <div className="form-group">
                                          <label className="form-label">Type de document</label>
                                          <select 
                                              className="form-select document-type"
                                              value={doc.type}
                                              onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                                          >
                                              <option value="">Sélectionner un type</option>
                                              <option value="CNI">Carte d'identité / Passeport</option>
                                              <option value="CV">CV</option>
                                              <option value="Diplome">Diplôme</option>
                                              <option value="Certificat">Certificat</option>
                                              <option value="Contrat">Contrat de travail</option>
                                              <option value="CNSS">Attestation CNSS</option>
                                              <option value="CNAMGS">Attestation CNAMGS</option>
                                              <option value="Autre">Autre document</option>
                                          </select>
                                      </div>
                                      <div className="form-group flex-grow-1">
                                          <label className="form-label">Fichier</label>
                                          <div className="input-group">
                                              <input 
                                                  type="file" 
                                                  className="form-control document-file"
                                                  onChange={(e) => handleDocumentChange(index, 'file', e.target.files[0])}
                                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                              />
                                              {documents.length > 1 && (
                                                  <button 
                                                      type="button" 
                                                      className="btn btn-outline-danger remove-document"
                                                      onClick={() => handleRemoveDocument(index)}
                                                  >
                                                      <i className="fas fa-times"></i>
                                                  </button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          ))}

                          <div className="mt-3">
                              <button 
                                  type="button" 
                                  className="btn btn-outline-primary"
                                  onClick={handleAddDocument}
                              >
                                  <i className="fas fa-plus me-2"></i>Ajouter un document
                              </button>
                          </div>
                      </div>

                      {/* Boutons de soumission */}
                      <div className="form-footer">
                          <button 
                              type="button" 
                              className="btn btn-secondary"
                              onClick={() => navigate('/employees')}
                          >
                              <i className="fas fa-arrow-left me-2"></i>Annuler
                          </button>
                          <button 
                              type="reset" 
                              className="btn btn-outline-primary"
                          >
                              <i className="fas fa-redo-alt me-2"></i>Réinitialiser
                          </button>
                          <button 
                              type="submit" 
                              className="btn btn-primary"
                              disabled={loading}
                          >
                              {loading ? (
                                  <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Traitement...
                                  </>
                              ) : (
                                  <>
                                      <i className="fas fa-user-plus me-2"></i>Ajouter l'employé
                                  </>
                              )}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      </div>
    );
};

export default NewEmployee;