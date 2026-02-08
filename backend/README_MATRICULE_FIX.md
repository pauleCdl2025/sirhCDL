# Correction des Matricules - Système d'Onboarding

## Problèmes identifiés

1. **Génération de matricules non uniques** : Utilisation de `Math.random()` qui peut créer des doublons
2. **Pas de contrainte d'unicité** dans la base de données sur le champ matricule
3. **Pas de vérification côté serveur** pour l'unicité avant l'insertion
4. **Gestion d'erreur insuffisante** lors de la validation

## Solutions implémentées

### 1. Service de gestion des matricules (`matriculeService.js`)

- **Génération séquentielle** : Basée sur l'année et un compteur incrémental
- **Vérification d'unicité** : Avant chaque insertion
- **Réservation de matricules** : Pour éviter les conflits lors de la création
- **Libération automatique** : En cas d'erreur

### 2. Contrainte d'unicité en base de données

- **Contrainte UNIQUE** sur le champ matricule
- **Index de performance** pour les recherches
- **Script de correction** pour les données existantes

### 3. Validation améliorée côté serveur

- **Validation complète** des données d'onboarding
- **Messages d'erreur détaillés** pour chaque champ
- **Gestion des erreurs** avec rollback automatique

### 4. Interface utilisateur améliorée

- **Validation en temps réel** des champs
- **Affichage des erreurs** par champ
- **Gestion des erreurs** du serveur
- **Styles CSS** pour une meilleure UX

## Installation et configuration

### 1. Exécuter le script de correction des matricules

```bash
cd backend
node fix_matricule_uniqueness.js
```

Ce script va :
- Détecter et corriger les doublons existants
- Ajouter la contrainte d'unicité
- Créer un index de performance

### 2. Vérifier la configuration de la base de données

Assurez-vous que les variables d'environnement sont configurées dans `config.env` :

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=rh_portal
DB_PASSWORD=your_password
DB_PORT=5432
```

### 3. Redémarrer le serveur

```bash
npm run dev
# ou
node server.js
```

## Format des matricules

Le nouveau système génère des matricules au format : `EMP{YY}{XXXX}`

- **EMP** : Préfixe fixe
- **YY** : Derniers 2 chiffres de l'année en cours
- **XXXX** : Numéro séquentiel sur 4 chiffres (0001, 0002, etc.)

Exemples :
- `EMP25001` : Premier employé de 2025
- `EMP25002` : Deuxième employé de 2025
- `EMP25010` : Dixième employé de 2025

## Gestion des erreurs

### Erreurs de validation côté client

- **Champs obligatoires** : Vérification en temps réel
- **Format des données** : Validation des emails, téléphones, etc.
- **Documents requis** : Vérification de la présence des fichiers

### Erreurs de validation côté serveur

- **Unicité des matricules** : Vérification avant insertion
- **Intégrité des données** : Validation des contraintes de base
- **Gestion des transactions** : Rollback automatique en cas d'erreur

## Tests

### 1. Test de création d'employé

```bash
# Créer un nouvel employé via l'interface d'onboarding
# Vérifier que le matricule est unique
# Vérifier que la validation fonctionne
```

### 2. Test de doublon de matricule

```bash
# Essayer de créer un employé avec un matricule existant
# Vérifier que l'erreur est bien gérée
# Vérifier que le matricule est automatiquement généré
```

### 3. Test de validation des données

```bash
# Soumettre le formulaire avec des données invalides
# Vérifier que les erreurs sont affichées
# Vérifier que la soumission est bloquée
```

## Maintenance

### Vérification périodique

```sql
-- Vérifier qu'il n'y a pas de doublons
SELECT matricule, COUNT(*) as count
FROM employees 
WHERE matricule IS NOT NULL 
GROUP BY matricule 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Vérifier la contrainte d'unicité
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'employees' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'matricule';
```

### Nettoyage des matricules temporaires

```sql
-- Supprimer les réservations temporaires orphelines
DELETE FROM employees 
WHERE nom_prenom = 'TEMP_RESERVATION' 
  AND created_at < NOW() - INTERVAL '1 hour';
```

## Dépannage

### Erreur "matricule already exists"

1. Vérifier que la contrainte d'unicité est bien en place
2. Vérifier qu'il n'y a pas de doublons dans la base
3. Exécuter le script de correction si nécessaire

### Erreur de validation

1. Vérifier que tous les champs obligatoires sont remplis
2. Vérifier le format des données (email, téléphone, etc.)
3. Vérifier que les documents sont bien uploadés

### Problème de performance

1. Vérifier que l'index sur matricule est créé
2. Vérifier les requêtes de génération de matricule
3. Optimiser les requêtes si nécessaire

## Support

Pour toute question ou problème :

1. Vérifier les logs du serveur
2. Vérifier les logs de la base de données
3. Exécuter les scripts de diagnostic
4. Consulter la documentation de l'API

## Notes importantes

- **Sauvegarde** : Toujours faire une sauvegarde avant d'exécuter les scripts de correction
- **Test** : Tester en environnement de développement avant la production
- **Monitoring** : Surveiller les performances après l'ajout des contraintes
- **Documentation** : Mettre à jour la documentation utilisateur si nécessaire








