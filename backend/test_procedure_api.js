const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testProcedureAPI() {
  console.log('🧪 Test des API de procédures médicales...\n');
  
  try {
    // Test 1: Récupérer les statistiques
    console.log('📊 Test 1: Récupération des statistiques');
    const statsResponse = await axios.get(`${API_BASE_URL}/procedures/statistiques`);
    console.log('✅ Statistiques récupérées:', statsResponse.data);
    
    // Test 2: Récupérer tous les dossiers
    console.log('\n📋 Test 2: Récupération de tous les dossiers');
    const dossiersResponse = await axios.get(`${API_BASE_URL}/procedures/dossiers`);
    console.log('✅ Dossiers récupérés:', dossiersResponse.data.dossiers.length, 'dossiers trouvés');
    
    // Test 3: Récupérer les étapes
    console.log('\n📝 Test 3: Récupération des étapes de procédure');
    const etapesResponse = await axios.get(`${API_BASE_URL}/procedures/etapes`);
    console.log('✅ Étapes récupérées:', etapesResponse.data.length, 'étapes trouvées');
    
    // Test 4: Récupérer un dossier spécifique
    if (dossiersResponse.data.dossiers.length > 0) {
      const firstDossier = dossiersResponse.data.dossiers[0];
      console.log('\n👤 Test 4: Récupération d\'un dossier spécifique');
      const dossierResponse = await axios.get(`${API_BASE_URL}/procedures/dossiers/${firstDossier.id}`);
      console.log('✅ Dossier récupéré:', dossierResponse.data.dossier.nom, dossierResponse.data.dossier.prenom);
    }
    
    // Test 5: Créer un nouveau dossier
    console.log('\n➕ Test 5: Création d\'un nouveau dossier');
    const newDossier = {
      nom: 'Test',
      prenom: 'Utilisateur',
      email: 'test.utilisateur@example.com',
      telephone: '+33 6 00 00 00 00',
      nationalite: 'Française',
      specialite: 'Médecine générale',
      universite: 'Université de Test',
      diplome_pays: 'France',
      commentaire: 'Dossier de test créé automatiquement'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/procedures/dossiers`, newDossier);
    console.log('✅ Nouveau dossier créé:', createResponse.data.dossier.nom, createResponse.data.dossier.prenom);
    console.log('🔗 Lien d\'accès généré:', createResponse.data.dossier.lien_acces);
    
    // Test 6: Ajouter un commentaire
    console.log('\n💬 Test 6: Ajout d\'un commentaire');
    const commentaireData = {
      commentaire: 'Commentaire de test ajouté automatiquement',
      type: 'note',
      admin_id: 1
    };
    
    const commentaireResponse = await axios.post(
      `${API_BASE_URL}/procedures/dossiers/${createResponse.data.dossier.id}/commentaires`,
      commentaireData
    );
    console.log('✅ Commentaire ajouté:', commentaireResponse.data.commentaire.commentaire);
    
    // Test 7: Mettre à jour un dossier
    console.log('\n✏️ Test 7: Mise à jour d\'un dossier');
    const updateData = {
      statut: 'authentification',
      commentaire: 'Statut mis à jour automatiquement'
    };
    
    const updateResponse = await axios.put(
      `${API_BASE_URL}/procedures/dossiers/${createResponse.data.dossier.id}`,
      updateData
    );
    console.log('✅ Dossier mis à jour, nouveau statut:', updateResponse.data.dossier.statut);
    
    // Test 8: Renvoyer le lien d'accès
    console.log('\n🔗 Test 8: Renvoi du lien d\'accès');
    const resendResponse = await axios.post(
      `${API_BASE_URL}/procedures/dossiers/${createResponse.data.dossier.id}/renvoyer-lien`
    );
    console.log('✅ Nouveau lien généré:', resendResponse.data.lien);
    
    // Test 9: Récupérer les documents requis pour une étape
    console.log('\n📄 Test 9: Récupération des documents requis');
    const documentsResponse = await axios.get(`${API_BASE_URL}/procedures/etapes/nouveau/documents`);
    console.log('✅ Documents requis récupérés:', documentsResponse.data.length, 'documents trouvés');
    
    // Test 10: Vérifier les statistiques mises à jour
    console.log('\n📊 Test 10: Vérification des statistiques mises à jour');
    const finalStatsResponse = await axios.get(`${API_BASE_URL}/procedures/statistiques`);
    console.log('✅ Statistiques finales:', finalStatsResponse.data);
    
    console.log('\n🎉 Tous les tests ont réussi ! Le système de procédures fonctionne correctement.');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Assurez-vous que le serveur backend est démarré sur le port 5001');
    }
  }
}

// Exécuter les tests
testProcedureAPI();







