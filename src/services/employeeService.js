import axios from 'axios';

// URL de base de l'API
const API_URL = 'http://localhost:5000/api';

// Instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Pour les requêtes multipart/form-data (envoi de fichiers)
const formDataApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Gestion des erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

formDataApi.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Service pour les employés
const employeeService = {
  // Méthode pour récupérer tous les employés (ajoutée)
  getAll: async () => {
    try {
      console.log('Calling getAll method');
      const response = await api.get('/employees');
      return response.data;
    } catch (error) {
      console.error('Error fetching all employees:', error);
      throw error;
    }
  },

  // Méthode d'authentification des employés
  authenticate: async (email, password) => {
    try {
      const response = await api.post('/employees/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },
  
  // Rechercher des employés avec des filtres
  search: async (params) => {
    try {
      const response = await api.get('/employees/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  },
  
  // Récupérer un employé par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee ${id}:`, error);
      throw error;
    }
  },
  
  // Créer un nouvel employé
  createEmployee: async (employeeData) => {
    try {
      // Utiliser formDataApi si employeeData est une instance de FormData
      const isFormData = employeeData instanceof FormData;
      const apiToUse = isFormData ? formDataApi : api;
      
      const response = await apiToUse.post('/employees', employeeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating employee:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Une erreur est survenue lors de la création de l\'employé',
        details: error.response?.data?.details || error.message
      };
    }
  },
  
  // Mettre à jour un employé
  update: async (id, employeeData) => {
    try {
      // Utiliser formDataApi si employeeData est une instance de FormData
      const isFormData = employeeData instanceof FormData;
      const apiToUse = isFormData ? formDataApi : api;
      
      const response = await apiToUse.put(`/employees/${id}`, employeeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Une erreur est survenue lors de la mise à jour de l\'employé',
        details: error.response?.data?.details || error.message
      };
    }
  },
  
  // Supprimer un employé
  delete: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      return { 
        success: false, 
        message: error.response?.data?.error || 'Une erreur est survenue lors de la suppression de l\'employé',
        details: error.response?.data?.details || error.message
      };
    }
  },
  
  // Récupérer les employés dont le contrat expire bientôt
  getExpiringContracts: async (daysThreshold = 30) => {
    try {
      const response = await api.get('/employees/alerts/expiring-contracts', {
        params: { daysThreshold }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw error;
    }
  },
  
  // Récupérer des statistiques sur les employés
  getStatistics: async () => {
    try {
      const response = await api.get('/employees/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      throw error;
    }
  }
};

// Exporter uniquement l'objet employeeService par défaut
export default employeeService;