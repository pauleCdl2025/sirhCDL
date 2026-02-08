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
supabase functions deploy evenements
supabase functions deploy requests
supabase functions deploy employees
```

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

## Désactiver la vérification JWT (optionnel)

Pour que les Edge Functions acceptent les requêtes avec la clé anon :

1. Supabase Dashboard > **Project Settings** > **Edge Functions**
2. Désactiver **Enforce JWT verification** pour les fonctions publiques

Ou laisser activé et s'assurer que le frontend envoie bien `Authorization: Bearer <anon_key>`.

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
