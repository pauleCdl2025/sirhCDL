const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/employees/active...\n');
    
    const response = await axios.get('http://localhost:5001/api/employees/active');
    
    console.log('✅ Statut:', response.status);
    console.log('✅ Réponse reçue');
    console.log('📊 Nombre d\'employés:', response.data.employees?.length || 0);
    
    if (response.data.employees && response.data.employees.length > 0) {
      console.log('👤 Premier employé:', response.data.employees[0].nom_prenom);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('📊 Statut:', error.response.status);
      console.error('📄 Données:', error.response.data);
    }
  }
}

testEndpoint();








