# 🔍 Guide : Champs Manquants dans les Contrats

## 🚨 Problème Identifié

**"Il le poste et date de fin de contrat"** - Vous voulez que les contrats affichent :
- ✅ **Le poste** de l'employé
- ✅ **La date de fin** du contrat
- ✅ **Le nom de l'employé** (déjà résolu)

## 🔍 Diagnostic des Champs Manquants

### **Champs Requis pour un Contrat Complet**

```sql
-- Structure complète d'un contrat
{
  "id": 1,
  "employee_id": 1,
  "type_contrat": "CDI",
  "poste": "Développeur Full-Stack",        -- ← CHAMP REQUIS
  "service": "IT",
  "date_debut": "2024-01-01",
  "date_fin": "2026-12-31",                 -- ← CHAMP REQUIS
  "salaire": 50000
}
```

### **Vérification des Champs Existants**

```sql
-- Vérifier la structure de la table contrats
\d contrats

-- Vérifier les colonnes présentes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contrats'
ORDER BY ordinal_position;

-- Vérifier les données existantes
SELECT id, employee_id, type_contrat, poste, service, 
       date_debut, date_fin, salaire
FROM contrats 
LIMIT 3;
```

## 🛠️ Solutions par Champ Manquant

### **Problème 1 : Colonne `poste` manquante**

#### **Symptômes :**
- Erreur "Cannot read properties of undefined (reading 'poste')"
- Affichage "Poste non défini" ou vide
- Impossible de filtrer par poste

#### **Solution :**
```sql
-- 1. Vérifier si la colonne existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'contrats' AND column_name = 'poste';

-- 2. Ajouter la colonne si elle n'existe pas
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS poste VARCHAR(255);

-- 3. Mettre à jour les contrats existants
UPDATE contrats SET poste = 'Poste non défini' WHERE poste IS NULL;

-- 4. Vérifier que la colonne est bien ajoutée
SELECT id, poste FROM contrats LIMIT 5;
```

### **Problème 2 : Colonne `date_fin` manquante**

#### **Symptômes :**
- Erreur "Cannot read properties of undefined (reading 'date_fin')"
- Affichage "Date de fin non définie" ou vide
- Impossible de calculer la durée du contrat

#### **Solution :**
```sql
-- 1. Vérifier si la colonne existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'contrats' AND column_name = 'date_fin';

-- 2. Ajouter la colonne si elle n'existe pas
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS date_fin DATE;

-- 3. Mettre à jour les contrats existants avec une valeur par défaut
UPDATE contrats 
SET date_fin = date_debut + INTERVAL '1 year' 
WHERE date_fin IS NULL;

-- 4. Vérifier que la colonne est bien ajoutée
SELECT id, date_debut, date_fin FROM contrats LIMIT 5;
```

## 📝 Scripts SQL Complets

### **Script 1 : Vérification et Correction Automatique**

```sql
-- Script complet pour corriger les champs manquants
DO $$
BEGIN
    -- Ajouter la colonne poste si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contrats' AND column_name = 'poste'
    ) THEN
        ALTER TABLE contrats ADD COLUMN poste VARCHAR(255);
        RAISE NOTICE 'Colonne poste ajoutée';
    ELSE
        RAISE NOTICE 'Colonne poste existe déjà';
    END IF;
    
    -- Ajouter la colonne date_fin si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contrats' AND column_name = 'date_fin'
    ) THEN
        ALTER TABLE contrats ADD COLUMN date_fin DATE;
        RAISE NOTICE 'Colonne date_fin ajoutée';
    ELSE
        RAISE NOTICE 'Colonne date_fin existe déjà';
    END IF;
    
    -- Mettre à jour les valeurs NULL
    UPDATE contrats SET poste = 'Poste non défini' WHERE poste IS NULL;
    UPDATE contrats SET date_fin = date_debut + INTERVAL '1 year' WHERE date_fin IS NULL;
    
    RAISE NOTICE 'Mise à jour des valeurs NULL terminée';
END $$;
```

### **Script 2 : Insertion de Données de Test**

```sql
-- Insérer des employés de test
INSERT INTO employees (nom_prenom, email, matricule) 
VALUES 
    ('Jean Dupont', 'jean@exemple.com', 'EMP001'),
    ('Marie Martin', 'marie@exemple.com', 'EMP002'),
    ('Pierre Durand', 'pierre@exemple.com', 'EMP003')
ON CONFLICT (matricule) DO NOTHING;

-- Insérer des contrats de test avec tous les champs
INSERT INTO contrats (
    employee_id, type_contrat, poste, service, 
    date_debut, date_fin, salaire
) VALUES 
    (
        (SELECT id FROM employees WHERE matricule = 'EMP001'),
        'CDI', 'Développeur Full-Stack', 'IT',
        '2024-01-01', '2026-12-31', 55000
    ),
    (
        (SELECT id FROM employees WHERE matricule = 'EMP002'),
        'CDD', 'Chef de Projet', 'Management',
        '2024-03-01', '2024-12-31', 65000
    ),
    (
        (SELECT id FROM employees WHERE matricule = 'EMP003'),
        'CDI', 'Designer UI/UX', 'Design',
        '2024-02-01', '2027-01-31', 48000
    );
```

