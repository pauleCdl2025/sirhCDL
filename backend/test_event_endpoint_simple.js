const axios = require('axios');

async function testEventEndpoint() {
  try {
    console.log('🧪 Test simple de l\'endpoint /api/evenements...\n');
    
    // Test GET /api/evenements
    console.log('1️⃣ Test GET /api/evenements');
    const getResponse = await axios.get('http://localhost:5001/api/evenements');
    console.log('✅ Status:', getResponse.status);
    console.log('✅ Données:', getResponse.data);
    console.log('✅ Headers:', getResponse.headers['content-type']);
    
    // Test POST /api/evenements
    console.log('\n2️⃣ Test POST /api/evenements');
    const testEvent = {
      name: 'Test Simple',
      date: '2024-12-25',
      location: 'Test Location',
      description: 'Test Description'
    };
    
    const postResponse = await axios.post('http://localhost:5001/api/evenements', testEvent);
    console.log('✅ Status:', postResponse.status);
    console.log('✅ Événement créé:', postResponse.data);
    
    // Test DELETE /api/evenements/:id
    if (postResponse.data.id) {
      console.log('\n3️⃣ Test DELETE /api/evenements/' + postResponse.data.id);
      const deleteResponse = await axios.delete(`http://localhost:5001/api/evenements/${postResponse.data.id}`);
      console.log('✅ Status:', deleteResponse.status);
      console.log('✅ Événement supprimé');
    }
    
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Données:', error.response.data);
      console.error('   Headers:', error.response.headers);
    } else if (error.request) {
      console.error('   Erreur de connexion - Vérifiez que le serveur est démarré sur le port 5001');
    }
  }
}

// Exécuter le test
testEventEndpoint();











