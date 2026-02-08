// Utilitaires pour le composant EmployeePortal

/**
 * Formate une date selon le format français
 * @param {string|Date} date - Date à formater
 * @param {string} format - Format de sortie ('short', 'long', 'time')
 * @returns {string} Date formatée
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return date; // Retourner la chaîne originale si ce n'est pas une date valide
    }
    
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return dateObj.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      default: // short
        return dateObj.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', date, error);
    return date;
  }
};

/**
 * Formate une date d'événement
 * @param {string} dateString - Date de l'événement
 * @returns {string} Date formatée
 */
export const formatEventDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Si la date est déjà formatée (comme "24/06/2025")
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Sinon, formater la date
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", dateString, error);
    return dateString;
  }
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {string|Date} startDate - Date de début
 * @param {string|Date} endDate - Date de fin
 * @returns {number} Nombre de jours
 */
export const calculateDaysDifference = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Erreur lors du calcul de la différence de jours:', error);
    return 0;
  }
};

/**
 * Vérifie si une date est dans le futur
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean} True si la date est dans le futur
 */
export const isFutureDate = (date) => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj > now;
  } catch (error) {
    console.error('Erreur lors de la vérification de la date future:', error);
    return false;
  }
};

/**
 * Vérifie si une date est dans le passé
 * @param {string|Date} date - Date à vérifier
 * @returns {boolean} True si la date est dans le passé
 */
export const isPastDate = (date) => {
  try {
    const dateObj = new Date(date);
    const now = new Date();
    return dateObj < now;
  } catch (error) {
    console.error('Erreur lors de la vérification de la date passée:', error);
    return false;
  }
};

/**
 * Formate la taille d'un fichier en format lisible
 * @param {number} bytes - Taille en octets
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Tronque un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @param {string} suffix - Suffixe à ajouter (par défaut '...')
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + suffix;
};

/**
 * Génère un ID unique
 * @returns {string} ID unique
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
};

/**
 * Nettoie et formate un numéro de téléphone
 * @param {string} phone - Numéro de téléphone à formater
 * @returns {string} Numéro formaté
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon le format français
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 11 && cleaned.startsWith('33')) {
    const national = cleaned.substring(2);
    return national.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone; // Retourner le numéro original si le format n'est pas reconnu
};

/**
 * Formate un nom propre (première lettre en majuscule)
 * @param {string} name - Nom à formater
 * @returns {string} Nom formaté
 */
export const formatProperName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param {string|Date} birthDate - Date de naissance
 * @returns {number} Âge calculé
 */
export const calculateAge = (birthDate) => {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Erreur lors du calcul de l\'âge:', error);
    return 0;
  }
};

/**
 * Vérifie si un objet est vide
 * @param {object} obj - Objet à vérifier
 * @returns {boolean} True si l'objet est vide
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0;
};

/**
 * Vérifie si un tableau est vide
 * @param {array} arr - Tableau à vérifier
 * @returns {boolean} True si le tableau est vide
 */
export const isEmptyArray = (arr) => {
  return !Array.isArray(arr) || arr.length === 0;
};

/**
 * Retourne la première valeur non-null/undefined d'une liste
 * @param {...any} values - Valeurs à vérifier
 * @returns {any} Première valeur non-null/undefined
 */
export const coalesce = (...values) => {
  return values.find(value => value != null);
};

/**
 * Retard asynchrone
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise} Promise qui se résout après le délai
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry avec délai exponentiel
 * @param {Function} fn - Fonction à exécuter
 * @param {number} maxAttempts - Nombre maximum de tentatives
 * @param {number} baseDelay - Délai de base en millisecondes
 * @returns {Promise} Résultat de la fonction
 */
export const retryWithExponentialBackoff = async (fn, maxAttempts = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à débouncer
 * @param {number} wait - Délai d'attente en millisecondes
 * @returns {Function} Fonction débouncée
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite en millisecondes
 * @returns {Function} Fonction throttlée
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};












