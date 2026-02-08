const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function createTestMessages() {
  try {
    console.log('🔄 Création de messages de test...');

    // Insérer des messages de test
    const testMessages = [
      {
        sender_id: 1,
        sender_name: 'ABEGUE EDOU ABESSOLO Pauline',
        sender_type: 'employee',
        receiver_id: 1,
        receiver_name: 'Service RH',
        receiver_type: 'rh',
        content: 'Bonjour, j\'aimerais prendre des congés la semaine prochaine.',
        is_read: false
      },
      {
        sender_id: 1,
        sender_name: 'ABEGUE EDOU ABESSOLO Pauline',
        sender_type: 'employee',
        receiver_id: 1,
        receiver_name: 'Service RH',
        receiver_type: 'rh',
        content: 'Pouvez-vous me confirmer si c\'est possible ?',
        is_read: false
      },
      {
        sender_id: 1,
        sender_name: 'Service RH',
        sender_type: 'rh',
        receiver_id: 1,
        receiver_name: 'ABEGUE EDOU ABESSOLO Pauline',
        receiver_type: 'employee',
        content: 'Bonjour Pauline, nous allons examiner votre demande.',
        is_read: true
      },
      {
        sender_id: 1,
        sender_name: 'NKOMA TCHIKA Paule Winnya',
        sender_type: 'employee',
        receiver_id: 1,
        receiver_name: 'Service RH',
        receiver_type: 'rh',
        content: 'Bonjour, j\'ai une question sur mon contrat.',
        is_read: false
      }
    ];

    for (const message of testMessages) {
      const query = `
        INSERT INTO messages (sender_id, sender_name, sender_type, receiver_id, receiver_name, receiver_type, content, is_read)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [
        message.sender_id,
        message.sender_name,
        message.sender_type,
        message.receiver_id,
        message.receiver_name,
        message.receiver_type,
        message.content,
        message.is_read
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Message créé: ${message.content.substring(0, 50)}...`);
    }

    console.log('🎉 Messages de test créés avec succès !');
    
    // Vérifier les statistiques
    console.log('\n📊 Vérification des statistiques:');
    
    // Stats RH
    const rhStatsQuery = `
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = 1 AND receiver_type = 'rh' AND is_read = FALSE
    `;
    const rhStats = await pool.query(rhStatsQuery);
    console.log(`Messages non lus pour RH: ${rhStats.rows[0].unread_count}`);

    // Stats Employé
    const empStatsQuery = `
      SELECT COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = 1 AND receiver_type = 'employee' AND is_read = FALSE
    `;
    const empStats = await pool.query(empStatsQuery);
    console.log(`Messages non lus pour Employé: ${empStats.rows[0].unread_count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création des messages de test:', error);
  } finally {
    await pool.end();
  }
}

createTestMessages();




