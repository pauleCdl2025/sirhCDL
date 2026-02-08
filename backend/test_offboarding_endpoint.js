const axios = require('axios');

async function testOffboardingEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/employees/offboarding...\n');
    
    // Données de test pour l'offboarding (utiliser un employé existant)
    const testData = {
      employee_id: 188, // ID d'un autre employé existant
      date_depart: '2025-08-14',
      motif_depart: 'Test d\'offboarding - Employé 188',
      type_depart: 'Démission',
      checklist: {
        materiel_retourne: true,
        acces_revoque: true,
        documents_recuperes: true
      },
      notes: 'Test de l\'endpoint avec employé 188'
    };
    
    // Créer un FormData
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('offboardingData', JSON.stringify(testData));
    
    console.log('📤 Envoi des données de test...');
    console.log('📋 Données:', testData);
    
    const response = await axios.post('http://localhost:5001/api/employees/offboarding', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Statut:', response.status);
    console.log('✅ Réponse reçue');
    console.log('📊 Données:', response.data);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.response) {
      console.error('📊 Statut:', error.response.status);
      console.error('📄 Données:', error.response.data);
      console.error('🔍 Headers:', error.response.headers);
    }
  }
}

testOffboardingEndpoint();
