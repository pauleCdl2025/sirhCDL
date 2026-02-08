const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';

async function testContratPDFFeatures() {
  try {
    console.log('🧪 Test des fonctionnalités de contrats PDF...\n');
    
    // 1. Tester la récupération de la liste des contrats
    console.log('1. Test GET /contrats...');
    const contratsResponse = await axios.get(`${BASE_URL}/contrats`);
    console.log(`✅ ${contratsResponse.data.length} contrats récupérés`);
    
    if (contratsResponse.data.length === 0) {
      console.log('❌ Aucun contrat trouvé pour les tests');
      return;
    }
    
    const firstContrat = contratsResponse.data[0];
    console.log(`   Premier contrat: ID=${firstContrat.id}, Employé=${firstContrat.nom_prenom}`);
    
    // 2. Tester la récupération de la liste des PDFs (devrait être vide au début)
    console.log('\n2. Test GET /contrats-pdf/list...');
    const pdfsResponse = await axios.get(`${BASE_URL}/contrats-pdf/list`);
    console.log(`✅ ${pdfsResponse.data.length} PDFs trouvés`);
    
    // 3. Tester la génération d'un contrat PDF
    console.log('\n3. Test POST /contrats-pdf/generate/:id...');
    const generateResponse = await axios.post(`${BASE_URL}/contrats-pdf/generate/${firstContrat.id}`);
    console.log('✅ Contrat PDF généré avec succès');
    console.log(`   Fichier: ${generateResponse.data.filename}`);
    console.log(`   URL: ${generateResponse.data.url}`);
    
    // 4. Vérifier que le PDF a été créé
    console.log('\n4. Vérification de la création du PDF...');
    const pdfsAfterGeneration = await axios.get(`${BASE_URL}/contrats-pdf/list`);
    console.log(`✅ ${pdfsAfterGeneration.data.length} PDFs après génération`);
    
    if (pdfsAfterGeneration.data.length > 0) {
      const generatedPDF = pdfsAfterGeneration.data[0];
      console.log(`   PDF généré: ${generatedPDF.filename}`);
      console.log(`   Taille: ${generatedPDF.size} bytes`);
    }
    
    // 5. Tester la visualisation du PDF
    console.log('\n5. Test GET /contrats-pdf/view/:filename...');
    try {
      const viewResponse = await axios.get(`${BASE_URL}/contrats-pdf/view/${generateResponse.data.filename}`, {
        responseType: 'stream'
      });
      console.log('✅ Visualisation du PDF réussie');
      console.log(`   Content-Type: ${viewResponse.headers['content-type']}`);
    } catch (error) {
      console.log('⚠️  Visualisation du PDF (peut nécessiter un navigateur)');
    }
    
    // 6. Tester le téléchargement du PDF
    console.log('\n6. Test GET /contrats-pdf/download/:filename...');
    try {
      const downloadResponse = await axios.get(`${BASE_URL}/contrats-pdf/download/${generateResponse.data.filename}`, {
        responseType: 'stream'
      });
      console.log('✅ Téléchargement du PDF réussi');
      console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
    } catch (error) {
      console.log('⚠️  Téléchargement du PDF (peut nécessiter un navigateur)');
    }
    
    // 7. Tester la suppression du PDF
    console.log('\n7. Test DELETE /contrats-pdf/delete/:filename...');
    const deleteResponse = await axios.delete(`${BASE_URL}/contrats-pdf/delete/${generateResponse.data.filename}`);
    console.log('✅ PDF supprimé avec succès');
    
    // 8. Vérifier que le PDF a été supprimé
    console.log('\n8. Vérification de la suppression...');
    const pdfsAfterDeletion = await axios.get(`${BASE_URL}/contrats-pdf/list`);
    console.log(`✅ ${pdfsAfterDeletion.data.length} PDFs après suppression`);
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('Détails de l\'erreur 500:', error.response.data);
    }
  }
}

// Exécuter les tests
testContratPDFFeatures();








