const fetch = require('node-fetch');

async function testAllEndpoints() {
  console.log('🔄 Test de tous les endpoints de statistiques...\n');
  
  const endpoints = [
    'http://localhost:5000/api/messages/stats/rh/1',
    'http://localhost:5000/api/messages/stats/employee/1',
    'http://localhost:5000/api/messages/stats/rh/1'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Test de: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Succès:`, JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Erreur: ${errorText}`);
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Erreur de connexion: ${error.message}\n`);
    }
  }
}

testAllEndpoints();




