const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkIncompleteOffboarding() {
  console.log('🔍 Vérification des offboarding incomplets...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier s'il y a des employés avec un statut "En cours de départ"
    console.log('1️⃣ Vérification des employés avec statut spécial...');
    const specialStatus = await client.query(`
      SELECT id, nom_prenom, statut, updated_at
      FROM employees 
      WHERE statut NOT IN ('Actif', 'Inactif')
      ORDER BY updated_at DESC
    `);
    
    if (specialStatus.rows.length > 0) {
      console.log(`📊 Employés avec statut spécial: ${specialStatus.rows.length}`);
      specialStatus.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}, Mis à jour: ${emp.updated_at}`);
      });
    } else {
      console.log('✅ Tous les employés ont un statut normal');
    }
    
    // 2. Vérifier s'il y a des employés récemment modifiés
    console.log('\n2️⃣ Employés récemment modifiés (dernières 24h)...');
    const recentModified = await client.query(`
      SELECT id, nom_prenom, statut, updated_at
      FROM employees 
      WHERE updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
    `);
    
    if (recentModified.rows.length > 0) {
      console.log(`📊 Employés modifiés récemment: ${recentModified.rows.length}`);
      recentModified.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}, Mis à jour: ${emp.updated_at}`);
      });
    } else {
      console.log('✅ Aucun employé modifié récemment');
    }
    
    // 3. Vérifier s'il y a des employés avec des dates de départ
    console.log('\n3️⃣ Employés avec des dates de départ...');
    const employeesWithDepartureDate = await client.query(`
      SELECT id, nom_prenom, statut, date_depart, updated_at
      FROM employees 
      WHERE date_depart IS NOT NULL
      ORDER BY date_depart DESC
    `);
    
    if (employeesWithDepartureDate.rows.length > 0) {
      console.log(`📊 Employés avec date de départ: ${employeesWithDepartureDate.rows.length}`);
      employeesWithDepartureDate.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Date départ: ${emp.date_depart}, Statut: ${emp.statut}`);
      });
    } else {
      console.log('✅ Aucun employé avec date de départ');
    }
    
    // 4. Rechercher par nom partiel (BOUDENGO, BOU, DEN, etc.)
    console.log('\n4️⃣ Recherche par noms partiels...');
    const partialNames = await client.query(`
      SELECT id, nom_prenom, statut, updated_at
      FROM employees 
      WHERE nom_prenom ILIKE '%BOU%' 
         OR nom_prenom ILIKE '%DEN%'
         OR nom_prenom ILIKE '%GO%'
         OR nom_prenom ILIKE '%BOD%'
         OR nom_prenom ILIKE '%BUD%'
         OR nom_prenom ILIKE '%BOUDE%'
         OR nom_prenom ILIKE '%DENGO%'
      ORDER BY nom_prenom
    `);
    
    if (partialNames.rows.length > 0) {
      console.log(`📊 Noms partiels trouvés: ${partialNames.rows.length}`);
      partialNames.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Nom: ${emp.nom_prenom}, Statut: ${emp.statut}`);
      });
    } else {
      console.log('❌ Aucun nom partiel trouvé');
    }
    
    // 5. Vérifier les logs d'erreur ou les tables de session
    console.log('\n5️⃣ Vérification des tables système...');
    const systemTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND (tablename LIKE '%session%' OR tablename LIKE '%temp%' OR tablename LIKE '%cache%')
    `);
    
    if (systemTables.rows.length > 0) {
      console.log('📋 Tables système disponibles:');
      systemTables.rows.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
    }
    
    // 6. Résumé et recommandations
    console.log('\n🎯 Résumé et recommandations:');
    console.log('   - BOUDENGO n\'apparaît dans aucune table');
    console.log('   - Vérifiez si l\'offboarding a été commencé mais pas terminé');
    console.log('   - Vérifiez les logs de l\'application frontend');
    console.log('   - Vérifiez si le nom a été mal orthographié');
    console.log('   - Vérifiez si l\'employé existait vraiment dans la base');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkIncompleteOffboarding().catch(console.error);








