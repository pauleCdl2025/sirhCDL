// Configuration pour les composants de graphiques

export const CHARTS_CONFIG = {
  // Configuration de l'API
  API: {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    ENDPOINTS: {
      EMPLOYEES: '/employees',
      CONTRACTS: '/employees/alerts/expiring-contracts',
      DEPARTMENTS: '/departments',
      ABSENCES: '/absences'
    },
    TIMEOUT: 10000, // 10 secondes
    RETRY_ATTEMPTS: 3
  },

  // Configuration des graphiques
  CHARTS: {
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    ANIMATION_DURATION: 600, // 0.6 secondes
    COLORS: {
      PRIMARY: '#3a7bd5',
      SECONDARY: '#00d1b2',
      SUCCESS: '#28a745',
      WARNING: '#ffc107',
      DANGER: '#dc3545',
      INFO: '#17a2b8'
    },
    PALETTE: [
      '#3a7bd5',
      '#00d1b2',
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#96ceb4',
      '#feca57',
      '#ff9ff3',
      '#54a0ff',
      '#5f27cd'
    ]
  },

  // Configuration des données de démonstration
  DEMO_DATA: {
    EMPLOYEES_COUNT: 20,
    DEPARTMENTS: [
      'Médecine Générale',
      'Cardiologie',
      'Radiologie',
      'Laboratoire',
      'Administration'
    ],
    CONTRACT_STATUSES: ['Expirés', 'Critiques', 'En alerte', 'OK'],
    ABSENCE_TYPES: ['Maladie', 'Congés', 'Formation', 'Autre']
  },

  // Configuration de l'interface
  UI: {
    LOADING_DELAY: 1500, // 1.5 secondes pour la démo
    ANIMATIONS: {
      FADE_IN: 800,
      SLIDE_DOWN: 600,
      SLIDE_UP: 600
    },
    RESPONSIVE: {
      BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1200
      }
    }
  }
};

// Fonctions utilitaires
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getDaysRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
};

export const getContractStatus = (daysRemaining) => {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining < 15) return 'critical';
  if (daysRemaining < 30) return 'warning';
  return 'ok';
};

export const getStatusColor = (status) => {
  const colors = {
    expired: '#dc3545',
    critical: '#ffc107',
    warning: '#17a2b8',
    ok: '#28a745'
  };
  return colors[status] || '#6c757d';
};

export const getStatusLabel = (status) => {
  const labels = {
    expired: 'Expirés',
    critical: 'Critiques',
    warning: 'En alerte',
    ok: 'OK'
  };
  return labels[status] || 'Inconnu';
};




