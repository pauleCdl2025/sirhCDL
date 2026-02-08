import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const adminService = {
  // Récupérer les statistiques globales
  getStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats/overview`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Récupérer les utilisateurs RH
  getRHUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users/rh`);
      return response.data;
    } catch (error) {
      console.error('Error fetching RH users:', error);
      throw error;
    }
  },

  // Récupérer les employés actifs
  getActiveEmployees: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/employees/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active employees:', error);
      throw error;
    }
  }
};

export default adminService;