## 🧪 Tests de Validation

### **Test 1 : Vérifier la Structure**

```sql
-- Vérifier que toutes les colonnes sont présentes
SELECT 
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('poste', 'date_fin') THEN 'REQUIS'
        ELSE 'OPTIONNEL'
    END as importance
FROM information_schema.columns 
WHERE table_name = 'contrats'
ORDER BY 
    CASE WHEN column_name IN ('poste', 'date_fin') THEN 1 ELSE 2 END,
    ordinal_position;
```

### **Test 2 : Vérifier les Données**

```sql
-- Vérifier qu'aucun contrat n'a de valeurs NULL pour les champs requis
SELECT 
    COUNT(*) as total_contrats,
    COUNT(poste) as contrats_avec_poste,
    COUNT(date_fin) as contrats_avec_date_fin,
    COUNT(*) - COUNT(poste) as contrats_sans_poste,
    COUNT(*) - COUNT(date_fin) as contrats_sans_date_fin
FROM contrats;
```

### **Test 3 : Vérifier la Liaison**

```sql
-- Vérifier que tous les contrats ont des employés valides
SELECT 
    c.id as contrat_id,
    c.employee_id,
    c.poste,
    c.date_fin,
    e.nom_prenom,
    CASE 
        WHEN e.id IS NULL THEN 'EMPLOYÉ MANQUANT'
        WHEN c.poste IS NULL THEN 'POSTE MANQUANT'
        WHEN c.date_fin IS NULL THEN 'DATE FIN MANQUANTE'
        ELSE 'OK'
    END as statut
FROM contrats c
LEFT JOIN employees e ON c.employee_id = e.id
ORDER BY c.id;
```

## 🔧 Correction Frontend

### **Mise à Jour du Composant ContractManagement**

Assurez-vous que le composant gère correctement les champs `poste` et `date_fin` :

```javascript
// Dans ContractManagement.jsx, vérifier l'affichage
const renderContratRow = (contrat) => (
  <tr key={contrat.id}>
    <td>{contrat.nom_employe || 'Nom non défini'}</td>
    <td>{contrat.poste || 'Poste non défini'}</td>        {/* ← Champ poste */}
    <td>{contrat.service || 'Service non défini'}</td>
    <td>{contrat.type_contrat || 'Type non défini'}</td>
    <td>{contrat.date_debut || 'Date début non définie'}</td>
    <td>{contrat.date_fin || 'Date fin non définie'}</td> {/* ← Champ date_fin */}
    <td>{contrat.salaire || 'Salaire non défini'}</td>
  </tr>
);
```

### **Gestion des Valeurs Manquantes**

```javascript
// Fonction utilitaire pour gérer les valeurs manquantes
const getSafeValue = (value, defaultValue = 'Non défini') => {
  return value !== null && value !== undefined ? value : defaultValue;
};

// Utilisation dans le rendu
<td>{getSafeValue(contrat.poste, 'Poste non défini')}</td>
<td>{getSafeValue(contrat.date_fin, 'Date fin non définie')}</td>
```

## 📋 Checklist de Résolution

- [ ] **Vérifier la structure** de la table `contrats`
- [ ] **Ajouter la colonne `poste`** si elle manque
- [ ] **Ajouter la colonne `date_fin`** si elle manque
- [ ] **Mettre à jour les données** existantes avec des valeurs par défaut
- [ ] **Insérer des données de test** complètes
- [ ] **Vérifier l'API** retourne bien tous les champs
- [ ] **Tester l'affichage** dans le composant frontend
- [ ] **Valider la recherche et filtres** par poste

## 🚀 Prochaines Étapes

1. **Lancer le composant `TestChampsContrats`** pour identifier les champs manquants
2. **Exécuter les scripts SQL** pour corriger la structure de la base
3. **Insérer des données de test** avec tous les champs requis
4. **Vérifier que l'API** retourne bien `poste` et `date_fin`
5. **Tester l'affichage** dans `ContractManagement`
6. **Valider que les contrats** affichent correctement le poste et la date de fin

## 💡 Conseils de Développement

- **Toujours vérifier la structure de la base** avant de développer le frontend
- **Utiliser des valeurs par défaut** pour éviter les erreurs "undefined"
- **Tester avec des données complètes** pour valider l'affichage
- **Maintenir une cohérence** entre la base de données et l'interface

Ce guide devrait permettre de résoudre rapidement le problème des champs manquants et d'afficher correctement le poste et la date de fin des contrats ! 🎯








