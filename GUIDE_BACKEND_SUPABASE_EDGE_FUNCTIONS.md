# Backend 100 % Supabase – Edge Functions

Ce guide décrit le déploiement du backend entièrement sur Supabase Cloud via Edge Functions.

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────┐
│  Netlify        │     │  Supabase Cloud                   │
│  (Frontend      │────▶│  - Edge Functions (auth, data)     │
│  React)         │     │  - PostgreSQL (base de données)    │
└─────────────────┘     └──────────────────────────────────┘
```

Tout le backend (auth + données) est hébergé sur Supabase.

## Edge Functions déployées

| Fonction        | URL                         | Rôle                                  |
|----------------|-----------------------------|----------------------------------------|
| `auth-login`   | `/functions/v1/auth-login`  | Authentification RH et employés       |
| `evenements`   | `/functions/v1/evenements`  | Événements (liste, upcoming)          |
| `requests`     | `/functions/v1/requests`    | Demandes employés (count/pending, etc.)|
| `employees`    | `/functions/v1/employees`   | Employés (liste, expiring-contracts)  |
| `conges`       | `/functions/v1/conges`      | Congés                                |
| `absences`     | `/functions/v1/absences`    | Absences                              |
| `contrats`     | `/functions/v1/contrats`    | Contrats                              |
| `notes`        | `/functions/v1/notes`       | Notes de service (/, /public)         |
| `sanctions`    | `/functions/v1/sanctions`   | Sanctions                             |
| `recrutements` | `/functions/v1/recrutements`| Historique recrutements               |
| `departs`      | `/functions/v1/departs`     | Historique départs                    |
| `visites-medicales` | `/functions/v1/visites-medicales` | Visites médicales          |
| `interviews`   | `/functions/v1/interviews`  | Entretiens                            |
| `tasks`        | `/functions/v1/tasks`       | Tâches (/, /stats/overview)           |
| `performance`  | `/functions/v1/performance` | Performance                           |
| `departments`  | `/functions/v1/departments`  | Départements                          |

## Déployer les Edge Functions

### Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installé
- Projet Supabase lié (`supabase link`)

### Commandes de déploiement

```bash
# Se placer à la racine du projet
cd sirhCDL

# Déployer toutes les fonctions
supabase functions deploy auth-login
supabase functions deploy evenements --no-verify-jwt
supabase functions deploy requests --no-verify-jwt
supabase functions deploy employees --no-verify-jwt
supabase functions deploy conges --no-verify-jwt
supabase functions deploy absences --no-verify-jwt
supabase functions deploy contrats --no-verify-jwt
supabase functions deploy notes --no-verify-jwt
supabase functions deploy sanctions --no-verify-jwt
supabase functions deploy recrutements --no-verify-jwt
supabase functions deploy departs --no-verify-jwt
supabase functions deploy visites-medicales --no-verify-jwt
supabase functions deploy interviews --no-verify-jwt
supabase functions deploy tasks --no-verify-jwt
supabase functions deploy performance --no-verify-jwt
supabase functions deploy departments --no-verify-jwt
```

> **Important** : `--no-verify-jwt` est requis pour les fonctions de données TOUTES les fonctions car la clé `sb_publishable_` n’est pas un JWT et provoque des 401 sans cela. Redéployer avec `--no-verify-jwt` si vous avez des erreurs 401.

### Variables d'environnement (Supabase Dashboard)

Dans **Project Settings** > **Edge Functions** > **Secrets**, configurer :

- `SUPABASE_URL` : URL du projet (ex: `https://dwpkqdiunxbgumepkveb.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role (Settings > API)
- `JWT_SECRET` : Secret pour les tokens JWT (auth-login)

## Variables Netlify

Dans **Site settings** > **Environment variables** :

| Variable                   | Valeur                                               |
|----------------------------|------------------------------------------------------|
| `REACT_APP_API_URL`        | `https://dwpkqdiunxbgumepkveb.supabase.co/functions/v1` |
| `REACT_APP_SUPABASE_ANON_KEY` | Clé anon Supabase                                 |

> **Important** : `REACT_APP_API_URL` doit pointer vers `/functions/v1` **sans** `/api` à la fin.

## Désactiver la vérification JWT (obligatoire avec clé sb_publishable_)

La clé `sb_publishable_` n’est pas un JWT, donc les Edge Functions renvoient 401 sans `--no-verify-jwt` au déploiement.

**Solution** : déployer avec `--no-verify-jwt` pour evenements, requests, employees.

## Ajouter d'autres endpoints

Pour exposer d'autres routes (congés, absences, contrats, etc.) :

1. Créer une nouvelle fonction dans `supabase/functions/<nom>/index.ts`
2. Implémenter la logique avec le client Supabase
3. Déployer : `supabase functions deploy <nom>`
4. Le frontend appelle alors `https://xxx.supabase.co/functions/v1/<nom>/...`

## Développement local (Edge Functions)

```bash
supabase functions serve
```

Puis tester avec `http://localhost:54321/functions/v1/evenements/upcoming`.
