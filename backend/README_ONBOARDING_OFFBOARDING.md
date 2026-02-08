# 📋 Documentation Onboarding & Offboarding

## 🎯 Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités d'onboarding et d'offboarding ajoutées à votre système SIRH. Ces fonctionnalités permettent de gérer l'intégration et le départ des employés de manière structurée et documentée.

## 🚀 Installation et Configuration

### 1. Créer les Tables de Base de Données

Exécutez le script SQL suivant dans votre base de données PostgreSQL :

```bash
psql -U postgres -d rh_portal -f backend/sql/create_onboarding_tables.sql
```

### 2. Vérifier l'Intégration des Routes

Les routes sont automatiquement intégrées dans `backend/server.js`. Vérifiez que ces lignes sont présentes :

```javascript
// Routes pour l'onboarding et l'offboarding
const onboardingRoutes = require('./routes/onboardingRoutes');
const offboardingRoutes = require('./routes/offboardingRoutes');
app.use('/api/employees', onboardingRoutes(pool));
app.use('/api/employees', offboardingRoutes(pool));
```

### 3. Créer les Dossiers d'Upload

Les dossiers suivants seront créés automatiquement lors de la première utilisation :

- `backend/uploads/onboarding/` - Documents d'intégration
- `backend/uploads/offboarding/` - Documents de départ

## 📊 API Endpoints

### 🔵 Onboarding

#### POST `/api/employees/onboarding`
**Créer un nouvel employé avec processus d'intégration**

**Body (FormData):**
- `employeeData` (JSON string) : Données de l'employé
- `documents` (files) : Documents d'intégration

**Exemple de `employeeData`:**
```json
{
  "matricule": "EMP2410001",
  "nom_prenom": "John Doe",
  "email": "john.doe@entreprise.com",
  "telephone": "+1234567890",
  "genre": "Homme",
  "lieu_naissance": "Paris",
  "situation_maritale": "Célibataire",
  "nbr_enfants": 0,
  "cnss_number": "CNSS123456",
  "cnamgs_number": "CNAMGS789012",
  "poste_actuel": "Développeur Senior",
  "type_contrat": "CDI",
  "date_entree": "2024-01-15",
  "date_fin_contrat": null,
  "categorie": "Cadre",
  "responsable": "Manager IT",
  "niveau_etude": "Master",
  "specialisation": "Informatique",
  "entity": "CDL",
  "departement": "IT",
  "domaine_fonctionnel": "Développement",
  "checklist": {
    "accueil": true,
    "formation": true,
    "equipement": false,
    "badge": true,
    "bureau": true
  },
  "notes": "Intégration réussie"
}
```

**Réponse de succès:**
```json
{
  "success": true,
  "message": "Onboarding terminé avec succès",
  "employee": { ... },
  "onboarding": { ... }
}
```

#### GET `/api/employees/onboarding`
**Récupérer tous les onboarding récents**

