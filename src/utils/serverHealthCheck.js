// Utilitaire pour vérifier la santé du serveur
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export const serverHealthCheck = {
  // Vérifier si le serveur répond
  async checkServerStatus() {
    try {
      // Utiliser un endpoint existant au lieu de /health
      const response = await axios.get(`${API_CONFIG.BASE_URL}/employees`, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      return {
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'unknown',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur de vérification du serveur:', error);
      
      // Si c'est une erreur 401, le serveur fonctionne mais l'authentification a échoué
      if (error.response?.status === 401) {
        return {
          status: 'healthy',
          responseTime: 'unknown',
          note: 'Serveur accessible mais authentification requise',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'unhealthy',
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Vérifier la connectivité réseau
  async checkNetworkConnectivity() {
    try {
      const startTime = Date.now();
      // Utiliser un endpoint simple qui existe
      await axios.get(`${API_CONFIG.BASE_URL}/employees`, {
        timeout: 3000,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Si c'est une erreur 401, la connexion fonctionne
      if (error.response?.status === 401) {
        return {
          status: 'connected',
          responseTime: 'unknown',
          note: 'Connexion établie mais authentification requise',
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Test de performance du serveur
  async testServerPerformance() {
    const tests = [];
    
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      try {
        await axios.get(`${API_CONFIG.BASE_URL}/employees`, {
          timeout: 5000,
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        const responseTime = Date.now() - startTime;
        tests.push({
          test: i + 1,
          responseTime,
          status: 'success'
        });
      } catch (error) {
        // Considérer 401 comme un succès (serveur accessible)
        if (error.response?.status === 401) {
          const responseTime = Date.now() - startTime;
          tests.push({
            test: i + 1,
            responseTime,
            status: 'success',
            note: 'Authentification requise'
          });
        } else {
          tests.push({
            test: i + 1,
            error: error.message,
            status: 'failed'
          });
        }
      }
    }
    
    const successfulTests = tests.filter(t => t.status === 'success');
    const avgResponseTime = successfulTests.length > 0 
      ? successfulTests.reduce((acc, t) => acc + t.responseTime, 0) / successfulTests.length
      : 0;
    
    return {
      tests,
      averageResponseTime: avgResponseTime,
      successRate: (successfulTests.length / tests.length) * 100
    };
  },

  // Diagnostic complet
  async runFullDiagnostic() {
    console.log('🔍 Démarrage du diagnostic serveur...');
    
    const results = {
      timestamp: new Date().toISOString(),
      network: await this.checkNetworkConnectivity(),
      server: await this.checkServerStatus(),
      performance: await this.testServerPerformance()
    };
    
    console.log('📊 Résultats du diagnostic:', results);
    
    return results;
  }
};
