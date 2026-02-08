import api from './api';

const INTERVIEW_API_URL = '/interviews';

export const interviewService = {
  // Récupérer tous les entretiens
  async getAllInterviews() {
    try {
      const response = await api.get(INTERVIEW_API_URL);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des entretiens:', error);
      throw error;
    }
  },

  // Récupérer un entretien par ID
  async getInterviewById(id) {
    try {
      const response = await api.get(`${INTERVIEW_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entretien:', error);
      throw error;
    }
  },

  // Créer un nouvel entretien
  async createInterview(interviewData) {
    try {
      const response = await api.post(INTERVIEW_API_URL, interviewData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'entretien:', error);
      throw error;
    }
  },

  // Mettre à jour un entretien
  async updateInterview(id, interviewData) {
    try {
      const response = await api.put(`${INTERVIEW_API_URL}/${id}`, interviewData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entretien:', error);
      throw error;
    }
  },

  // Supprimer un entretien
  async deleteInterview(id) {
    try {
      const response = await api.delete(`${INTERVIEW_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entretien:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'un entretien
  async updateInterviewStatus(id, status) {
    try {
      const response = await api.patch(`${INTERVIEW_API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }
};
