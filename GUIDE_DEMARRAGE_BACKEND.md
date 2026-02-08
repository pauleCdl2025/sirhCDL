# 🚀 Guide de Démarrage du Backend

## ⚠️ Erreurs ERR_CONNECTION_REFUSED

Si vous voyez des erreurs `ERR_CONNECTION_REFUSED` dans la console, cela signifie que le **backend n'est pas démarré** ou n'est pas accessible.

---

## 📋 Démarrage du Backend

### Option 1 : Démarrage manuel

1. **Ouvrez un terminal** dans le dossier du projet :
   ```bash
   cd C:\Users\paule\Documents\Sirh
   ```

2. **Allez dans le dossier backend** :
   ```bash
   cd backend
   ```

3. **Démarrez le serveur** :
   ```bash
   npm start
   ```
   
   Ou avec nodemon (redémarrage automatique) :
   ```bash
   npx nodemon server.js
   ```

4. **Vérifiez que le serveur démarre** :
   - Vous devriez voir : `🚀 Server running on port 5000`
   - Le serveur doit être accessible sur : `http://localhost:5000`

### Option 2 : Démarrage avec npm script

1. **Depuis la racine du projet** :
   ```bash
   npm run server
   ```

2. **Ou depuis le dossier backend** :
   ```bash
   cd backend
   npm start
   ```

---

## ✅ Vérification que le Backend fonctionne

### Test 1 : Endpoint de santé
Ouvrez votre navigateur et allez sur :
```
http://localhost:5000/api/health
```

Vous devriez voir une réponse JSON avec le statut du serveur.

### Test 2 : Endpoint ping
```
http://localhost:5000/api/ping
```

Vous devriez voir : `{"message":"pong","timestamp":"..."}`

### Test 3 : Test depuis la console du navigateur
Ouvrez la console (F12) et exécutez :
```javascript
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend accessible:', data))
  .catch(err => console.error('❌ Backend non accessible:', err));
```

---

## 🔧 Problèmes courants

### Problème 1 : Port déjà utilisé

**Erreur :** `EADDRINUSE: address already in use :::5000`

**Solution :**
1. Trouvez le processus qui utilise le port 5000 :
   ```bash
   netstat -ano | findstr :5000
   ```
2. Tuez le processus (remplacez PID par le numéro trouvé) :
   ```bash
   taskkill /PID <PID> /F
   ```
3. Redémarrez le serveur

### Problème 2 : Base de données non accessible

**Erreur :** `Database connection failed`

**Solution :**
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants dans `backend/.env` :
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=rh_portal
   DB_PASSWORD=Cdl@2025
   DB_PORT=5432
   ```

### Problème 3 : Variables d'environnement manquantes

**Solution :**
1. Vérifiez que le fichier `backend/.env` existe
2. Vérifiez qu'il contient toutes les variables nécessaires
3. Redémarrez le serveur après modification

---

## 📊 Ports utilisés

- **Frontend :** `http://localhost:3000`
- **Backend :** `http://localhost:5000`
- **Base de données PostgreSQL :** `localhost:5432`

---

## 🎯 Commandes utiles

### Démarrer le backend
```bash
cd backend
npm start
```

### Démarrer avec nodemon (redémarrage auto)
```bash
cd backend
npx nodemon server.js
```

### Vérifier les processus Node.js
```bash
tasklist | findstr node
```

### Arrêter tous les processus Node.js
```bash
taskkill /F /IM node.exe
```

---

## 📝 Logs du serveur

Quand le backend démarre correctement, vous devriez voir :

```
🚀 Server running on port 5000
📡 WebSocket server ready for real-time notifications
✅ Route /api/messages enregistrée
✅ Route /api/admin enregistrée
Connected to PostgreSQL database
PostgreSQL client encoding set to UTF8
```

---

## 🔄 Redémarrage complet

Si vous avez des problèmes, essayez un redémarrage complet :

1. **Arrêtez tous les processus Node.js**
2. **Redémarrez PostgreSQL** (si nécessaire)
3. **Vérifiez les fichiers de configuration** (`backend/.env`)
4. **Démarrez le backend** :
   ```bash
   cd backend
   npm start
   ```
5. **Démarrez le frontend** (dans un autre terminal) :
   ```bash
   npm start
   ```

---

## ✅ Checklist de démarrage

- [ ] PostgreSQL est démarré
- [ ] Le fichier `backend/.env` existe et est configuré
- [ ] Le backend démarre sans erreur
- [ ] `http://localhost:5000/api/health` répond
- [ ] Le frontend peut communiquer avec le backend
- [ ] Aucune erreur `ERR_CONNECTION_REFUSED` dans la console

---

**Dernière mise à jour :** 2025-01-XX