**Réponse:**
```json
{
  "success": true,
  "onboarding": [
    {
      "id": 1,
      "employee_id": 1,
      "date_integration": "2024-01-15",
      "checklist": { ... },
      "documents": ["doc1.pdf", "doc2.jpg"],
      "notes": "Intégration réussie",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### GET `/api/employees/onboarding/:employeeId`
**Récupérer l'historique d'onboarding d'un employé spécifique**

#### GET `/api/employees/onboarding/document/:filename`
**Télécharger un document d'onboarding**

#### DELETE `/api/employees/onboarding/document/:filename`
**Supprimer un document d'onboarding**

### 🔴 Offboarding

#### POST `/api/employees/offboarding`
**Finaliser le départ d'un employé**

**⚠️ IMPORTANT :** Cette action supprime définitivement l'employé de l'effectif (table `employees`).

**Body (FormData):**
- `offboardingData` (JSON string) : Données de départ
- `documents` (files) : Documents de départ

**Exemple de `offboardingData`:**
```json
{
  "employee_id": 1,
  "date_depart": "2024-12-31",
  "motif_depart": "Démission personnelle",
  "type_depart": "Démission",
  "checklist": {
    "formation_transfert": true,
    "inventaire_bureau": true,
    "cles_retournees": true,
    "badge_retire": false,
    "compte_desactive": true
  },
  "notes": "Employé très compétent, départ regretté"
}
```

**Réponse de succès:**
```json
{
  "success": true,
  "message": "Offboarding terminé avec succès",
  "offboarding": { ... },
  "employee": {
    "id": 1,
    "matricule": "EMP2410001",
    "nom_prenom": "John Doe",
    "date_depart": "2024-12-31"
  }
}
```

**⚠️ Conséquences de l'action :**
- L'employé est supprimé de la table `employees`
- L'historique est conservé dans `offboarding_history`, `depart_history`, et `recrutement_history`
- Les contrats sont marqués comme "Terminé"
- **Cette action est irréversible**

#### GET `/api/employees/offboarding`
**Récupérer tous les offboarding récents**

#### GET `/api/employees/offboarding/:employeeId`
**Récupérer l'historique d'offboarding d'un employé**

#### GET `/api/employees/active`
**Récupérer la liste des employés actifs pour la sélection**

#### GET `/api/employees/offboarding/document/:filename`
**Télécharger un document d'offboarding**

#### DELETE `/api/employees/offboarding/document/:filename`
**Supprimer un document d'offboarding**

#### POST `/api/employees/offboarding/:employeeId/cancel`
**Annuler un offboarding (désactivé)**

**⚠️ Cette fonctionnalité est désactivée car l'employé est supprimé de l'effectif lors de l'offboarding.**

## 🗄️ Structure de la Base de Données

### Tables Principales

#### `onboarding_history`
- `id` : Identifiant unique
- `employee_id` : Référence vers l'employé
- `date_integration` : Date d'intégration
- `checklist` : Checklist d'intégration (JSONB)
- `documents` : Liste des documents (array)
- `notes` : Notes additionnelles
- `statut` : Statut du processus
- `created_at` / `updated_at` : Timestamps

#### `offboarding_history`
- `id` : Identifiant unique
- `employee_id` : Référence vers l'employé
- `date_depart` : Date de départ
- `motif_depart` : Raison du départ
- `checklist` : Checklist de départ (JSONB)
- `documents` : Liste des documents (array)
- `notes` : Notes additionnelles
- `statut` : Statut du processus
- `created_at` / `updated_at` : Timestamps

#### `contrats`
- `id` : Identifiant unique
- `employee_id` : Référence vers l'employé
- `type_contrat` : Type de contrat
- `date_debut` : Date de début
- `date_fin` : Date de fin (optionnel)
- `statut` : Statut du contrat
- `created_at` / `updated_at` : Timestamps

#### `recrutement_history`
- `id` : Identifiant unique
- `employee_id` : Référence vers l'employé
- `date_recrutement` : Date de recrutement
- `date_fin` : Date de fin (si applicable)
- `poste_recrute` : Poste pour lequel l'employé a été recruté
- `type_contrat` : Type de contrat proposé
- `salaire_propose` : Salaire proposé lors du recrutement
- `source_recrutement` : Source du recrutement
- `notes` : Notes additionnelles
- `statut` : Statut du recrutement (En cours, Recruté, Parti, Annulé)
- `created_at` / `updated_at` : Timestamps

### Colonnes Ajoutées à `employees`

- `statut` : Statut de l'employé (Actif, Partant, Inactif)
- `date_depart` : Date de départ
- `departement` : Département de l'employé
- `domaine_fonctionnel` : Domaine fonctionnel
- `categorie` : Catégorie professionnelle
- `responsable` : Responsable hiérarchique
- `niveau_etude` : Niveau d'études
- `specialisation` : Spécialisation
- `date_fin_contrat` : Date de fin de contrat
- `notes` : Notes additionnelles

## 🔧 Fonctionnalités Techniques

### Gestion des Fichiers
- **Types supportés** : PDF, JPG, PNG, DOC, DOCX
- **Taille maximale** : 10MB par fichier
- **Nombre maximal** : 10 fichiers par processus
- **Stockage** : Dossiers séparés pour onboarding/offboarding
- **Nommage** : Noms uniques avec timestamps

### Validation des Données
- **Vérification des matricules** : Unicité garantie
- **Contrôles de statut** : Employés actifs uniquement pour l'offboarding
- **Transactions** : Rollback automatique en cas d'erreur
- **Gestion des erreurs** : Messages d'erreur détaillés

### Sécurité
- **Authentification** : Token Bearer requis
- **Validation des types de fichiers** : Protection contre les uploads malveillants
- **Nettoyage automatique** : Suppression des fichiers en cas d'erreur

## 📱 Intégration Frontend

### Composants React
- **Onboarding.jsx** : Processus d'intégration en 5 étapes
- **Offboarding.jsx** : Processus de départ en 5 étapes
- **CSS associés** : Styles modernes et responsifs

### Fonctionnalités Frontend
- **Formulaires multi-étapes** : Navigation intuitive
- **Upload de documents** : Drag & drop avec prévisualisation
- **Checklists interactives** : Validation par étape
- **Recherche d'employés** : Sélection facile pour l'offboarding
- **Récapitulatifs** : Validation avant soumission

## 🧪 Tests et Validation

### Test des Endpoints
Utilisez Postman ou un outil similaire pour tester :

1. **Créer un onboarding** : POST `/api/employees/onboarding`
2. **Lister les onboarding** : GET `/api/employees/onboarding`
3. **Créer un offboarding** : POST `/api/employees/offboarding`
4. **Lister les offboarding** : GET `/api/employees/offboarding`

### Vérification de la Base
```sql
-- Vérifier les tables créées
\dt onboarding_history
\dt offboarding_history
\dt contrats

