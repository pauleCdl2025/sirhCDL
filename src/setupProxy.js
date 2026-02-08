// Fichier de configuration proxy pour désactiver les WebSockets
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Désactiver les WebSockets en redirigeant vers une route inexistante
  app.use('/ws', (req, res) => {
    res.status(404).send('WebSocket désactivé');
  });
  
  // Configuration proxy pour l'API backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    pathRewrite: {
      '^/api': '/api'
    }
  }));
};



