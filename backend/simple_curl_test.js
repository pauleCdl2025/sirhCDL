const http = require('http');

console.log('🧪 Test simple de l\'endpoint d\'approbation...\n');

const data = JSON.stringify({
  is_approved: true,
  approval_comments: 'Test d\'approbation',
  approved_by: 1
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/request-files/2/approval',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('📡 Envoi de la requête d\'approbation...');

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📊 Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Réponse:', body);
    
    if (res.statusCode === 200) {
      console.log('✅ Approbation réussie !');
    } else {
      console.log('❌ Approbation échouée');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erreur de requête:', e.message);
});

req.write(data);
req.end();











