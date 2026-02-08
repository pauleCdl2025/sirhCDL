// Service pour l'historique de recrutement
export const recrutementService = {
    // Récupérer tous les recrutements
    getAll: async () => {
      try {
        const response = await api.get('/recrutements');
        return response.data;
      } catch (error) {
        console.error('Error fetching recruitment history:', error);
        throw error;
      }
    },
    
    // Récupérer un recrutement par ID
    getById: async (id) => {
      try {
        const response = await api.get(`/recrutements/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching recruitment ${id}:`, error);
        throw error;
      }
    },
    
    // Créer un nouveau recrutement
    create: async (formData) => {
      try {
        // Utiliser FormData pour permettre l'upload de CV
        const response = await api.post('/recrutements', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error creating recruitment record:', error);
        throw error;
      }
    },
    
    // Mettre à jour un recrutement
    update: async (id, formData) => {
      try {
        // Utiliser FormData pour permettre l'upload de CV
        const response = await api.put(`/recrutements/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error(`Error updating recruitment ${id}:`, error);
        throw error;
      }
    },
    
    // Supprimer un recrutement
    delete: async (id) => {
      try {
        const response = await api.delete(`/recrutements/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting recruitment ${id}:`, error);
        throw error;
      }
    },
    
    // Rechercher des recrutements
    search: async (filters) => {
      try {
        const response = await api.get('/recrutements/search/filter', { params: filters });
        return response.data;
      } catch (error) {
        console.error('Error searching recruitment records:', error);
        throw error;
      }
    },
    
    // Télécharger un CV
    downloadCV: async (id) => {
      try {
        // Utiliser window.open pour télécharger le fichier
        window.open(`${api.defaults.baseURL}/recrutements/cv/${id}`, '_blank');
        return true;
      } catch (error) {
        console.error('Error downloading CV:', error);
        throw error;
      }
    }
  };
  
  // Ajouter ce service à l'export dans api.js