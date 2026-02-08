import axios from 'axios';

// Créez une instance axios avec l'URL de base de votre API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuration de base pour l'API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs d'authentification
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service pour les absences
export const absenceService = {
  // Récupérer toutes les absences
  getAll: async () => {
    try {
      const response = await api.get('/absences');
      return response.data;
    } catch (error) {
      console.error('Error fetching absences:', error);
      throw error;
    }
  },
  
  // Récupérer une absence par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/absences/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching absence ${id}:`, error);
      throw error;
    }
  },
  
  // Récupérer les absences d'un employé
  getByEmployeeName: async (nom) => {
    try {
      const response = await api.get(`/absences/employe/${encodeURIComponent(nom)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching absences for employee ${nom}:`, error);
      throw error;
    }
  },
  
  // Créer une nouvelle absence
  create: async (formData) => {
    try {
      // Utiliser FormData pour permettre l'upload de fichiers
      const response = await api.post('/absences', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating absence:', error);
      throw error;
    }
  },
  
  // Mettre à jour une absence
  update: async (id, formData) => {
    try {
      // Utiliser FormData pour permettre l'upload de fichiers
      const response = await api.put(`/absences/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating absence ${id}:`, error);
      throw error;
    }
  },
  
  // Traiter une absence (approuver/refuser)
  processAbsence: async (id, statut) => {
    try {
      const response = await api.put(`/absences/${id}/traiter`, { statut });
      return response.data;
    } catch (error) {
      console.error(`Error processing absence ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer une absence
  delete: async (id) => {
    try {
      const response = await api.delete(`/absences/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting absence ${id}:`, error);
      throw error;
    }
  },
  
  // Rechercher des absences
  search: async (filters) => {
    try {
      const response = await api.get('/absences/search/filter', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error searching absences:', error);
      throw error;
    }
  },
  
  // Obtenir des statistiques sur les absences
  getStats: async (period) => {
    try {
      const response = await api.get('/absences/stats', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching absence statistics:', error);
      throw error;
    }
  },
  
  // Télécharger un document d'absence
  downloadDocument: async (id) => {
    try {
      const response = await api.get(`/absences/${id}/document`, {
        responseType: 'blob'
      });
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Créer un élément a pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `absence-document-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error(`Error downloading document for absence ${id}:`, error);
      throw error;
    }
  },
  
  // Obtenir un résumé des absences par employé
  getAbsenceSummaryByEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/absences/summary/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching absence summary for employee ${employeeId}:`, error);
      throw error;
    }
  },
  
  // Obtenir un résumé des absences par service
  getAbsenceSummaryByService: async () => {
    try {
      const response = await api.get('/absences/summary/service');
      return response.data;
    } catch (error) {
      console.error('Error fetching absence summary by service:', error);
      throw error;
    }
  },
  
  // Obtenir un résumé des absences par type
  getAbsenceSummaryByType: async () => {
    try {
      const response = await api.get('/absences/summary/type');
      return response.data;
    } catch (error) {
      console.error('Error fetching absence summary by type:', error);
      throw error;
    }
  },
  
  // Obtenir un résumé des absences par motif
  getAbsenceSummaryByMotif: async () => {
    try {
      const response = await api.get('/absences/summary/motif');
      return response.data;
    } catch (error) {
      console.error('Error fetching absence summary by motif:', error);
      throw error;
    }
  },
  
  // Exporter les absences au format CSV
  exportToCSV: async (filters) => {
    try {
      const response = await api.get('/absences/export/csv', { 
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'absences-export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting absences to CSV:', error);
      throw error;
    }
  },
  
  // Exporter les absences au format PDF
  exportToPDF: async (filters) => {
    try {
      const response = await api.get('/absences/export/pdf', { 
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'absences-export.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting absences to PDF:', error);
      throw error;
    }
  }
};

export default absenceService;