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

async function createMessagingTables() {
  try {
    console.log('🚀 Création des tables de messagerie et notifications...');

    // Table pour la messagerie en temps réel
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('employee', 'rh', 'system')),
        receiver_type VARCHAR(20) NOT NULL CHECK (receiver_type IN ('employee', 'rh', 'system')),
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'notification', 'system')),
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parent_message_id INTEGER REFERENCES messages(id),
        thread_id VARCHAR(50),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
        metadata JSONB
      )
    `);
    console.log('✅ Table messages créée');

    // Table pour les conversations/threads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        thread_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255),
        participants JSONB NOT NULL,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        conversation_type VARCHAR(20) DEFAULT 'support' CHECK (conversation_type IN ('support', 'general', 'urgent', 'system'))
      )
    `);
    console.log('✅ Table conversations créée');

    // Table pour les notifications push en temps réel
    await pool.query(`
      CREATE TABLE IF NOT EXISTS real_time_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('employee', 'rh')),
        notification_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        action_url VARCHAR(500),
        action_text VARCHAR(100)
      )
    `);
    console.log('✅ Table real_time_notifications créée');

    // Index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON real_time_notifications(user_id, user_type)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_unread ON real_time_notifications(user_id, is_read) WHERE is_read = FALSE
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON real_time_notifications(created_at)
    `);

    console.log('✅ Index créés');

    // Fonction pour générer un thread_id unique
    await pool.query(`
      CREATE OR REPLACE FUNCTION generate_thread_id()
      RETURNS VARCHAR(50) AS $$
      BEGIN
        RETURN 'thread_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_' || FLOOR(RANDOM() * 1000)::INTEGER;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Fonction generate_thread_id créée');

    // Triggers pour mettre à jour les timestamps
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_messages_updated_at ON messages
    `);
    await pool.query(`
      CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations
    `);
    await pool.query(`
      CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Triggers créés');

    console.log('🎉 Toutes les tables de messagerie et notifications ont été créées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
createMessagingTables();







