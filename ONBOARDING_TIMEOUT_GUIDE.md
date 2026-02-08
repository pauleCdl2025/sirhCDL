# Guide de Résolution des Timeouts d'Onboarding

## 🔍 Diagnostic Actuel

✅ **Serveur Accessible** : Le diagnostic montre que le serveur fonctionne parfaitement
- Connexion Réseau : Connected (430ms)
- Serveur API : Healthy
- Performance : 100% (3/3 tests réussis)

❌ **Problème** : Timeout lors de l'onboarding malgré un serveur fonctionnel

## 🚀 Solutions Appliquées

### 1. **Timeouts Augmentés**
- ✅ Timeout d'onboarding : 60s → **180s (3 minutes)**
- ✅ Timeout d'upload : 60s → **120s (2 minutes)**
- ✅ Retry configuré : **2 tentatives** avec backoff exponentiel

### 2. **Optimisations Logging**
- ✅ Logs détaillés des tentatives de retry
- ✅ Affichage de la taille des documents
- ✅ Suivi du progrès d'upload

### 3. **Messages d'Erreur Améliorés**
- ✅ Messages plus informatifs avec emojis
- ✅ Suggestions spécifiques selon le type d'erreur

## 🔧 Actions à Effectuer

### 1. **Testez l'Onboarding**
```bash
# Vérifiez les logs dans la console du navigateur
# Vous devriez voir :
🚀 Démarrage de l'onboarding avec retry...
📄 Document 1: cv.pdf (2.5 MB)
📊 Taille totale des documents: 5.2 MB
📤 Upload progress: 25%
```

### 2. **Si le Timeout Persiste**

#### **Option A : Réduire la Taille des Documents**
- Compressez les images (max 1MB par image)
- Utilisez des PDFs optimisés
- Évitez les fichiers > 5MB

#### **Option B : Vérifier le Serveur Backend**
```javascript
// Dans votre serveur Express, ajoutez :
app.use('/api/employees/onboarding', (req, res, next) => {
  console.log('📥 Onboarding request received');
  console.log('📊 Content-Length:', req.headers['content-length']);
  next();
});
```

#### **Option C : Configuration Serveur**
```javascript
// Augmentez les timeouts côté serveur
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Pour multer (upload de fichiers)
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par fichier
    files: 5 // 5 fichiers max
  }
});
```

## 📊 Monitoring

### **Logs à Surveiller**
1. **Console Navigateur** :
   - `🚀 Démarrage de l'onboarding avec retry...`
   - `📤 Upload progress: X%`
   - `🔄 Tentative X échouée: timeout`

2. **Logs Serveur** :
   - Temps de traitement de l'onboarding
   - Utilisation mémoire/CPU
   - Erreurs de base de données

### **Métriques de Performance**
- **Temps d'upload** : < 30 secondes pour 5MB
- **Temps de traitement** : < 60 secondes
- **Temps total** : < 3 minutes

## 🚨 Actions d'Urgence

### **Si le Problème Persiste**

1. **Vérifiez les Logs Serveur**
   ```bash
   # Dans les logs de votre serveur
   grep "onboarding" /var/log/app.log
   grep "timeout" /var/log/app.log
   ```

2. **Testez l'Endpoint Directement**
   ```bash
   curl -X POST http://localhost:5001/api/employees/onboarding \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "employeeData={\"nom_prenom\":\"Test\"}" \
     --max-time 180
   ```

3. **Vérifiez la Base de Données**
   ```sql
   -- Vérifiez les performances
   SHOW PROCESSLIST;
   SELECT * FROM information_schema.tables WHERE table_schema = 'your_db';
   ```

## 📞 Support Technique

### **Informations à Fournir**
1. **Logs Console** : Copiez tous les logs de la console
2. **Taille Documents** : Liste des fichiers uploadés
3. **Erreur Exacte** : Message d'erreur complet
4. **Configuration** : Version du serveur, base de données

### **Contact**
- **Développeur Backend** : Pour vérifier la configuration serveur
- **DBA** : Pour optimiser les requêtes de base de données
- **DevOps** : Pour vérifier la configuration réseau

---

## ✅ Checklist de Vérification

- [ ] Diagnostic serveur : ✅ Healthy
- [ ] Timeouts augmentés : ✅ 180s
- [ ] Retry configuré : ✅ 2 tentatives
- [ ] Logs activés : ✅ Console
- [ ] Documents < 5MB : ⚠️ À vérifier
- [ ] Serveur backend optimisé : ⚠️ À vérifier

**Prochaine étape** : Testez l'onboarding avec ces optimisations et surveillez les logs.







