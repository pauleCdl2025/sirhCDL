import api from './api';

const procedureService = {
  // Récupérer tous les dossiers avec filtres
  getAllDossiers: async (params = {}) => {
    try {
      const response = await api.get('/procedures/dossiers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStatistiques: async () => {
    try {
      const response = await api.get('/procedures/statistiques');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistiques:', error);
      throw error;
    }
  },

  // Récupérer un dossier spécifique
  getDossier: async (id) => {
    try {
      const response = await api.get(`/procedures/dossiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dossier:', error);
      throw error;
    }
  },

  // Créer un nouveau dossier
  createDossier: async (dossierData) => {
    try {
      const response = await api.post('/procedures/dossiers', dossierData);
      return response.data;
    } catch (error) {
      console.error('Error creating dossier:', error);
      throw error;
    }
  },

  // Mettre à jour un dossier
  updateDossier: async (id, dossierData) => {
    try {
      const response = await api.put(`/procedures/dossiers/${id}`, dossierData);
      return response.data;
    } catch (error) {
      console.error('Error updating dossier:', error);
      throw error;
    }
  },

  // Supprimer un dossier
  deleteDossier: async (id) => {
    try {
      const response = await api.delete(`/procedures/dossiers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dossier:', error);
      throw error;
    }
  },

  // Ajouter un commentaire
  addCommentaire: async (dossierId, commentaireData) => {
    try {
      const response = await api.post(`/procedures/dossiers/${dossierId}/commentaires`, commentaireData);
      return response.data;
    } catch (error) {
      console.error('Error adding commentaire:', error);
      throw error;
    }
  },

  // Upload un document
  uploadDocument: async (dossierId, documentData) => {
    try {
      const formData = new FormData();
      formData.append('document', documentData.file);
      formData.append('document_requis_id', documentData.document_requis_id);
      if (documentData.commentaire) {
        formData.append('commentaire', documentData.commentaire);
      }

      const response = await api.post(`/procedures/dossiers/${dossierId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Récupérer les étapes de procédure
  getEtapes: async () => {
    try {
      const response = await api.get('/procedures/etapes');
      return response.data;
    } catch (error) {
      console.error('Error fetching etapes:', error);
      throw error;
    }
  },

  // Récupérer les documents requis par étape
  getDocumentsRequis: async (etape) => {
    try {
      const response = await api.get(`/procedures/etapes/${etape}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents requis:', error);
      throw error;
    }
  },

  // Renvoyer le lien d'accès
  renvoyerLien: async (dossierId) => {
    try {
      const response = await api.post(`/procedures/dossiers/${dossierId}/renvoyer-lien`);
      return response.data;
    } catch (error) {
      console.error('Error resending link:', error);
      throw error;
    }
  },

  // Fonction utilitaire pour formater les dates
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Fonction utilitaire pour obtenir le statut coloré
  getStatusColor: (statut) => {
    const colors = {
      'nouveau': 'primary',
      'authentification': 'warning',
      'homologation': 'info',
      'cnom': 'purple',
      'autorisation_exercer': 'success',
      'autorisation_travail': 'success'
    };
    return colors[statut] || 'secondary';
  },

  // Fonction utilitaire pour obtenir le titre du statut
  getStatusTitle: (statut) => {
    const titles = {
      'nouveau': 'Dossier créé',
      'authentification': 'Authentification des diplômes',
      'homologation': 'Demande d\'homologation',
      'cnom': 'Enregistrement CNOM',
      'autorisation_exercer': 'Autorisation d\'exercer',
      'autorisation_travail': 'Autorisation de travail'
    };
    return titles[statut] || statut;
  }
};

export default procedureService;







