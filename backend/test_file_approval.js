const axios = require('axios');

async function testFileApproval() {
  try {
    console.log('🧪 Test de l\'endpoint d\'approbation des fichiers...\n');

    const baseURL = 'http://localhost:5001/api';
    const fileId = 2; // ID du fichier à approuver

    console.log(`1️⃣ Test d'approbation du fichier ${fileId}...`);

    const response = await axios.put(`${baseURL}/request-files/${fileId}/approval`, {
      is_approved: true,
      approval_comments: 'Fichier approuvé pour test',
      approved_by: 1 // ID de l'utilisateur qui approuve
    });

    console.log('✅ Approbation réussie !');
    console.log('📊 Réponse:', response.data);

  } catch (error) {
    console.error('❌ Erreur lors de l\'approbation:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Headers:', error.response.headers);
    }
  }
}

// Exécuter le test
testFileApproval();











