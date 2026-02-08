const { Pool } = require('pg');
const AutoNotificationService = require('./services/autoNotificationService');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
});

async function testAutoNotifications() {
  try {
    console.log('🚀 Test des notifications automatiques...');
    
    const autoNotificationService = new AutoNotificationService(pool);

    // Récupérer un employé aléatoire
    const employeeResult = await pool.query('SELECT id, nom_prenom FROM employees ORDER BY RANDOM() LIMIT 1');
    const employee = employeeResult.rows[0];
    
    if (!employee) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    console.log(`📋 Employé sélectionné: ${employee.nom_prenom} (ID: ${employee.id})`);

    // Test 1: Notification de demande
    console.log('\n📝 Test 1: Notification de demande de congé');
    const requestNotifications = await autoNotificationService.createRequestNotification({
      request_id: 999, // ID fictif pour le test
      employee_id: employee.id,
      request_type: 'leave_request',
      title: `Demande de congé - ${employee.nom_prenom}`,
      description: 'Demande de congé annuel du 15 au 20 janvier 2025',
      priority: 'high'
    });
    console.log(`✅ ${requestNotifications.length} notifications de demande créées`);

    // Test 2: Notification de message
    console.log('\n💬 Test 2: Notification de message');
    const messageNotification = await autoNotificationService.createMessageNotification({
      message_id: 999, // ID fictif pour le test
      sender_id: employee.id,
      receiver_id: employee.id, // Auto-message pour le test
      message_content: 'Bonjour, j\'ai une question concernant mes congés. Pouvez-vous m\'aider ?',
      thread_id: 'test_thread_123'
    });
    console.log('✅ Notification de message créée');

    // Test 3: Notification d'approbation
    console.log('\n✅ Test 3: Notification d\'approbation');
    const approvalNotification = await autoNotificationService.createApprovalNotification({
      request_id: 999,
      employee_id: employee.id,
      approver_id: 1, // ID fictif d'approbateur
      status: 'approved',
      request_type: 'leave_request',
      title: `Demande de congé - ${employee.nom_prenom}`
    });
    console.log('✅ Notification d\'approbation créée');

    // Test 4: Notification de rappel
    console.log('\n⏰ Test 4: Notification de rappel');
    const reminderNotification = await autoNotificationService.createReminderNotification({
      user_id: employee.id,
      reminder_type: 'contract_renewal',
      title: 'Renouvellement de contrat',
      message: 'Votre contrat expire dans 30 jours. Veuillez prendre contact avec les RH.',
      priority: 'high'
    });
    console.log('✅ Notification de rappel créée');

    console.log('\n🎉 Tous les tests de notifications automatiques sont terminés !');
    console.log('\n📱 Pour voir les notifications en temps réel:');
    console.log('1. Ouvrez votre application dans le navigateur');
    console.log('2. Connectez-vous avec l\'utilisateur ID:', employee.id);
    console.log('3. Les notifications devraient apparaître instantanément dans le TopNav');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await pool.end();
  }
}

// Test spécifique pour les demandes
async function testRequestNotifications() {
  try {
    console.log('🚀 Test spécifique des notifications de demandes...');
    
    const autoNotificationService = new AutoNotificationService(pool);

    // Récupérer quelques employés
    const employeesResult = await pool.query('SELECT id, nom_prenom FROM employees LIMIT 3');
    const employees = employeesResult.rows;

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    const requestTypes = [
      { type: 'leave_request', title: 'Demande de congé', priority: 'high' },
      { type: 'absence', title: 'Demande d\'absence', priority: 'normal' },
      { type: 'contract_renewal', title: 'Renouvellement de contrat', priority: 'urgent' }
    ];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const requestType = requestTypes[i % requestTypes.length];

      console.log(`\n📝 Création de notification pour ${employee.nom_prenom}: ${requestType.title}`);

      const notifications = await autoNotificationService.createRequestNotification({
        request_id: 1000 + i,
        employee_id: employee.id,
        request_type: requestType.type,
        title: `${requestType.title} - ${employee.nom_prenom}`,
        description: `Description de la demande de type ${requestType.type}`,
        priority: requestType.priority
      });

      console.log(`✅ ${notifications.length} notifications créées pour ${employee.nom_prenom}`);
    }

    console.log('\n🎉 Test des notifications de demandes terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test des demandes:', error);
  } finally {
    await pool.end();
  }
}

// Interface de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'all':
    testAutoNotifications();
    break;
  case 'requests':
    testRequestNotifications();
    break;
  default:
    console.log('🚀 Script de test des notifications automatiques');
    console.log('\n📋 Commandes disponibles:');
    console.log('  node test_auto_notifications.js all      - Tester toutes les notifications');
    console.log('  node test_auto_notifications.js requests - Tester les notifications de demandes');
    console.log('\n💡 Assurez-vous que le serveur backend est démarré avec WebSocket activé');
    break;
}







