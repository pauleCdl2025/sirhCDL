const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function createMissingTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Création des tables manquantes...');
    
    // Table onboarding_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS onboarding_history (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        date_integration DATE NOT NULL,
        checklist JSONB,
        documents TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table onboarding_history créée/vérifiée');
    
    // Table recrutement_history
    await client.query(`
      CREATE TABLE IF NOT EXISTS recrutement_history (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        date_recrutement DATE NOT NULL,
        poste_recrute VARCHAR(255),
        type_contrat VARCHAR(100),
        salaire_propose DECIMAL(10, 2),
        source_recrutement VARCHAR(255),
        notes TEXT,
        statut VARCHAR(50) DEFAULT 'Recruté',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table recrutement_history créée/vérifiée');
    
    // Table contrats
    await client.query(`
      CREATE TABLE IF NOT EXISTS contrats (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        type_contrat VARCHAR(100),
        date_debut DATE,
        date_fin DATE,
        statut VARCHAR(50) DEFAULT 'Actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table contrats créée/vérifiée');
    
    await client.query('COMMIT');
    console.log('✅ Toutes les tables ont été créées avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createMissingTables();







