import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Création d'une instance axios avec l'URL de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Service pour les congés
export const congeService = {
  // Récupérer tous les congés
  getAll: async () => {
    try {
      const response = await api.get('/conges');
      return response.data;
    } catch (error) {
      console.error('Error fetching conges:', error);
      throw error;
    }
  },
  
  // Récupérer un congé par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/conges/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conge ${id}:`, error);
      throw error;
    }
  },
  
  // Récupérer les congés d'un employé
  getByEmployee: async (employeeName) => {
    try {
      const response = await api.get(`/conges/employee/${encodeURIComponent(employeeName)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conges for employee ${employeeName}:`, error);
      throw error;
    }
  },
  
  // Récupérer les congés par statut
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/conges/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching conges with status ${status}:`, error);
      throw error;
    }
  },
  
  // Créer un nouveau congé
  create: async (congeData) => {
    try {
      // Si c'est FormData, ne pas définir Content-Type (laissé au navigateur)
      const config = congeData instanceof FormData ? {} : {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await api.post('/conges', congeData, config);
      return response.data;
    } catch (error) {
      console.error('Error creating conge:', error);
      throw error;
    }
  },
  
  // Mettre à jour un congé
  update: async (id, congeData) => {
    try {
      // Si c'est FormData, ne pas définir Content-Type (laissé au navigateur)
      const config = congeData instanceof FormData ? {} : {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await api.put(`/conges/${id}`, congeData, config);
      return response.data;
    } catch (error) {
      console.error(`Error updating conge ${id}:`, error);
      throw error;
    }
  },
  
  // Approuver un congé
  approve: async (id) => {
    try {
      const response = await api.put(`/conges/${id}/approve`, {});
      return response.data;
    } catch (error) {
      console.error(`Error approving conge ${id}:`, error);
      throw error;
    }
  },
  
  // Refuser un congé
  reject: async (id, motif_refus) => {
    try {
      const response = await api.put(`/conges/${id}/reject`, { motif_refus });
      return response.data;
    } catch (error) {
      console.error(`Error rejecting conge ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer un congé
  delete: async (id) => {
    try {
      const response = await api.delete(`/conges/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting conge ${id}:`, error);
      throw error;
    }
  },
  
  // Recherche avancée
  search: async (filters) => {
    try {
      const response = await api.get('/conges/search/filter', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error searching conges:', error);
      throw error;
    }
  }
};

export default congeService;