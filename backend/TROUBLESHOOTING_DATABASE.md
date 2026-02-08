# 🔧 Guide de Dépannage - Connexion Base de Données

## 🚨 Problème : Données simulées au lieu des vrais employés

Si votre composant Offboarding affiche des données simulées au lieu des vrais employés de votre base de données, suivez ce guide de dépannage.

## 🔍 Diagnostic Étape par Étape

### 1. Vérifier la Connexion à la Base de Données

Exécutez le script de test de connexion :

```bash
cd backend
node test_database_connection.js
```

**Résultats attendus :**
- ✅ Connexion réussie à PostgreSQL
- ✅ Table employees trouvée
- 📊 Nombre total d'employés > 0

### 2. Vérifier la Configuration de la Base de Données

#### A. Fichier de Configuration
Vérifiez que votre fichier `backend/db.js` contient la bonne configuration :

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // Votre utilisateur PostgreSQL
  host: 'localhost',          // Votre hôte PostgreSQL
  database: 'rh_portal',      // Nom de votre base de données
  password: 'votre_mot_de_passe', // Votre mot de passe
  port: 5432,                 // Port PostgreSQL (par défaut: 5432)
});
```

#### B. Variables d'Environnement
Créez un fichier `.env` dans le dossier `backend/` :

```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=rh_portal
DB_PASSWORD=votre_mot_de_passe
DB_PORT=5432
```

Puis modifiez `backend/db.js` pour utiliser ces variables :

```javascript
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

### 3. Vérifier l'Existence des Données

#### A. Connexion Directe à PostgreSQL
```bash
psql -U postgres -d rh_portal
```

#### B. Vérifier les Tables
```sql
-- Lister toutes les tables
\dt

-- Vérifier la table employees
\d employees

-- Compter les employés
SELECT COUNT(*) FROM employees;

-- Voir quelques employés
SELECT id, matricule, nom_prenom, poste_actuel FROM employees LIMIT 5;
```

### 4. Vérifier les Routes Backend

#### A. Test de la Route `/api/employees/active`
Utilisez Postman ou curl pour tester :

```bash
curl -X GET "http://localhost:5001/api/employees/active" \
  -H "Authorization: Bearer votre_token_ici"
```

**Réponse attendue :**
```json
{
  "success": true,
  "employees": [
    {
      "id": 1,
      "matricule": "EMP001",
      "nom_prenom": "John Doe",
      "poste_actuel": "Développeur",
      "entity": "CDL",
      "departement": "IT",
      "type_contrat": "CDI",
      "date_entree": "2024-01-15"
    }
  ]
}
```

#### B. Vérifier les Logs du Serveur
Dans votre terminal où le serveur backend tourne, vous devriez voir :

```
🔍 Récupération des employés actifs depuis la base de données...
✅ X employés récupérés depuis la base de données
```

### 5. Problèmes Courants et Solutions

#### A. Erreur "ECONNREFUSED"
**Symptôme :** Impossible de se connecter à PostgreSQL

**Solutions :**
1. Vérifier que PostgreSQL est démarré :
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Vérifier le port PostgreSQL :
   ```bash
   netstat -an | grep 5432
   ```

#### B. Erreur "28P01" (Authentication Failed)
**Symptôme :** Identifiants incorrects

**Solutions :**
1. Vérifier le mot de passe PostgreSQL
2. Vérifier que l'utilisateur a les droits sur la base de données

#### C. Erreur "3D000" (Database Does Not Exist)
**Symptôme :** Base de données introuvable

**Solutions :**
1. Créer la base de données :
   ```sql
   CREATE DATABASE rh_portal;
   ```

2. Vérifier le nom exact de la base de données

#### D. Table "employees" Introuvable
**Symptôme :** La table n'existe pas

**Solutions :**
1. Exécuter le script de création des tables :
   ```bash
   psql -U postgres -d rh_portal -f backend/sql/create_onboarding_tables.sql
   ```

2. Vérifier que le script s'est bien exécuté

### 6. Test Complet de l'Intégration

#### A. Démarrer le Serveur Backend
```bash
cd backend
npm start
```

#### B. Démarrer le Frontend
```bash
npm start
```

#### C. Tester l'Onboarding
1. Créer un nouvel employé via l'onboarding
2. Vérifier qu'il apparaît dans la base de données
3. Tester l'offboarding avec cet employé

### 7. Vérification des Logs

#### A. Logs Backend
Vérifiez la console du serveur backend pour :
- Messages de connexion à la base de données
- Erreurs SQL
- Requêtes exécutées

#### B. Logs Frontend
Vérifiez la console du navigateur pour :
- Erreurs de requêtes API
- Réponses des endpoints
- Messages de chargement

### 8. Commandes de Diagnostic

#### A. Vérifier l'État de PostgreSQL
```bash
# Windows
sc query postgresql-x64-15

# Linux/Mac
sudo systemctl status postgresql
```

#### B. Vérifier les Connexions Actives
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'rh_portal';
```

#### C. Vérifier les Permissions
```sql
\du postgres
```

## 🎯 Solutions Rapides

### Solution 1 : Redémarrer les Services
```bash
# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Redémarrer le serveur backend
# Ctrl+C puis npm start
```

### Solution 2 : Vérifier la Configuration
```bash
# Tester la connexion
cd backend
node test_database_connection.js
```

### Solution 3 : Recréer les Tables
```bash
psql -U postgres -d rh_portal -f backend/sql/create_onboarding_tables.sql
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Collectez les logs** : Console backend + frontend + base de données
2. **Exécutez le script de test** : `node test_database_connection.js`
3. **Vérifiez la configuration** : Fichiers `.env` et `db.js`
4. **Testez la connexion directe** : `psql -U postgres -d rh_portal`

---

**Version** : 1.0  
**Date** : Décembre 2024  
**Statut** : Production Ready ✅








