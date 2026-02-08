// Endpoint de santé pour le serveur (à ajouter dans votre serveur Express)
// Ce fichier est optionnel et montre comment créer un endpoint de santé

const express = require('express');
const router = express.Router();

// Endpoint de santé simple
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Endpoint ping simple
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de diagnostic complet
router.get('/diagnostic', async (req, res) => {
  try {
    const diagnostic = {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      database: {
        status: 'unknown',
        // Ajoutez ici votre logique de vérification de base de données
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(diagnostic);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;







