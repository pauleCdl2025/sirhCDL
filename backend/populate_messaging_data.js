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

async function populateMessagingData() {
  try {
    console.log('🚀 Début du peuplement des données de messagerie...');

    // Récupérer quelques employés existants
    const employeesResult = await pool.query('SELECT id, nom_prenom, email FROM employees LIMIT 5');
    const employees = employeesResult.rows;

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé dans la base de données');
      return;
    }

    console.log(`📋 ${employees.length} employés trouvés pour les tests`);

    // Insérer des notifications de test
    console.log('📢 Insertion des notifications de test...');
    
    const notificationTypes = [
      'leave_request',
      'contract_renewal',
      'system_maintenance',
      'meeting_reminder',
      'report_ready',
      'training_available',
      'performance_review',
      'birthday_wish'
    ];

    const notificationTitles = [
      'Nouvelle demande de congé',
      'Contrat à renouveler',
      'Maintenance système prévue',
      'Réunion équipe RH',
      'Rapport mensuel disponible',
      'Formation disponible',
      'Évaluation de performance',
      'Joyeux anniversaire !'
    ];

    const notificationMessages = [
      'Marie Dupont a demandé 5 jours de congés du 15 au 19 janvier',
      'Le contrat de Jean Martin expire dans 30 jours',
      'Maintenance prévue le samedi 20 janvier de 22h à 2h',
      'Réunion équipe RH demain à 14h en salle de conférence',
      'Le rapport RH de janvier 2025 est maintenant disponible',
      'Nouvelle formation "Gestion du stress" disponible',
      'Votre évaluation de performance annuelle est prête',
      'Tous nos vœux pour votre anniversaire !'
    ];

    for (let i = 0; i < 20; i++) {
      const employee = employees[i % employees.length];
      const typeIndex = i % notificationTypes.length;
      
      await pool.query(`
        INSERT INTO real_time_notifications 
        (user_id, user_type, notification_type, title, message, priority, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        employee.id,
        'employee',
        notificationTypes[typeIndex],
        notificationTitles[typeIndex],
        notificationMessages[typeIndex],
        i % 3 === 0 ? 'high' : i % 3 === 1 ? 'normal' : 'low',
        JSON.stringify({
          employee_id: employee.id,
          timestamp: new Date().toISOString(),
          category: typeIndex % 2 === 0 ? 'work' : 'personal'
        })
      ]);
    }

    console.log('✅ 20 notifications insérées');

    // Insérer des conversations de test
    console.log('💬 Insertion des conversations de test...');

    for (let i = 0; i < 5; i++) {
      const threadId = `thread_${Date.now()}_${i}`;
      const participants = [
        { id: employees[0].id, type: 'employee' },
        { id: employees[1].id, type: 'employee' }
      ];

      await pool.query(`
        INSERT INTO conversations 
        (thread_id, title, participants, conversation_type)
        VALUES ($1, $2, $3, $4)
      `, [
        threadId,
        `Conversation ${i + 1}`,
        JSON.stringify(participants),
        i % 2 === 0 ? 'support' : 'general'
      ]);

      // Insérer des messages pour cette conversation
      const messages = [
        'Bonjour, j\'ai une question concernant mes congés.',
        'Bonjour ! Je peux vous aider avec ça.',
        'Parfait, merci beaucoup !',
        'De rien, n\'hésitez pas si vous avez d\'autres questions.',
        'D\'accord, bonne journée !'
      ];

      for (let j = 0; j < messages.length; j++) {
        const senderId = j % 2 === 0 ? employees[0].id : employees[1].id;
        const receiverId = j % 2 === 0 ? employees[1].id : employees[0].id;

        await pool.query(`
          INSERT INTO messages 
          (sender_id, sender_type, receiver_id, receiver_type, message, thread_id, priority)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          senderId,
          'employee',
          receiverId,
          'employee',
          messages[j],
          threadId,
          'normal'
        ]);
      }
    }

    console.log('✅ 5 conversations avec messages insérées');

    // Insérer des messages directs
    console.log('📨 Insertion des messages directs...');

    const directMessages = [
      'Rapport mensuel RH disponible dans votre espace',
      'Réunion équipe demain à 14h',
      'Nouvelle formation disponible',
      'Mise à jour du système prévue',
      'Évaluation de performance à compléter'
    ];

    for (let i = 0; i < 10; i++) {
      const senderId = employees[0].id;
      const receiverId = employees[i % employees.length].id;
      const message = directMessages[i % directMessages.length];

      await pool.query(`
        INSERT INTO messages 
        (sender_id, sender_type, receiver_id, receiver_type, message, message_type, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        senderId,
        'employee',
        receiverId,
        'employee',
        message,
        'text',
        i % 3 === 0 ? 'high' : 'normal'
      ]);
    }

    console.log('✅ 10 messages directs insérés');

    // Marquer quelques messages comme non lus
    await pool.query(`
      UPDATE messages 
      SET is_read = false 
      WHERE id IN (SELECT id FROM messages ORDER BY RANDOM() LIMIT 5)
    `);

    await pool.query(`
      UPDATE real_time_notifications 
      SET is_read = false 
      WHERE id IN (SELECT id FROM real_time_notifications ORDER BY RANDOM() LIMIT 8)
    `);

    console.log('✅ Messages et notifications marqués comme non lus');

    console.log('🎉 Peuplement des données terminé avec succès !');
    console.log('📊 Résumé :');
    console.log('   - 20 notifications créées');
    console.log('   - 5 conversations avec messages');
    console.log('   - 10 messages directs');
    console.log('   - Quelques éléments marqués comme non lus');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement des données:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter le script
populateMessagingData();
