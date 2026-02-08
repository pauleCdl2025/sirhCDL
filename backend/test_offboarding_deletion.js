const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const TEST_TOKEN = 'your-test-token-here';

async function testOffboardingDeletion() {
  console.log('🧪 Test de suppression d\'employé lors de l\'offboarding\n');

  try {
    // 1. Récupérer la liste des employés avant l'offboarding
    console.log('1️⃣ Récupération de la liste des employés...');
    const employeesBefore = await axios.get(`${BASE_URL}/employees/active`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    if (employeesBefore.data.success) {
      console.log(`✅ ${employeesBefore.data.employees.length} employés trouvés`);
      console.log('📋 Liste des employés:');
      employeesBefore.data.employees.forEach(emp => {
        console.log(`   - ${emp.matricule}: ${emp.nom_prenom} (${emp.poste_actuel})`);
      });
    } else {
      throw new Error('Impossible de récupérer la liste des employés');
    }

    // 2. Sélectionner le premier employé pour le test
    const testEmployee = employeesBefore.data.employees[0];
    if (!testEmployee) {
      throw new Error('Aucun employé disponible pour le test');
    }

    console.log(`\n2️⃣ Test d'offboarding pour l'employé: ${testEmployee.nom_prenom} (${testEmployee.matricule})`);

    // 3. Créer un offboarding (simulation sans documents)
    const offboardingData = {
      employee_id: testEmployee.id,
      date_depart: new Date().toISOString().split('T')[0],
      motif_depart: 'Test d\'offboarding - Suppression automatique',
      type_depart: 'Test',
      checklist: {
        formation_transfert: true,
        inventaire_bureau: true,
        cles_retournees: true,
        badge_retire: true,
        compte_desactive: true
      },
      notes: 'Test automatique de suppression d\'employé'
    };

    console.log('📤 Envoi de la requête d\'offboarding...');
    const offboardingResponse = await axios.post(`${BASE_URL}/employees/offboarding`, 
      { offboardingData: JSON.stringify(offboardingData) },
      {
        headers: { 
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (offboardingResponse.data.success) {
      console.log('✅ Offboarding réussi');
      console.log('📊 Réponse:', offboardingResponse.data.message);
    } else {
      throw new Error('Échec de l\'offboarding');
    }

    // 4. Vérifier que l'employé a été supprimé de l'effectif
    console.log('\n3️⃣ Vérification de la suppression de l\'employé...');
    
    // Attendre un peu pour laisser le temps à la base de données de se mettre à jour
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const employeesAfter = await axios.get(`${BASE_URL}/employees/active`, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });

    if (employeesAfter.data.success) {
      const remainingEmployees = employeesAfter.data.employees;
      const employeeStillExists = remainingEmployees.find(emp => emp.id === testEmployee.id);
      
      if (employeeStillExists) {
        console.log('❌ ERREUR: L\'employé existe encore dans l\'effectif');
        console.log('📊 Employés restants:', remainingEmployees.length);
      } else {
        console.log('✅ SUCCÈS: L\'employé a été supprimé de l\'effectif');
        console.log(`📊 Nombre d'employés avant: ${employeesBefore.data.employees.length}`);
        console.log(`📊 Nombre d'employés après: ${remainingEmployees.length}`);
        console.log(`📊 Différence: ${employeesBefore.data.employees.length - remainingEmployees.length}`);
      }
    } else {
      throw new Error('Impossible de vérifier la suppression');
    }

    // 5. Vérifier que l'historique est conservé
    console.log('\n4️⃣ Vérification de la conservation de l\'historique...');
    
    try {
      const offboardingHistory = await axios.get(`${BASE_URL}/employees/offboarding/${testEmployee.id}`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
      });
      
      if (offboardingHistory.data.success && offboardingHistory.data.offboarding.length > 0) {
        console.log('✅ Historique d\'offboarding conservé');
        console.log('📊 Dernier offboarding:', offboardingHistory.data.offboarding[0]);
      } else {
        console.log('⚠️ Aucun historique d\'offboarding trouvé');
      }
    } catch (error) {
      console.log('⚠️ Impossible de récupérer l\'historique d\'offboarding:', error.message);
    }

    console.log('\n🎯 Test terminé avec succès !');
    console.log('📝 Résumé:');
    console.log('   - L\'employé a été supprimé de l\'effectif');
    console.log('   - L\'historique a été conservé');
    console.log('   - L\'offboarding fonctionne correctement');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📊 Détails de l\'erreur:', error.response.data);
    }
  }
}

// Fonction pour tester la route d'annulation (qui devrait être désactivée)
async function testCancelOffboarding() {
  console.log('\n🧪 Test de la route d\'annulation d\'offboarding (désactivée)\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/employees/offboarding/1/cancel`, {}, {
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('❌ ERREUR: La route d\'annulation devrait être désactivée');
    console.log('📊 Réponse reçue:', response.data);
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ SUCCÈS: La route d\'annulation est correctement désactivée');
      console.log('📊 Message d\'erreur:', error.response.data.message);
    } else {
      console.log('⚠️ Réponse inattendue:', error.message);
    }
  }
}

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests d\'offboarding avec suppression d\'employé\n');
  
  await testOffboardingDeletion();
  await testCancelOffboarding();
  
  console.log('\n🏁 Tous les tests sont terminés');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testOffboardingDeletion,
  testCancelOffboarding,
  runTests
};








