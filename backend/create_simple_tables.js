const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
});

async function createSimpleTables() {
  try {
    console.log('🚀 Création des tables simples...');

    // Supprimer les tables existantes si elles existent
    await pool.query('DROP TABLE IF EXISTS real_time_notifications CASCADE');
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS conversations CASCADE');

    // Créer la table notifications
    await pool.query(`
      CREATE TABLE real_time_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_type VARCHAR(20) NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        priority VARCHAR(20) DEFAULT 'normal',
        action_url VARCHAR(500),
        action_text VARCHAR(100)
      )
    `);
    console.log('✅ Table real_time_notifications créée');

    // Créer la table messages
    await pool.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        sender_type VARCHAR(20) NOT NULL,
        receiver_type VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parent_message_id INTEGER,
        thread_id VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'sent',
        metadata JSONB
      )
    `);
    console.log('✅ Table messages créée');

    // Créer la table conversations
    await pool.query(`
      CREATE TABLE conversations (
        id SERIAL PRIMARY KEY,
        thread_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255),
        participants JSONB NOT NULL,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        conversation_type VARCHAR(20) DEFAULT 'support'
      )
    `);
    console.log('✅ Table conversations créée');

    console.log('🎉 Tables créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
createSimpleTables();







