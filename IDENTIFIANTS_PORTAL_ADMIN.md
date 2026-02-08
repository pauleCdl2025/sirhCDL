# 🔑 Identifiants de Connexion - Portail Administrateur

## 📋 Vue d'ensemble

Le **Portail Administrateur** permet de gérer les deux portails du système SIRH :
- **Portail RH** - Gestion des ressources humaines
- **Portail Employé** - Accès des employés

---

## 🏢 Accès au Portail Administrateur

### URL de connexion
- **URL :** `http://localhost:3000/login`
- **Route :** `/login`

### URL du Dashboard Admin
- **URL :** `http://localhost:3000/admin-dashboard`
- **Route :** `/admin-dashboard`
- **Accès via sidebar :** Administration → Dashboard Admin

---

## 👤 Identifiants Administrateur

### 1. Administrateur Principal RH ⭐
- **Email :** `rh@centre-diagnostic.com`
- **Mot de passe :** `Rh@2025CDL`
- **Rôle :** Admin RH
- **Accès :** 
  - Dashboard RH complet
  - Dashboard Admin
  - Gestion des employés
  - Gestion des utilisateurs RH

### 2. Administrateur Système
- **Email :** `admin@centrediagnostic.ga`
- **Mot de passe :** `Admin@2025CDL`
- **Rôle :** Admin
- **Accès :**
  - Tous les droits administrateur
  - Dashboard Admin
  - Configuration système

### 3. Compte de Test
- **Email :** `test@test.com`
- **Mot de passe :** `test123`
- **Rôle :** Admin (test)
- **Accès :**
  - Dashboard Admin
  - Fonctionnalités de test

---

## 🚀 Guide de connexion rapide

### Étape 1 : Accéder à la page de connexion
1. Ouvrez votre navigateur
2. Allez sur : `http://localhost:3000/login`

### Étape 2 : Se connecter
1. **Dans le champ "Identifiant", entrez votre email :**
   - Exemple : `rh@centre-diagnostic.com`
   
2. **Dans le champ "Mot de passe", entrez votre mot de passe :**
   - Exemple : `Rh@2025CDL`

3. **Cliquez sur "Se connecter"**

### Étape 3 : Accéder au Dashboard Admin
Une fois connecté, vous pouvez accéder au Dashboard Admin de deux façons :

#### Option 1 : Via la Sidebar
1. Dans la sidebar gauche, cliquez sur **"Administration"**
2. Cliquez sur **"Dashboard Admin"**

#### Option 2 : Via l'URL directe
1. Allez directement sur : `http://localhost:3000/admin-dashboard`

---

## 📊 Fonctionnalités du Dashboard Admin

Le Dashboard Admin permet de :

### Vue d'ensemble
- ✅ Voir les statistiques des deux portails (RH et Employé)
- ✅ Consulter le nombre total d'utilisateurs RH
- ✅ Consulter le nombre total d'employés
- ✅ Voir les répartitions par département et entité
- ✅ Consulter l'activité récente (7 derniers jours)

### Gestion du Portail RH
- ✅ Voir le nombre d'administrateurs
- ✅ Voir le nombre d'utilisateurs RH
- ✅ Gérer les utilisateurs RH

### Gestion du Portail Employé
- ✅ Voir le nombre total d'employés
- ✅ Voir les employés actifs/inactifs
- ✅ Voir la répartition par type de contrat (CDI, CDD, Stagiaires)
- ✅ Gérer les employés
- ✅ Gérer les contrats
- ✅ Créer de nouveaux employés (Onboarding)

### Alertes et Notifications
- ✅ Contrats expirant bientôt (30 jours)
- ✅ Visites médicales en retard
- ✅ Visites médicales à venir (30 jours)
- ✅ Demandes d'employés en attente

---

## 🔒 Sécurité

### Recommandations importantes

1. **Ne partagez pas vos identifiants**
   - Chaque administrateur doit avoir son propre compte
   - Ne communiquez jamais vos mots de passe

2. **Utilisez des mots de passe forts**
   - Minimum 8 caractères
   - Majuscules, minuscules, chiffres et caractères spéciaux
   - Exemple : `Rh@2025CDL` ✅

3. **Changez régulièrement vos mots de passe**
   - Tous les 3-6 mois
   - Immédiatement si vous suspectez une compromission

4. **Déconnexion après utilisation**
   - Toujours vous déconnecter après chaque session
   - Ne laissez jamais votre session ouverte sur un ordinateur partagé

---

## 🆘 Support technique

### En cas de problème de connexion

1. **Vérifiez que les serveurs sont démarrés :**
   - Frontend : `http://localhost:3000`
   - Backend : `http://localhost:5000` (ou 5001)

2. **Vérifiez vos identifiants :**
   - L'email est sensible à la casse
   - Le mot de passe est sensible à la casse
   - Vérifiez qu'il n'y a pas d'espaces avant/après

3. **Vérifiez la console du navigateur :**
   - Appuyez sur F12
   - Allez dans l'onglet "Console"
   - Recherchez d'éventuelles erreurs

4. **Vérifiez la connexion réseau :**
   - Assurez-vous que le backend est accessible
   - Testez : `http://localhost:5000/api/health`

5. **Contactez l'équipe technique** si le problème persiste

---

## 📝 Notes importantes

### Système unifié
- Les deux portails (RH et Employé) utilisent maintenant la même page de connexion (`/login`)
- Le système détecte automatiquement le type d'utilisateur :
  - **Email** → Utilisateur RH/Admin
  - **Matricule** → Employé

### Accès Dashboard Admin
- Le Dashboard Admin est accessible uniquement aux utilisateurs avec le rôle **Admin** ou **RH**
- Les employés n'ont pas accès au Dashboard Admin

### Identifiants par défaut
- ⚠️ **Les identifiants ci-dessus sont des identifiants par défaut**
- Il est **fortement recommandé** de les changer après la première connexion
- Pour changer le mot de passe, contactez l'administrateur système

---

## 🔄 Changement de mot de passe

### Pour les administrateurs RH

Actuellement, le changement de mot de passe pour les utilisateurs RH doit être fait :
1. **Via la base de données** (contactez l'administrateur système)
2. **Via l'API** (si configurée)

### Pour les employés

Les employés peuvent changer leur mot de passe via :
- Le portail employé → Profil → Changer le mot de passe
- Route API : `PUT /api/employees/auth/change-password`

---

## 📄 Fichiers de référence

- **Identifiants employés :** `EMPLOYEE_LOGIN_CREDENTIALS.md`
- **Manuel utilisateur :** `MANUEL_UTILISATEUR_COMPLET.md`

---

## 🎯 Récapitulatif rapide

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `rh@centre-diagnostic.com` | `Rh@2025CDL` | Admin RH |
| `admin@centrediagnostic.ga` | `Admin@2025CDL` | Admin |
| `test@test.com` | `test123` | Admin (test) |

**URL Dashboard Admin :** `http://localhost:3000/admin-dashboard`

---

**Dernière mise à jour :** 2025-01-XX


