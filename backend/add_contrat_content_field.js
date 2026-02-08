const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function addContratContentField() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Ajout du champ contrat_content à la table contrats...');
    
    // Ajouter le champ contrat_content
    await client.query(`
      ALTER TABLE contrats ADD COLUMN IF NOT EXISTS contrat_content TEXT;
    `);
    console.log('✅ Champ contrat_content ajouté');
    
    // Vérifier la structure finale
    const structure = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Structure finale de la table contrats:');
    structure.rows.forEach(col => {
      console.log(`   ${col.ordinal_position}. ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n🎉 Champ contrat_content ajouté avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du champ:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await addContratContentField();
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec de l\'ajout du champ:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { addContratContentField };








