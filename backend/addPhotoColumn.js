const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function addPhotoColumn() {
  try {
    console.log('🔄 Ajout de la colonne photo_path...');
    
    // Ajouter la colonne photo_path
    await pool.query(`
      ALTER TABLE employees 
      ADD COLUMN IF NOT EXISTS photo_path VARCHAR(255)
    `);
    
    // Créer un index pour optimiser les requêtes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_photo 
      ON employees(photo_path)
    `);
    
    // Ajouter un commentaire
    await pool.query(`
      COMMENT ON COLUMN employees.photo_path IS 'Chemin vers la photo de profil de l''employé'
    `);
    
    console.log('✅ Colonne photo_path ajoutée avec succès !');
    
    // Vérifier la structure de la table
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Structure de la table employees:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error.message);
  } finally {
    await pool.end();
  }
}

addPhotoColumn();