-- Vérifier les colonnes ajoutées
\d employees

-- Vérifier les vues créées
\dv v_employees_onboarding
\dv v_employees_offboarding
```

## 🚨 Dépannage

### Erreurs Courantes

#### "Table does not exist"
- Exécutez le script SQL de création des tables
- Vérifiez les permissions de la base de données

#### "Permission denied"
- Vérifiez les droits d'écriture sur les dossiers d'upload
- Vérifiez les permissions de la base de données

#### "Foreign key constraint failed"
- Vérifiez que l'employé existe dans la table `employees`
- Vérifiez l'intégrité des données

#### "File too large"
- Vérifiez la taille des fichiers uploadés (max 10MB)
- Ajustez la limite dans la configuration Multer si nécessaire

### Logs et Debugging
- **Console du serveur** : Messages d'erreur détaillés
- **Logs de base de données** : Requêtes SQL exécutées
- **Fichiers temporaires** : Vérifiez les dossiers d'upload

## 🔄 Maintenance

### Sauvegarde
- **Base de données** : Sauvegardez régulièrement les nouvelles tables
- **Documents** : Sauvegardez le dossier `uploads/`

### Nettoyage
- **Documents anciens** : Supprimez les fichiers obsolètes
- **Logs** : Archivez les logs anciens
- **Tables** : Optimisez les performances avec VACUUM

### Mises à Jour
- **Routes** : Vérifiez la compatibilité lors des mises à jour
- **Base de données** : Testez les migrations sur un environnement de dev
- **Frontend** : Vérifiez la compatibilité des composants

## 📞 Support

Pour toute question ou problème :
1. Vérifiez cette documentation
2. Consultez les logs du serveur
3. Testez avec Postman
4. Contactez l'équipe de développement

---

**Version** : 1.0  
**Date** : Décembre 2024  
**Auteur** : Assistant IA  
**Statut** : Production Ready ✅
