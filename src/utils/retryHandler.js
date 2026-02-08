// Gestionnaire de retry pour les appels API
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const retryHandler = {
  // Configuration du retry
  config: {
    maxRetries: 1, // Réduit à 1 tentative pour éviter les délais inutiles
    baseDelay: 3000, // Augmenté à 3 secondes
    maxDelay: 10000, // Réduit à 10 secondes
    backoffMultiplier: 1.5, // Réduit le backoff
    retryableStatuses: [408, 429, 500, 502, 503, 504],
    retryableErrors: ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND']
  },

  // Calculer le délai d'attente avec backoff exponentiel
  calculateDelay(retryCount) {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, retryCount);
    return Math.min(delay, this.config.maxDelay);
  },

  // Vérifier si une erreur est retryable
  isRetryableError(error) {
    const status = error.response?.status;
    const code = error.code;
    
    // Pour les erreurs 504, on ne retry qu'une fois
    if (status === 504) {
      return true;
    }
    
    return (
      this.config.retryableStatuses.includes(status) ||
      this.config.retryableErrors.includes(code) ||
      error.message.includes('timeout') ||
      error.message.includes('network')
    );
  },

  // Fonction de retry avec backoff exponentiel
  async retryRequest(requestFn, retryCount = 0) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`🔄 Tentative ${retryCount + 1} échouée:`, error.message);
      console.log(`📊 Détails de l'erreur:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code,
        message: error.message
      });
      
      if (retryCount >= this.config.maxRetries || !this.isRetryableError(error)) {
        console.log(`❌ Arrêt des tentatives après ${retryCount + 1} échecs`);
        throw error;
      }
      
      const delay = this.calculateDelay(retryCount);
      console.log(`⏳ Nouvelle tentative dans ${delay}ms... (${retryCount + 1}/${this.config.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.retryRequest(requestFn, retryCount + 1);
    }
  },

  // Wrapper pour les appels axios avec retry
  async axiosWithRetry(config, retryCount = 0) {
    const requestFn = () => axios(config);
    return this.retryRequest(requestFn, retryCount);
  },

  // Fonction spécifique pour l'onboarding avec retry
  async onboardingWithRetry(formData, onProgress) {
    console.log('🚀 Démarrage de l\'onboarding avec retry...');
    
    const submitData = new FormData();
    
    // Ajouter les données de base
    const employeeData = {
      ...formData.employeeInfo,
      ...formData.professionalInfo,
      checklist: formData.checklist
    };
    
    submitData.append('employeeData', JSON.stringify(employeeData));
    console.log('📋 Données employé:', employeeData);
    
    // Ajouter les documents avec vérification de taille
    let totalSize = 0;
    formData.documents.forEach((doc, index) => {
      if (doc.file) {
        totalSize += doc.file.size;
        submitData.append('documents', doc.file);
        submitData.append('documentTypes', doc.type);
        console.log(`📄 Document ${index + 1}: ${doc.file.name} (${(doc.file.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    });
    
    console.log(`📊 Taille totale des documents: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    const config = {
      method: 'post',
      url: `${API_CONFIG.BASE_URL}/employees/onboarding`,
      data: submitData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      timeout: API_CONFIG.ONBOARDING_TIMEOUT,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📤 Upload progress: ${percentCompleted}%`);
          onProgress(progressEvent);
        }
      }
    };

    console.log('⚙️ Configuration de la requête:', {
      url: config.url,
      timeout: config.timeout,
      headers: config.headers
    });

    return this.axiosWithRetry(config);
  }
};
