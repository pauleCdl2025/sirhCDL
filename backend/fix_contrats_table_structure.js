const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixContratsTableStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Début de la correction de la structure de la table contrats...');
    
    // 1. Ajouter le champ employee_id
    console.log('1. Ajout du champ employee_id...');
    await client.query(`
      ALTER TABLE contrats ADD COLUMN IF NOT EXISTS employee_id INTEGER;
    `);
    console.log('✅ Champ employee_id ajouté');
    
    // 2. Créer la contrainte de clé étrangère
    console.log('2. Création de la contrainte de clé étrangère...');
    await client.query(`
      ALTER TABLE contrats 
      ADD CONSTRAINT fk_contrats_employee 
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;
    `);
    console.log('✅ Contrainte de clé étrangère créée');
    
    // 3. Migrer les données existantes
    console.log('3. Migration des données existantes...');
    const migrationResult = await client.query(`
      UPDATE contrats 
      SET employee_id = e.id 
      FROM employees e 
      WHERE contrats.nom_employe = e.nom_prenom 
      AND contrats.employee_id IS NULL;
    `);
    console.log(`✅ ${migrationResult.rowCount} contrats migrés`);
    
    // 4. Vérifier les contrats qui n'ont pas pu être liés
    console.log('4. Vérification des contrats non liés...');
    const unlinkedContrats = await client.query(`
      SELECT id, nom_employe, employee_id 
      FROM contrats 
      WHERE employee_id IS NULL;
    `);
    
    if (unlinkedContrats.rows.length > 0) {
      console.log('⚠️  Contrats non liés trouvés:');
      unlinkedContrats.rows.forEach(contrat => {
        console.log(`   - ID: ${contrat.id}, Nom: ${contrat.nom_employe}`);
      });
    } else {
      console.log('✅ Tous les contrats sont liés aux employés');
    }
    
    // 5. Ajouter un index sur employee_id
    console.log('5. Ajout de l\'index sur employee_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contrats_employee_id ON contrats(employee_id);
    `);
    console.log('✅ Index créé');
    
    // 6. Vérifier la nouvelle structure
    console.log('6. Vérification de la nouvelle structure...');
    const structure = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Structure actuelle de la table contrats:');
    structure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🎉 Correction de la structure terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await fixContratsTableStructure();
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec de la correction:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { fixContratsTableStructure };
