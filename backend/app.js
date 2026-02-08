// Configuration serveur optimisée pour résoudre les erreurs 504
// À intégrer dans votre app.js ou server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// ========================================
// CONFIGURATION EXPRESS OPTIMISÉE
// ========================================

// Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Augmenter les limites pour éviter les timeouts
app.use(express.json({ 
  limit: '50mb',
  timeout: 300000 // 5 minutes
}));

app.use(express.urlencoded({ 
  limit: '50mb', 
  extended: true,
  timeout: 300000
}));

// Configuration pour les fichiers statiques
app.use(express.static('public', {
  maxAge: '1h',
  etag: true
}));

// ========================================
// MIDDLEWARE DE MONITORING
// ========================================

// Middleware global de monitoring des performances
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${req.method} ${req.path} - ${duration}ms`);
    
    if (duration > 30000) { // Plus de 30 secondes
      console.warn(`⚠️ REQUÊTE LENTE: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});

// Middleware spécifique pour l'onboarding
app.use('/api/employees/onboarding', (req, res, next) => {
  console.log('📥 Onboarding request received');
  console.log('📊 Content-Length:', req.headers['content-length']);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // Timeouts pour éviter les blocages
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  
  next();
});

// ========================================
// CONFIGURATION MULTER OPTIMISÉE
// ========================================

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Créer le dossier s'il n'existe pas
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuration multer optimisée
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par fichier
    files: 5, // 5 fichiers max
    fieldSize: 2 * 1024 * 1024 // 2MB pour les champs
  },
  fileFilter: (req, file, cb) => {
    console.log('📄 Processing file:', file.originalname);
    
    // Vérifier le type de fichier
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
    }
  }
});

// ========================================
// ROUTE D'ONBOARDING OPTIMISÉE
// ========================================

app.post('/api/employees/onboarding', upload.array('documents', 5), async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Début du traitement onboarding');
    
    // 1. Validation des données
    const employeeData = JSON.parse(req.body.employeeData);
    console.log('✅ Données employé validées');
    
    // 2. Traitement des fichiers de manière asynchrone
    const filePromises = req.files.map(async (file, index) => {
      console.log(`📄 Traitement fichier ${index + 1}: ${file.originalname}`);
      
      // Simuler un traitement de fichier (remplacez par votre logique)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        filename: file.filename,
        originalName: file.originalname,
        type: req.body.documentTypes[index],
        size: file.size,
        path: file.path
      };
    });
    
    const processedFiles = await Promise.all(filePromises);
    console.log('✅ Fichiers traités');
    
    // 3. Sauvegarde en base de données (simulation)
    console.log('💾 Sauvegarde en base de données...');
    
    // Simuler une sauvegarde en base de données
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const employee = {
      id: Date.now(),
      ...employeeData,
      documents: processedFiles,
      createdAt: new Date().toISOString()
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ Onboarding terminé en ${duration}ms`);
    
    res.json({
      success: true,
      message: 'Employé créé avec succès',
      employee: employee,
      processingTime: duration,
      filesProcessed: processedFiles.length
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Erreur onboarding:', error);
    console.error(`⏱️ Durée avant erreur: ${duration}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'onboarding',
      error: error.message,
      processingTime: duration
    });
  }
});

// ========================================
// ROUTES DE SANTÉ
// ========================================

// Endpoint de santé simple
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Endpoint ping
app.get('/api/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// GESTION D'ERREURS
// ========================================

// Middleware de gestion d'erreurs
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux',
        error: 'Le fichier dépasse la limite de 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Trop de fichiers',
        error: 'Maximum 5 fichiers autorisés'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: error.message
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Monitoring activé`);
  console.log(`📁 Dossier uploads: ${path.join(__dirname, 'uploads')}`);
  console.log(`⏱️ Timeout configuré: 5 minutes`);
});

module.exports = app;
