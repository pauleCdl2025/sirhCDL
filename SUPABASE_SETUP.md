# Configuration Supabase - Guide Rapide

## ✅ Informations de Connexion

- **URL Supabase**: `https://dwpkqdiunxbgumepkveb.supabase.co`
- **Anon Key**: `sb_publishable_VKZReniDd61V10U-E8-v4A_aNbAk2kh`

## 🔐 Étape 1 : Récupérer le Mot de Passe de la Base de Données

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Database**
4. Dans la section **Connection string**, notez le mot de passe
5. Ou réinitialisez-le si nécessaire

## 📝 Étape 2 : Configurer les Variables d'Environnement

### Pour Netlify (Production)

Dans le dashboard Netlify, ajoutez ces variables d'environnement :

```
SUPABASE_URL=https://dwpkqdiunxbgumepkveb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_VKZReniDd61V10U-E8-v4A_aNbAk2kh
DB_HOST=db.dwpkqdiunxbgumepkveb.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_supabase
NODE_ENV=production
```

### Pour le Développement Local

Créez un fichier `.env` à la racine du projet :

```env
SUPABASE_URL=https://dwpkqdiunxbgumepkveb.supabase.co
SUPABASE_ANON_KEY=sb_publishable_VKZReniDd61V10U-E8-v4A_aNbAk2kh
DB_HOST=db.dwpkqdiunxbgumepkveb.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_supabase
```

## 🗄️ Étape 3 : Créer les Tables dans Supabase

1. Allez dans **SQL Editor** dans Supabase Dashboard
2. Exécutez votre script SQL (`rh_portail.sql`) ou créez les tables manuellement
3. Vérifiez que toutes les tables sont créées

## 📦 Étape 4 : Migrer les Données

Une fois les tables créées, exécutez le script de migration :

```bash
# Définir le mot de passe Supabase
export DB_PASSWORD=votre_mot_de_passe_supabase
export DB_HOST=db.dwpkqdiunxbgumepkveb.supabase.co

# Exécuter la migration
node backend/scripts/migrate-to-supabase.js
```

## ✅ Étape 5 : Tester la Connexion

Testez la connexion avec :

```bash
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'db.dwpkqdiunxbgumepkveb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'votre_mot_de_passe',
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(r => {
  console.log('✅ Connexion réussie!', r.rows[0]);
  process.exit(0);
}).catch(e => {
  console.error('❌ Erreur:', e.message);
  process.exit(1);
});
"
```

## 🚀 Prochaines Étapes

1. ✅ Configuration Supabase terminée
2. ⏭️ Créer les tables dans Supabase
3. ⏭️ Migrer les données
4. ⏭️ Déployer sur Netlify
5. ⏭️ Configurer les variables d'environnement dans Netlify
