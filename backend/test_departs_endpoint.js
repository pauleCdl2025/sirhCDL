const axios = require('axios');

async function testDepartsEndpoint() {
  try {
    console.log('🧪 Test de l\'endpoint /api/departs...\n');
    
    // 1. Test GET /api/departs
    console.log('1️⃣ Test GET /api/departs...');
    try {
      const getResponse = await axios.get('http://localhost:5001/api/departs');
      console.log('✅ GET /api/departs - Statut:', getResponse.status);
      console.log('📊 Nombre de départs:', getResponse.data.length);
    } catch (error) {
      console.error('❌ GET /api/departs - Erreur:', error.response?.status, error.response?.data);
    }
    
    // 2. Test POST /api/departs (création)
    console.log('\n2️⃣ Test POST /api/departs (création)...');
    const testDeparture = {
      nom: 'TEST',
      prenom: 'DEPART',
      departement: 'IT',
      statut: 'Parti',
      poste: 'Développeur',
      date_depart: '2025-08-14',
      motif_depart: 'Test de l\'endpoint',
      commentaire: 'Test de création via API'
    };
    
    try {
      const postResponse = await axios.post('http://localhost:5001/api/departs', testDeparture);
      console.log('✅ POST /api/departs - Statut:', postResponse.status);
      console.log('📊 Départ créé:', postResponse.data);
      
      // 3. Test PUT /api/departs/:id (mise à jour)
      if (postResponse.data.id) {
        console.log('\n3️⃣ Test PUT /api/departs/:id (mise à jour)...');
        const updateData = { ...testDeparture, commentaire: 'Commentaire mis à jour' };
        
        try {
          const putResponse = await axios.put(`http://localhost:5001/api/departs/${postResponse.data.id}`, updateData);
          console.log('✅ PUT /api/departs/:id - Statut:', putResponse.status);
          console.log('📊 Départ mis à jour:', putResponse.data);
        } catch (error) {
          console.error('❌ PUT /api/departs/:id - Erreur:', error.response?.status, error.response?.data);
        }
        
        // 4. Test DELETE /api/departs/:id (suppression)
        console.log('\n4️⃣ Test DELETE /api/departs/:id (suppression)...');
        try {
          const deleteResponse = await axios.delete(`http://localhost:5001/api/departs/${postResponse.data.id}`);
          console.log('✅ DELETE /api/departs/:id - Statut:', deleteResponse.status);
          console.log('📊 Départ supprimé:', deleteResponse.data);
        } catch (error) {
          console.error('❌ DELETE /api/departs/:id - Erreur:', error.response?.status, error.response?.data);
        }
      }
      
    } catch (error) {
      console.error('❌ POST /api/departs - Erreur:', error.response?.status, error.response?.data);
      console.error('🔍 Détails de l\'erreur:', error.message);
      
      if (error.response?.data?.details) {
        console.error('📋 Détails techniques:', error.response.data.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDepartsEndpoint();








