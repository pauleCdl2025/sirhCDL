const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkContratsStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table contrats...\n');
    
    // Vérifier si la table existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contrats'
      )
    `);
    
    console.log('Table contrats existe:', tableExists.rows[0].exists);
    
    if (tableExists.rows[0].exists) {
      // Vérifier la structure de la table
      const structure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'contrats' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Structure actuelle de la table contrats:');
      structure.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable} - Default: ${row.column_default || 'NULL'}`);
      });
      
      // Vérifier le contenu
      const content = await pool.query(`
        SELECT COUNT(*) as count FROM contrats
      `);
      
      console.log(`\n📊 Nombre d'enregistrements dans contrats: ${content.rows[0].count}`);
      
      if (content.rows[0].count > 0) {
        const recentRecords = await pool.query(`
          SELECT c.*, e.nom_prenom, e.matricule
          FROM contrats c
          JOIN employees e ON c.employee_id = e.id
          ORDER BY c.created_at DESC 
          LIMIT 5
        `);
        
        console.log('\n📋 Derniers contrats:');
        recentRecords.rows.forEach((record, index) => {
          console.log(`${index + 1}. ID: ${record.id}, Employee: ${record.nom_prenom} (${record.matricule}), Type: ${record.type_contrat}, Date début: ${record.date_debut}, Statut: ${record.statut}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkContratsStructure();

