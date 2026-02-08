const contratPDFService = require('./services/contratPDFService');

async function testPDFService() {
  try {
    console.log('🧪 Test direct du service PDF...');
    
    // Données de test
    const contrat = {
      id: 1,
      type_contrat: 'CDI',
      date_debut: '2024-01-01',
      date_fin: null,
      poste: 'Infirmier',
      service: 'Soins',
      salaire: 150000,
      statut: 'Actif'
    };
    
    const employee = {
      nom_prenom: 'Test Employé',
      matricule: 'EMP001'
    };
    
    console.log('📄 Génération du contrat PDF...');
    
    // Générer le PDF
    const pdfPath = await contratPDFService.generateContratPDF(contrat, employee);
    
    console.log('✅ Contrat PDF généré avec succès !');
    console.log('📁 Chemin du fichier:', pdfPath);
    
    // Lister les contrats générés
    console.log('\n📋 Liste des contrats générés:');
    const contrats = await contratPDFService.listGeneratedContrats();
    console.log(`   ${contrats.length} contrats trouvés`);
    
    if (contrats.length > 0) {
      contrats.forEach((contrat, index) => {
        console.log(`   ${index + 1}. ${contrat.filename} (${contrat.size} bytes)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testPDFService();








