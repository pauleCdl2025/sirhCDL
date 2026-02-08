# Guide de déploiement : Supabase + Netlify

Ce guide vous accompagne pour utiliser **Supabase** comme base de données et déployer l'application sur **Netlify**.

## Architecture de déploiement

```
┌─────────────────┐     ┌──────────────────────────────────┐
│  Netlify        │     │  Supabase Cloud                  │
│  (Frontend      │────▶│  - Edge Functions (auth + data)  │
│  React)         │     │  - PostgreSQL (base de données)  │
└─────────────────┘     └──────────────────────────────────┘
```

- **Tout le backend** (auth + données) est hébergé sur Supabase (Edge Functions).
- Voir `GUIDE_BACKEND_SUPABASE_EDGE_FUNCTIONS.md` pour le déploiement des Edge Functions.

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

## Partie 2 : Déployer les Edge Functions Supabase

Le backend est hébergé sur Supabase sous forme d'Edge Functions.

### 2.1 Déployer les fonctions

```bash
supabase functions deploy auth-login
supabase functions deploy evenements
supabase functions deploy requests

supabase functions deploy employees l’URL supabase functions deploy employees
```
### 2.2 Configurer les secrets (Dashboard Supabase)

**Project Settings** > **Edge Functions** > **Secrets** :
- `SUPABASE_URL` : URL du projet
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (Settings > API)
- `JWT_SECRET` : Secret pour les tokens JWT

Voir `GUIDE_BACKEND_SUPABASE_EDGE_FUNCTIONS.md` pour plus de détails.

3. (supprimé) d’environnement que ci-dessus

---

## Partie 3 : Déployer le Frontend sur Netlify

### 3.1 Préparer le projet

Les variables d'environnement se configurent dans Netlify (voir section 3.2, pas de fichier `.env` à commiter).

Configurez les variables dans Netlify (voir section 3.2). d’environnement directement dans Netlify.

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
   REACT_APP_API_URL = https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1
   REACT_APP_SUPABASE_ANON_KEY = <votre clé anon Supabase>
   NODE_VERSION = 18
   ```
   
   - `REACT_APP_API_URL` : URL des Edge Functions Supabase (auth + données)
   - `REACT_APP_SUPABASE_ANON_KEY` : Clé anonyme Supabase (Settings > API)

6. Cliquez sur **Deploy site**

### 3.3 Déploiement manuel (drag & drop)

1. En local : `npm run build`
2. Sur [app.netlify.com](https://app.netlify.com), glissez-déposez le dossier `build` dans la zone de déploiement

---

## LA SUITE : Checklist de déploiement

Exécutez ces étapes dans l'ordre :

### Étape 1 – Déployer les Edge Functions

```bash
cd c:\Users\surface\Desktop\sirhCDL
supabase login
supabase link --project-ref dwpkqdiunxbgumepkveb
supabase functions deploy auth-login
supabase functions deploy evenements
supabase functions deploy requests
supabase functions deploy employees
```

### Étape 2 – Configurer les secrets Supabase

Dashboard Supabase > **Project Settings** > **Edge Functions** > **Secrets** :

| Secret | Valeur |
|--------|--------|
| `SUPABASE_URL` | `https://dwpkqdiunxbgumepkveb.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé **service_role** (Settings > API) |
| `JWT_SECRET` | Une chaîne aléatoire longue (ex. 32 caractères) |

### Étape 3 – Variables Netlify

Netlify > **Site settings** > **Environment variables** > **Add variable** :

| Variable | Valeur |
|----------|--------|
| `REACT_APP_API_URL` | `https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1` |
| `REACT_APP_SUPABASE_ANON_KEY` | Clé **anon** (Settings > API) |
| `NODE_VERSION` | `18` |

### Étape 4 – Redéployer le site Netlify

Options > **Trigger deploy** > **Deploy site** (ou pousser un commit sur la branche liée).

### Étape 5 – Tester

1. Ouvrir https://sirhcdl0.netlify.app
2. Se connecter avec `rh@centre-diagnostic.com` / `Rh@2025CDL`
3. Vérifier le dashboard, la liste des employés, les événements

---

## Partie 4 : Configuration finale

### 4.1 Vérifier la connexion

1. Ouvrez votre site Netlify
2. Connectez-vous avec vos identifiants
3. Vérifiez que les données s’affichent bien (employés, congés, etc.)

---

## Résumé des variables d'environnement

### Netlify (Frontend)
| Variable | Valeur |
|---------|--------|
| `REACT_APP_API_URL` | `https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1` |
| `REACT_APP_SUPABASE_ANON_KEY` | Clé anon Supabase |
| `NODE_VERSION` | 18 |

> **Important** : Le backend est entièrement sur Supabase. Déployez les Edge Functions (auth-login, evenements, requests, employees) avant de tester.

### Edge Functions (Secrets Supabase)
| Variable | Valeur |
|---------|--------|
| `SUPABASE_URL` | https://dwpkqdiunxbgumepkveb.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (Settings > API) |
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

### Les données ne s'affichent pas / Erreurs CORS sur evenements, employees, requests
- **Cause** : Les Edge Functions ne sont pas déployées.
- **Solution** : Déployez les Edge Functions (`supabase functions deploy evenements requests employees`).
- Vérifiez que `REACT_APP_API_URL` = `https://xxx.supabase.co/functions/v1` (sans `/api`).
- Les variables `REACT_APP_*` doivent être définies au moment du build Netlify.

---

## Fichiers modifiés pour cette configuration

- `backend/db.js` : Connexion Supabase via variables d’environnement
- `backend/server.js` : CORS mis à jour pour Netlify
- `netlify.toml` : Configuration de build et de déploiement
- `backend/config.env.example` : Variables Supabase documentées
