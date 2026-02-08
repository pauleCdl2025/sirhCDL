# Guide d'import des données vers Supabase

Ce guide décrit comment importer toutes vos données depuis `rh_portail.sql` vers votre base Supabase.

## Prérequis

1. **Schéma déjà créé** : Exécutez d'abord `rh_portail_supabase.sql` dans le SQL Editor de Supabase (création des tables vides).

2. **Mot de passe Supabase** : Récupérez-le dans Supabase Dashboard > Settings > Database.

---

## Méthode 1 : Avec psql (recommandée)

`psql` est l'outil en ligne de commande de PostgreSQL. Il gère nativement le format `COPY ... FROM stdin` du fichier.

### Si PostgreSQL est installé

1. Ouvrez PowerShell ou l'invite de commandes
2. Définissez les variables :

```powershell
$env:DB_PASSWORD = "votre_mot_de_passe_supabase"
$env:DB_HOST = "db.dwpkqdiunxbgumepkveb.supabase.co"
```

3. Lancez l'import :

```powershell
cd c:\Users\surface\Desktop\sirhCDL
node scripts/import-data-to-supabase.js
```

**Ou avec le fichier batch :**

```cmd
set DB_PASSWORD=votre_mot_de_passe_supabase
scripts\import-data-to-supabase.bat
```

### Si psql n'est pas installé

1. Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
2. Installez-le (psql sera ajouté au PATH)
3. Relancez l'import

---

## Méthode 2 : Avec pgAdmin

1. Ouvrez pgAdmin
2. Créez une nouvelle connexion :
   - **Host** : `db.dwpkqdiunxbgumepkveb.supabase.co`
   - **Port** : 5432
   - **Database** : postgres
   - **Username** : postgres
   - **Password** : votre mot de passe Supabase
   - **SSL** : Require

3. Clic droit sur la base > Query Tool
4. Menu File > Open > Sélectionnez `rh_portail.sql`
5. Exécutez (F5)

---

## Méthode 3 : Avec DBeaver

1. Créez une connexion PostgreSQL vers Supabase
2. Clic droit sur la connexion > SQL Editor > Open SQL Script
3. Sélectionnez `rh_portail.sql`
4. Exécutez le script

---

## Ordre d'exécution

**Important** : Si votre base Supabase est vide :

1. **Option A** - Tout en une fois avec psql :
   - Exécutez `rh_portail.sql` (schéma + données)
   - Les tables seront créées et remplies

2. **Option B** - En deux étapes (si schéma déjà créé) :
   - Vous avez déjà exécuté `rh_portail_supabase.sql`
   - Exécutez `rh_portail.sql` : les `CREATE TABLE` échoueront (tables existantes) mais les `COPY` inséreront les données
   - **Problème** : Le script peut s'arrêter aux premières erreurs

**Recommandation** : Si la base est vide, utilisez `rh_portail.sql` complet avec psql. Si des tables existent déjà, videz-les ou recréez le projet Supabase.

---

## Dépannage

### Erreur "relation already exists"
Les tables existent déjà. Soit vous avez déjà importé, soit exécutez sur une base vide.

### Erreur de connexion SSL
Vérifiez que vous utilisez `sslmode=require` ou l'option SSL dans votre client.

### Erreur d'encodage
Le fichier est en UTF-8. Assurez-vous que votre client utilise UTF-8.

### Problèmes d'accents (é, è, ê affichés incorrectement)

Les fichiers `rh_portail_DATA_ONLY.sql`, `rh_portail_INSERT.sql` et `rh_portail.sql` ont été corrigés : les accents français s'affichent maintenant correctement (Cérémonie, Arrêt, Infirmière, etc.).

**Si votre base Supabase contient déjà des données avec des accents incorrects** (ex. : C‚r‚monie au lieu de Cérémonie) :

1. Ouvrez **Supabase Dashboard** > **SQL Editor**
2. Copiez et exécutez le script `supabase/database/fix_accents_supabase.sql`
3. Cela corrige les tables : absence, conges, employees, contrats, sanctions_table, notes, historique_recrutement, recrutement_history, historique_departs, visites_medicales
