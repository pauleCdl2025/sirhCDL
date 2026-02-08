// Constantes pour le composant EmployeePortal

// Types de demandes
export const REQUEST_TYPES = {
  LEAVE: 'leave',
  DOCUMENT: 'document',
  OTHER: 'other'
};

// Statuts des demandes
export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

// Types de documents
export const DOCUMENT_TYPES = {
  PAYSLIP: 'payslip',
  CERTIFICATE: 'certificate',
  CONTRACT: 'contract',
  OTHER: 'other'
};

// Catégories de notes de service
export const NOTE_CATEGORIES = {
  INFORMATION: 'Information',
  ORGANISATION: 'Organisation',
  RAPPEL: 'Rappel',
  PROCEDURE: 'Procédure',
  EVENEMENT: 'Évènement',
  RECRUTEMENT: 'Recrutement'
};

// Priorités des annonces
export const ANNOUNCEMENT_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Statuts des sanctions
export const SANCTION_STATUS = {
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée'
};

// Types de sanctions
export const SANCTION_TYPES = {
  AVERTISSEMENT: 'Avertissement',
  BLAME: 'Blâme',
  MISE_A_PIED: 'Mise à pied',
  EXCLUSION: 'Exclusion'
};

// Onglets du portail
export const PORTAL_TABS = {
  DASHBOARD: 'dashboard',
  DOCUMENTS: 'documents',
  REQUESTS: 'requests',
  NOTES: 'notes',
  EVENTS: 'events',
  SANCTIONS: 'sanctions',
  PROFILE: 'profile'
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Erreur lors de la vérification de l\'authentification',
  LOADING_FAILED: 'Une erreur est survenue lors du chargement des données. Veuillez réessayer.',
  REQUEST_FAILED: 'Une erreur est survenue lors de la création de la demande. Veuillez réessayer.',
  CANCELLATION_FAILED: 'Une erreur est survenue lors de l\'annulation de la demande. Veuillez réessayer.',
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  VALIDATION_ERROR: 'Veuillez vérifier les informations saisies.',
  PERMISSION_DENIED: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  REQUEST_CREATED: 'Votre demande a été soumise avec succès.',
  REQUEST_CANCELLED: 'Votre demande a été annulée avec succès.',
  PROFILE_UPDATED: 'Votre profil a été mis à jour avec succès.',
  DOCUMENT_DOWNLOADED: 'Le document a été téléchargé avec succès.',
  LOGOUT_SUCCESS: 'Vous avez été déconnecté avec succès.'
};

// Messages d'information
export const INFO_MESSAGES = {
  NO_EVENTS: 'Aucun événement prévu prochainement.',
  NO_NOTES: 'Aucune note de service disponible.',
  NO_REQUESTS: 'Vous n\'avez pas de demandes récentes.',
  NO_SANCTIONS: 'Vous n\'avez pas de sanctions disciplinaires à votre dossier.',
  NO_DOCUMENTS: 'Aucun document disponible.',
  LOADING: 'Chargement en cours...',
  NO_DATA: 'Aucune donnée disponible.'
};

// Validation des formulaires
export const VALIDATION_RULES = {
  REQUIRED: 'Ce champ est obligatoire',
  EMAIL: 'Veuillez saisir une adresse email valide',
  PHONE: 'Veuillez saisir un numéro de téléphone valide',
  DATE_FUTURE: 'La date doit être dans le futur',
  DATE_END_AFTER_START: 'La date de fin doit être postérieure à la date de début',
  MIN_LENGTH: (min) => `Ce champ doit contenir au moins ${min} caractères`,
  MAX_LENGTH: (max) => `Ce champ ne peut pas dépasser ${max} caractères`
};

// Limites de données
export const DATA_LIMITS = {
  EVENTS_PREVIEW: 3,
  NOTES_PREVIEW: 3,
  REQUESTS_PREVIEW: 5,
  DOCUMENTS_PREVIEW: 10,
  SEARCH_RESULTS: 50,
  PAGINATION_SIZE: 20
};

// Délais et timeouts
export const TIMEOUTS = {
  API_REQUEST: 10000,
  SESSION_TIMEOUT: 3600000, // 1 heure
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  THROTTLE_LIMIT: 1000
};

// Formats de date
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'dddd DD MMMM YYYY',
  TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'DD MMMM YYYY'
};

// Formats de fichier
export const FILE_FORMATS = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS: 'application/vnd.ms-excel',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  IMAGE: 'image/*'
};

// Tailles de fichier (en octets)
export const FILE_SIZES = {
  MAX_UPLOAD: 10 * 1024 * 1024, // 10 MB
  MAX_PREVIEW: 5 * 1024 * 1024, // 5 MB
  THUMBNAIL: 100 * 1024 // 100 KB
};

// Codes d'erreur HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Codes d'erreur personnalisés
export const CUSTOM_ERROR_CODES = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND'
};

// Actions utilisateur
export const USER_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  DOWNLOAD: 'download',
  UPLOAD: 'upload'
};

// Permissions
export const PERMISSIONS = {
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  VIEW_DOCUMENTS: 'view_documents',
  DOWNLOAD_DOCUMENTS: 'download_documents',
  CREATE_REQUESTS: 'create_requests',
  CANCEL_REQUESTS: 'cancel_requests',
  VIEW_SANCTIONS: 'view_sanctions',
  VIEW_NOTES: 'view_notes',
  VIEW_EVENTS: 'view_events'
};

// Rôles utilisateur
export const USER_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR_ADMIN: 'hr_admin',
  SUPER_ADMIN: 'super_admin'
};

// États de chargement
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  SUBMITTING: 'submitting'
};

// Types de notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Priorités des notifications
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Durées de cache (en millisecondes)
export const CACHE_DURATIONS = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  EVENTS: 15 * 60 * 1000, // 15 minutes
  NOTES: 30 * 60 * 1000, // 30 minutes
  DOCUMENTS: 60 * 60 * 1000, // 1 heure
  SANCTIONS: 24 * 60 * 60 * 1000 // 24 heures
};

// Configuration des thèmes
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Configuration des langues
export const LANGUAGE_CONFIG = {
  FR: 'fr',
  EN: 'en',
  ES: 'es'
};

// Configuration des fuseaux horaires
export const TIMEZONE_CONFIG = {
  DEFAULT: 'Europe/Paris',
  UTC: 'UTC',
  LOCAL: 'local'
};












