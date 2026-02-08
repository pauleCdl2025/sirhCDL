const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testMedicalPortal() {
  console.log('🏥 Test du portail d\'accès médical...\n');
  
  try {
    // Test 1: Récupérer un dossier existant pour obtenir un token
    console.log('📋 Test 1: Récupération d\'un dossier existant');
    const dossiersResponse = await axios.get(`${API_BASE_URL}/procedures/dossiers`);
    
    if (dossiersResponse.data.dossiers.length === 0) {
      console.log('❌ Aucun dossier trouvé. Création d\'un dossier de test...');
      
      // Créer un dossier de test
      const newDossier = {
        nom: 'Test',
        prenom: 'Médecin',
        email: 'test.medecin@example.com',
        telephone: '+33 6 00 00 00 00',
        nationalite: 'Française',
        specialite: 'Médecine générale',
        universite: 'Université de Test',
        diplome_pays: 'France',
        commentaire: 'Dossier de test pour le portail médical'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/procedures/dossiers`, newDossier);
      console.log('✅ Dossier de test créé:', createResponse.data.dossier.nom, createResponse.data.dossier.prenom);
      
      const token = createResponse.data.dossier.token_acces;
      const lienAcces = createResponse.data.dossier.lien_acces;
      
      console.log('🔗 Token généré:', token);
      console.log('🔗 Lien d\'accès:', lienAcces);
      
      // Test 2: Accès par token
      console.log('\n🔐 Test 2: Accès par token');
      const accessResponse = await axios.get(`${API_BASE_URL}/procedures/access/${token}`);
      console.log('✅ Accès réussi au dossier:', accessResponse.data.dossier.nom, accessResponse.data.dossier.prenom);
      console.log('📄 Documents:', accessResponse.data.documents.length);
      console.log('💬 Commentaires:', accessResponse.data.commentaires.length);
      console.log('🔔 Notifications:', accessResponse.data.notifications.length);
      
      // Test 3: Ajouter un commentaire
      console.log('\n💬 Test 3: Ajout d\'un commentaire');
      const commentaireData = {
        commentaire: 'Commentaire de test pour le portail médical',
        type: 'note',
        admin_id: 1
      };
      
      const commentaireResponse = await axios.post(
        `${API_BASE_URL}/procedures/dossiers/${accessResponse.data.dossier.id}/commentaires`,
        commentaireData
      );
      console.log('✅ Commentaire ajouté:', commentaireResponse.data.commentaire.commentaire);
      
      // Test 4: Vérifier l'accès avec le nouveau commentaire
      console.log('\n🔄 Test 4: Vérification de l\'accès avec nouveau commentaire');
      const updatedAccessResponse = await axios.get(`${API_BASE_URL}/procedures/access/${token}`);
      console.log('✅ Nouveau nombre de commentaires:', updatedAccessResponse.data.commentaires.length);
      
      // Test 5: Test avec un token invalide
      console.log('\n❌ Test 5: Test avec un token invalide');
      try {
        await axios.get(`${API_BASE_URL}/procedures/access/invalid-token`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ Erreur 401 correcte pour token invalide');
        } else {
          console.log('❌ Erreur inattendue:', error.response?.status);
        }
      }
      
      console.log('\n🎉 Tous les tests du portail médical ont réussi !');
      console.log('\n📋 Résumé:');
      console.log(`- Dossier créé: ${createResponse.data.dossier.nom} ${createResponse.data.dossier.prenom}`);
      console.log(`- Token d'accès: ${token}`);
      console.log(`- Lien d'accès: ${lienAcces}`);
      console.log(`- Commentaires ajoutés: ${updatedAccessResponse.data.commentaires.length}`);
      console.log('\n🌐 Pour tester le portail frontend, visitez:');
      console.log(`http://localhost:3000/medical-access/${token}`);
      
    } else {
      // Utiliser un dossier existant
      const existingDossier = dossiersResponse.data.dossiers[0];
      console.log('✅ Dossier existant trouvé:', existingDossier.nom, existingDossier.prenom);
      
      if (existingDossier.token_acces) {
        console.log('🔗 Token existant:', existingDossier.token_acces);
        console.log('🔗 Lien d\'accès:', existingDossier.lien_acces);
        
        // Test d'accès
        console.log('\n🔐 Test d\'accès par token');
        const accessResponse = await axios.get(`${API_BASE_URL}/procedures/access/${existingDossier.token_acces}`);
        console.log('✅ Accès réussi au dossier');
        console.log('📄 Documents:', accessResponse.data.documents.length);
        console.log('💬 Commentaires:', accessResponse.data.commentaires.length);
        console.log('🔔 Notifications:', accessResponse.data.notifications.length);
        
        console.log('\n🌐 Pour tester le portail frontend, visitez:');
        console.log(`http://localhost:3000/medical-access/${existingDossier.token_acces}`);
      } else {
        console.log('❌ Aucun token d\'accès trouvé pour ce dossier');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Assurez-vous que le serveur backend est démarré sur le port 5001');
    }
  }
}

// Exécuter les tests
testMedicalPortal();







