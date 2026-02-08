# 📧 Guide de Configuration Email - Réinitialisation de Mot de Passe

## ⚠️ Situation actuelle

Les "Mots de passe d'application" Google ne sont pas disponibles pour votre compte. Voici les alternatives.

## 🔧 Options de configuration

### Option 1 : SMTP de votre domaine (Recommandé)

Si `centre-diagnostic.com` a son propre serveur email :

**Dans `.env` :**
```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.centre-diagnostic.com
SMTP_PORT=587
SMTP_USER=paule.winnya@centre-diagnostic.com
SMTP_PASS=votre-mot-de-passe-email
```

**Informations à obtenir :**
- Adresse du serveur SMTP (ex: `smtp.centre-diagnostic.com` ou `mail.centre-diagnostic.com`)
- Port SMTP (généralement 587 pour TLS ou 465 pour SSL)
- Votre mot de passe email

### Option 2 : Service email transactionnel

#### A. SendGrid (Gratuit jusqu'à 100 emails/jour)

1. Créer un compte sur https://sendgrid.com
2. Créer une API Key
3. Configurer dans `.env` :
```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

#### B. Mailgun (Gratuit jusqu'à 5000 emails/mois)

1. Créer un compte sur https://www.mailgun.com
2. Vérifier votre domaine
3. Configurer dans `.env` :
```env
SMTP_SERVICE=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@centre-diagnostic.com
SMTP_PASS=votre-api-key-mailgun
```

### Option 3 : Outlook/Office 365

Si vous utilisez Office 365 :

```env
SMTP_SERVICE=outlook
SMTP_USER=paule.winnya@centre-diagnostic.com
SMTP_PASS=votre-mot-de-passe-office365
```

### Option 4 : Mode test (Développement)

Pour les tests sans configuration email :

**Ne configurez pas** `SMTP_USER` et `SMTP_PASS` dans `.env`

Le système fonctionnera en mode test :
- ✅ Les tokens de réinitialisation seront créés
- ✅ Les tokens seront valides
- ⚠️ Les emails ne seront pas envoyés
- ℹ️ Le token sera retourné dans la réponse API (pour les tests)

## 📝 Configuration recommandée pour votre cas

Vu que vous utilisez `centre-diagnostic.com`, je recommande :

1. **Vérifier avec votre administrateur IT** :
   - Quel est le serveur SMTP de votre domaine ?
   - Quels sont les paramètres de connexion ?
   - Le port et le protocole (TLS/SSL) ?

2. **Si vous avez accès au serveur email** :
   - Utiliser l'Option 1 (SMTP personnalisé)

3. **Si pas de serveur email disponible** :
   - Utiliser SendGrid (Option 2A) - simple et gratuit

## ✅ Après configuration

1. Redémarrer le serveur backend
2. Tester la réinitialisation de mot de passe
3. Vérifier que l'email est bien reçu

## 🔍 Vérification

Pour vérifier si la configuration fonctionne, regardez les logs du serveur :
- ✅ `📧 Configuration SMTP personnalisée: ...` = Configuration active
- ⚠️ `⚠️ Configuration SMTP non trouvée...` = Mode test


