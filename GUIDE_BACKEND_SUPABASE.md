# Backend géré par Supabase

Ce guide décrit comment utiliser Supabase comme backend complet (hébergé dans le cloud).

## Architecture

```
Frontend (Netlify)  →  Supabase
                        ├── Edge Functions (auth-login)
                        ├── Database (PostgreSQL)
                        └── Storage (fichiers)
```

## Configuration requise

### 1. Variables d'environnement (Netlify / .env)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `REACT_APP_API_URL` | `https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1` | URL des Edge Functions |
| `REACT_APP_SUPABASE_ANON_KEY` | `sb_publishable_VKZReniDd61V10U-E8-v4A_aNbAk2kh` | Clé anonyme Supabase |

### 2. Tables d'administration dans Supabase

Exécutez dans le SQL Editor de Supabase :

```sql
-- Fichier: supabase/database/admin_tables.sql
```

### 3. Déployer l'Edge Function auth-login

**Méthode A : Via le Dashboard Supabase** (sans CLI)

1. Allez dans **Supabase Dashboard** > **Edge Functions**
2. Cliquez sur **Deploy a new function** > **Via Editor**
3. Nommez la fonction : `auth-login`
4. Copiez le contenu de `supabase/functions/auth-login/index.ts`
5. Cliquez sur **Deploy function**

**Méthode B : Via CLI** (npm global non supporté sur Windows)

```powershell
# Option 1 : Scoop
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
iwr -useb get.scoop.sh | iex
scoop install supabase

# Option 2 : npm (dépendance du projet)
npm install supabase --save-dev
```

Puis :

```powershell
npx supabase login
npx supabase link --project-ref dwpkqdiunxbgumepkveb
npx supabase functions deploy auth-login
```

### 4. Vérifier les secrets Supabase

Dans **Supabase Dashboard** > **Edge Functions** > **Secrets** :
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont automatiques
- `JWT_SECRET` : à définir manuellement

## Endpoints API (employés, contrats, etc.)

L'Edge Function `auth-login` gère uniquement l'authentification. Pour les données :

**Option A - Backend Express** (recommandé actuellement) :
- Déployez le backend Express sur Render (connecté à Supabase pour la DB)
- `REACT_APP_API_URL` = `https://votre-backend.onrender.com/api`
- L'auth reste sur Express (/auth/login) dans ce cas

**Option B - Supabase uniquement** :
- `REACT_APP_API_URL` = `https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1`
- `REACT_APP_SUPABASE_ANON_KEY` = votre clé anon
- L'auth utilise l'Edge Function auth-login ✓
- Les autres endpoints nécessitent des Edge Functions supplémentaires (à développer)

## Test de l'authentification

1. Configurez les variables dans Netlify
2. Redéployez le frontend
3. Connectez-vous avec : `rh@centre-diagnostic.com` / `Rh@2025CDL`

## Dépannage

### "Impossible de se connecter au serveur"
- Vérifiez que `REACT_APP_API_URL` pointe vers Supabase Functions
- Vérifiez que `auth-login` est déployé
- Vérifiez que `REACT_APP_SUPABASE_ANON_KEY` est défini

### Erreur 401 sur l'Edge Function
- L'anon key doit être dans le header `Authorization: Bearer <key>`
