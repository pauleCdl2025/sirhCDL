# 📧 Configuration de l'envoi d'emails pour la réinitialisation de mot de passe

## Configuration actuelle

Votre fichier `.env` est configuré avec :
- **SMTP_SERVICE**: gmail
- **SMTP_USER**: paule.winnya@centre-diagnostic.com
- **SMTP_PASS**: (à configurer)

## 🔐 Créer un "App Password" pour Gmail

### Pour un compte Google Workspace (centre-diagnostic.com)

Si votre compte `paule.winnya@centre-diagnostic.com` est un compte Google Workspace :

1. **Activer la validation en deux étapes** (si pas déjà fait) :
   - Allez sur https://myaccount.google.com/security
   - Activez "Validation en deux étapes"

2. **Créer un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Autre (nom personnalisé)" et entrez "Portail RH - Réinitialisation"
   - Cliquez sur "Générer"
   - **Copiez le mot de passe de 16 caractères** (sans espaces)

3. **Mettre à jour le fichier `.env`** :
   ```
   SMTP_PASS=votre-mot-de-passe-de-16-caracteres
   ```

### Pour un compte Gmail standard

Si vous utilisez un compte Gmail standard :

1. Allez sur https://myaccount.google.com/apppasswords
2. Créez un mot de passe d'application
3. Utilisez ce mot de passe dans `.env`

### Pour un autre service email (Outlook, Yahoo, etc.)

Si `centre-diagnostic.com` utilise un autre service email :

1. **Outlook/Office 365** :
   ```
   SMTP_SERVICE=outlook
   SMTP_USER=paule.winnya@centre-diagnostic.com
   SMTP_PASS=votre-mot-de-passe
   ```

2. **Autre serveur SMTP personnalisé** :
   Modifiez `backend/routes/passwordResetRoutes.js` pour utiliser :
   ```javascript
   host: 'smtp.votre-serveur.com',
   port: 587,
   secure: false,
   auth: {
     user: process.env.SMTP_USER,
     pass: process.env.SMTP_PASS
   }
   ```

## ✅ Vérification

Après configuration, redémarrez le serveur backend et testez la réinitialisation de mot de passe.

## 🔒 Sécurité

- ⚠️ **Ne partagez jamais** votre mot de passe d'application
- ⚠️ **Ne commitez pas** le fichier `.env` dans Git
- ✅ Le fichier `.env` est déjà dans `.gitignore`

## 📝 Note

Si vous ne configurez pas SMTP, le système fonctionnera en mode test :
- Les tokens de réinitialisation seront créés
- Les emails ne seront pas envoyés
- Le token sera retourné dans la réponse API (pour les tests uniquement)


