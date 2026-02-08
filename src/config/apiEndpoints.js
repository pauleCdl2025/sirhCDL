// Configuration des endpoints API pour les contrats
export const CONTRACT_API_ENDPOINTS = {
  // Endpoints de base
  BASE: '/contrats',
  
  // Opérations CRUD
  GET_ALL: '/contrats',
  GET_BY_ID: (id) => `/contrats/${id}`,
  GET_BY_EMPLOYEE: (employeeId) => `/contrats/employee/${employeeId}`,
  CREATE: '/contrats',
  UPDATE: (id) => `/contrats/${id}`,
  DELETE: (id) => `/contrats/${id}`,
  
  // Opérations spécialisées
  TERMINATE: (id) => `/contrats/${id}/terminate`,
  SEND_TO_EMPLOYEE: (id) => `/contrats/${id}/send`,
  GET_HISTORY: (id) => `/contrats/${id}/history`,
  DOWNLOAD: (id) => `/contrats/${id}/download`,
  GENERATE: '/contrats/generate',
  
  // Endpoints pour les actions en lot
  BULK_SEND: '/contrats/bulk/send',
  BULK_DOWNLOAD: '/contrats/bulk/download',
  BULK_DELETE: '/contrats/bulk/delete',
};

// Configuration des messages d'erreur
export const CONTRACT_ERROR_MESSAGES = {
  NOT_FOUND: 'Contrat non trouvé',
  EMPLOYEE_NOT_FOUND: 'Employé non trouvé',
  PERMISSION_DENIED: 'Vous n\'avez pas les permissions pour cette action',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard',
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet',
  VALIDATION_ERROR: 'Données invalides. Vérifiez les informations saisies',
  SEND_ERROR: 'Erreur lors de l\'envoi du contrat',
  DOWNLOAD_ERROR: 'Erreur lors du téléchargement',
  GENERATE_ERROR: 'Erreur lors de la génération du contrat',
};

// Configuration des statuts de contrat
export const CONTRACT_STATUSES = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring-soon',
  TERMINATED: 'terminated',
  DRAFT: 'draft',
};

// Configuration des types de contrat
export const CONTRACT_TYPES = {
  CDI: 'CDI',
  CDD: 'CDD',
  PRESTATAIRE: 'Prestataire',
  STAGE: 'Stage',
  STAGE_PNPE: 'Stage PNPE',
};

// Configuration des actions d'historique
export const CONTRACT_HISTORY_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  SEND: 'send',
  DOWNLOAD: 'download',
  TERMINATE: 'terminate',
  RENEW: 'renew',
};











