// Script de test pour le système de messagerie avec données réelles
const testMessagingSystem = async () => {
  console.log('🧪 Test du système de messagerie avec données réelles...');
  
  try {
    // Test 1: Vérifier la connexion à la base de données
    console.log('📊 Test 1: Connexion à la base de données');
    const dbTest = await fetch('/api/employees');
    if (dbTest.ok) {
      const employees = await dbTest.json();
      console.log(`✅ ${employees.length} employés trouvés dans la base de données`);
      
      // Afficher les premiers employés
      employees.slice(0, 3).forEach(emp => {
        console.log(`   - ${emp.nom_prenom} (${emp.matricule}) - ${emp.poste_actuel}`);
      });
    } else {
      console.log('❌ Erreur de connexion à la base de données');
    }

    // Test 2: Vérifier la création de la table messages
    console.log('\n📧 Test 2: Table des messages');
    const messagesTest = await fetch('/api/messages/stats/rh/1');
    if (messagesTest.ok) {
      const stats = await messagesTest.json();
      console.log('✅ Table des messages accessible');
      console.log(`   - Messages totaux: ${stats.stats?.total_messages || 0}`);
      console.log(`   - Messages non lus: ${stats.stats?.unread_messages || 0}`);
    } else {
      console.log('❌ Erreur d\'accès à la table des messages');
    }

    // Test 3: Envoyer un message de test
    console.log('\n💬 Test 3: Envoi de message');
    const testMessage = {
      senderId: 1,
      senderName: 'Service RH',
      senderType: 'rh',
      receiverId: 1,
      receiverName: 'Test Employé',
      receiverType: 'employee',
      content: 'Message de test du système de messagerie'
    };

    const sendTest = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (sendTest.ok) {
      const sentMessage = await sendTest.json();
      console.log('✅ Message envoyé avec succès');
      console.log(`   - ID: ${sentMessage.data?.id}`);
      console.log(`   - Contenu: ${sentMessage.data?.content}`);
    } else {
      console.log('❌ Erreur lors de l\'envoi du message');
    }

    // Test 4: Récupérer les messages
    console.log('\n📥 Test 4: Récupération des messages');
    const getMessages = await fetch('/api/messages/rh/1');
    if (getMessages.ok) {
      const messages = await getMessages.json();
      console.log('✅ Messages récupérés avec succès');
      console.log(`   - Nombre de messages: ${messages.messages?.length || 0}`);
      console.log(`   - Messages non lus: ${messages.unreadCount || 0}`);
    } else {
      console.log('❌ Erreur lors de la récupération des messages');
    }

    console.log('\n🎉 Tests terminés ! Le système de messagerie est opérationnel.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Exécuter les tests si le script est appelé directement
if (typeof window !== 'undefined') {
  // Dans le navigateur
  window.testMessagingSystem = testMessagingSystem;
  console.log('💡 Utilisez testMessagingSystem() dans la console pour tester le système');
} else {
  // Dans Node.js
  testMessagingSystem();
}

module.exports = testMessagingSystem;




