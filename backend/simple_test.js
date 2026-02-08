const http = require('http');

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

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();











