# 🔐 Identifiants Administrateur Uniques

## ⚠️ IMPORTANT
Ces identifiants sont **uniques et séparés** des identifiants RH et employés. Ils sont réservés exclusivement aux administrateurs système.

---

## 📋 Identifiants Administrateur

### 🔑 Identifiant Principal (Recommandé)
- **Email :** `admin@system.ga`
- **Mot de passe :** `Admin@System2025!`
- **Rôle :** Super Administrateur
- **Accès :** Tous les portails et toutes les fonctionnalités

### 🔑 Identifiant Secondaire
- **Email :** `administrateur@centrediagnostic.ga`
- **Mot de passe :** `Admin@CDL2025!`
- **Rôle :** Super Administrateur
- **Accès :** Tous les portails et toutes les fonctionnalités

### 🔑 Identifiant Super Admin
- **Email :** `superadmin@centrediagnostic.ga`
- **Mot de passe :** `SuperAdmin@2025!`
- **Rôle :** Super Administrateur
- **Accès :** Tous les portails et toutes les fonctionnalités

---

## 🚀 Accès au Portail Administrateur

1. **URL de connexion :** `http://localhost:3000/login` (même page que RH et employés)
2. **Utilisez UNIQUEMENT les identifiants ci-dessus**
3. **Le système détecte automatiquement que vous êtes admin et vous redirige vers le portail admin**
4. **Ne pas utiliser les identifiants RH ou employé**

### ⚠️ Note Importante
- La route `/admin-login` redirige automatiquement vers `/login`
- Tous les utilisateurs (RH, employés, admins) utilisent la même page de connexion
- Le système détecte automatiquement le type d'utilisateur et redirige vers le bon portail

---

## 🔒 Sécurité

- ✅ Ces identifiants sont **différents** des identifiants RH
- ✅ Ces identifiants sont **différents** des identifiants employé
- ✅ Service d'authentification **séparé** (`adminAuthService`)
- ✅ Session admin **indépendante** de la session RH

---

## 📝 Permissions Administrateur

L'administrateur a accès à :
- ✅ Gestion de tous les utilisateurs (RH, employés, admins)
- ✅ Gestion de tous les employés
- ✅ Visualisation de toutes les statistiques
- ✅ Configuration système
- ✅ Logs d'audit
- ✅ Sauvegarde et restauration
- ✅ Gestion des alertes

---

## ⚠️ Notes Importantes

1. **Ne partagez PAS ces identifiants** avec des utilisateurs RH ou employés
2. **Changez les mots de passe** en production
3. **Utilisez des mots de passe forts** en production
4. **Activez l'authentification à deux facteurs** si possible

---

**Dernière mise à jour :** 2025-01-XX

