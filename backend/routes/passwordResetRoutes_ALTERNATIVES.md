# 🔧 Alternatives pour la configuration email

## Problème
Les "Mots de passe d'application" ne sont pas disponibles pour votre compte Google.

## Solutions alternatives

### Option 1 : Utiliser OAuth2 avec Gmail (Recommandé pour Google Workspace)

Si vous avez un compte Google Workspace, vous pouvez utiliser OAuth2 :

```javascript
// Configuration OAuth2 pour Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.SMTP_USER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});
```

**Étapes :**
1. Créer un projet dans Google Cloud Console
2. Activer Gmail API
3. Créer des identifiants OAuth2
4. Obtenir un refresh token

### Option 2 : Utiliser un service email transactionnel (Recommandé pour production)

#### A. SendGrid (Gratuit jusqu'à 100 emails/jour)
```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

#### B. Mailgun (Gratuit jusqu'à 5000 emails/mois)
```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-api-key-mailgun
```

#### C. Amazon SES (Payant mais très économique)
```env
SMTP_SERVICE=smtp
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=votre-access-key
SMTP_PASS=votre-secret-key
```

### Option 3 : Utiliser le serveur SMTP de votre domaine

Si `centre-diagnostic.com` a son propre serveur email :

```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.centre-diagnostic.com
SMTP_PORT=587
SMTP_USER=paule.winnya@centre-diagnostic.com
SMTP_PASS=votre-mot-de-passe-email
```

### Option 4 : Mode test (Développement uniquement)

Pour les tests, le système fonctionne sans configuration SMTP :
- Les tokens sont créés
- Les emails ne sont pas envoyés
- Le token est retourné dans la réponse API

## Configuration recommandée pour votre cas

Vu que vous utilisez `centre-diagnostic.com`, je recommande :

1. **Si vous avez un serveur email** : Utiliser le SMTP de votre domaine
2. **Si vous utilisez Google Workspace** : Contacter l'administrateur pour activer les mots de passe d'application
3. **Pour la production** : Utiliser SendGrid ou Mailgun


