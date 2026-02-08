import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  employeeService, 
  requestService, 
  sanctionService, 
  evenementService, 
  noteService 
} from '../../../services/api';

/**
 * Hook personnalisé pour gérer la logique du composant EmployeePortal
 */
export const useEmployeePortal = () => {
  const navigate = useNavigate();
  
  // États principaux
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // États des données
  const [events, setEvents] = useState([]);
  const [sanctions, setSanctions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [employeeRequests, setEmployeeRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  
  // États des modales
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showSanctionDetailsModal, setShowSanctionDetailsModal] = useState(false);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [showDocumentViewModal, setShowDocumentViewModal] = useState(false);
  
  // États des sélections
  const [requestType, setRequestType] = useState('');
  const [selectedSanction, setSelectedSanction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Vérifier l'authentification de l'utilisateur
   */
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les données utilisateur depuis sessionStorage
      const userData = sessionStorage.getItem('employeeUser');
      
      if (!userData) {
        console.log("Aucune donnée utilisateur trouvée, redirection vers la page de connexion");
        navigate('/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      console.log("Données utilisateur trouvées:", parsedUser);
      
      // Stocker l'ID de l'utilisateur pour les requêtes ultérieures
      if (parsedUser.id) {
        setUserId(parsedUser.id);
        
        try {
          // Récupérer les données complètes de l'utilisateur depuis l'API
          console.log("Récupération des données complètes de l'utilisateur avec ID:", parsedUser.id);
          const completeUserData = await employeeService.getById(parsedUser.id);
          console.log("Données complètes récupérées:", completeUserData);
          
          // Fusionner les données existantes avec les données complètes
          setUser({...parsedUser, ...completeUserData});
        } catch (apiError) {
          console.error("Erreur lors de la récupération des données complètes:", apiError);
          // En cas d'erreur, utiliser les données de session uniquement
          setUser(parsedUser);
        }
      } else {
        console.log("ID utilisateur non trouvé dans les données de session");
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setError('Erreur lors de la vérification de l\'authentification');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Charger toutes les données de l'utilisateur
   */
  const loadUserData = useCallback(async () => {
    if (!user?.nom_prenom || !userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les événements à venir
      try {
        console.log("Chargement des événements à venir");
        const upcomingEvents = await evenementService.getUpcoming();
        console.log("Événements récupérés:", upcomingEvents);
        setEvents(upcomingEvents);
      } catch (eventError) {
        console.error("Erreur lors du chargement des événements:", eventError);
        // Données fictives en cas d'erreur
        setEvents([
          {
            id: 1,
            name: 'Réunion mensuelle',
            formatted_date: '24/06/2025',
            location: 'Salle de conférence',
            description: 'Réunion mensuelle pour discuter des objectifs du mois.'
          },
          {
            id: 2,
            name: 'Formation Excel',
            formatted_date: '25/06/2025',
            location: 'Salle de formation',
            description: 'Formation sur les fonctionnalités avancées d\'Excel.'
          },
          {
            id: 3,
            name: 'Team Building',
            formatted_date: '27/06/2025',
            location: 'Parc des Cèdres',
            description: 'Activité de cohésion d\'équipe en plein air.'
          }
        ]);
      }
      
      // Charger les sanctions
      try {
        console.log("Chargement des sanctions pour l'employé:", user.nom_prenom);
        const userSanctions = await sanctionService.getByEmployeeName(user.nom_prenom);
        console.log("Sanctions récupérées:", userSanctions);
        setSanctions(userSanctions);
      } catch (sanctionError) {
        console.error("Erreur lors du chargement des sanctions:", sanctionError);
        setSanctions([]);
      }
      
      // Charger les notes de service
      try {
        setLoadingNotes(true);
        console.log("Chargement des notes de service publiques");
        const notesData = await noteService.getPublicNotes();
        console.log("Notes récupérées:", notesData);
        setNotes(notesData);
      } catch (notesError) {
        console.error("Erreur lors du chargement des notes de service:", notesError);
        // Données fictives en cas d'erreur
        setNotes([
          {
            id: 1,
            full_note_number: 'NS-2025-001',
            category: 'Information',
            title: 'Nouveau processus de congés',
            content: 'Suite à la réunion du comité de direction, nous mettons en place un nouveau processus de demande de congés à partir du 1er juillet 2025.',
            created_at: '2025-06-20'
          },
          {
            id: 2,
            full_note_number: 'NS-2025-002',
            category: 'Organisation',
            title: 'Horaires d\'été',
            content: 'Les horaires d\'été seront appliqués du 1er juillet au 31 août 2025.',
            created_at: '2025-06-22'
          }
        ]);
      } finally {
        setLoadingNotes(false);
      }
      
      // Charger les demandes de l'utilisateur
      try {
        console.log("Chargement des demandes pour l'utilisateur ID:", userId);
        const userRequests = await requestService.getByEmployeeId(userId);
        console.log("Demandes récupérées:", userRequests);
        setEmployeeRequests(userRequests);
      } catch (reqError) {
        console.error("Erreur lors du chargement des demandes:", reqError);
        // Données fictives en cas d'erreur
        setEmployeeRequests([
          {
            id: 101,
            type: 'leave',
            status: 'pending',
            startDate: '2025-07-20',
            endDate: '2025-07-25',
            submitDate: '2025-06-10'
          },
          {
            id: 102,
            type: 'document',
            status: 'approved',
            description: 'Attestation de travail',
            submitDate: '2025-06-05',
            responseDate: '2025-06-07'
          }
        ]);
      }
      
      // Charger les autres données (annonces, documents, planning)
      loadMockData();
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, user]);

  /**
   * Charger des données fictives pour les fonctionnalités non encore implémentées
   */
  const loadMockData = useCallback(() => {
    // Annonces
    setAnnouncements([
      {
        id: 1,
        title: 'Mise à jour des protocoles médicaux',
        date: '15 juin 2025',
        content: 'Chers employés, veuillez noter que les nouveaux protocoles médicaux seront mis en place à partir du 1er juillet. Une formation sera organisée la semaine prochaine.',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Journée portes ouvertes',
        date: '10 juin 2025',
        content: 'Nous organisons une journée portes ouvertes le 25 juillet. Votre participation est encouragée pour présenter nos services aux visiteurs.',
        priority: 'medium'
      }
    ]);
    
    // Documents
    setDocuments([
      {
        id: 201,
        name: 'Fiche de paie - Mai 2025',
        type: 'payslip',
        date: '2025-06-01',
        size: '245 KB'
      },
      {
        id: 202,
        name: 'Attestation employeur',
        type: 'certificate',
        date: '2025-05-15',
        size: '120 KB'
      },
      {
        id: 203,
        name: 'Contrat de travail',
        type: 'contract',
        date: '2024-01-10',
        size: '350 KB'
      }
    ]);
    
    // Planning
    setSchedule([
      {
        id: 301,
        date: '2025-06-15',
        startTime: '08:00',
        endTime: '16:00',
        department: user?.entity || 'Radiologie'
      },
      {
        id: 302,
        date: '2025-06-16',
        startTime: '09:00',
        endTime: '17:00',
        department: user?.entity || 'Radiologie'
      },
      {
        id: 303,
        date: '2025-06-17',
        startTime: '08:00',
        endTime: '16:00',
        department: user?.entity || 'Radiologie'
      }
    ]);
  }, [user]);

  /**
   * Gérer la déconnexion
   */
  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('employeeUser');
    sessionStorage.removeItem('token');
    navigate('/EmployeeLogin');
  }, [navigate]);

  /**
   * Gérer l'ouverture de la modale de nouvelle demande
   */
  const handleNewRequest = useCallback((type) => {
    setRequestType(type);
    setShowNewRequestModal(true);
  }, []);

  /**
   * Fermer la modale de nouvelle demande
   */
  const closeNewRequestModal = useCallback(() => {
    setShowNewRequestModal(false);
    setRequestType('');
  }, []);

  /**
   * Soumettre une nouvelle demande
   */
  const submitNewRequest = useCallback(async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Appeler l'API pour créer une nouvelle demande
      let newRequest;
      
      if (requestType === 'leave') {
        newRequest = await requestService.create({
          employee_id: userId,
          request_type: 'leave',
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          request_details: formData.details,
          status: 'pending'
        });
      } else if (requestType === 'document') {
        newRequest = await requestService.create({
          employee_id: userId,
          request_type: 'document',
          request_details: formData.details,
          reason: formData.reason,
          status: 'pending'
        });
      } else {
        newRequest = await requestService.create({
          employee_id: userId,
          request_type: 'other',
          request_details: formData.details,
          reason: formData.reason,
          status: 'pending'
        });
      }
      
      // Ajouter la nouvelle demande à la liste
      setEmployeeRequests(prev => [newRequest, ...prev]);
      
      // Afficher un message de succès
      setSuccessMessage('Votre demande a été soumise avec succès.');
      
      // Fermer la modale
      closeNewRequestModal();
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      setError('Une erreur est survenue lors de la création de la demande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  }, [requestType, userId, closeNewRequestModal]);

  /**
   * Annuler une demande
   */
  const cancelRequest = useCallback(async (requestId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      return;
    }
    
    try {
      // Appeler l'API pour annuler la demande
      await requestService.delete(requestId);
      
      // Mettre à jour la liste des demandes
      setEmployeeRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Afficher un message de succès
      setSuccessMessage('Votre demande a été annulée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la demande:', error);
      setError('Une erreur est survenue lors de l\'annulation de la demande. Veuillez réessayer.');
    }
  }, []);

  /**
   * Voir les détails d'une demande
   */
  const viewRequestDetails = useCallback((request) => {
    setSelectedRequest(request);
    setShowRequestDetailsModal(true);
  }, []);

  /**
   * Voir les détails d'une sanction
   */
  const viewSanctionDetails = useCallback((sanction) => {
    setSelectedSanction(sanction);
    setShowSanctionDetailsModal(true);
  }, []);

  /**
   * Voir un document
   */
  const viewDocument = useCallback((document) => {
    setSelectedDocument(document);
    setShowDocumentViewModal(true);
  }, []);

  /**
   * Télécharger un document
   */
  const downloadDocument = useCallback((document) => {
    // Simuler un téléchargement
    alert(`Téléchargement du document "${document.name}" en cours...`);
    
    // En production, vous utiliseriez une API réelle pour télécharger le document
    // window.open(`${API_URL}/documents/download/${document.id}`, '_blank');
  }, []);

  /**
   * Effacer les messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Effets
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    // États
    user,
    userId,
    loading,
    error,
    successMessage,
    events,
    sanctions,
    notes,
    employeeRequests,
    announcements,
    documents,
    schedule,
    showNewRequestModal,
    showSanctionDetailsModal,
    showRequestDetailsModal,
    showDocumentViewModal,
    requestType,
    selectedSanction,
    selectedRequest,
    selectedDocument,
    isSubmitting,
    loadingNotes,
    isLoading,
    
    // Actions
    handleLogout,
    handleNewRequest,
    closeNewRequestModal,
    submitNewRequest,
    cancelRequest,
    viewRequestDetails,
    viewSanctionDetails,
    viewDocument,
    downloadDocument,
    clearMessages,
    
    // Setters pour les modales
    setShowNewRequestModal,
    setShowSanctionDetailsModal,
    setShowRequestDetailsModal,
    setShowDocumentViewModal
  };
};











