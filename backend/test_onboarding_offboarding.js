const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here'; // Remplacez par un vrai token

// Fonction de test avec gestion d'erreur
async function testEndpoint(method, endpoint, data = null, description) {
  try {
    console.log(`\n🧪 Test: ${description}`);
    console.log(`${method.toUpperCase()} ${endpoint}`);
    
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ Succès: ${response.status} - ${response.statusText}`);
    console.log(`📊 Données reçues:`, response.data);
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Tests des endpoints d'onboarding
async function testOnboardingEndpoints() {
  console.log('\n🔵 === TESTS ONBOARDING ===');
  
  // Test 1: Récupérer tous les onboarding
  await testEndpoint('GET', '/employees/onboarding', null, 'Récupérer tous les onboarding');
  
  // Test 2: Récupérer un onboarding spécifique (ID 1)
  await testEndpoint('GET', '/employees/onboarding/1', null, 'Récupérer onboarding ID 1');
  
  // Test 3: Créer un onboarding (simulation)
  const onboardingData = {
    employeeData: JSON.stringify({
      matricule: 'EMP2410001',
      nom_prenom: 'Test User',
      email: 'test@entreprise.com',
      telephone: '+1234567890',
      genre: 'Homme',
      lieu_naissance: 'Paris',
      situation_maritale: 'Célibataire',
      nbr_enfants: 0,
      cnss_number: 'CNSS123456',
      cnamgs_number: 'CNAMGS789012',
      poste_actuel: 'Développeur Test',
      type_contrat: 'CDI',
      date_entree: '2024-12-01',
      date_fin_contrat: null,
      categorie: 'Cadre',
      responsable: 'Manager Test',
      niveau_etude: 'Master',
      specialisation: 'Informatique',
      entity: 'CDL',
      departement: 'IT',
      domaine_fonctionnel: 'Développement',
      checklist: {
        accueil: true,
        formation: true,
        equipement: false,
        badge: true,
        bureau: true
      },
      notes: 'Test d\'intégration'
    })
  };
  
  // Note: Ce test échouera probablement car il nécessite des fichiers
  console.log('\n⚠️  Test de création d\'onboarding (nécessite des fichiers)');
  console.log('📝 Utilisez Postman pour tester avec des vrais fichiers');
}

// Tests des endpoints d'offboarding
async function testOffboardingEndpoints() {
  console.log('\n🔴 === TESTS OFFBOARDING ===');
  
  // Test 1: Récupérer tous les offboarding
  await testEndpoint('GET', '/employees/offboarding', null, 'Récupérer tous les offboarding');
  
  // Test 2: Récupérer un offboarding spécifique (ID 1)
  await testEndpoint('GET', '/employees/offboarding/1', null, 'Récupérer offboarding ID 1');
  
  // Test 3: Récupérer les employés actifs
  await testEndpoint('GET', '/employees/active', null, 'Récupérer employés actifs');
  
  // Test 4: Créer un offboarding (simulation)
  const offboardingData = {
    offboardingData: JSON.stringify({
      employee_id: 1,
      date_depart: '2024-12-31',
      motif_depart: 'Test de départ',
      type_depart: 'Démission',
      checklist: {
        formation_transfert: true,
        inventaire_bureau: true,
        cles_retournees: true,
        badge_retire: false,
        compte_desactive: true
      },
      notes: 'Test d\'offboarding'
    })
  };
  
  // Note: Ce test échouera probablement car il nécessite des fichiers
  console.log('\n⚠️  Test de création d\'offboarding (nécessite des fichiers)');
  console.log('📝 Utilisez Postman pour tester avec des vrais fichiers');
}

// Test de la base de données
async function testDatabaseConnection() {
  console.log('\n🗄️  === TEST CONNEXION BASE DE DONNÉES ===');
  
  try {
    // Test simple de connexion
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    console.log('✅ Serveur accessible:', response.status);
    console.log('📊 Message:', response.data);
  } catch (error) {
    console.log('❌ Serveur inaccessible:', error.message);
  }
}

// Fonction principale
async function runAllTests() {
  console.log('🚀 === DÉMARRAGE DES TESTS ONBOARDING/OFFBOARDING ===');
  console.log(`📍 URL de base: ${BASE_URL}`);
  console.log(`🔑 Token: ${TEST_TOKEN}`);
  
  // Test de connexion
  await testDatabaseConnection();
  
  // Tests des endpoints
  await testOnboardingEndpoints();
  await testOffboardingEndpoints();
  
  console.log('\n🎯 === RÉSUMÉ DES TESTS ===');
  console.log('✅ Tests terminés !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Vérifiez que votre serveur backend est démarré sur le port 5001');
  console.log('2. Exécutez le script SQL pour créer les tables');
  console.log('3. Testez avec Postman en utilisant de vrais fichiers');
  console.log('4. Vérifiez les logs du serveur pour plus de détails');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testOnboardingEndpoints,
  testOffboardingEndpoints,
  testDatabaseConnection,
  runAllTests
};








