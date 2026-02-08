const { Pool } = require('pg');
const matriculeService = require('./services/matriculeService');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function testMatriculeSystem() {
  const matriculeSvc = matriculeService(pool);
  
  try {
    console.log('🧪 Test du système de matricules...\n');
    
    // Test 1: Génération de matricules uniques
    console.log('1️⃣ Test de génération de matricules uniques');
    const matricules = [];
    for (let i = 0; i < 5; i++) {
      const matricule = await matriculeSvc.generateUniqueMatricule();
      matricules.push(matricule);
      console.log(`   - Matricule ${i + 1}: ${matricule}`);
    }
    
    // Vérifier l'unicité
    const uniqueMatricules = new Set(matricules);
    if (uniqueMatricules.size === matricules.length) {
      console.log('   ✅ Tous les matricules sont uniques');
    } else {
      console.log('   ❌ Des doublons ont été détectés');
    }
    
    // Test 2: Vérification d'unicité
    console.log('\n2️⃣ Test de vérification d\'unicité');
    const testMatricule = matricules[0];
    const isUnique = await matriculeSvc.isMatriculeUnique(testMatricule);
    console.log(`   - Matricule ${testMatricule}: ${isUnique ? 'Unique' : 'Déjà existant'}`);
    
    // Test 3: Réservation de matricule
    console.log('\n3️⃣ Test de réservation de matricule');
    const matriculeToReserve = 'TEST001';
    const reserved = await matriculeSvc.reserveMatricule(matriculeToReserve);
    console.log(`   - Réservation de ${matriculeToReserve}: ${reserved ? 'Succès' : 'Échec'}`);
    
    // Test 4: Vérification après réservation
    const isUniqueAfterReservation = await matriculeSvc.isMatriculeUnique(matriculeToReserve);
    console.log(`   - ${matriculeToReserve} après réservation: ${isUniqueAfterReservation ? 'Unique' : 'Déjà existant'}`);
    
    // Test 5: Libération de matricule
    console.log('\n4️⃣ Test de libération de matricule');
    await matriculeSvc.releaseMatricule(matriculeToReserve);
    const isUniqueAfterRelease = await matriculeSvc.isMatriculeUnique(matriculeToReserve);
    console.log(`   - ${matriculeToReserve} après libération: ${isUniqueAfterRelease ? 'Unique' : 'Déjà existant'}`);
    
    // Test 6: Vérification de la contrainte d'unicité
    console.log('\n5️⃣ Test de la contrainte d\'unicité en base');
    try {
      const client = await pool.connect();
      
      // Essayer d'insérer un employé avec un matricule existant
      const existingMatricule = matricules[0];
      await client.query(`
        INSERT INTO employees (matricule, nom_prenom, statut_employe, created_at)
        VALUES ($1, 'Test Doublon', 'Test', NOW())
      `, [existingMatricule]);
      
      console.log('   ❌ La contrainte d\'unicité ne fonctionne pas');
      
      // Nettoyer le test
      await client.query('DELETE FROM employees WHERE nom_prenom = $1', ['Test Doublon']);
      
    } catch (error) {
      if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation d'unicité
        console.log('   ✅ La contrainte d\'unicité fonctionne correctement');
      } else {
        console.log(`   ⚠️  Erreur inattendue: ${error.message}`);
      }
    } finally {
      if (client) client.release();
    }
    
    // Test 7: Performance de génération
    console.log('\n6️⃣ Test de performance');
    const startTime = Date.now();
    for (let i = 0; i < 100; i++) {
      await matriculeSvc.generateUniqueMatricule();
    }
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`   - Génération de 100 matricules: ${duration}ms`);
    console.log(`   - Moyenne: ${duration / 100}ms par matricule`);
    
    // Test 8: Vérification de l'index
    console.log('\n7️⃣ Test de l\'index sur matricule');
    try {
      const client = await pool.connect();
      const indexResult = await client.query(`
        SELECT 
          indexname,
          tablename,
          indexdef
        FROM pg_indexes 
        WHERE tablename = 'employees' 
          AND indexname = 'idx_employees_matricule'
      `);
      
      if (indexResult.rows.length > 0) {
        console.log('   ✅ Index sur matricule trouvé');
        console.log(`   - Nom: ${indexResult.rows[0].indexname}`);
      } else {
        console.log('   ❌ Index sur matricule non trouvé');
      }
      
      client.release();
    } catch (error) {
      console.log(`   ⚠️  Erreur lors de la vérification de l'index: ${error.message}`);
    }
    
    console.log('\n🎉 Tests terminés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter les tests
if (require.main === module) {
  testMatriculeSystem()
    .then(() => {
      console.log('Tests terminés avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors des tests:', error);
      process.exit(1);
    });
}

module.exports = { testMatriculeSystem };








