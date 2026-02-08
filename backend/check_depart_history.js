const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkDepartHistory() {
  console.log('🔍 Vérification de l\'historique des départs...\n');
  
  const client = await pool.connect();
  
  try {
    // Vérifier le nombre total d'enregistrements
    const totalCount = await client.query('SELECT COUNT(*) FROM depart_history');
    console.log(`📊 Total des enregistrements dans depart_history: ${totalCount.rows[0].count}`);
    
    if (parseInt(totalCount.rows[0].count) > 0) {
      // Afficher tous les enregistrements
      const allRecords = await client.query('SELECT * FROM depart_history ORDER BY created_at DESC');
      console.log('\n📋 Tous les enregistrements de depart_history:');
      
      allRecords.rows.forEach((record, index) => {
        console.log(`\n   ${index + 1}. ID: ${record.id}`);
        console.log(`      Employé ID: ${record.employee_id}`);
        console.log(`      Date de départ: ${record.date_depart}`);
        console.log(`      Motif: ${record.motif_depart}`);
        console.log(`      Type de départ: ${record.type_depart}`);
        console.log(`      Notes: ${record.notes}`);
        console.log(`      Créé le: ${record.created_at}`);
      });
      
      // Vérifier si l'employé de test (ID 187) est présent
      const testEmployee = await client.query('SELECT * FROM depart_history WHERE employee_id = 187');
      if (testEmployee.rows.length > 0) {
        console.log('\n✅ L\'employé de test (ID 187) est bien dans depart_history');
      } else {
        console.log('\n❌ L\'employé de test (ID 187) n\'est PAS dans depart_history');
      }
      
    } else {
      console.log('❌ Aucun enregistrement trouvé dans depart_history');
    }
    
    // Vérifier aussi offboarding_history
    console.log('\n🔍 Vérification de offboarding_history...');
    const offboardingCount = await client.query('SELECT COUNT(*) FROM offboarding_history');
    console.log(`📊 Total des enregistrements dans offboarding_history: ${offboardingCount.rows[0].count}`);
    
    if (parseInt(offboardingCount.rows[0].count) > 0) {
      const offboardingRecords = await client.query('SELECT * FROM offboarding_history ORDER BY created_at DESC');
      console.log('\n📋 Enregistrements de offboarding_history:');
      
      offboardingRecords.rows.forEach((record, index) => {
        console.log(`\n   ${index + 1}. ID: ${record.id}`);
        console.log(`      Employé ID: ${record.employee_id}`);
        console.log(`      Date de départ: ${record.date_depart}`);
        console.log(`      Motif: ${record.motif_depart}`);
        console.log(`      Créé le: ${record.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDepartHistory().catch(console.error);








