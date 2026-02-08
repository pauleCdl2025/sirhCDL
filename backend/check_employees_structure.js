const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkEmployeesStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table employees...\n');
    
    // Vérifier la structure de la table
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Structure actuelle de la table employees:');
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable} - Default: ${row.column_default || 'NULL'}`);
    });
    
    // Vérifier le nombre total de colonnes
    console.log(`\n📊 Total: ${structure.rows.length} colonnes`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkEmployeesStructure();







