const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function cleanupTempMatricules() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Nettoyage des matricules temporaires...\n');
    
    // 1. Identifier les réservations temporaires
    console.log('1️⃣ Identification des réservations temporaires...');
    const tempMatriculesResult = await client.query(`
      SELECT id, matricule, created_at, 
             EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_old
      FROM employees 
      WHERE nom_prenom = 'TEMP_RESERVATION'
      ORDER BY created_at DESC
    `);
    
    if (tempMatriculesResult.rows.length === 0) {
      console.log('   ✅ Aucune réservation temporaire trouvée');
    } else {
      console.log(`   📋 ${tempMatriculesResult.rows.length} réservations temporaires trouvées:`);
      tempMatriculesResult.rows.forEach(row => {
        console.log(`      - ID: ${row.id}, Matricule: ${row.matricule}, Âge: ${row.hours_old.toFixed(2)}h`);
      });
    }
    
    // 2. Supprimer les réservations anciennes (plus de 1 heure)
    console.log('\n2️⃣ Suppression des réservations anciennes...');
    const deleteResult = await client.query(`
      DELETE FROM employees 
      WHERE nom_prenom = 'TEMP_RESERVATION' 
        AND created_at < NOW() - INTERVAL '1 hour'
      RETURNING id, matricule, created_at
    `);
    
    if (deleteResult.rows.length === 0) {
      console.log('   ✅ Aucune réservation ancienne à supprimer');
    } else {
      console.log(`   🗑️  ${deleteResult.rows.length} réservations anciennes supprimées:`);
      deleteResult.rows.forEach(row => {
        console.log(`      - ID: ${row.id}, Matricule: ${row.matricule}, Créé: ${row.created_at}`);
      });
    }
    
    // 3. Vérifier les réservations restantes
    console.log('\n3️⃣ Vérification des réservations restantes...');
    const remainingResult = await client.query(`
      SELECT id, matricule, created_at, 
             EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_old
      FROM employees 
      WHERE nom_prenom = 'TEMP_RESERVATION'
      ORDER BY created_at DESC
    `);
    
    if (remainingResult.rows.length === 0) {
      console.log('   ✅ Aucune réservation temporaire restante');
    } else {
      console.log(`   ⚠️  ${remainingResult.rows.length} réservations récentes conservées:`);
      remainingResult.rows.forEach(row => {
        console.log(`      - ID: ${row.id}, Matricule: ${row.matricule}, Âge: ${row.hours_old.toFixed(2)}h`);
      });
      console.log('   ℹ️  Ces réservations sont récentes et peuvent être en cours d\'utilisation');
    }
    
    // 4. Vérifier l'intégrité des matricules
    console.log('\n4️⃣ Vérification de l\'intégrité des matricules...');
    const integrityResult = await client.query(`
      SELECT matricule, COUNT(*) as count
      FROM employees 
      WHERE matricule IS NOT NULL 
        AND nom_prenom != 'TEMP_RESERVATION'
      GROUP BY matricule 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (integrityResult.rows.length === 0) {
      console.log('   ✅ Aucun doublon de matricule détecté');
    } else {
      console.log(`   ❌ ${integrityResult.rows.length} doublons de matricules détectés:`);
      integrityResult.rows.forEach(row => {
        console.log(`      - ${row.matricule}: ${row.count} occurrences`);
      });
      console.log('   ⚠️  Exécutez fix_matricule_uniqueness.js pour corriger ces doublons');
    }
    
    // 5. Statistiques de nettoyage
    console.log('\n5️⃣ Statistiques de nettoyage...');
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN nom_prenom = 'TEMP_RESERVATION' THEN 1 END) as temp_reservations,
        COUNT(CASE WHEN nom_prenom != 'TEMP_RESERVATION' THEN 1 END) as real_employees
      FROM employees
    `);
    
    const stats = statsResult.rows[0];
    console.log(`   📊 Total des employés: ${stats.total_employees}`);
    console.log(`   📋 Réservations temporaires: ${stats.temp_reservations}`);
    console.log(`   👥 Employés réels: ${stats.real_employees}`);
    
    // 6. Recommandations
    console.log('\n6️⃣ Recommandations...');
    if (stats.temp_reservations > 0) {
      console.log('   ⚠️  Des réservations temporaires sont encore actives');
      console.log('   ℹ️  Attendez qu\'elles soient plus anciennes ou vérifiez leur utilisation');
    }
    
    if (integrityResult.rows.length > 0) {
      console.log('   ❌ Des doublons de matricules nécessitent une correction');
      console.log('   🔧 Exécutez: node fix_matricule_uniqueness.js');
    }
    
    console.log('\n🎉 Nettoyage terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  cleanupTempMatricules()
    .then(() => {
      console.log('Nettoyage terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors du nettoyage:', error);
      process.exit(1);
    });
}

module.exports = { cleanupTempMatricules };








