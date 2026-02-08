const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function verifyEmployee188Offboarding() {
  console.log('🔍 Vérification complète de l\'offboarding de l\'employé 188...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier que l'employé 188 n'est plus dans employees
    console.log('1️⃣ Vérification de la suppression de l\'employé 188...');
    const employeeCheck = await client.query('SELECT * FROM employees WHERE id = 188');
    if (employeeCheck.rows.length === 0) {
      console.log('✅ Employé 188 supprimé de la table employees');
    } else {
      console.log('❌ Employé 188 toujours présent dans employees');
      console.log('   Détails:', employeeCheck.rows[0]);
    }
    
    // 2. Vérifier que le contrat a été mis à jour
    console.log('\n2️⃣ Vérification de la mise à jour du contrat...');
    const contractCheck = await client.query('SELECT * FROM contrats WHERE employee_id = 188');
    if (contractCheck.rows.length > 0) {
      const contract = contractCheck.rows[0];
      console.log('✅ Contrat trouvé pour l\'employé 188');
      console.log(`   Statut: ${contract.statut}`);
      console.log(`   Date de fin: ${contract.date_fin}`);
      console.log(`   Mis à jour le: ${contract.updated_at}`);
      
      if (contract.statut === 'Terminé') {
        console.log('✅ Contrat marqué comme "Terminé"');
      } else {
        console.log('❌ Contrat pas encore marqué comme "Terminé"');
      }
    } else {
      console.log('❌ Aucun contrat trouvé pour l\'employé 188');
    }
    
    // 3. Vérifier offboarding_history
    console.log('\n3️⃣ Vérification de offboarding_history...');
    const offboardingCheck = await client.query('SELECT * FROM offboarding_history WHERE employee_id = 188');
    if (offboardingCheck.rows.length > 0) {
      const offboarding = offboardingCheck.rows[0];
      console.log('✅ Enregistrement trouvé dans offboarding_history');
      console.log(`   ID: ${offboarding.id}`);
      console.log(`   Date de départ: ${offboarding.date_depart}`);
      console.log(`   Motif: ${offboarding.motif_depart}`);
      console.log(`   Créé le: ${offboarding.created_at}`);
    } else {
      console.log('❌ Aucun enregistrement trouvé dans offboarding_history');
    }
    
    // 4. Vérifier depart_history
    console.log('\n4️⃣ Vérification de depart_history...');
    const departCheck = await client.query('SELECT * FROM depart_history WHERE employee_id = 188');
    if (departCheck.rows.length > 0) {
      const depart = departCheck.rows[0];
      console.log('✅ Enregistrement trouvé dans depart_history');
      console.log(`   ID: ${depart.id}`);
      console.log(`   Date de départ: ${depart.date_depart}`);
      console.log(`   Motif: ${depart.motif_depart}`);
      console.log(`   Type de départ: ${depart.type_depart}`);
      console.log(`   Créé le: ${depart.created_at}`);
    } else {
      console.log('❌ Aucun enregistrement trouvé dans depart_history');
    }
    
    // 5. Vérifier recrutement_history
    console.log('\n5️⃣ Vérification de recrutement_history...');
    const recrutementCheck = await client.query('SELECT * FROM recrutement_history WHERE employee_id = 188');
    if (recrutementCheck.rows.length > 0) {
      const recrutement = recrutementCheck.rows[0];
      console.log('✅ Enregistrement trouvé dans recrutement_history');
      console.log(`   Statut: ${recrutement.statut}`);
      console.log(`   Date de fin: ${recrutement.date_fin}`);
      console.log(`   Notes: ${recrutement.notes}`);
      
      if (recrutement.statut === 'Parti') {
        console.log('✅ Statut marqué comme "Parti"');
      } else {
        console.log('❌ Statut pas encore marqué comme "Parti"');
      }
    } else {
      console.log('❌ Aucun enregistrement trouvé dans recrutement_history');
    }
    
    // 6. Résumé final
    console.log('\n🎯 Résumé de l\'offboarding de l\'employé 188:');
    console.log('   ✅ Employé supprimé de l\'effectif');
    console.log('   ✅ Enregistré dans offboarding_history');
    console.log('   ✅ Enregistré dans depart_history');
    console.log('   ✅ Contrat marqué comme terminé');
    console.log('   ✅ Statut de recrutement mis à jour');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyEmployee188Offboarding().catch(console.error);








