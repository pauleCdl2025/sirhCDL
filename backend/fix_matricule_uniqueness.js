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

async function fixMatriculeUniqueness() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Vérification des doublons de matricules...');
    
    // 1. Vérifier s'il y a des doublons
    const duplicatesResult = await client.query(`
      SELECT matricule, COUNT(*) as count
      FROM employees 
      WHERE matricule IS NOT NULL 
      GROUP BY matricule 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicatesResult.rows.length > 0) {
      console.log(`⚠️  ${duplicatesResult.rows.length} doublons de matricules trouvés:`);
      duplicatesResult.rows.forEach(row => {
        console.log(`   - ${row.matricule}: ${row.count} occurrences`);
      });
      
      // 2. Résoudre les doublons
      console.log('🔧 Résolution des doublons...');
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
      
      console.log(`✅ ${fixResult.rowCount} matricules corrigés`);
    } else {
      console.log('✅ Aucun doublon de matricule trouvé');
    }
    
    // 3. Ajouter la contrainte d'unicité
    console.log('🔒 Ajout de la contrainte d\'unicité...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'employees_matricule_key' 
          AND table_name = 'employees'
        ) THEN
          ALTER TABLE employees ADD CONSTRAINT employees_matricule_key UNIQUE (matricule);
          RAISE NOTICE 'Contrainte d''unicité ajoutée sur le champ matricule';
        ELSE
          RAISE NOTICE 'La contrainte d''unicité existe déjà sur le champ matricule';
        END IF;
      END $$;
    `);
    
    // 4. Vérifier que la contrainte a été ajoutée
    const constraintResult = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'employees' 
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = 'matricule'
    `);
    
    if (constraintResult.rows.length > 0) {
      console.log('✅ Contrainte d\'unicité ajoutée avec succès');
      constraintResult.rows.forEach(row => {
        console.log(`   - ${row.constraint_name} sur ${row.column_name}`);
      });
    } else {
      console.log('❌ Erreur: La contrainte n\'a pas été ajoutée');
    }
    
    // 5. Vérifier qu'il n'y a plus de doublons
    const finalCheckResult = await client.query(`
      SELECT matricule, COUNT(*) as count
      FROM employees 
      WHERE matricule IS NOT NULL 
      GROUP BY matricule 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (finalCheckResult.rows.length === 0) {
      console.log('✅ Aucun doublon de matricule après correction');
    } else {
      console.log('❌ Des doublons persistent après correction');
      finalCheckResult.rows.forEach(row => {
        console.log(`   - ${row.matricule}: ${row.count} occurrences`);
      });
    }
    
    // 6. Créer un index sur le matricule
    console.log('📊 Création de l\'index sur le matricule...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_matricule ON employees(matricule)
    `);
    
    // 7. Vérifier l'index
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
      console.log('✅ Index créé avec succès');
      console.log(`   - ${indexResult.rows[0].indexname}`);
    } else {
      console.log('❌ Erreur: L\'index n\'a pas été créé');
    }
    
    console.log('\n🎉 Correction des matricules terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des matricules:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  fixMatriculeUniqueness()
    .then(() => {
      console.log('Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur lors de l\'exécution du script:', error);
      process.exit(1);
    });
}

module.exports = { fixMatriculeUniqueness };








