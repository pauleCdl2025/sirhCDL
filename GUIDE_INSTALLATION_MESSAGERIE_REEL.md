# 🚀 Guide d'Installation - Système de Messagerie Réel RH-Employé

## 📋 **Prérequis**
- PostgreSQL installé et configuré
- Node.js et npm installés
- Application React et Backend configurés

## 🗄️ **1. Configuration de la Base de Données**

### **Étape 1: Exécuter le script SQL**
```bash
# Se connecter à PostgreSQL
psql -U votre_utilisateur -d votre_base_de_donnees

# Exécuter le script
\i backend/db/messaging.sql
```

### **Étape 2: Vérifier la création**
```sql
-- Vérifier que la table existe
\dt messages

-- Vérifier les données de test
SELECT * FROM messages LIMIT 5;
```

## 🔧 **2. Configuration du Backend**

### **Étape 1: Installer les dépendances WebSocket**
```bash
cd backend
npm install ws
```

### **Étape 2: Démarrer le serveur**
```bash
npm run dev
```

### **Étape 3: Vérifier les logs**
Vous devriez voir :
```
🔌 WebSocket Server démarré sur le port 5002
✅ Table des messages créée avec succès
```

## ⚛️ **3. Configuration du Frontend**

### **Étape 1: Démarrer l'application React**
```bash
npm start
```

### **Étape 2: Vérifier les composants**
- `RHMessagingReal.jsx` - Portail RH
- `EmployeeMessagingReal.jsx` - Portail Employé

## 🧪 **4. Tests du Système**

### **Test 1: Portail RH**
1. **Se connecter en tant qu'administrateur RH**
2. **Aller dans "Messagerie"**
3. **Sélectionner un employé** dans la liste
4. **Envoyer un message** :
   ```javascript
   // Dans la console du navigateur
   console.log('Test envoi message RH');
   ```
5. **Vérifier** :
   - ✅ Message sauvegardé en base
   - ✅ Notification WebSocket envoyée
   - ✅ Message affiché dans la conversation

### **Test 2: Portail Employé**
1. **Se connecter avec un matricule d'employé**
2. **Aller dans l'onglet "Messages"**
3. **Voir les messages du RH**
4. **Répondre au RH** :
   ```javascript
   // Dans la console du navigateur
   console.log('Test réponse employé');
   ```
5. **Vérifier** :
   - ✅ Message sauvegardé en base
   - ✅ Notification WebSocket envoyée
   - ✅ Message affiché côté RH

### **Test 3: Communication Bidirectionnelle**
1. **RH envoie un message à l'employé**
2. **Employé répond au RH**
3. **Vérifier** :
   - ✅ Messages persistés en base
   - ✅ Notifications temps réel
   - ✅ Compteurs de messages non lus
   - ✅ Historique complet des conversations

## 🔍 **5. Diagnostic des Problèmes**

### **Problème: WebSocket ne se connecte pas**
```bash
# Vérifier que le port 5002 est libre
netstat -an | grep 5002

# Vérifier les logs du serveur
tail -f backend/logs/server.log
```

### **Problème: Messages ne se sauvegardent pas**
```sql
-- Vérifier la table messages
SELECT COUNT(*) FROM messages;

-- Vérifier les permissions
GRANT ALL PRIVILEGES ON TABLE messages TO votre_utilisateur;
```

### **Problème: Notifications ne fonctionnent pas**
```javascript
// Dans la console du navigateur
// Vérifier la connexion WebSocket
console.log('WebSocket status:', ws.readyState);
```

## 📊 **6. API Endpoints Disponibles**

### **Envoi de Message**
```http
POST /api/messages
Content-Type: application/json

{
  "senderId": 1,
  "senderName": "Service RH",
  "senderType": "rh",
  "receiverId": 2,
  "receiverName": "Jean Dupont",
  "receiverType": "employee",
  "content": "Bonjour Jean, votre demande a été approuvée."
}
```

### **Récupération des Messages**
```http
GET /api/messages/rh/1
GET /api/messages/employee/2
```

### **Conversation entre deux utilisateurs**
```http
GET /api/messages/conversation/rh/1/employee/2
```

### **Marquer comme lu**
```http
POST /api/messages/mark-read
Content-Type: application/json

{
  "messageIds": [1, 2, 3]
}
```

### **Statistiques**
```http
GET /api/messages/stats/rh/1
GET /api/messages/stats/employee/2
```

## 🌐 **7. WebSocket Events**

### **Enregistrement**
```javascript
{
  "type": "register",
  "userType": "rh", // ou "employee"
  "userId": 1
}
```

### **Nouveau Message**
```javascript
{
  "type": "new_message",
  "message": {
    "id": 123,
    "senderId": 1,
    "senderName": "Service RH",
    "content": "Message content",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## ✅ **8. Checklist de Validation**

- [ ] Table `messages` créée en base
- [ ] WebSocket Server démarré sur port 5002
- [ ] API endpoints fonctionnels
- [ ] Portail RH peut envoyer des messages
- [ ] Portail Employé peut répondre
- [ ] Notifications temps réel actives
- [ ] Messages persistés en base
- [ ] Compteurs de messages non lus
- [ ] Historique des conversations
- [ ] Interface responsive

## 🎯 **Résultat Attendu**

Après cette installation, vous devriez avoir :

1. ✅ **Communication bidirectionnelle** RH ↔ Employé
2. ✅ **Messages persistés** en base de données PostgreSQL
3. ✅ **Notifications temps réel** via WebSocket
4. ✅ **Interface moderne** et responsive
5. ✅ **Statistiques** et compteurs en temps réel
6. ✅ **Historique complet** des conversations

Le système de messagerie réel est maintenant **100% fonctionnel** ! 🎉

## 🆘 **Support**

En cas de problème :
1. Vérifier les logs du serveur backend
2. Vérifier la console du navigateur
3. Tester les endpoints API avec Postman
4. Vérifier la connexion à la base de données
5. Vérifier que le port 5002 est libre




