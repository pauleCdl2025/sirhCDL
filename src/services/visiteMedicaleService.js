// Service pour les visites médicales
export const visiteMedicaleService = {
    // Récupérer toutes les visites médicales
    getAll: async () => {
      try {
        const response = await api.get('/visites-medicales');
        return response.data;
      } catch (error) {
        console.error('Error fetching medical visits:', error);
        throw error;
      }
    },
    
    // Récupérer une visite médicale par ID
    getById: async (id) => {
      try {
        const response = await api.get(`/visites-medicales/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching medical visit ${id}:`, error);
        throw error;
      }
    },
    
    // Créer une nouvelle visite médicale
    create: async (visiteData) => {
      try {
        const response = await api.post('/visites-medicales', visiteData);
        return response.data;
      } catch (error) {
        console.error('Error creating medical visit:', error);
        throw error;
      }
    },
    
    // Mettre à jour une visite médicale
    update: async (id, visiteData) => {
      try {
        const response = await api.put(`/visites-medicales/${id}`, visiteData);
        return response.data;
      } catch (error) {
        console.error(`Error updating medical visit ${id}:`, error);
        throw error;
      }
    },
    
    // Mettre à jour le statut d'une visite médicale
    updateStatus: async (id, statusData) => {
      try {
        const response = await api.put(`/visites-medicales/${id}/status`, statusData);
        return response.data;
      } catch (error) {
        console.error(`Error updating medical visit status ${id}:`, error);
        throw error;
      }
    },
    
    // Supprimer une visite médicale
    delete: async (id) => {
      try {
        const response = await api.delete(`/visites-medicales/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting medical visit ${id}:`, error);
        throw error;
      }
    },
    
    // Rechercher des visites médicales avec filtres
    search: async (filters) => {
      try {
        const response = await api.get('/visites-medicales/search', { params: filters });
        return response.data;
      } catch (error) {
        console.error('Error searching medical visits:', error);
        throw error;
      }
    },
    
    // Obtenir des statistiques sur les visites médicales
    getStatistics: async () => {
      try {
        const response = await api.get('/visites-medicales/stats/overview');
        return response.data;
      } catch (error) {
        console.error('Error fetching medical visit statistics:', error);
        // Retourner des statistiques par défaut en cas d'erreur pour éviter les crashs d'UI
        return {
          overdueCount: 0,
          days30Count: 0,
          days90Count: 0,
          completedCount: 0
        };
      }
    }
  };