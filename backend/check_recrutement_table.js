const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkRecrutementTable() {
  console.log('🔍 Vérification de la table recrutement_history...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Vérifier la structure actuelle
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'recrutement_history'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure actuelle de recrutement_history:');
    structure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Vérifier si la colonne notes existe
    const hasNotes = structure.rows.some(col => col.column_name === 'notes');
    
    if (!hasNotes) {
      console.log('\n❌ Colonne notes manquante dans recrutement_history');
      console.log('🔧 Ajout de la colonne notes...');
      
      await client.query(`
        ALTER TABLE recrutement_history 
        ADD COLUMN notes TEXT
      `);
      
      console.log('✅ Colonne notes ajoutée');
    } else {
      console.log('\n✅ Colonne notes existe déjà');
    }
    
    // Vérifier si la colonne updated_at existe
    const hasUpdatedAt = structure.rows.some(col => col.column_name === 'updated_at');
    
    if (!hasUpdatedAt) {
      console.log('\n❌ Colonne updated_at manquante dans recrutement_history');
      console.log('🔧 Ajout de la colonne updated_at...');
      
      await client.query(`
        ALTER TABLE recrutement_history 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('✅ Colonne updated_at ajoutée');
    } else {
      console.log('\n✅ Colonne updated_at existe déjà');
    }
    
    await client.query('COMMIT');
    console.log('\n🎯 Structure de recrutement_history corrigée !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkRecrutementTable().catch(console.error);








