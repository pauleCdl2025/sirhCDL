// Configuration de l'API
const API_CONFIG = {
  // URL de base de l'API backend
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Endpoints
  ENDPOINTS: {
    EMPLOYEES: {
      ACTIVE: '/api/employees/active',
      OFFBOARDING: '/api/employees/offboarding',
      ONBOARDING: '/api/employees/onboarding'
    }
  },
  
  // Méthode pour construire une URL complète
  buildUrl: (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  }
};

export default API_CONFIG;




