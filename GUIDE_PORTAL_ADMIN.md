# 🎯 Guide du Portail Administrateur

## 📋 Vue d'ensemble

Le **Portail Administrateur** est un portail **séparé et indépendant** du portail RH, permettant aux administrateurs de gérer les deux portails (RH et Employé) depuis une interface dédiée.

---

## 🔐 Accès au Portail Administrateur

### URL de connexion
- **URL :** `http://localhost:3000/login` (même page que RH et employés)
- **Route :** `/login`
- **Note :** La route `/admin-login` redirige automatiquement vers `/login`

### Identifiants administrateur (UNIQUES)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@system.ga` | `Admin@System2025!` | Super Admin |
| `administrateur@centrediagnostic.ga` | `Admin@CDL2025!` | Super Admin |
| `superadmin@centrediagnostic.ga` | `SuperAdmin@2025!` | Super Admin |

⚠️ **Ces identifiants sont UNIQUES et différents des identifiants RH et employé.**

---

## 🚀 Connexion au Portail Admin

### Étape 1 : Accéder à la page de connexion
1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3000/login` (même page que RH et employés)
3. Le système détecte automatiquement votre identifiant admin et vous redirige vers le portail admin

### Étape 2 : Se connecter
1. **Dans le champ "Email administrateur", entrez votre email :**
   - Exemple : `admin@system.ga`
   
2. **Dans le champ "Mot de passe", entrez votre mot de passe :**
   - Exemple : `Admin@System2025!`

3. **Cliquez sur "Se connecter"**

### Étape 3 : Accès au Dashboard Admin
Une fois connecté, vous serez automatiquement redirigé vers :
- **URL :** `http://localhost:3000/admin-portal`
- **Route :** `/admin-portal`

---

## 🎨 Interface du Portail Admin

### Layout séparé
Le portail admin utilise un **layout complètement séparé** du portail RH :
- ✅ **Sidebar admin** avec navigation dédiée
- ✅ **Topbar** avec informations de l'administrateur
- ✅ **Zone de contenu** pour le dashboard et les statistiques
- ✅ **Pas de sidebar RH** - Interface indépendante

### Navigation dans le portail admin

La sidebar admin contient :
- **Dashboard** - Vue d'ensemble des deux portails
- **Gestion Utilisateurs** - Gérer tous les utilisateurs (RH, employés, admins)
- **Gestion Employés** - Gérer tous les employés
- **Statistiques** - Graphiques et métriques détaillées
- **Alertes** - Notifications et alertes importantes
- **Paramètres** - Configuration système

---

## 📊 Fonctionnalités du Dashboard Admin

### Vue d'ensemble
- ✅ Statistiques des deux portails (RH et Employé)
- ✅ Nombre total d'utilisateurs RH
- ✅ Nombre total d'employés
- ✅ Répartitions par département et entité
- ✅ Activité récente (7 derniers jours)

### Gestion du Portail RH
- ✅ Nombre d'administrateurs
- ✅ Nombre d'utilisateurs RH
- ✅ Accès rapide pour gérer les utilisateurs RH

### Gestion du Portail Employé
- ✅ Nombre total d'employés
- ✅ Employés actifs/inactifs
- ✅ Répartition par type de contrat (CDI, CDD, Stagiaires)
- ✅ Accès rapide pour gérer les employés et contrats

### Alertes et Notifications
- ✅ Contrats expirant bientôt (30 jours)
- ✅ Visites médicales en retard
- ✅ Visites médicales à venir (30 jours)
- ✅ Demandes d'employés en attente

---

## 🔗 Accès au Portail RH depuis le Portail Admin

Les boutons d'action dans le dashboard admin ouvrent le **portail RH dans un nouvel onglet**, permettant de :
- Gérer les utilisateurs RH
- Gérer les employés
- Gérer les contrats
- Créer de nouveaux employés (Onboarding)
- Voir les visites médicales
- Traiter les demandes d'employés

---

## 🔒 Sécurité et Authentification

### Vérification d'authentification
- Le portail admin vérifie automatiquement l'authentification
- Si non authentifié, redirection vers `/admin-login`
- Les données admin sont stockées dans `sessionStorage` sous la clé `adminUser`

### Déconnexion
- Cliquez sur le bouton "Déconnexion" dans la sidebar
- Ou utilisez le bouton de déconnexion dans la topbar
- Redirection automatique vers `/admin-login`

---

## 🆚 Différences avec le Portail RH

| Fonctionnalité | Portail RH | Portail Admin |
|----------------|------------|---------------|
| **URL de connexion** | `/login` | `/admin-login` |
| **Layout** | Sidebar RH complète | Sidebar admin dédiée |
| **Accès** | Utilisateurs RH | Administrateurs uniquement |
| **Fonctionnalités** | Gestion RH standard | Gestion globale des deux portails |
| **Dashboard** | Dashboard RH | Dashboard Admin avec statistiques globales |

---

## 📝 Notes importantes

### Séparation complète
- ✅ Le portail admin est **complètement séparé** du portail RH
- ✅ Aucune dépendance avec la sidebar RH
- ✅ Interface indépendante et dédiée

### Détection automatique
- Si un administrateur se connecte via `/login`, il sera automatiquement redirigé vers `/admin-portal`
- Les identifiants admin sont détectés automatiquement

### Accès aux fonctionnalités RH
- Les boutons dans le dashboard admin ouvrent le portail RH dans un **nouvel onglet**
- Cela permet de gérer les fonctionnalités RH tout en gardant le dashboard admin ouvert

---

## 🎯 Récapitulatif rapide

1. **Connexion :** `http://localhost:3000/admin-login`
2. **Identifiants :** 
   - Email : `rh@centre-diagnostic.com`
   - Mot de passe : `Rh@2025CDL`
3. **Dashboard :** `http://localhost:3000/admin-portal`
4. **Layout :** Sidebar admin séparée (pas de sidebar RH)

---

**Dernière mise à jour :** 2025-01-XX

