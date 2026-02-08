# Guide de déploiement : Supabase + Netlify

Ce guide vous accompagne pour utiliser **Supabase** comme base de données et déployer l'application sur **Netlify**.

## Architecture de déploiement

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Netlify        │     │  Backend (Render  │     │  Supabase       │
│  (Frontend      │────▶│  ou Railway)      │────▶│  (PostgreSQL)   │
│  React)         │     │  API Express     │     │  Base de données│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

> **Important** : Netlify héberge uniquement les sites statiques. Votre backend Express doit être déployé séparément (Render, Railway, Fly.io, etc.).

---

## Partie 1 : Configurer Supabase

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur **New Project**
3. Choisissez un nom, un mot de passe pour la base de données, et une région

### 1.2 Récupérer les informations de connexion

Dans **Settings** > **API** de votre projet Supabase :
- **Project URL** : `https://xxxxx.supabase.co`
- **anon key** : pour les appels côté client (optionnel)
- **Database password** : défini à la création

Dans **Settings** > **Database** :
- **Host** : `db.xxxxx.supabase.co`
- **Port** : 5432
- **Database** : postgres
- **User** : postgres

### 1.3 Créer les tables dans Supabase

1. Allez dans **SQL Editor** dans le dashboard Supabase
2. Exécutez le script `rh_portail.sql` (ou les scripts dans `backend/db/`)
3. Vérifiez que toutes les tables sont créées dans **Table Editor**

### 1.4 Migrer les données (optionnel)

Si vous avez des données à migrer depuis votre base locale :

```bash
cd backend
set DB_HOST=db.votre-projet.supabase.co
set DB_USER=postgres
set DB_NAME=postgres
set DB_PASSWORD=votre_mot_de_passe
node scripts/migrate-to-supabase.js
```

---

## Partie 2 : Déployer le Backend (Render ou Railway)

Le backend Express doit être hébergé séparément. **Render** propose un plan gratuit adapté.

### 2.1 Déployer sur Render

1. Créez un compte sur [render.com](https://render.com)
2. **New** > **Web Service**
3. Connectez votre dépôt Git
4. Configuration :
   - **Build Command** : `cd backend && npm install`
   - **Start Command** : `cd backend && node server.js`
   - **Root Directory** : laisser vide ou `backend`

5. **Environment Variables** (à ajouter) :
   ```
   NODE_ENV=production
   DB_HOST=db.votre-projet.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=votre_mot_de_passe_supabase
   SUPABASE_URL=https://votre-projet.supabase.co
   FRONTEND_URL=https://votre-site.netlify.app
   JWT_SECRET=votre_secret_jwt_long_et_aleatoire
   ```

6. Sauvegardez et déployez. Notez l’URL du service (ex : `https://votre-api.onrender.com`)

### 2.2 Alternative : Railway

1. [railway.app](https://railway.app) > **New Project** > **Deploy from GitHub**
2. Sélectionnez le dépôt et le dossier `backend`
3. Ajoutez les mêmes variables d’environnement que ci-dessus
4. Railway génère automatiquement une URL publique

---

## Partie 3 : Déployer le Frontend sur Netlify

### 3.1 Préparer le projet

Créez un fichier `.env.production` à la racine du projet (ne pas commiter) :

```env
REACT_APP_API_URL=https://votre-api.onrender.com/api
```

Ou utilisez les variables d’environnement directement dans Netlify.

### 3.2 Déploiement via Netlify

1. Allez sur [netlify.com](https://netlify.com) et connectez votre dépôt Git
2. **Add new site** > **Import an existing project**
3. Choisissez GitHub/GitLab et le dépôt du projet

4. **Build settings** (déjà configurés dans `netlify.toml`) :
   - **Build command** : `npm run build`
   - **Publish directory** : `build`
   - **Base directory** : (laisser vide, le frontend est à la racine)

5. **Environment variables** (Site settings > Environment variables) :
   ```
   REACT_APP_API_URL = https://votre-api.onrender.com/api
   NODE_VERSION = 18
   ```

6. Cliquez sur **Deploy site**

### 3.3 Déploiement manuel (drag & drop)

1. En local : `npm run build`
2. Sur [app.netlify.com](https://app.netlify.com), glissez-déposez le dossier `build` dans la zone de déploiement

---

## Partie 4 : Configuration finale

### 4.1 Mettre à jour CORS du backend

Une fois le site Netlify créé, ajoutez son URL dans les variables du backend :

```
FRONTEND_URL=https://votre-site.netlify.app
```

Ou pour les prévisualisations :
```
NETLIFY_URL=https://*.netlify.app
```

### 4.2 Vérifier la connexion

1. Ouvrez votre site Netlify
2. Connectez-vous avec vos identifiants
3. Vérifiez que les données s’affichent bien (employés, congés, etc.)

---

## Résumé des variables d'environnement

### Netlify (Frontend)
| Variable | Valeur |
|---------|--------|
| `REACT_APP_API_URL` | URL de votre backend (ex: `https://xxx.onrender.com/api`) |
| `NODE_VERSION` | 18 |

### Backend (Render/Railway)
| Variable | Valeur |
|---------|--------|
| `NODE_ENV` | production |
| `DB_HOST` | db.dwpkqdiunxbgumepkveb.supabase.co |
| `DB_PORT` | 5432 |
| `DB_NAME` | postgres |
| `DB_USER` | postgres |
| `DB_PASSWORD` | Mot de passe Supabase |
| `SUPABASE_URL` | https://dwpkqdiunxbgumepkveb.supabase.co |
| `SUPABASE_ANON_KEY` | sb_publishable_VKZReniDd61V10U-E8-v4A_aNbAk2kh |
| `FRONTEND_URL` | https://votre-site.netlify.app |
| `JWT_SECRET` | Secret pour les tokens JWT |

### Développement local avec Supabase
Copiez `backend/config.env.example` vers `backend/.env` et remplissez les valeurs Supabase.

---

## Dépannage

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans le backend correspond exactement à l’URL Netlify
- Vérifiez que le backend autorise `*.netlify.app`

### Erreur de connexion à la base
- Vérifiez les variables `DB_*` dans le backend
- Supabase requiert une connexion SSL (déjà gérée dans le code)

### Les données ne s'affichent pas
- Vérifiez que `REACT_APP_API_URL` pointe vers le bon backend
- Les variables `REACT_APP_*` doivent être définies au moment du build

---

## Fichiers modifiés pour cette configuration

- `backend/db.js` : Connexion Supabase via variables d’environnement
- `backend/server.js` : CORS mis à jour pour Netlify
- `netlify.toml` : Configuration de build et de déploiement
- `backend/config.env.example` : Variables Supabase documentées
