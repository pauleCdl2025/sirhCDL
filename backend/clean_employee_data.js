const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function cleanEmployeeData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Nettoyage des données des employés...\n');
    
    // 1. Supprimer toutes les demandes d'employés
    console.log('1️⃣ Suppression des demandes d\'employés...');
    const deleteRequestsResult = await client.query('DELETE FROM employee_requests');
    console.log(`   ✅ ${deleteRequestsResult.rowCount} demandes supprimées`);
    
    // 2. Supprimer toutes les sanctions
    console.log('2️⃣ Suppression des sanctions...');
    const deleteSanctionsResult = await client.query('DELETE FROM sanctions_table');
    console.log(`   ✅ ${deleteSanctionsResult.rowCount} sanctions supprimées`);
    
    // 3. Vérifier que les tables sont vides
    console.log('\n3️⃣ Vérification que les tables sont vides...');
    
    const requestsCount = await client.query('SELECT COUNT(*) FROM employee_requests');
    const sanctionsCount = await client.query('SELECT COUNT(*) FROM sanctions_table');
    
    console.log(`   📊 employee_requests: ${requestsCount.rows[0].count} lignes`);
    console.log(`   📊 sanctions_table: ${sanctionsCount.rows[0].count} lignes`);
    
    // 4. Réinitialiser les séquences d'auto-incrémentation
    console.log('\n4️⃣ Réinitialisation des séquences...');
    
    await client.query('ALTER SEQUENCE employee_requests_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE sanctions_table_id_seq RESTART WITH 1');
    
    console.log('   ✅ Séquences réinitialisées');
    
    console.log('\n🎉 Nettoyage terminé avec succès !');
    console.log('💡 Les tables sont maintenant vides et prêtes pour de nouvelles données');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le nettoyage
cleanEmployeeData();











