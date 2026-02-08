const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkBoudengoEmployee() {
  console.log('🔍 Vérification de l\'employé BOUDENGO...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Rechercher BOUDENGO dans employees
    console.log('1️⃣ Recherche de BOUDENGO dans la table employees...');
    const employeeSearch = await client.query(`
      SELECT * FROM employees 
      WHERE nom_prenom ILIKE '%BOUDENGO%' 
      OR nom_prenom ILIKE '%BOUDENGO%'
      ORDER BY id
    `);
    
    if (employeeSearch.rows.length > 0) {
      console.log(`✅ ${employeeSearch.rows.length} employé(s) BOUDENGO trouvé(s) dans employees:`);
      employeeSearch.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}`);
      });
    } else {
      console.log('❌ Aucun employé BOUDENGO trouvé dans employees');
    }
    
    // 2. Rechercher BOUDENGO dans offboarding_history
    console.log('\n2️⃣ Recherche de BOUDENGO dans offboarding_history...');
    const offboardingSearch = await client.query(`
      SELECT oh.*, e.nom_prenom, e.matricule
      FROM offboarding_history oh
      LEFT JOIN employees e ON oh.employee_id = e.id
      WHERE e.nom_prenom ILIKE '%BOUDENGO%' 
      OR e.nom_prenom ILIKE '%BOUDENGO%'
      ORDER BY oh.created_at DESC
    `);
    
    if (offboardingSearch.rows.length > 0) {
      console.log(`✅ ${offboardingSearch.rows.length} enregistrement(s) BOUDENGO trouvé(s) dans offboarding_history:`);
      offboardingSearch.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}, Employé: ${record.nom_prenom}, Date départ: ${record.date_depart}`);
      });
    } else {
      console.log('❌ Aucun enregistrement BOUDENGO trouvé dans offboarding_history');
    }
    
    // 3. Rechercher BOUDENGO dans depart_history
    console.log('\n3️⃣ Recherche de BOUDENGO dans depart_history...');
    const departSearch = await client.query(`
      SELECT dh.*, e.nom_prenom, e.matricule
      FROM depart_history dh
      LEFT JOIN employees e ON dh.employee_id = e.id
      WHERE e.nom_prenom ILIKE '%BOUDENGO%' 
      OR e.nom_prenom ILIKE '%BOUDENGO%'
      ORDER BY dh.created_at DESC
    `);
    
    if (departSearch.rows.length > 0) {
      console.log(`✅ ${departSearch.rows.length} enregistrement(s) BOUDENGO trouvé(s) dans depart_history:`);
      departSearch.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. ID: ${record.id}, Employé: ${record.nom_prenom}, Date départ: ${record.date_depart}`);
      });
    } else {
      console.log('❌ Aucun enregistrement BOUDENGO trouvé dans depart_history');
    }
    
    // 4. Rechercher par nom partiel
    console.log('\n4️⃣ Recherche par nom partiel (BOUDENGO)...');
    const partialSearch = await client.query(`
      SELECT 'employees' as table_name, id, nom_prenom, statut, created_at
      FROM employees 
      WHERE nom_prenom ILIKE '%BOUDENGO%'
      UNION ALL
      SELECT 'offboarding_history' as table_name, id, 
             (SELECT nom_prenom FROM employees WHERE id = oh.employee_id) as nom_prenom,
             'Offboardé' as statut, created_at
      FROM offboarding_history oh
      WHERE (SELECT nom_prenom FROM employees WHERE id = oh.employee_id) ILIKE '%BOUDENGO%'
      UNION ALL
      SELECT 'depart_history' as table_name, id,
             (SELECT nom_prenom FROM employees WHERE id = dh.employee_id) as nom_prenom,
             'Parti' as statut, created_at
      FROM depart_history dh
      WHERE (SELECT nom_prenom FROM employees WHERE id = dh.employee_id) ILIKE '%BOUDENGO%'
      ORDER BY table_name, created_at DESC
    `);
    
    if (partialSearch.rows.length > 0) {
      console.log(`✅ ${partialSearch.rows.length} enregistrement(s) trouvé(s) avec BOUDENGO:`);
      partialSearch.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. Table: ${record.table_name}, ID: ${record.id}, Nom: ${record.nom_prenom}, Statut: ${record.statut}`);
      });
    } else {
      console.log('❌ Aucun enregistrement trouvé avec BOUDENGO');
    }
    
    // 5. Vérifier tous les employés récents
    console.log('\n5️⃣ Derniers employés traités (pour identifier BOUDENGO)...');
    const recentEmployees = await client.query(`
      SELECT id, nom_prenom, statut, created_at, updated_at
      FROM employees 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    console.log('📋 10 derniers employés mis à jour:');
    recentEmployees.rows.forEach((emp, index) => {
      console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}, Mis à jour: ${emp.updated_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkBoudengoEmployee().catch(console.error);








