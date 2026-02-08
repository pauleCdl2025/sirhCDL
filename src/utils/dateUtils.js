/**
 * Formate une date au format local français (DD/MM/YYYY)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Vérifie si une date est dans le passé
 * @param {string|Date} date - La date à vérifier
 * @returns {boolean} - true si la date est dans le passé
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    const today = new Date();
    
    // Réinitialiser les heures, minutes, secondes et millisecondes pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
};

/**
 * Vérifie si un contrat expire bientôt (dans les 30 jours)
 * @param {string|Date} endDate - La date de fin du contrat
 * @returns {boolean} - true si le contrat expire dans les 30 jours
 */
export const isContractAboutToExpire = (endDate) => {
  if (!endDate) return false;
  
  try {
    const dateObj = new Date(endDate);
    const today = new Date();
    
    // Réinitialiser les heures, minutes, secondes et millisecondes pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    // Si la date est déjà passée, le contrat n'est pas "sur le point d'expirer", il est déjà expiré
    if (dateObj < today) {
      return false;
    }
    
    // Calculer la différence en jours
    const diffTime = dateObj - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Retourner true si la date d'expiration est dans les 30 prochains jours
    return diffDays <= 30;
  } catch (error) {
    console.error('Error checking if contract is about to expire:', error);
    return false;
  }
};

/**
 * Vérifie si un contrat est expiré
 * @param {string|Date} endDate - La date de fin du contrat
 * @returns {boolean} - true si le contrat est expiré
 */
export const isContractExpired = (endDate) => {
  if (!endDate) return false;
  
  try {
    const dateObj = new Date(endDate);
    const today = new Date();
    
    // Réinitialiser les heures, minutes, secondes et millisecondes pour comparer uniquement les dates
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    console.error('Error checking if contract is expired:', error);
    return false;
  }
};

/**
 * Calcule l'âge à partir d'une date de naissance
 * @param {string|Date} birthDate - La date de naissance
 * @returns {number|null} - L'âge calculé ou null si la date n'est pas valide
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  try {
    const birthDateObj = new Date(birthDate);
    
    // Vérifier si la date est valide
    if (isNaN(birthDateObj.getTime())) {
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error('Error calculating age:', error);
    return null;
  }
};

/**
 * Calcule le nombre d'années de service depuis la date d'embauche
 * @param {string|Date} hireDate - La date d'embauche
 * @returns {number|null} - Le nombre d'années de service ou null si la date n'est pas valide
 */
export const calculateYearsOfService = (hireDate) => {
  if (!hireDate) return null;
  
  try {
    const hireDateObj = new Date(hireDate);
    
    // Vérifier si la date est valide
    if (isNaN(hireDateObj.getTime())) {
      return null;
    }
    
    const today = new Date();
    let years = today.getFullYear() - hireDateObj.getFullYear();
    const monthDiff = today.getMonth() - hireDateObj.getMonth();
    
    // Ajuster le nombre d'années si l'anniversaire d'embauche n'est pas encore passé cette année
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < hireDateObj.getDate())) {
      years--;
    }
    
    return years;
  } catch (error) {
    console.error('Error calculating years of service:', error);
    return null;
  }
};

/**
 * Formate une date au format complet (jour de la semaine, jour, mois, année)
 * @param {string|Date} date - La date à formater
 * @returns {string} - La date formatée
 */
export const formatFullDate = (date) => {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting full date:', error);
    return '-';
  }
};