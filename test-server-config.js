// Script de test pour vérifier la configuration du serveur
// À exécuter côté serveur pour diagnostiquer les problèmes 504

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ServerTester {
  constructor(baseURL = 'http://localhost:5001') {
    this.baseURL = baseURL;
    this.results = [];
  }

  // Test de connectivité de base
  async testConnectivity() {
    console.log('🔍 Test de connectivité...');
    try {
      const response = await axios.get(`${this.baseURL}/api/employees`, {
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Serveur accessible');
      return true;
    } catch (error) {
      console.log('❌ Serveur inaccessible:', error.message);
      return false;
    }
  }

  // Test de performance de l'endpoint d'onboarding
  async testOnboardingPerformance() {
    console.log('🚀 Test de performance onboarding...');
    
    // Créer un fichier de test
    const testFile = path.join(__dirname, 'test-document.pdf');
    if (!fs.existsSync(testFile)) {
      // Créer un fichier PDF minimal pour le test
      const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n149\n%%EOF\n');
      fs.writeFileSync(testFile, pdfContent);
    }

    const formData = new FormData();
    formData.append('employeeData', JSON.stringify({
      matricule: 'CDL-2025-0001',
      nom_prenom: 'Test User',
      email: 'test@test.com',
      telephone: '0123456789',
      poste_actuel: 'Développeur',
      type_contrat: 'CDI',
      date_entree: '2025-01-01',
      entity: 'IT',
      departement: 'Développement',
      domaine_fonctionnel: 'Informatique',
      checklist: {
        contrat_signature: true,
        documents_verifies: true,
        acces_configure: false,
        formation_initiale: false,
        presentation_equipe: false
      }
    }));
    formData.append('documents', fs.createReadStream(testFile));
    formData.append('documentTypes', 'CV');

    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseURL}/api/employees/onboarding`, formData, {
        timeout: 180000, // 3 minutes
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer test-token'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload: ${percent}%`);
          }
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Onboarding réussi en ${duration}ms`);
      
      this.results.push({
        test: 'onboarding',
        status: 'success',
        duration,
        response: response.data
      });

      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ Onboarding échoué après ${duration}ms:`, error.message);
      
      this.results.push({
        test: 'onboarding',
        status: 'failed',
        duration,
        error: error.message,
        statusCode: error.response?.status
      });

      return false;
    }
  }

  // Test de charge pour identifier les goulots d'étranglement
  async testLoadPerformance() {
    console.log('⚡ Test de charge...');
    
    const concurrentRequests = 3;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(this.testOnboardingPerformance());
    }
    
    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r).length;
      console.log(`📊 ${successCount}/${concurrentRequests} requêtes réussies`);
    } catch (error) {
      console.log('❌ Test de charge échoué:', error.message);
    }
  }

  // Vérification de la configuration du serveur
  async checkServerConfig() {
    console.log('🔧 Vérification de la configuration...');
    
    const checks = [
      {
        name: 'Process Memory',
        check: () => {
          const memUsage = process.memoryUsage();
          const memMB = Math.round(memUsage.heapUsed / 1024 / 1024);
          console.log(`💾 Mémoire utilisée: ${memMB}MB`);
          return memMB < 500; // Moins de 500MB
        }
      },
      {
        name: 'CPU Usage',
        check: () => {
          const startUsage = process.cpuUsage();
          setTimeout(() => {
            const endUsage = process.cpuUsage(startUsage);
            const cpuPercent = (endUsage.user + endUsage.system) / 1000000;
            console.log(`🖥️ CPU usage: ${cpuPercent.toFixed(2)}ms`);
          }, 1000);
          return true;
        }
      },
      {
        name: 'File System',
        check: () => {
          const uploadDir = path.join(__dirname, 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          console.log('📁 Dossier uploads accessible');
          return true;
        }
      }
    ];

    checks.forEach(check => {
      try {
        const result = check.check();
        console.log(`${result ? '✅' : '❌'} ${check.name}`);
      } catch (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
      }
    });
  }

  // Génération du rapport
  generateReport() {
    console.log('\n📊 RAPPORT DE TEST');
    console.log('==================');
    
    this.results.forEach(result => {
      console.log(`\n${result.status === 'success' ? '✅' : '❌'} ${result.test}`);
      console.log(`   Durée: ${result.duration}ms`);
      if (result.error) {
        console.log(`   Erreur: ${result.error}`);
        console.log(`   Code: ${result.statusCode}`);
      }
    });

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS');
    console.log('==================');
    
    const failedTests = this.results.filter(r => r.status === 'failed');
    if (failedTests.length > 0) {
      console.log('❌ Problèmes détectés:');
      failedTests.forEach(test => {
        if (test.statusCode === 504) {
          console.log('   - Erreur 504: Augmentez les timeouts côté serveur');
        } else if (test.duration > 60000) {
          console.log('   - Performance lente: Optimisez le traitement des fichiers');
        }
      });
    } else {
      console.log('✅ Tous les tests sont passés avec succès');
    }
  }

  // Exécution de tous les tests
  async runAllTests() {
    console.log('🚀 Démarrage des tests de configuration serveur...\n');
    
    await this.checkServerConfig();
    console.log('');
    
    const isConnected = await this.testConnectivity();
    if (!isConnected) {
      console.log('❌ Impossible de continuer - serveur inaccessible');
      return;
    }
    
    console.log('');
    await this.testOnboardingPerformance();
    console.log('');
    await this.testLoadPerformance();
    console.log('');
    
    this.generateReport();
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new ServerTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ServerTester;







