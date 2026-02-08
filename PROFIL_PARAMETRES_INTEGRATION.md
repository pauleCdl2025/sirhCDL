# Pages Profil et Paramètres - Intégration Base de Données

## 📋 Vue d'ensemble

Les pages profil et paramètres ont été intégrées avec votre base de données PostgreSQL pour utiliser des données réelles au lieu de données simulées.

## 🗄️ Modifications de la Base de Données

### Nouvelles colonnes ajoutées à la table `employees`

```sql
-- Colonnes pour le profil utilisateur
avatar_path VARCHAR(255)                    -- Chemin vers l'avatar
preferences_notifications TEXT             -- Préférences JSON
preferences_language VARCHAR(10)            -- Langue (fr/en/es)
preferences_theme VARCHAR(20)              -- Thème (light/dark/auto)
preferences_timezone VARCHAR(50)           -- Fuseau horaire
preferences_date_format VARCHAR(20)        -- Format de date

-- Colonnes pour la sécurité
security_two_factor BOOLEAN                 -- Authentification 2FA
security_session_timeout INTEGER           -- Délai session (minutes)
security_password_expiry INTEGER           -- Expiration mot de passe (jours)

-- Colonnes pour l'affichage
display_dashboard_layout VARCHAR(20)       -- Layout tableau de bord
display_items_per_page INTEGER             -- Éléments par page
display_auto_refresh BOOLEAN               -- Actualisation auto
display_refresh_interval INTEGER           -- Intervalle actualisation (sec)

-- Colonnes avancées
advanced_debug_mode BOOLEAN                -- Mode debug
advanced_analytics BOOLEAN                 -- Analytics
advanced_backup_frequency VARCHAR(20)      -- Fréquence sauvegarde
```

## 🚀 Installation et Configuration

### 1. Exécuter la Migration

```bash
cd backend
node run_user_preferences_migration.js
```

### 2. Redémarrer le Serveur

```bash
npm start
# ou
node server.js
```

## 🔧 API Endpoints

### Profil Utilisateur

#### `GET /api/user/profile?email={email}`
Récupère le profil complet de l'utilisateur

**Réponse :**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "matricule": "EMP001",
    "nom_prenom": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "telephone": "+237 123 456 789",
    "poste_actuel": "Développeur",
    "functional_area": "IT",
    "anciennete": 2,
    "stats": {
      "totalContrats": 3,
      "contratsActifs": 2,
      "contratsExpires": 1
    }
  }
}
```

#### `PUT /api/user/profile`
Met à jour le profil utilisateur

**Body :**
```json
{
  "email": "jean.dupont@example.com",
  "nom_prenom": "Jean Dupont",
  "telephone": "+237 123 456 789",
  "adresse": "Douala, Cameroun",
  "lieu": "Yaoundé",
  "niveau_etude": "Master",
  "specialisation": "Développement Web",
  "emergency_contact": "Marie Dupont",
  "emergency_phone": "+237 987 654 321"
}
```

#### `POST /api/user/profile/avatar`
Upload d'avatar utilisateur

**FormData :**
- `avatar`: fichier image
- `email`: email utilisateur

### Paramètres Utilisateur

#### `GET /api/user/settings?email={email}`
Récupère les paramètres de l'utilisateur

**Réponse :**
```json
{
  "success": true,
  "settings": {
    "language": "fr",
    "theme": "light",
    "timezone": "Africa/Douala",
    "dateFormat": "DD/MM/YYYY",
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false,
    "contractAlerts": true,
    "leaveRequests": true,
    "systemUpdates": false,
    "twoFactorAuth": false,
    "sessionTimeout": 30,
    "passwordExpiry": 90,
    "dashboardLayout": "default",
    "itemsPerPage": 25,
    "autoRefresh": true,
    "refreshInterval": 30,
    "debugMode": false,
    "analytics": true,
    "backupFrequency": "weekly"
  }
}
```

#### `PUT /api/user/settings`
Met à jour les paramètres utilisateur

#### `POST /api/user/settings/reset`
Réinitialise les paramètres aux valeurs par défaut

## 🎨 Fonctionnalités Frontend

### Page Profil (`/profile`)

- **Chargement automatique** des données depuis la base
- **Upload d'avatar** avec stockage sur le serveur
- **Édition en temps réel** des informations personnelles
- **Statistiques dynamiques** basées sur les données réelles
- **Gestion des erreurs** avec fallback vers les données locales

### Page Paramètres (`/settings`)

- **5 onglets organisés** : Général, Notifications, Sécurité, Affichage, Avancé
- **Sauvegarde automatique** dans la base de données
- **Synchronisation** avec localStorage comme backup
- **Réinitialisation** aux valeurs par défaut
- **Interface responsive** adaptée mobile/desktop

## 🔒 Sécurité

- **Validation des données** côté serveur
- **Authentification requise** pour toutes les opérations
- **Upload sécurisé** des avatars (types de fichiers limités)
- **Protection CSRF** via les tokens de session
- **Encodage UTF-8** pour les caractères spéciaux

## 📱 Responsive Design

Les pages s'adaptent automatiquement :
- **Desktop** : Layout complet avec sidebar
- **Tablet** : Adaptation des grilles
- **Mobile** : Interface optimisée pour petits écrans

## 🐛 Gestion d'Erreurs

- **Messages d'erreur** explicites pour l'utilisateur
- **Fallback gracieux** vers les données locales
- **Logs détaillés** côté serveur pour le debugging
- **Indicateurs de chargement** pendant les opérations

## 🔄 Synchronisation

- **Base de données** : Source de vérité principale
- **localStorage** : Cache local pour les paramètres
- **Session** : Données temporaires de l'utilisateur connecté

## 📊 Statistiques Disponibles

### Profil Utilisateur
- Ancienneté calculée automatiquement
- Nombre total de contrats
- Contrats actifs
- Contrats expirés

### Paramètres
- Préférences de notification
- Configuration de sécurité
- Options d'affichage
- Paramètres avancés

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de connexion base de données**
   - Vérifier les credentials dans `server.js`
   - S'assurer que PostgreSQL est démarré

2. **Migration échouée**
   - Vérifier les permissions de la base
   - Exécuter manuellement le SQL de migration

3. **Upload d'avatar échoué**
   - Vérifier que le dossier `uploads/avatars` existe
   - Vérifier les permissions d'écriture

4. **Paramètres non sauvegardés**
   - Vérifier la connexion à l'API
   - Consulter les logs du serveur

### Logs Utiles

```bash
# Logs du serveur
tail -f logs/server.log

# Logs de la base de données
tail -f /var/log/postgresql/postgresql.log
```

## 🔮 Améliorations Futures

- [ ] Authentification à deux facteurs complète
- [ ] Thèmes personnalisés avancés
- [ ] Export/Import des paramètres
- [ ] Notifications push en temps réel
- [ ] Historique des modifications
- [ ] API de synchronisation mobile

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs du serveur
2. Vérifier la connexion à la base de données
3. Tester les endpoints API individuellement
4. Contacter l'équipe de développement






