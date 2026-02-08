import api from './api';

const TASK_API_URL = '/tasks';

export const taskService = {
  // Récupérer toutes les tâches
  async getAllTasks() {
    try {
      const response = await api.get(TASK_API_URL);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      throw error;
    }
  },

  // Récupérer une tâche par ID
  async getTaskById(id) {
    try {
      const response = await api.get(`${TASK_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      throw error;
    }
  },

  // Créer une nouvelle tâche
  async createTask(taskData) {
    try {
      const response = await api.post(TASK_API_URL, taskData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  },

  // Mettre à jour une tâche
  async updateTask(id, taskData) {
    try {
      const response = await api.put(`${TASK_API_URL}/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw error;
    }
  },

  // Supprimer une tâche
  async deleteTask(id) {
    try {
      const response = await api.delete(`${TASK_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(id, status) {
    try {
      const response = await api.patch(`${TASK_API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  // Mettre à jour la progression d'une tâche
  async updateTaskProgress(id, progress) {
    try {
      const response = await api.patch(`${TASK_API_URL}/${id}/progress`, { progress });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des tâches
  async getTaskStats() {
    try {
      const response = await api.get(`${TASK_API_URL}/stats/overview`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
};
