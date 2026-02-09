import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import '../../styles/EditEmployee.css';

const EditEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const listEmployee = location.state?.employee;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Fonction de calcul du total de rémunération (réservée pour usage futur)
    // eslint-disable-next-line no-unused-vars
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
        matricule: '',
        genre: 'Homme',
        noms: '',
        situation_maritale: 'Célibataire',
        statut_marital: 'Célibataire',
        nbr_enfants: 0,
        enfants: 0,
        date_naissance: '',
        age: '',
        lieu: '',
        lieu_naissance: '',

        // Coordonnées
        adresse: '',
        telephone: '',
        email: '',
        cnss_number: '',
        cnamgs_number: '',

        // Informations professionnelles
        domaine_fonctionnel: '',
        functional_area: '',
        entity: '',
        departement: '',
        date_embauche: '',
        date_entree: '',
        poste_actuel: '',
        attachement_hierarchique: '',
        responsable: '',
        type_contrat: '',
        categorie: '',
        date_fin_contrat: '',
        statut_local_expat: '',
        employee_type: '',
        pays: 'Gabon',
        nationalite: 'Gabon',
        niveau_academique: '',
        niveau_etude: '',
        diplome: '',
        specialisation: '',
        anciennete_entreprise: '0 ans 0 mois',
        statut_employe: '',

        // Informations de retraite
        admission_retraite_dans: '',
        date_depart_retraite: '',

        // Rémunération
        pay: 'Salaire',
        type_remuneration: 'Salaire',
        payment_mode: '',
        categorie_convention: '',
        salaire_base: 0,
        sursalaire: 0,
        prime_responsabilite: 0,
        transport: 35000,
        prime_transport: 35000,
        logement: 0,
        prime_logement: 0,

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
        ind_stage: 0,

        // Contacts d'urgence
        emergency_contact: '',
        emergency_phone: ''
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

    // Mapper les données employé vers le formulaire
    const mapEmployeeToFormData = (emp) => {
        if (!emp || typeof emp !== 'object') return null;
        const e = { ...emp };
        return {
            matricule: e.matricule || '',
            genre: e.genre || 'Homme',
            noms: e.nom_prenom || e.nom || '',
            situation_maritale: e.statut_marital || 'Célibataire',
            statut_marital: e.statut_marital || 'Célibataire',
            nbr_enfants: e.enfants ?? 0,
            enfants: e.enfants ?? 0,
            date_naissance: e.date_naissance ? (e.date_naissance.split?.('T')[0] || e.date_naissance.split?.(' ')[0] || e.date_naissance) : '',
            age: e.age || '',
            lieu: e.lieu_naissance || e.lieu || '',
            lieu_naissance: e.lieu_naissance || e.lieu || '',
            adresse: e.adresse || '',
            telephone: e.telephone || '',
            email: e.email || '',
            cnss_number: e.cnss_number || '',
            cnamgs_number: e.cnamgs_number || '',
            domaine_fonctionnel: e.functional_area || '',
            functional_area: e.functional_area || '',
            entity: e.entity || '',
            departement: e.departement || '',
            date_embauche: e.date_entree ? (e.date_entree.split?.('T')[0] || e.date_entree.split?.(' ')[0] || e.date_entree) : '',
            date_entree: e.date_entree ? (e.date_entree.split?.('T')[0] || e.date_entree.split?.(' ')[0] || e.date_entree) : '',
            poste_actuel: e.poste_actuel || e.poste || '',
            attachement_hierarchique: e.responsable || '',
            responsable: e.responsable || '',
            type_contrat: e.type_contrat || '',
            categorie: e.categorie || '',
            date_fin_contrat: e.date_fin_contrat ? (e.date_fin_contrat.split?.('T')[0] || e.date_fin_contrat.split?.(' ')[0] || e.date_fin_contrat) : '',
            statut_local_expat: e.employee_type || '',
            employee_type: e.employee_type || '',
            pays: e.nationalite || 'Gabon',
            nationalite: e.nationalite || 'Gabon',
            niveau_academique: e.niveau_etude || '',
            niveau_etude: e.niveau_etude || '',
            diplome: e.specialisation || '',
            specialisation: e.specialisation || '',
            anciennete_entreprise: e.anciennete || '0 ans 0 mois',
            statut_employe: e.statut_employe || e.statut || 'Actif',
            statut_dossier: e.statut_dossier || 'NON SPÉCIFIÉ',
            admission_retraite_dans: e.admission_retraite_dans || (e.age_restant ? `${e.age_restant} ans` : ''),
            date_depart_retraite: e.date_depart_retraite || (e.date_retraite ? (e.date_retraite.split?.('T')[0] || e.date_retraite.split?.(' ')[0] || e.date_retraite) : ''),
            pay: e.type_remuneration || 'Salaire',
            type_remuneration: e.type_remuneration || 'Salaire',
            payment_mode: e.payment_mode || e.mode_paiement || '',
            categorie_convention: e.categorie_convention || '',
            salaire_base: e.salaire_base ?? 0,
            sursalaire: e.sursalaire ?? 0,
            prime_responsabilite: e.prime_responsabilite ?? 0,
            transport: e.prime_transport ?? 35000,
            prime_transport: e.prime_transport ?? 35000,
            logement: e.prime_logement ?? 0,
            prime_logement: e.prime_logement ?? 0,
            prime_assiduite: e.prime_assiduite ?? 0,
            primes_diverses: e.primes_diverses ?? 0,
            panier: e.panier ?? 0,
            prime_ca: e.prime_ca ?? 0,
            ind_caisse: e.ind_caisse ?? 0,
            ind_domesticite: e.ind_domesticite ?? 0,
            ind_eau_electricite: e.ind_eau_electricite ?? 0,
            ind_voiture: e.ind_voiture ?? 0,
            prime_salissure: e.prime_salissure ?? 0,
            honoraires: e.honoraires ?? 0,
            ind_stage: e.ind_stage ?? e.indemnite_stage ?? 0,
            emergency_contact: e.emergency_contact || e.contact_urgence || '',
            emergency_phone: e.emergency_phone || e.telephone_urgence || ''
        };
    };

    // Pré-remplir immédiatement avec les données de la liste (si passées)
    useEffect(() => {
        if (listEmployee && id && String(listEmployee.id) === String(id)) {
            const mapped = mapEmployeeToFormData(listEmployee);
            if (mapped) setEmployeeData(mapped);
        }
    }, [id, listEmployee]);

    // Charger les données complètes de l'employé via l'API
    useEffect(() => {
        const loadEmployee = async () => {
            try {
                setLoading(true);
                const apiEmployee = await employeeService.getById(id);
                if (apiEmployee && !apiEmployee.error) {
                    const merged = mapEmployeeToFormData({ ...listEmployee, ...apiEmployee });
                    if (merged) setEmployeeData(merged);
                }
            } catch (err) {
                console.error('Error loading employee:', err);
                if (!listEmployee) setError('Erreur lors du chargement des données de l\'employé');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadEmployee();
    }, [id, listEmployee]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployeeData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            // Mapper les données du formulaire vers la structure de la base de données
            // IMPORTANT: Les noms de champs doivent correspondre exactement à ce que le backend attend
            const updateData = {
                // Informations générales
                matricule: employeeData.matricule || '',
                genre: employeeData.genre || 'Homme',
                nom_prenom: employeeData.noms || '',
                statut_marital: employeeData.situation_maritale || employeeData.statut_marital || 'Célibataire',
                enfants: employeeData.nbr_enfants ? parseInt(employeeData.nbr_enfants) : (employeeData.enfants ? parseInt(employeeData.enfants) : 0),
                date_naissance: employeeData.date_naissance || null,
                lieu: employeeData.lieu || employeeData.lieu_naissance || '',

                // Coordonnées
                adresse: employeeData.adresse || '',
                telephone: employeeData.telephone || '',
                email: employeeData.email || '',
                cnss_number: employeeData.cnss_number || '',
                cnamgs_number: employeeData.cnamgs_number || '',

                // Informations professionnelles
                functional_area: employeeData.domaine_fonctionnel || employeeData.functional_area || '',
                entity: employeeData.entity || '',
                departement: employeeData.departement || '',
                date_entree: employeeData.date_embauche || employeeData.date_entree || null,
                poste_actuel: employeeData.poste_actuel || '',
                responsable: employeeData.attachement_hierarchique || employeeData.responsable || '',
                type_contrat: employeeData.type_contrat || '',
                categorie: employeeData.categorie || '',
                date_fin_contrat: employeeData.date_fin_contrat || null,
                employee_type: employeeData.statut_local_expat || employeeData.employee_type || '',
                nationalite: employeeData.pays || employeeData.nationalite || 'Gabon',
                niveau_etude: employeeData.niveau_academique || employeeData.niveau_etude || '',
                specialisation: employeeData.diplome || employeeData.specialisation || '',
                statut_employe: employeeData.statut_employe || 'Actif',
                statut_dossier: employeeData.statut_dossier || 'NON SPÉCIFIÉ',

                // Rémunération
                type_remuneration: employeeData.pay || employeeData.type_remuneration || 'Salaire',
                payment_mode: employeeData.payment_mode || '',
                salaire_base: employeeData.salaire_base ? parseFloat(employeeData.salaire_base) : 0,
                prime_responsabilite: employeeData.prime_responsabilite ? parseFloat(employeeData.prime_responsabilite) : 0,
                prime_transport: employeeData.transport ? parseFloat(employeeData.transport) : (employeeData.prime_transport ? parseFloat(employeeData.prime_transport) : 0),
                prime_logement: employeeData.logement ? parseFloat(employeeData.logement) : (employeeData.prime_logement ? parseFloat(employeeData.prime_logement) : 0),
                honoraires: employeeData.honoraires ? parseFloat(employeeData.honoraires) : 0,
                indemnite_stage: employeeData.ind_stage ? parseFloat(employeeData.ind_stage) : 0,

                // Contacts d'urgence
                emergency_contact: employeeData.emergency_contact || '',
                emergency_phone: employeeData.emergency_phone || ''
            };
            
            // Mettre à jour l'employé
            const result = await employeeService.update(id, updateData);
            
            if (result && result.success) {
            // Rediriger vers la liste des employés
            navigate('/employees');
            } else {
                setError(result?.message || 'Erreur lors de la mise à jour de l\'employé');
            }
        } catch (err) {
            console.error('Error updating employee:', err);
            setError('Erreur lors de la mise à jour de l\'employé');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-xl text-gray-600 font-medium">Chargement des données...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/employees')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-employee-container">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header avec navigation */}
                <div className="edit-employee-header">
                    <div className="edit-employee-nav">
                        <div>
                            <h1 className="edit-employee-title">Modifier l'employé</h1>
                            <p className="edit-employee-subtitle">Gérez les informations complètes de l'employé</p>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate('/employees')}
                                className="edit-employee-back-btn"
                            >
                                <i className="fas fa-arrow-left"></i>
                                Retour à la liste
                            </button>
                        </div>
                    </div>
                </div>

                {/* Formulaire principal */}
                <div className="edit-employee-form-container">
                    {/* Header du formulaire */}
                    <div className="edit-employee-form-header">
                        <div className="edit-employee-form-header-content">
                            <div className="edit-employee-form-icon">
                                <i className="fas fa-user-edit"></i>
                            </div>
                            <div>
                                <h2 className="edit-employee-form-title">Formulaire de modification</h2>
                                <p className="edit-employee-form-subtitle">Remplissez tous les champs nécessaires pour mettre à jour les informations</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Barre de progression */}
                        <div className="edit-employee-progress">
                            <div className="edit-employee-progress-header">
                                <span className="edit-employee-progress-text">Progression du formulaire</span>
                                <span className="edit-employee-progress-count">5/5 sections</span>
                            </div>
                            <div className="edit-employee-progress-bar">
                                <div className="edit-employee-progress-fill" style={{width: '100%'}}></div>
                            </div>
                        </div>

                        {/* Section Informations générales */}
                        <div className="edit-employee-section">
                            <div className="edit-employee-section-header">
                                <div className="edit-employee-section-icon blue">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <h3 className="edit-employee-section-title">Informations générales</h3>
                                    <p className="edit-employee-section-subtitle">Données personnelles et de contact</p>
                                </div>
                            </div>
                            <div className="edit-employee-section-container blue">
                                <div className="edit-employee-field-grid">
                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label required">
                                            Matricule
                                        </label>
                                        <input
                                            type="text"
                                            name="matricule"
                                            value={employeeData.matricule}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Ex: CDL-2024-0105"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Genre
                                        </label>
                                        <div className="edit-employee-radio-group">
                                            <div className="edit-employee-radio-item">
                                                <input 
                                                    type="radio" 
                                                    name="genre" 
                                                    value="Homme" 
                                                    checked={employeeData.genre === 'Homme'}
                                                    onChange={handleInputChange}
                                                />
                                                <label>Homme</label>
                                            </div>
                                            <div className="edit-employee-radio-item">
                                                <input 
                                                    type="radio" 
                                                    name="genre" 
                                                    value="Femme"
                                                    checked={employeeData.genre === 'Femme'}
                                                    onChange={handleInputChange}
                                                />
                                                <label>Femme</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label required">
                                            Nom prénom
                                        </label>
                                        <input
                                            type="text"
                                            name="noms"
                                            value={employeeData.noms}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nom et prénom"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Situation maritale
                                        </label>
                                        <select
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

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Nombre d'enfants
                                        </label>
                                        <input
                                            type="number"
                                            name="nbr_enfants"
                                            value={employeeData.nbr_enfants}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Date de naissance
                                        </label>
                                        <input
                                            type="date"
                                            name="date_naissance"
                                            value={employeeData.date_naissance}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Âge
                                        </label>
                                        <input
                                            type="text"
                                            name="age"
                                            value={employeeData.age}
                                            readOnly
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Lieu
                                        </label>
                                        <input
                                            type="text"
                                            name="lieu"
                                            value={employeeData.lieu}
                                            onChange={handleInputChange}
                                            placeholder="Ville de naissance"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            name="adresse"
                                            value={employeeData.adresse}
                                            onChange={handleInputChange}
                                            placeholder="Adresse complète"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={employeeData.telephone}
                                            onChange={handleInputChange}
                                            placeholder="+241 XX XX XX XX"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={employeeData.email}
                                            onChange={handleInputChange}
                                            placeholder="email@exemple.com"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Numéro CNSS
                                        </label>
                                        <input
                                            type="text"
                                            name="cnss_number"
                                            value={employeeData.cnss_number}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Numéro CNAMGS
                                        </label>
                                        <input
                                            type="text"
                                            name="cnamgs_number"
                                            value={employeeData.cnamgs_number}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Informations professionnelles */}
                        <div className="edit-employee-section">
                            <div className="edit-employee-section-header">
                                <div className="edit-employee-section-icon green">
                                    <i className="fas fa-briefcase"></i>
                                </div>
                                <div>
                                    <h3 className="edit-employee-section-title">Informations professionnelles</h3>
                                    <p className="edit-employee-section-subtitle">Poste, contrat et organisation</p>
                                </div>
                            </div>
                            <div className="edit-employee-section-container green">
                                <div className="edit-employee-field-grid">
                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Poste actuel
                                        </label>
                                        <input
                                            type="text"
                                            name="poste_actuel"
                                            value={employeeData.poste_actuel}
                                            onChange={handleInputChange}
                                            placeholder="Intitulé du poste"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Type de contrat
                                        </label>
                                        <select
                                            name="type_contrat"
                                            value={employeeData.type_contrat}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="CDI">CDI</option>
                                            <option value="CDD">CDD</option>
                                            <option value="Stage">Stage</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Prestataire">Prestataire</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Date d'embauche
                                        </label>
                                        <input
                                            type="date"
                                            name="date_embauche"
                                            value={employeeData.date_embauche}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Date de fin de contrat
                                        </label>
                                        <input
                                            type="date"
                                            name="date_fin_contrat"
                                            value={employeeData.date_fin_contrat}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Type d'employé
                                        </label>
                                        <select
                                            name="statut_local_expat"
                                            value={employeeData.statut_local_expat}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Local">Local</option>
                                            <option value="Expatrié">Expatrié</option>
                                            <option value="Stagiaire">Stagiaire</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Domaine fonctionnel
                                        </label>
                                        <input
                                            type="text"
                                            name="domaine_fonctionnel"
                                            value={employeeData.domaine_fonctionnel}
                                            onChange={handleInputChange}
                                            placeholder="Ex: IT, RH, Finance"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Entité/Département
                                        </label>
                                        <input
                                            type="text"
                                            name="entity"
                                            value={employeeData.entity}
                                            onChange={handleInputChange}
                                            placeholder="Ex: CDL, IT, RH"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Département
                                        </label>
                                        <input
                                            type="text"
                                            name="departement"
                                            value={employeeData.departement}
                                            onChange={handleInputChange}
                                            placeholder="Ex: IT, RH, Finance"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Responsable/Supérieur hiérarchique
                                        </label>
                                        <input
                                            type="text"
                                            name="attachement_hierarchique"
                                            value={employeeData.attachement_hierarchique}
                                            onChange={handleInputChange}
                                            placeholder="Nom du responsable"
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Section Informations personnelles */}
                        <div className="edit-employee-section">
                            <div className="edit-employee-section-header">
                                <div className="edit-employee-section-icon purple">
                                    <i className="fas fa-heart"></i>
                                </div>
                                <div>
                                    <h3 className="edit-employee-section-title">Informations personnelles</h3>
                                    <p className="edit-employee-section-subtitle">Vie personnelle et formation</p>
                                </div>
                            </div>
                            <div className="edit-employee-section-container purple">
                                <div className="edit-employee-field-grid">
                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Nationalité
                                        </label>
                                        <input
                                            type="text"
                                            name="pays"
                                            value={employeeData.pays}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Gabonaise"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Statut marital
                                        </label>
                                        <select
                                            name="situation_maritale"
                                            value={employeeData.situation_maritale}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Célibataire">Célibataire</option>
                                            <option value="Marié">Marié(e)</option>
                                            <option value="Divorcé">Divorcé(e)</option>
                                            <option value="Veuf">Veuf(ve)</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Nombre d'enfants
                                        </label>
                                        <input
                                            type="number"
                                            name="nbr_enfants"
                                            value={employeeData.nbr_enfants}
                                            onChange={handleInputChange}
                                            min="0"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Niveau d'étude
                                        </label>
                                        <select
                                            name="niveau_academique"
                                            value={employeeData.niveau_academique}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Primaire">Primaire</option>
                                            <option value="Secondaire">Secondaire</option>
                                            <option value="Bac">Bac</option>
                                            <option value="Bac+2">Bac+2</option>
                                            <option value="Bac+3">Bac+3</option>
                                            <option value="Bac+4">Bac+4</option>
                                            <option value="Bac+5">Bac+5</option>
                                            <option value="Doctorat">Doctorat</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field lg:col-span-2 xl:col-span-3">
                                        <label className="edit-employee-field-label">
                                            Spécialisation/Diplôme
                                        </label>
                                        <input
                                            type="text"
                                            name="diplome"
                                            value={employeeData.diplome}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Informatique, Gestion RH, Finance"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Informations de rémunération */}
                        <div className="edit-employee-section">
                            <div className="edit-employee-section-header">
                                <div className="edit-employee-section-icon yellow">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                                <div>
                                    <h3 className="edit-employee-section-title">Informations de rémunération</h3>
                                    <p className="edit-employee-section-subtitle">Salaire et primes</p>
                                </div>
                            </div>
                            <div className="edit-employee-section-container yellow">
                                <div className="edit-employee-field-grid">
                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Type de rémunération
                                        </label>
                                        <select
                                            name="pay"
                                            value={employeeData.pay}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Salaire">Salaire</option>
                                            <option value="Honoraires">Honoraires</option>
                                            <option value="Indemnité">Indemnité</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Mode de paiement
                                        </label>
                                        <select
                                            name="payment_mode"
                                            value={employeeData.payment_mode}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="Virement bancaire">Virement bancaire</option>
                                            <option value="Chèque">Chèque</option>
                                            <option value="Espèces">Espèces</option>
                                        </select>
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Catégorie conventionnelle
                                        </label>
                                        <input
                                            type="text"
                                            name="categorie"
                                            value={employeeData.categorie}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Cadre, Agent, Technicien"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Salaire de base
                                        </label>
                                        <input
                                            type="number"
                                            name="salaire_base"
                                            value={employeeData.salaire_base}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Prime de responsabilité
                                        </label>
                                        <input
                                            type="number"
                                            name="prime_responsabilite"
                                            value={employeeData.prime_responsabilite}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Prime de transport
                                        </label>
                                        <input
                                            type="number"
                                            name="transport"
                                            value={employeeData.transport}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Prime de logement
                                        </label>
                                        <input
                                            type="number"
                                            name="logement"
                                            value={employeeData.logement}
                                            onChange={handleInputChange}
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Informations administratives */}
                        <div className="edit-employee-section">
                            <div className="edit-employee-section-header">
                                <div className="edit-employee-section-icon red">
                                    <i className="fas fa-file-alt"></i>
                                </div>
                                <div>
                                    <h3 className="edit-employee-section-title">Informations administratives</h3>
                                    <p className="edit-employee-section-subtitle">Documents et contacts d'urgence</p>
                                </div>
                            </div>
                            <div className="edit-employee-section-container red">
                                <div className="edit-employee-field-grid">
                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Numéro CNSS
                                        </label>
                                        <input
                                            type="text"
                                            name="cnss_number"
                                            value={employeeData.cnss_number}
                                            onChange={handleInputChange}
                                            placeholder="Numéro CNSS"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Numéro CNAMGS
                                        </label>
                                        <input
                                            type="text"
                                            name="cnamgs_number"
                                            value={employeeData.cnamgs_number}
                                            onChange={handleInputChange}
                                            placeholder="Numéro CNAMGS"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Contact d'urgence
                                        </label>
                                        <input
                                            type="text"
                                            name="emergency_contact"
                                            value={employeeData.emergency_contact}
                                            onChange={handleInputChange}
                                            placeholder="Nom du contact"
                                        />
                                    </div>

                                    <div className="edit-employee-field">
                                        <label className="edit-employee-field-label">
                                            Téléphone d'urgence
                                        </label>
                                        <input
                                            type="tel"
                                            name="emergency_phone"
                                            value={employeeData.emergency_phone}
                                            onChange={handleInputChange}
                                            placeholder="Numéro d'urgence"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="edit-employee-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/employees')}
                                className="edit-employee-btn secondary"
                            >
                                <i className="fas fa-times"></i>
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="edit-employee-btn primary"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <span className="edit-employee-spinner"></span>
                                        Mise à jour...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <i className="fas fa-save"></i>
                                        Mettre à jour l'employé
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;
