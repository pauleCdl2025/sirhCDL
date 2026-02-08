# 🔍 Guide de Débogage - Connexion Admin

## 📋 Instructions pour déboguer le problème de connexion

### Étape 1 : Ouvrir la Console du Navigateur
1. Appuyez sur **F12** ou **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
2. Allez dans l'onglet **Console**

### Étape 2 : Tester la Connexion
1. Allez sur `http://localhost:3000/admin-login`
2. Entrez les identifiants :
   - **Email :** `admin@system.ga`
   - **Mot de passe :** `Admin@System2025!`
3. Cliquez sur "Se connecter"

### Étape 3 : Vérifier les Logs dans la Console

Vous devriez voir une série de logs dans cet ordre :

1. **🖱️ Bouton cliqué** - Quand vous cliquez sur le bouton
2. **🔵 handleSubmit appelé** - Quand le formulaire se soumet
3. **✅ Validation passée** - Si la validation réussit
4. **🔐 AdminAuthService.login appelé** - Quand l'authentification commence
5. **📧 Email normalisé** - L'email après normalisation
6. **🔑 Mot de passe reçu** - Le mot de passe entré
7. **🔑 Mot de passe attendu** - Le mot de passe attendu
8. **🔍 Comparaison** - Le résultat de la comparaison
9. **✅ Identifiants admin valides** - Si les identifiants sont corrects
10. **✅ Connexion admin réussie** - Si la connexion réussit
11. **💾 Données admin à stocker** - Les données qui seront stockées
12. **✅ Données stockées dans sessionStorage** - Confirmation du stockage
13. **🔄 Redirection vers /admin-portal...** - Tentative de redirection
14. **✅ navigate appelé avec succès** - Confirmation de la navigation

### Étape 4 : Identifier le Problème

#### Si vous ne voyez AUCUN log :
- ❌ Le formulaire ne se soumet pas
- **Solution :** Vérifiez s'il y a des erreurs JavaScript dans la console (en rouge)

#### Si vous voyez "❌ Email vide" ou "❌ Mot de passe vide" :
- ❌ Les champs ne sont pas remplis correctement
- **Solution :** Vérifiez que vous avez bien rempli les champs

#### Si vous voyez "❌ Identifiants de test invalides" :
- ❌ Les identifiants ne correspondent pas
- **Solution :** Vérifiez que vous utilisez exactement :
  - Email : `admin@system.ga` (en minuscules)
  - Mot de passe : `Admin@System2025!` (attention à la casse et aux caractères spéciaux)

#### Si vous voyez "✅ Identifiants admin valides" mais pas de redirection :
- ❌ Problème de navigation
- **Solution :** Vérifiez que la route `/admin-portal` existe dans `App.js`

### Étape 5 : Vérifier sessionStorage

Dans la console, tapez :
```javascript
sessionStorage.getItem('adminUser')
```

Vous devriez voir un objet JSON avec les données de l'administrateur.

### Étape 6 : Vérifier les Routes

Dans la console, tapez :
```javascript
window.location.pathname
```

Après la connexion, cela devrait afficher `/admin-portal`.

---

## 🔧 Solutions Rapides

### Solution 1 : Vider le Cache
1. Appuyez sur **Ctrl+Shift+R** (Windows) / **Cmd+Shift+R** (Mac) pour forcer le rechargement
2. Réessayez la connexion

### Solution 2 : Vérifier les Identifiants
Assurez-vous d'utiliser **exactement** :
- Email : `admin@system.ga`
- Mot de passe : `Admin@System2025!`

### Solution 3 : Vérifier la Console pour les Erreurs
Cherchez les messages en **rouge** dans la console et notez-les.

---

## 📞 Informations à Fournir si le Problème Persiste

Si le problème persiste, fournissez :
1. **Tous les logs** que vous voyez dans la console (copiez-collez)
2. **Toutes les erreurs** en rouge dans la console
3. **Le résultat de** `sessionStorage.getItem('adminUser')` dans la console
4. **Le résultat de** `window.location.pathname` après avoir cliqué sur "Se connecter"


