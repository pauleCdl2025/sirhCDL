const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkRecentOffboardingHistory() {
  console.log('🔍 Vérification de l\'historique récent des offboarding...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier tous les offboarding récents
    console.log('1️⃣ Tous les offboarding récents:');
    const allOffboarding = await client.query(`
      SELECT oh.*, 
             (SELECT nom_prenom FROM employees WHERE id = oh.employee_id) as nom_prenom,
             (SELECT matricule FROM employees WHERE id = oh.employee_id) as matricule
      FROM offboarding_history oh
      ORDER BY oh.created_at DESC
    `);
    
    if (allOffboarding.rows.length > 0) {
      console.log(`📊 Total des offboarding: ${allOffboarding.rows.length}`);
      allOffboarding.rows.forEach((record, index) => {
        console.log(`\n   ${index + 1}. ID: ${record.id}`);
        console.log(`      Employé ID: ${record.employee_id}`);
        console.log(`      Nom: ${record.nom_prenom || 'N/A'}`);
        console.log(`      Matricule: ${record.matricule || 'N/A'}`);
        console.log(`      Date départ: ${record.date_depart}`);
        console.log(`      Motif: ${record.motif_depart}`);
        console.log(`      Créé le: ${record.created_at}`);
      });
    } else {
      console.log('❌ Aucun offboarding trouvé');
    }
    
    // 2. Vérifier tous les départs récents
    console.log('\n2️⃣ Tous les départs récents:');
    const allDeparts = await client.query(`
      SELECT dh.*, 
             (SELECT nom_prenom FROM employees WHERE id = dh.employee_id) as nom_prenom,
             (SELECT matricule FROM employees WHERE id = dh.employee_id) as matricule
      FROM depart_history dh
      ORDER BY dh.created_at DESC
    `);
    
    if (allDeparts.rows.length > 0) {
      console.log(`📊 Total des départs: ${allDeparts.rows.length}`);
      allDeparts.rows.forEach((record, index) => {
        console.log(`\n   ${index + 1}. ID: ${record.id}`);
        console.log(`      Employé ID: ${record.employee_id}`);
        console.log(`      Nom: ${record.nom_prenom || 'N/A'}`);
        console.log(`      Matricule: ${record.matricule || 'N/A'}`);
        console.log(`      Date départ: ${record.date_depart}`);
        console.log(`      Motif: ${record.motif_depart}`);
        console.log(`      Type: ${record.type_depart}`);
        console.log(`      Créé le: ${record.created_at}`);
      });
    } else {
      console.log('❌ Aucun départ trouvé');
    }
    
    // 3. Rechercher par nom similaire (pour identifier les erreurs d'orthographe)
    console.log('\n3️⃣ Recherche par noms similaires à BOUDENGO:');
    const similarNames = await client.query(`
      SELECT DISTINCT nom_prenom, id, statut
      FROM employees 
      WHERE nom_prenom ILIKE '%BOU%' 
         OR nom_prenom ILIKE '%DEN%'
         OR nom_prenom ILIKE '%GO%'
         OR nom_prenom ILIKE '%BOD%'
         OR nom_prenom ILIKE '%BUD%'
      ORDER BY nom_prenom
    `);
    
    if (similarNames.rows.length > 0) {
      console.log(`📊 Noms similaires trouvés: ${similarNames.rows.length}`);
      similarNames.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}`);
      });
    } else {
      console.log('❌ Aucun nom similaire trouvé');
    }
    
    // 4. Vérifier les employés supprimés récemment
    console.log('\n4️⃣ Employés supprimés récemment (via offboarding):');
    const deletedEmployees = await client.query(`
      SELECT 
        oh.employee_id,
        oh.date_depart,
        oh.motif_depart,
        oh.created_at as offboarding_date,
        (SELECT nom_prenom FROM employees WHERE id = oh.employee_id) as nom_prenom
      FROM offboarding_history oh
      WHERE NOT EXISTS (
        SELECT 1 FROM employees e WHERE e.id = oh.employee_id
      )
      ORDER BY oh.created_at DESC
    `);
    
    if (deletedEmployees.rows.length > 0) {
      console.log(`📊 Employés supprimés: ${deletedEmployees.rows.length}`);
      deletedEmployees.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.employee_id}, Nom: ${emp.nom_prenom || 'N/A'}, Date départ: ${emp.date_depart}`);
      });
    } else {
      console.log('✅ Tous les employés des offboarding existent encore dans employees');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRecentOffboardingHistory().catch(console.error);








