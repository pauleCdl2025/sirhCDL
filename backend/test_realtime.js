const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
});

async function sendTestNotification() {
  try {
    console.log('🚀 Envoi d\'une notification de test...');

    // Récupérer un employé aléatoire
    const employeeResult = await pool.query('SELECT id, nom_prenom FROM employees ORDER BY RANDOM() LIMIT 1');
    
    if (employeeResult.rows.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    const employee = employeeResult.rows[0];
    console.log(`📋 Employé sélectionné: ${employee.nom_prenom} (ID: ${employee.id})`);

    // Types de notifications de test
    const testNotifications = [
      {
        type: 'leave_request',
        title: 'Nouvelle demande de congé',
        message: 'Une nouvelle demande de congé nécessite votre approbation',
        priority: 'high'
      },
      {
        type: 'system_maintenance',
        title: 'Maintenance système prévue',
        message: 'Une maintenance système est prévue ce soir de 22h à 2h',
        priority: 'normal'
      },
      {
        type: 'meeting_reminder',
        title: 'Rappel de réunion',
        message: 'Réunion équipe RH dans 15 minutes en salle de conférence',
        priority: 'urgent'
      },
      {
        type: 'report_ready',
        title: 'Rapport mensuel disponible',
        message: 'Le rapport RH de janvier 2025 est maintenant disponible',
        priority: 'normal'
      },
      {
        type: 'training_available',
        title: 'Nouvelle formation disponible',
        message: 'Formation "Gestion du stress" disponible - Inscription ouverte',
        priority: 'low'
      }
    ];

    // Sélectionner une notification aléatoire
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];

    // Insérer la notification
    const result = await pool.query(`
      INSERT INTO real_time_notifications 
      (user_id, user_type, notification_type, title, message, priority, data)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      employee.id,
      'employee',
      randomNotification.type,
      randomNotification.title,
      randomNotification.message,
      randomNotification.priority,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        test: true,
        employee_id: employee.id
      })
    ]);

    const notification = result.rows[0];
    console.log('✅ Notification créée:', notification.title);
    console.log('📊 Détails:', {
      id: notification.id,
      type: notification.notification_type,
      priority: notification.priority,
      user_id: notification.user_id,
      created_at: notification.created_at
    });

    console.log('\n🎯 Pour tester en temps réel:');
    console.log('1. Ouvrez votre application dans le navigateur');
    console.log('2. Connectez-vous avec l\'utilisateur ID:', employee.id);
    console.log('3. La notification devrait apparaître instantanément dans le TopNav');

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de notification:', error);
  } finally {
    await pool.end();
  }
}

// Fonction pour envoyer plusieurs notifications
async function sendMultipleNotifications() {
  try {
    console.log('🚀 Envoi de plusieurs notifications de test...');

    const employeesResult = await pool.query('SELECT id, nom_prenom FROM employees LIMIT 3');
    const employees = employeesResult.rows;

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    const notifications = [
      {
        type: 'leave_request',
        title: 'Demande de congé urgente',
        message: 'Demande de congé nécessitant une approbation immédiate',
        priority: 'urgent'
      },
      {
        type: 'contract_renewal',
        title: 'Contrat à renouveler',
        message: 'Le contrat de l\'employé expire dans 7 jours',
        priority: 'high'
      },
      {
        type: 'birthday_wish',
        title: 'Joyeux anniversaire !',
        message: 'Tous nos vœux pour votre anniversaire !',
        priority: 'normal'
      }
    ];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const notification = notifications[i % notifications.length];

      await pool.query(`
        INSERT INTO real_time_notifications 
        (user_id, user_type, notification_type, title, message, priority, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        employee.id,
        'employee',
        notification.type,
        notification.title,
        notification.message,
        notification.priority,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          test: true,
          batch: true
        })
      ]);

      console.log(`✅ Notification envoyée à ${employee.nom_prenom} (ID: ${employee.id})`);
    }

    console.log(`\n🎉 ${employees.length} notifications envoyées !`);
    console.log('📱 Les utilisateurs connectés devraient recevoir ces notifications en temps réel');

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi multiple:', error);
  } finally {
    await pool.end();
  }
}

// Fonction pour envoyer un message de test
async function sendTestMessage() {
  try {
    console.log('🚀 Envoi d\'un message de test...');

    // Récupérer deux employés différents
    const employeesResult = await pool.query('SELECT id, nom_prenom FROM employees ORDER BY RANDOM() LIMIT 2');
    
    if (employeesResult.rows.length < 2) {
      console.log('❌ Pas assez d\'employés pour envoyer un message');
      return;
    }

    const [sender, receiver] = employeesResult.rows;
    console.log(`📤 Expéditeur: ${sender.nom_prenom} (ID: ${sender.id})`);
    console.log(`📥 Destinataire: ${receiver.nom_prenom} (ID: ${receiver.id})`);

    const messages = [
      'Bonjour, j\'ai une question concernant mes congés.',
      'Réunion équipe demain à 14h - Confirmez votre présence',
      'Nouveau rapport disponible dans votre espace',
      'Merci pour votre travail cette semaine !',
      'Formation disponible - Inscrivez-vous rapidement'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Insérer le message
    const result = await pool.query(`
      INSERT INTO messages 
      (sender_id, sender_type, receiver_id, receiver_type, message, priority)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      sender.id,
      'employee',
      receiver.id,
      'employee',
      randomMessage,
      'normal'
    ]);

    const message = result.rows[0];
    console.log('✅ Message créé:', message.message);
    console.log('📊 Détails:', {
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      created_at: message.created_at
    });

    console.log('\n🎯 Pour tester en temps réel:');
    console.log('1. Ouvrez votre application dans le navigateur');
    console.log('2. Connectez-vous avec l\'utilisateur ID:', receiver.id);
    console.log('3. Le message devrait apparaître instantanément dans le TopNav');

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de message:', error);
  } finally {
    await pool.end();
  }
}

// Interface de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'notification':
    sendTestNotification();
    break;
  case 'notifications':
    sendMultipleNotifications();
    break;
  case 'message':
    sendTestMessage();
    break;
  default:
    console.log('🚀 Script de test des notifications en temps réel');
    console.log('\n📋 Commandes disponibles:');
    console.log('  node test_realtime.js notification  - Envoyer une notification de test');
    console.log('  node test_realtime.js notifications - Envoyer plusieurs notifications');
    console.log('  node test_realtime.js message       - Envoyer un message de test');
    console.log('\n💡 Assurez-vous que le serveur backend est démarré avec WebSocket activé');
    break;
}







