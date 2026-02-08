const http = require('http');

console.log('🔍 Test détaillé de l\'endpoint d\'approbation...\n');

// Test 1: Vérifier que le serveur répond
console.log('1️⃣ Test de connectivité du serveur...');
const testServer = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/',
  method: 'GET'
}, (res) => {
  console.log(`✅ Serveur accessible - Status: ${res.statusCode}`);
  
  // Test 2: Tester l'endpoint d'approbation
  console.log('\n2️⃣ Test de l\'endpoint d\'approbation...');
  
  const data = JSON.stringify({
    is_approved: true,
    approval_comments: 'Test d\'approbation',
    approved_by: 1
  });

  const approvalReq = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/request-files/2/approval',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }, (approvalRes) => {
    console.log(`📊 Status de l'approbation: ${approvalRes.statusCode}`);
    console.log(`📊 Headers:`, approvalRes.headers);
    
    let body = '';
    approvalRes.on('data', (chunk) => {
      body += chunk;
    });
    
    approvalRes.on('end', () => {
      console.log('📄 Réponse complète:', body);
      
      if (approvalRes.statusCode === 200) {
        console.log('✅ Approbation réussie !');
      } else {
        console.log('❌ Approbation échouée');
      }
    });
  });

  approvalReq.on('error', (e) => {
    console.error('❌ Erreur de requête d\'approbation:', e.message);
  });

  approvalReq.write(data);
  approvalReq.end();
});

testServer.on('error', (e) => {
  console.error('❌ Erreur de connexion au serveur:', e.message);
});

testServer.end();











