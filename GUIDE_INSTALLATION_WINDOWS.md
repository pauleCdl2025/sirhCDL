# 🚀 Guide d'Installation Windows - Système de Messagerie Réel

## 📋 **Prérequis Windows**
- PostgreSQL installé et configuré
- Node.js et npm installés
- PowerShell ou Command Prompt

## 🗄️ **1. Configuration de la Base de Données (Windows)**

### **Étape 1: Se connecter à PostgreSQL**
```powershell
# Ouvrir PowerShell en tant qu'administrateur
# Se connecter à PostgreSQL
psql -U postgres -d votre_base_de_donnees
```

### **Étape 2: Exécuter le script SQL**
```sql
-- Dans psql, exécuter :
\i backend/db/messaging.sql

-- Ou copier-coller le contenu du fichier directement
```

### **Étape 3: Vérifier la création**
```sql
-- Vérifier que la table existe
\dt messages

-- Vérifier les données de test
SELECT * FROM messages LIMIT 5;

-- Quitter psql
\q
```

## 🔧 **2. Configuration du Backend (Windows)**

### **Étape 1: Installer les dépendances**
```powershell
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install ws

# Vérifier l'installation
npm list ws
```

### **Étape 2: Démarrer le serveur**
```powershell
# Démarrer le serveur de développement
npm run dev
```

### **Étape 3: Vérifier les logs**
Vous devriez voir dans la console :
```
🔌 WebSocket Server démarré sur le port 5002
✅ Table des messages créée avec succès
Server running on port 5001
```

## ⚛️ **3. Configuration du Frontend (Windows)**

### **Étape 1: Ouvrir un nouveau terminal**
```powershell
# Ouvrir un nouveau PowerShell
# Aller dans le dossier racine du projet
cd C:\Users\hp\sirh
```

### **Étape 2: Démarrer l'application React**
```powershell
# Démarrer l'application React
npm start
```

### **Étape 3: Vérifier l'ouverture**
- L'application devrait s'ouvrir dans le navigateur sur `http://localhost:3000`
- Vérifier qu'il n'y a pas d'erreurs dans la console

## 🧪 **4. Tests du Système (Windows)**

### **Test 1: Portail RH**
1. **Ouvrir le navigateur** sur `http://localhost:3000`
2. **Se connecter en tant qu'administrateur RH**
3. **Aller dans "Messagerie"** (menu latéral)
4. **Sélectionner un employé** dans la liste de gauche
5. **Envoyer un message** :
   - Taper un message dans la zone de texte
   - Cliquer sur le bouton d'envoi (icône avion)
   - OU appuyer sur Entrée
6. **Vérifier dans la console du navigateur** (F12) :
   ```
   ✅ Message envoyé avec succès: [ID]
   ```

### **Test 2: Portail Employé**
1. **Ouvrir un nouvel onglet** sur `http://localhost:3000/EmployeeLogin`
2. **Se connecter avec un matricule d'employé** (ex: CDL-2024-0001)
3. **Aller dans l'onglet "Messages"**
4. **Voir les messages du RH** (s'il y en a)
5. **Répondre au RH** :
   - Taper une réponse
   - Cliquer sur Envoyer
6. **Vérifier dans la console** :
   ```
   ✅ Message envoyé avec succès: [ID]
   ```

### **Test 3: Communication Bidirectionnelle**
1. **RH envoie un message à l'employé**
2. **Employé répond au RH**
3. **Vérifier** :
   - Messages persistés en base de données
   - Notifications temps réel
   - Compteurs de messages non lus
   - Historique des conversations

## 🔍 **5. Diagnostic des Problèmes (Windows)**

### **Problème: WebSocket ne se connecte pas**
```powershell
# Vérifier que le port 5002 est libre
netstat -an | findstr 5002

# Vérifier les processus Node.js
tasklist | findstr node
```

### **Problème: Messages ne se sauvegardent pas**
```sql
-- Se connecter à PostgreSQL
psql -U postgres -d votre_base

-- Vérifier la table messages
SELECT COUNT(*) FROM messages;

-- Vérifier les permissions
GRANT ALL PRIVILEGES ON TABLE messages TO votre_utilisateur;
```

### **Problème: Notifications ne fonctionnent pas**
```javascript
// Dans la console du navigateur (F12)
// Vérifier la connexion WebSocket
console.log('WebSocket status:', ws.readyState);
```

## 📊 **6. Commandes Windows Utiles**

### **Gestion des processus**
```powershell
# Voir les processus Node.js
tasklist | findstr node

# Arrêter un processus Node.js
taskkill /PID [PID_NUMBER] /F

# Voir les ports utilisés
netstat -an | findstr :5001
netstat -an | findstr :5002
```

### **Gestion des fichiers**
```powershell
# Lister les fichiers
dir backend\db\

# Voir le contenu d'un fichier
type backend\db\messaging.sql

# Copier un fichier
copy backend\db\messaging.sql C:\temp\
```

### **Gestion de PostgreSQL**
```powershell
# Se connecter à PostgreSQL
psql -U postgres

# Lister les bases de données
\l

# Se connecter à une base
\c nom_de_la_base

# Lister les tables
\dt

# Quitter psql
\q
```

## ✅ **7. Checklist de Validation Windows**

- [ ] PostgreSQL installé et accessible
- [ ] Table `messages` créée en base
- [ ] WebSocket Server démarré sur port 5002
- [ ] Backend Node.js démarré sur port 5001
- [ ] Frontend React démarré sur port 3000
- [ ] API endpoints fonctionnels
- [ ] Portail RH peut envoyer des messages
- [ ] Portail Employé peut répondre
- [ ] Notifications temps réel actives
- [ ] Messages persistés en base
- [ ] Compteurs de messages non lus
- [ ] Historique des conversations
- [ ] Interface responsive

## 🎯 **Résultat Attendu**

Après cette installation sur Windows, vous devriez avoir :

1. ✅ **Communication bidirectionnelle** RH ↔ Employé
2. ✅ **Messages persistés** en base de données PostgreSQL
3. ✅ **Notifications temps réel** via WebSocket
4. ✅ **Interface moderne** et responsive
5. ✅ **Statistiques** et compteurs en temps réel
6. ✅ **Historique complet** des conversations

## 🆘 **Support Windows**

En cas de problème sur Windows :
1. Vérifier que PostgreSQL est démarré
2. Vérifier que les ports 3000, 5001, 5002 sont libres
3. Vérifier les logs du serveur backend
4. Vérifier la console du navigateur (F12)
5. Redémarrer les services si nécessaire

Le système de messagerie réel fonctionne maintenant sur Windows ! 🎉




