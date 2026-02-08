const pool = require('./db');

async function createMessagesTable() {
  try {
    console.log('🔄 Création de la table des messages...');
    
    // Créer la table des messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('rh', 'employee')),
        receiver_id INTEGER NOT NULL,
        receiver_name VARCHAR(255) NOT NULL,
        receiver_type VARCHAR(50) NOT NULL CHECK (receiver_type IN ('rh', 'employee')),
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table messages créée avec succès');
    
    // Créer des index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, timestamp)
    `);
    
    console.log('✅ Index créés avec succès');
    
    // Créer une fonction pour mettre à jour updated_at automatiquement
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_messages_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
         NEW.updated_at = CURRENT_TIMESTAMP;
         RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Créer le trigger pour updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_messages_modtime ON messages
    `);
    
    await pool.query(`
      CREATE TRIGGER update_messages_modtime
      BEFORE UPDATE ON messages
      FOR EACH ROW
      EXECUTE PROCEDURE update_messages_updated_at()
    `);
    
    console.log('✅ Trigger créé avec succès');
    
    // Vérifier si la table est vide et insérer des messages de test
    const countResult = await pool.query('SELECT COUNT(*) as count FROM messages');
    const messageCount = parseInt(countResult.rows[0].count);
    
    if (messageCount === 0) {
      console.log('📝 Insertion de messages de test...');
      
      // Insérer quelques messages de test
      await pool.query(`
        INSERT INTO messages (sender_id, sender_name, sender_type, receiver_id, receiver_name, receiver_type, content) VALUES
        (1, 'Service RH', 'rh', 1, 'Jean Dupont', 'employee', 'Bonjour Jean, votre demande de congé a été approuvée.'),
        (1, 'Jean Dupont', 'employee', 1, 'Service RH', 'rh', 'Merci beaucoup pour l''information !'),
        (1, 'Service RH', 'rh', 2, 'Marie Martin', 'employee', 'Bonjour Marie, n''oubliez pas votre visite médicale demain.'),
        (2, 'Marie Martin', 'employee', 1, 'Service RH', 'rh', 'D''accord, je serai présente à 14h.'),
        (1, 'Service RH', 'rh', 3, 'Pierre Durand', 'employee', 'Bonjour Pierre, votre contrat a été renouvelé.'),
        (3, 'Pierre Durand', 'employee', 1, 'Service RH', 'rh', 'Excellent, merci pour cette bonne nouvelle !')
      `);
      
      console.log('✅ Messages de test insérés avec succès');
    } else {
      console.log(`📊 ${messageCount} messages déjà présents dans la table`);
    }
    
    // Vérifier la création
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM messages');
    console.log(`✅ Table messages prête avec ${finalCount.rows[0].count} messages`);
    
    // Afficher quelques exemples
    const examples = await pool.query(`
      SELECT sender_name, receiver_name, content, timestamp 
      FROM messages 
      ORDER BY timestamp DESC 
      LIMIT 3
    `);
    
    console.log('📋 Exemples de messages :');
    examples.rows.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.sender_name} → ${msg.receiver_name}: ${msg.content.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    console.log('🔄 Test de connexion à la base de données...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connexion réussie à:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Initialisation du système de messagerie...');
    
    // Tester la connexion
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Impossible de se connecter à la base de données');
      process.exit(1);
    }
    
    // Créer la table des messages
    await createMessagesTable();
    
    console.log('🎉 Système de messagerie initialisé avec succès !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('1. Démarrer le backend : npm run dev');
    console.log('2. Démarrer le frontend : npm start');
    console.log('3. Tester la messagerie dans l\'interface');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { createMessagesTable, testConnection };




