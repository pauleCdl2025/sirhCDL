const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    console.log('🔄 Test de l\'endpoint RH...');
    
    const response = await fetch('http://localhost:5000/api/messages/stats/rh/1');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données reçues:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testEndpoint();




