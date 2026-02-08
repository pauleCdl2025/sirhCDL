const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function identifyBoudengoEmployee() {
  console.log('🔍 Identification de l\'employé BOUDENGO depuis l\'historique...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Créer une table temporaire avec les informations des employés supprimés
    console.log('1️⃣ Création d\'une table temporaire pour récupérer les noms...');
    
    await client.query(`
      CREATE TEMP TABLE temp_offboarded_employees AS
      SELECT 
        oh.employee_id,
        oh.date_depart,
        oh.motif_depart,
        oh.created_at as offboarding_date,
        dh.type_depart,
        dh.notes as depart_notes
      FROM offboarding_history oh
      LEFT JOIN depart_history dh ON oh.employee_id = dh.employee_id
      ORDER BY oh.created_at DESC
    `);
    
    console.log('✅ Table temporaire créée');
    
    // 2. Récupérer les informations depuis les logs ou sauvegardes
    console.log('\n2️⃣ Tentative de récupération des noms depuis d\'autres sources...');
    
    // Vérifier s'il y a des vues ou des sauvegardes
    const views = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public' 
      AND viewname LIKE '%employee%'
    `);
    
    if (views.rows.length > 0) {
      console.log('📋 Vues disponibles:');
      views.rows.forEach(view => {
        console.log(`   - ${view.viewname}`);
      });
    }
    
    // 3. Vérifier s'il y a des tables d'audit ou de logs
    const auditTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND (tablename LIKE '%audit%' OR tablename LIKE '%log%' OR tablename LIKE '%backup%')
    `);
    
    if (auditTables.rows.length > 0) {
      console.log('📋 Tables d\'audit/logs disponibles:');
      auditTables.rows.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    }
    
    // 4. Vérifier les informations dans la table temporaire
    console.log('\n3️⃣ Informations des employés offboardés:');
    const offboardedInfo = await client.query(`
      SELECT * FROM temp_offboarded_employees
      ORDER BY offboarding_date DESC
    `);
    
    if (offboardedInfo.rows.length > 0) {
      console.log(`📊 ${offboardedInfo.rows.length} employés offboardés:`);
      offboardedInfo.rows.forEach((emp, index) => {
        console.log(`\n   ${index + 1}. ID: ${emp.employee_id}`);
        console.log(`      Date départ: ${emp.date_depart}`);
        console.log(`      Motif: ${emp.motif_depart}`);
        console.log(`      Type: ${emp.type_depart}`);
        console.log(`      Notes: ${emp.depart_notes}`);
        console.log(`      Offboardé le: ${emp.offboarding_date}`);
      });
    }
    
    // 5. Rechercher dans les contrats (peut-être qu'il y a des informations)
    console.log('\n4️⃣ Vérification des contrats des employés supprimés:');
    const contractsInfo = await client.query(`
      SELECT c.*, 
             (SELECT nom_prenom FROM employees WHERE id = c.employee_id) as nom_prenom
      FROM contrats c
      WHERE c.employee_id IN (
        SELECT employee_id FROM temp_offboarded_employees
      )
      ORDER BY c.updated_at DESC
    `);
    
    if (contractsInfo.rows.length > 0) {
      console.log(`📊 Contrats des employés supprimés: ${contractsInfo.rows.length}`);
      contractsInfo.rows.forEach((contract, index) => {
        console.log(`   ${index + 1}. Employé ID: ${contract.employee_id}, Nom: ${contract.nom_prenom || 'N/A'}, Statut: ${contract.statut}`);
      });
    }
    
    // 6. Demander à l'utilisateur de confirmer l'ID
    console.log('\n5️⃣ Pour identifier BOUDENGO, pouvez-vous me dire:');
    console.log('   - Quel était l\'ID de l\'employé BOUDENGO ?');
    console.log('   - Ou à quelle date avez-vous fait l\'offboarding ?');
    console.log('   - Ou quel était le motif de départ ?');
    
    // 7. Nettoyer
    await client.query('DROP TABLE temp_offboarded_employees');
    console.log('\n✅ Table temporaire supprimée');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'identification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

identifyBoudengoEmployee().catch(console.error);








