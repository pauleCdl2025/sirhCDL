const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkRecrutementHistory() {
  try {
    // Vérifier si la table existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'recrutement_history'
      )
    `);
    
    console.log('Table recrutement_history existe:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Vérifier la structure de la table
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'recrutement_history' 
        ORDER BY ordinal_position
      `);
      
      console.log('\nStructure de la table recrutement_history:');
      structure.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
      });
      
      // Vérifier le contenu
      const content = await pool.query(`
        SELECT COUNT(*) as count FROM recrutement_history
      `);
      
      console.log(`\nNombre d'enregistrements dans recrutement_history: ${content.rows[0].count}`);
      
      if (content.rows[0].count > 0) {
        const recentRecords = await pool.query(`
          SELECT * FROM recrutement_history 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        console.log('\nDerniers enregistrements:');
        recentRecords.rows.forEach((record, index) => {
          console.log(`${index + 1}. ID: ${record.id}, Employee ID: ${record.employee_id}, Date: ${record.date_recrutement}, Poste: ${record.poste_recrute}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkRecrutementHistory();







