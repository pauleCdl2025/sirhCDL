const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function createContratsTable() {
  console.log('🔧 Création de la table contrats...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Vérifier si la table contrats existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contrats'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('ℹ️ Table contrats existe déjà');
      
      // Vérifier la structure
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'contrats'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Structure actuelle de la table contrats:');
      structure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
    } else {
      console.log('🏗️ Création de la table contrats...');
      
      await client.query(`
        CREATE TABLE contrats (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL,
          type_contrat VARCHAR(100) NOT NULL,
          date_debut DATE NOT NULL,
          date_fin DATE,
          statut VARCHAR(50) DEFAULT 'Actif',
          salaire DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Table contrats créée');
      
      // Ajouter quelques contrats de test pour les employés existants
      console.log('📝 Ajout de contrats de test...');
      
      const employees = await client.query('SELECT id, type_contrat, date_entree FROM employees LIMIT 5');
      
      for (const emp of employees.rows) {
        await client.query(`
          INSERT INTO contrats (employee_id, type_contrat, date_debut, statut)
          VALUES ($1, $2, $3, 'Actif')
        `, [emp.id, emp.type_contrat || 'CDI', emp.date_entree || '2024-01-01']);
      }
      
      console.log(`✅ ${employees.rows.length} contrats de test ajoutés`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎯 Table contrats prête !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createContratsTable().catch(console.error);








