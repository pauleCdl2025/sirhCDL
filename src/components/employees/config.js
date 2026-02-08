// Configuration du composant EmployeePortal

export const CONFIG = {
  // Configuration de l'API
  API: {
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // Configuration de l'interface
  UI: {
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 70,
    MODAL_ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000
  },

  // Configuration des données
  DATA: {
    EVENTS_PREVIEW_LIMIT: 3,
    NOTES_PREVIEW_LIMIT: 3,
    REQUESTS_PREVIEW_LIMIT: 5,
    DOCUMENTS_PREVIEW_LIMIT: 10
  },

  // Configuration des permissions
  PERMISSIONS: {
    CAN_CREATE_REQUESTS: true,
    CAN_CANCEL_REQUESTS: true,
    CAN_VIEW_SANCTIONS: true,
    CAN_VIEW_DOCUMENTS: true,
    CAN_VIEW_NOTES: true,
    CAN_VIEW_EVENTS: true
  },

  // Configuration des types de demandes
  REQUEST_TYPES: {
    LEAVE: {
      label: 'Congé',
      icon: 'fa-calendar-alt',
      color: '#3498db',
      requiresDates: true
    },
    DOCUMENT: {
      label: 'Document',
      icon: 'fa-file-alt',
      color: '#2ecc71',
      requiresDates: false
    },
    OTHER: {
      label: 'Autre',
      icon: 'fa-clipboard-list',
      color: '#9b59b6',
      requiresDates: false
    }
  },

  // Configuration des statuts
  STATUS_CONFIG: {
    PENDING: {
      label: 'En attente',
      class: 'status-pending',
      color: '#f39c12'
    },
    APPROVED: {
      label: 'Approuvé',
      class: 'status-approved',
      color: '#27ae60'
    },
    REJECTED: {
      label: 'Refusé',
      class: 'status-rejected',
      color: '#e74c3c'
    },
    COMPLETED: {
      label: 'Terminé',
      class: 'status-completed',
      color: '#3498db'
    }
  },

  // Configuration des catégories de notes
  NOTE_CATEGORIES: {
    INFORMATION: {
      label: 'Information',
      class: 'category-info',
      color: '#3498db'
    },
    ORGANISATION: {
      label: 'Organisation',
      class: 'category-organisation',
      color: '#2ecc71'
    },
    RAPPEL: {
      label: 'Rappel',
      class: 'category-reminder',
      color: '#f39c12'
    },
    PROCEDURE: {
      label: 'Procédure',
      class: 'category-procedure',
      color: '#9b59b6'
    },
    EVENEMENT: {
      label: 'Évènement',
      class: 'category-event',
      color: '#e74c3c'
    },
    RECRUTEMENT: {
      label: 'Recrutement',
      class: 'category-recruitment',
      color: '#1abc9c'
    }
  },

  // Configuration des types de documents
  DOCUMENT_TYPES: {
    PAYSLIP: {
      label: 'Fiche de paie',
      icon: 'fa-file-invoice-dollar',
      color: '#27ae60'
    },
    CERTIFICATE: {
      label: 'Attestation',
      icon: 'fa-certificate',
      color: '#f39c12'
    },
    CONTRACT: {
      label: 'Contrat',
      icon: 'fa-file-signature',
      color: '#3498db'
    },
    OTHER: {
      label: 'Autre',
      icon: 'fa-file-alt',
      color: '#95a5a6'
    }
  },

  // Configuration des priorités
  PRIORITIES: {
    HIGH: {
      label: 'Haute',
      class: 'priority-high',
      color: '#e74c3c'
    },
    MEDIUM: {
      label: 'Moyenne',
      class: 'priority-medium',
      color: '#f39c12'
    },
    LOW: {
      label: 'Basse',
      class: 'priority-low',
      color: '#27ae60'
    }
  },

  // Configuration des messages
  MESSAGES: {
    SUCCESS: {
      REQUEST_CREATED: 'Votre demande a été soumise avec succès.',
      REQUEST_CANCELLED: 'Votre demande a été annulée avec succès.',
      PROFILE_UPDATED: 'Votre profil a été mis à jour avec succès.'
    },
    ERROR: {
      LOADING_FAILED: 'Une erreur est survenue lors du chargement des données. Veuillez réessayer.',
      REQUEST_FAILED: 'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.',
      AUTH_FAILED: 'Impossible de charger les données utilisateur. Veuillez vous reconnecter.',
      NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.'
    },
    INFO: {
      NO_EVENTS: 'Aucun événement prévu prochainement.',
      NO_NOTES: 'Aucune note de service disponible.',
      NO_REQUESTS: 'Vous n\'avez pas de demandes récentes.',
      NO_SANCTIONS: 'Vous n\'avez pas de sanctions disciplinaires à votre dossier.'
    }
  },

  // Configuration des validations
  VALIDATION: {
    REQUIRED_FIELDS: {
      REASON: 'Le motif est requis',
      START_DATE: 'La date de début est requise',
      END_DATE: 'La date de fin est requise'
    },
    DATE_VALIDATION: {
      END_DATE_AFTER_START: 'La date de fin doit être postérieure à la date de début',
      FUTURE_DATES_ONLY: 'Les dates doivent être dans le futur'
    }
  }
};

// Fonctions utilitaires de configuration
export const getConfigValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
};

export const getRequestTypeConfig = (type) => {
  return CONFIG.REQUEST_TYPES[type.toUpperCase()] || CONFIG.REQUEST_TYPES.OTHER;
};

export const getStatusConfig = (status) => {
  return CONFIG.STATUS_CONFIG[status.toUpperCase()] || CONFIG.STATUS_CONFIG.PENDING;
};

export const getNoteCategoryConfig = (category) => {
  return CONFIG.NOTE_CATEGORIES[category.toUpperCase()] || CONFIG.NOTE_CATEGORIES.OTHER;
};

export const getDocumentTypeConfig = (type) => {
  return CONFIG.DOCUMENT_TYPES[type.toUpperCase()] || CONFIG.DOCUMENT_TYPES.OTHER;
};

export const getPriorityConfig = (priority) => {
  return CONFIG.PRIORITIES[priority.toUpperCase()] || CONFIG.PRIORITIES.MEDIUM;
};

export const getMessage = (type, key) => {
  return CONFIG.MESSAGES[type.toUpperCase()]?.[key] || 'Message non défini';
};












