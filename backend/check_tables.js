const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
  options: '-c client_encoding=UTF8',
  charset: 'utf8',
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

async function checkTables() {
  try {
    console.log('🔍 Vérification des tables...');

    // Vérifier la table real_time_notifications
    const notificationsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'real_time_notifications'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Structure de la table real_time_notifications:');
    notificationsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Vérifier la table messages
    const messagesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Structure de la table messages:');
    messagesResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Vérifier la table conversations
    const conversationsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Structure de la table conversations:');
    conversationsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
checkTables();
