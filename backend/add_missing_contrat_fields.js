const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function addMissingContratFields() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Ajout des champs manquants à la table contrats...');
    
    // 1. Ajouter le champ poste
    console.log('1. Ajout du champ poste...');
    await client.query(`
      ALTER TABLE contrats ADD COLUMN IF NOT EXISTS poste VARCHAR(255);
    `);
    console.log('✅ Champ poste ajouté');
    
    // 2. Ajouter le champ service
    console.log('2. Ajout du champ service...');
    await client.query(`
      ALTER TABLE contrats ADD COLUMN IF NOT EXISTS service VARCHAR(255);
    `);
    console.log('✅ Champ service ajouté');
    
    // 3. Vérifier la nouvelle structure
    console.log('3. Vérification de la nouvelle structure...');
    const structure = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Structure finale de la table contrats:');
    structure.rows.forEach(col => {
      console.log(`   ${col.ordinal_position}. ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 4. Vérifier les données existantes
    const dataCount = await client.query('SELECT COUNT(*) FROM contrats;');
    console.log(`\n📊 Nombre de contrats dans la table: ${dataCount.rows[0].count}`);
    
    if (parseInt(dataCount.rows[0].count) > 0) {
      const sampleData = await client.query('SELECT id, employee_id, type_contrat, poste, service FROM contrats LIMIT 3;');
      console.log('\n📝 Exemple de données après modification:');
      sampleData.rows.forEach((row, index) => {
        console.log(`   Contrat ${index + 1}:`, row);
      });
    }
    
    console.log('\n🎉 Ajout des champs manquants terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des champs:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await addMissingContratFields();
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec de l\'ajout des champs:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { addMissingContratFields };








