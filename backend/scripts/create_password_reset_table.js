const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function createPasswordResetTable() {
  const client = await pool.connect();
  try {
    console.log('🔄 Création de la table password_reset_tokens...\n');
    
    // Créer la table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        used_at TIMESTAMP NULL
      )
    `);
    
    console.log('✅ Table password_reset_tokens créée');
    
    // Créer les index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_identifier ON password_reset_tokens(identifier);
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);
      CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_type ON password_reset_tokens(user_type);
    `);
    
    console.log('✅ Index créés');
    
    // Vérifier la structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Structure de la table:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ Table password_reset_tokens prête à être utilisée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPasswordResetTable();


