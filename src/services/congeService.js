import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const isSupabase = API_URL?.includes?.('supabase.co');

const defaultHeaders = {
  'Content-Type': 'application/json',
  ...(isSupabase && SUPABASE_ANON_KEY && {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY
  })
};

// Création d'une instance axios avec l'URL de base
const api = axios.create({
  baseURL: API_URL,
  headers: defaultHeaders
});

// Intercepteur pour ajouter le token ou la clé Supabase (priorité Supabase si utilisée)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (isSupabase && SUPABASE_ANON_KEY) {
      config.headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
      config.headers.apikey = SUPABASE_ANON_KEY;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    const formDataToObject = (fd) => {
      const obj = {};
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) continue;
        obj[key] = value;
      }
      return obj;
    };

    try {
      const config = congeData instanceof FormData ? {} : {
        headers: { 'Content-Type': 'application/json' }
      };
      const payload = congeData instanceof FormData ? formDataToObject(congeData) : congeData;

      try {
        const response = await api.post('/conges', congeData, config);
        return response.data;
      } catch (edgeError) {
        if (isSupabase && SUPABASE_ANON_KEY && edgeError.response?.status === 404) {
          const restBase = API_URL.replace(/\/functions\/v1\/?$/, '/rest/v1');
          const restRes = await axios.post(`${restBase}/conges`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation'
            }
          });
          const data = Array.isArray(restRes.data) ? restRes.data[0] : restRes.data;
          return data;
        }
        throw edgeError;
      }
    } catch (error) {
      console.error('Error creating conge:', error);
      throw error;
    }
  },
  
  // Mettre à jour un congé
  update: async (id, congeData) => {
    const formDataToObject = (fd) => {
      const obj = {};
      for (const [key, value] of fd.entries()) {
        if (value instanceof File) continue;
        obj[key] = value;
      }
      return obj;
    };
    const payload = congeData instanceof FormData ? formDataToObject(congeData) : congeData;

    try {
      const config = congeData instanceof FormData ? {} : {
        headers: { 'Content-Type': 'application/json' }
      };
      try {
        const response = await api.put(`/conges/${id}`, congeData, config);
        return response.data;
      } catch (edgeError) {
        if (isSupabase && SUPABASE_ANON_KEY && edgeError.response?.status === 404) {
          const restBase = API_URL.replace(/\/functions\/v1\/?$/, '/rest/v1');
          const restRes = await axios.patch(`${restBase}/conges?id=eq.${id}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Prefer': 'return=representation'
            }
          });
          return Array.isArray(restRes.data) ? restRes.data[0] : restRes.data;
        }
        throw edgeError;
      }
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