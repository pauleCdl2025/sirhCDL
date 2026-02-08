const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupMatriculeSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Configuration du système de matricules...\n');
    
    // 1. Vérifier la structure de la table employees
    console.log('1️⃣ Vérification de la structure de la table employees...');
    const tableStructureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'employees'
      ORDER BY ordinal_position
    `);
    
    const hasMatriculeColumn = tableStructureResult.rows.some(col => col.column_name === 'matricule');
    if (hasMatriculeColumn) {
      console.log('   ✅ Colonne matricule trouvée');
      
      // Vérifier si la contrainte d'unicité existe
      const constraintResult = await client.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'employees' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE '%matricule%'
      `);
      
      if (constraintResult.rows.length > 0) {
        console.log('   ✅ Contrainte d\'unicité déjà présente');
      } else {
        console.log('   ⚠️  Contrainte d\'unicité manquante - sera ajoutée');
      }
    } else {
      console.log('   ❌ Colonne matricule manquante');
      console.log('   🔧 Ajout de la colonne matricule...');
      
      await client.query(`
        ALTER TABLE employees 
        ADD COLUMN matricule VARCHAR(50)
      `);
      
      console.log('   ✅ Colonne matricule ajoutée');
    }
    
    // 2. Vérifier et corriger les doublons existants
    console.log('\n2️⃣ Vérification des doublons de matricules...');
    const duplicatesResult = await client.query(`
      SELECT matricule, COUNT(*) as count
      FROM employees 
      WHERE matricule IS NOT NULL 
      GROUP BY matricule 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicatesResult.rows.length > 0) {
      console.log(`   ⚠️  ${duplicatesResult.rows.length} doublons détectés - correction en cours...`);
      
      // Corriger les doublons en ajoutant un suffixe unique
      const fixResult = await client.query(`
        UPDATE employees 
        SET matricule = matricule || '_' || id
        WHERE id IN (
          SELECT e1.id
          FROM employees e1
          INNER JOIN (
            SELECT matricule
            FROM employees 
            WHERE matricule IS NOT NULL 
            GROUP BY matricule 
            HAVING COUNT(*) > 1
          ) e2 ON e1.matricule = e2.matricule
          AND e1.id NOT IN (
            SELECT MIN(id)
            FROM employees 
            WHERE matricule IS NOT NULL 
            GROUP BY matricule
          )
        )
      `);
      
      console.log(`   ✅ ${fixResult.rowCount} doublons corrigés`);
    } else {
      console.log('   ✅ Aucun doublon détecté');
    }
    
    // 3. Ajouter la contrainte d'unicité
    console.log('\n3️⃣ Ajout de la contrainte d\'unicité...');
    try {
      await client.query(`
        ALTER TABLE employees 
        ADD CONSTRAINT employees_matricule_key UNIQUE (matricule)
      `);
      console.log('   ✅ Contrainte d\'unicité ajoutée');
    } catch (error) {
      if (error.code === '42710') { // Constraint already exists
        console.log('   ℹ️  Contrainte d\'unicité déjà présente');
      } else {
        throw error;
      }
    }
    
    // 4. Créer l'index de performance
    console.log('\n4️⃣ Création de l\'index de performance...');
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_employees_matricule ON employees(matricule)
      `);
      console.log('   ✅ Index créé avec succès');
    } catch (error) {
      console.log(`   ⚠️  Erreur lors de la création de l'index: ${error.message}`);
    }
    
    // 5. Vérifier la configuration finale
    console.log('\n5️⃣ Vérification de la configuration finale...');
    
    // Vérifier la contrainte
    const finalConstraintResult = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'employees' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%matricule%'
    `);
    
    if (finalConstraintResult.rows.length > 0) {
      console.log('   ✅ Contrainte d\'unicité vérifiée');
    } else {
      console.log('   ❌ Contrainte d\'unicité manquante');
    }
    
    // Vérifier l'index
    const finalIndexResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE tablename = 'employees' 
        AND indexname = 'idx_employees_matricule'
    `);
    
    if (finalIndexResult.rows.length > 0) {
      console.log('   ✅ Index vérifié');
    } else {
      console.log('   ❌ Index manquant');
    }
    
    // Vérifier qu'il n'y a plus de doublons
    const finalDuplicatesResult = await client.query(`
      SELECT matricule, COUNT(*) as count
      FROM employees 
      WHERE matricule IS NOT NULL 
      GROUP BY matricule 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (finalDuplicatesResult.rows.length === 0) {
      console.log('   ✅ Aucun doublon après configuration');
    } else {
      console.log(`   ❌ ${finalDuplicatesResult.rows.length} doublons persistent`);
    }
    
    // 6. Statistiques finales
    console.log('\n6️⃣ Statistiques finales...');
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN matricule IS NOT NULL THEN 1 END) as employees_with_matricule,
        COUNT(CASE WHEN matricule IS NULL THEN 1 END) as employees_without_matricule
      FROM employees
    `);
    
    const stats = statsResult.rows[0];
    console.log(`   📊 Total des employés: ${stats.total_employees}`);
    console.log(`   📋 Avec matricule: ${stats.employees_with_matricule}`);
    console.log(`   ❓ Sans matricule: ${stats.employees_without_matricule}`);
    
    // 7. Recommandations
    console.log('\n7️⃣ Recommandations...');
    
    if (stats.employees_without_matricule > 0) {
      console.log(`   ⚠️  ${stats.employees_without_matricule} employés n'ont pas de matricule`);
      console.log('   🔧 Considérez leur attribuer un matricule manuellement');
    }
    
    if (finalDuplicatesResult.rows.length > 0) {
      console.log('   ❌ Des doublons persistent - vérifiez manuellement');
    }
    
    console.log('\n🎉 Configuration du système de matricules terminée avec succès!');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Redémarrer le serveur backend');
    console.log('   2. Tester la création d\'un nouvel employé');
    console.log('   3. Vérifier que les matricules sont uniques');
    console.log('   4. Exécuter les tests: node test_matricule_system.js');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  setupMatriculeSystem()
    .then(() => {
      console.log('Configuration terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors de la configuration:', error);
      process.exit(1);
    });
}

module.exports = { setupMatriculeSystem };








