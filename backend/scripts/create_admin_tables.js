const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'Cdl@2025',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function createAdminTables() {
  try {
    console.log('📋 Création des tables d\'administration...\n');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, '../db/admin_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter les commandes SQL
    await pool.query(sql);

    console.log('✅ Tables créées avec succès !');
    console.log('   - login_history');
    console.log('   - audit_logs');
    console.log('   - users (si n\'existe pas)');
    console.log('\n📊 Vérification des tables...\n');

    // Vérifier que les tables existent
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('login_history', 'audit_logs', 'users')
      ORDER BY table_name
    `);

    console.log('✅ Tables disponibles:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminTables();

