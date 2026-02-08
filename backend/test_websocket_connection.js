const { io } = require('socket.io-client');

async function testWebSocketConnection() {
  try {
    console.log('🚀 TEST DE CONNEXION WEBSOCKET');
    console.log('=' .repeat(40));

    // Test de connexion WebSocket
    console.log('\n🔌 Test de connexion WebSocket...');
    
    const socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('❌ Timeout de connexion WebSocket');
        socket.disconnect();
        reject(new Error('Timeout'));
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ WebSocket connecté avec succès !');
        console.log(`📡 Socket ID: ${socket.id}`);
        
        // Test d'authentification
        console.log('\n🔐 Test d\'authentification...');
        socket.emit('authenticate', { userId: 1, userType: 'rh' });
        
        socket.on('authenticated', (data) => {
          console.log('✅ Authentification réussie !');
          console.log(`👤 Utilisateur: ${data.userId} (${data.userType})`);
          
          // Test d'envoi de notification
          console.log('\n📢 Test d\'envoi de notification...');
          socket.emit('test_notification', {
            title: 'Test de notification',
            message: 'Ceci est un test de notification automatique',
            priority: 'normal'
          });
          
          setTimeout(() => {
            console.log('✅ Test de notification envoyé !');
            socket.disconnect();
            resolve({ success: true, socketId: socket.id });
          }, 1000);
        });

        socket.on('auth_error', (error) => {
          console.log('❌ Erreur d\'authentification:', error);
          socket.disconnect();
          reject(new Error('Auth error'));
        });
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Erreur de connexion WebSocket:', error.message);
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        console.log(`🔌 WebSocket déconnecté: ${reason}`);
      });
    });

  } catch (error) {
    console.error('❌ Erreur lors du test WebSocket:', error);
    return { success: false, error: error.message };
  }
}

// Interface de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'run':
    testWebSocketConnection()
      .then(result => {
        if (result.success) {
          console.log('\n🎉 TEST WEBSOCKET RÉUSSI !');
          console.log('✅ Connexion WebSocket: OK');
          console.log('✅ Authentification: OK');
          console.log('✅ Envoi de notification: OK');
          console.log('\n📱 Votre application devrait maintenant pouvoir se connecter au WebSocket !');
        } else {
          console.log('\n❌ TEST WEBSOCKET ÉCHOUÉ');
          console.log('Vérifiez que le serveur backend est démarré sur le port 5001');
        }
      })
      .catch(error => {
        console.log('\n❌ TEST WEBSOCKET ÉCHOUÉ');
        console.log('Erreur:', error.message);
      });
    break;
  default:
    console.log('🚀 Test de Connexion WebSocket');
    console.log('\n📋 Commandes disponibles:');
    console.log('  node test_websocket_connection.js run - Exécuter le test');
    console.log('\n💡 Ce test vérifie la connexion WebSocket avec le serveur');
    break;
}







