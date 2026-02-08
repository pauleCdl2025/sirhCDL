const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testContratEndpoints() {
  try {
    console.log('🧪 Test des endpoints de contrats...\n');
    
    // 1. Tester la récupération de tous les contrats
    console.log('1. Test GET /contrats...');
    const allContrats = await axios.get(`${BASE_URL}/contrats`);
    console.log(`✅ ${allContrats.data.length} contrats récupérés`);
    
    if (allContrats.data.length > 0) {
      const firstContrat = allContrats.data[0];
      console.log(`   Premier contrat: ID=${firstContrat.id}, Employé=${firstContrat.nom_prenom}, Type=${firstContrat.type_contrat}`);
    }
    
    // 2. Tester la récupération d'un contrat par ID
    if (allContrats.data.length > 0) {
      const contratId = allContrats.data[0].id;
      console.log(`\n2. Test GET /contrats/${contratId}...`);
      const contratById = await axios.get(`${BASE_URL}/contrats/${contratId}`);
      console.log(`✅ Contrat récupéré: ${contratById.data.nom_prenom} - ${contratById.data.type_contrat}`);
    }
    
    // 3. Tester la modification d'un contrat
    if (allContrats.data.length > 0) {
      const contratId = allContrats.data[0].id;
      const contratToUpdate = allContrats.data[0];
      
      console.log(`\n3. Test PUT /contrats/${contratId}...`);
      
      const updateData = {
        employee_id: contratToUpdate.employee_id,
        type_contrat: contratToUpdate.type_contrat,
        date_debut: contratToUpdate.date_debut,
        date_fin: contratToUpdate.date_fin,
        poste: 'Poste de test',
        service: 'Service de test',
        salaire: 150000,
        statut: 'Actif'
      };
      
      const updatedContrat = await axios.put(`${BASE_URL}/contrats/${contratId}`, updateData);
      console.log(`✅ Contrat modifié avec succès: ${updatedContrat.data.poste} - ${updatedContrat.data.service}`);
    }
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('Détails de l\'erreur 500:', error.response.data);
    }
  }
}

// Exécuter les tests
testContratEndpoints();








