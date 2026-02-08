# Guide de Résolution des Erreurs 504 - Côté Serveur

## 🔍 Analyse du Problème

D'après les logs, le problème est **côté serveur** :
- ✅ Upload réussi (100%)
- ✅ Données reçues par le serveur
- ❌ **504 Gateway Timeout** lors du traitement

## 🚨 Diagnostic Serveur

### **Logs d'Analyse**
```javascript
// Dans votre serveur Express, ajoutez ces middlewares :

// 1. Middleware de logging pour l'onboarding
app.use('/api/employees/onboarding', (req, res, next) => {
  console.log('📥 Onboarding request received');
  console.log('📊 Content-Length:', req.headers['content-length']);
  console.log('⏰ Timestamp:', new Date().toISOString());
  next();
});

// 2. Middleware de timeout pour éviter les blocages
app.use('/api/employees/onboarding', (req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// 3. Middleware de monitoring des performances
app.use('/api/employees/onboarding', (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`⏱️ Onboarding completed in ${duration}ms`);
  });
  
  next();
});
```

## 🔧 Solutions Côté Serveur

### **1. Configuration Express**
```javascript
// app.js ou server.js
const express = require('express');
const app = express();

// Augmenter les limites
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
```

### **2. Configuration Multer (Upload de Fichiers)**
```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par fichier
    files: 5, // 5 fichiers max
    fieldSize: 2 * 1024 * 1024 // 2MB pour les champs
  },
  fileFilter: (req, file, cb) => {
    console.log('📄 Processing file:', file.originalname);
    cb(null, true);
  }
});
```

### **3. Route d'Onboarding Optimisée**
```javascript
// routes/employees.js
router.post('/onboarding', upload.array('documents', 5), async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Début du traitement onboarding');
    
    // 1. Validation des données
    const employeeData = JSON.parse(req.body.employeeData);
    console.log('✅ Données employé validées');
    
    // 2. Traitement des fichiers de manière asynchrone
    const filePromises = req.files.map(async (file, index) => {
      console.log(`📄 Traitement fichier ${index + 1}: ${file.originalname}`);
      // Votre logique de traitement de fichier
      return { filename: file.filename, type: req.body.documentTypes[index] };
    });
    
    const processedFiles = await Promise.all(filePromises);
    console.log('✅ Fichiers traités');
    
    // 3. Sauvegarde en base de données
    console.log('💾 Sauvegarde en base de données...');
    const employee = await Employee.create({
      ...employeeData,
      documents: processedFiles
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Onboarding terminé en ${duration}ms`);
    
    res.json({
      success: true,
      message: 'Employé créé avec succès',
      employee: employee,
      processingTime: duration
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
```

### **4. Configuration Base de Données**
```javascript
// Si vous utilisez MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'your_database',
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  queueLimit: 0
});

// Si vous utilisez MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/your_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 300000,
  connectTimeoutMS: 30000
});
```

## 🚨 Actions d'Urgence

### **Si le Problème Persiste**

1. **Vérifiez les Logs Serveur**
   ```bash
   # Linux/Mac
   tail -f /var/log/your-app.log | grep onboarding
   
   # Windows
   Get-Content your-app.log -Wait | Select-String "onboarding"
   ```

2. **Testez l'Endpoint Directement**
   ```bash
   curl -X POST http://localhost:5001/api/employees/onboarding \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "employeeData={\"nom_prenom\":\"Test\",\"email\":\"test@test.com\"}" \
     -F "documents=@test.pdf" \
     --max-time 300
   ```

3. **Vérifiez les Performances**
   ```javascript
   // Ajoutez ce middleware pour monitorer
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       if (duration > 30000) { // Plus de 30 secondes
         console.warn(`⚠️ Requête lente: ${req.method} ${req.path} - ${duration}ms`);
       }
     });
     next();
   });
   ```

## 📊 Monitoring Recommandé

### **Métriques à Surveiller**
- **Temps de traitement** : < 60 secondes
- **Utilisation mémoire** : < 80%
- **CPU** : < 70%
- **Connexions DB** : < 80% du pool

### **Alertes à Configurer**
```javascript
// Exemple d'alerte de performance
const performanceAlert = (duration, endpoint) => {
  if (duration > 60000) { // Plus d'1 minute
    console.error(`🚨 PERFORMANCE CRITIQUE: ${endpoint} - ${duration}ms`);
    // Envoyer une alerte (email, Slack, etc.)
  }
};
```

## 🔧 Configuration Serveur Web (Nginx/Apache)

### **Nginx**
```nginx
# /etc/nginx/sites-available/your-app
server {
    listen 80;
    server_name your-domain.com;
    
    client_max_body_size 50M;
    client_body_timeout 300s;
    client_header_timeout 300s;
    
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
```

### **Apache**
```apache
# /etc/apache2/sites-available/your-app.conf
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPass /api/ http://localhost:5001/api/
    ProxyPassReverse /api/ http://localhost:5001/api/
    
    Timeout 300
    ProxyTimeout 300
</VirtualHost>
```

## ✅ Checklist de Vérification

- [ ] Timeouts Express configurés : ⚠️ À vérifier
- [ ] Multer optimisé : ⚠️ À vérifier
- [ ] Base de données optimisée : ⚠️ À vérifier
- [ ] Logs de performance activés : ⚠️ À vérifier
- [ ] Serveur web configuré : ⚠️ À vérifier

**Prochaine étape** : Appliquez ces configurations côté serveur et testez à nouveau l'onboarding.







