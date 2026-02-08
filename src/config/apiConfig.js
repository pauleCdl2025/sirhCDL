// Configuration centralisée pour les appels API
export const API_CONFIG = {
  // Timeouts par défaut
  DEFAULT_TIMEOUT: 10000, // 10 secondes
  UPLOAD_TIMEOUT: 120000,  // 2 minutes pour les uploads
  ONBOARDING_TIMEOUT: 180000, // 3 minutes pour l'onboarding
  
  // URLs de base
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Configuration pour les uploads
  UPLOAD_HEADERS: {
    'Content-Type': 'multipart/form-data',
  },
  
  // Messages d'erreur personnalisés
  ERROR_MESSAGES: {
    TIMEOUT: 'Le serveur prend trop de temps à répondre. Veuillez réessayer.',
    GATEWAY_TIMEOUT: 'Erreur de gateway timeout. Le serveur est temporairement indisponible.',
    NETWORK_ERROR: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
    SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
    UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  }
};

// Fonction utilitaire pour créer une configuration axios
export const createAxiosConfig = (options = {}) => {
  const {
    timeout = API_CONFIG.DEFAULT_TIMEOUT,
    headers = {},
    ...otherOptions
  } = options;
  
  return {
    timeout,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...headers,
    },
    ...otherOptions,
  };
};

// Configuration spécifique pour l'onboarding
export const ONBOARDING_CONFIG = createAxiosConfig({
  timeout: API_CONFIG.ONBOARDING_TIMEOUT,
  headers: API_CONFIG.UPLOAD_HEADERS,
});

// Configuration pour les uploads de fichiers
export const UPLOAD_CONFIG = createAxiosConfig({
  timeout: API_CONFIG.UPLOAD_TIMEOUT,
  headers: API_CONFIG.UPLOAD_HEADERS,
});
