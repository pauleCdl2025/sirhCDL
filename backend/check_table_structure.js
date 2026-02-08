const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkTableStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colonnes de la table employees:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
