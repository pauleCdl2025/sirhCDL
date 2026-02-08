-- Script pour ajouter la contrainte d'unicité sur le champ matricule
-- Ce script doit être exécuté sur la base de données existante

-- 1. Vérifier s'il y a des doublons de matricules
SELECT matricule, COUNT(*) as count
FROM employees 
WHERE matricule IS NOT NULL 
GROUP BY matricule 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Si des doublons existent, les résoudre en ajoutant un suffixe unique
-- (Exécuter seulement si des doublons sont trouvés)
UPDATE employees 
SET matricule = matricule || '_' || id
WHERE id IN (
  SELECT e1.id
  FROM employees e1
  INNER JOIN (
    SELECT matricule
    FROM employees 
    WHERE matricule IS NOT NULL 
    GROUP BY matricule 
    HAVING COUNT(*) > 1
  ) e2 ON e1.matricule = e2.matricule
  AND e1.id NOT IN (
    SELECT MIN(id)
    FROM employees 
    WHERE matricule IS NOT NULL 
    GROUP BY matricule
  )
);

-- 3. Ajouter la contrainte d'unicité
-- Vérifier d'abord si la contrainte existe déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'employees_matricule_key' 
    AND table_name = 'employees'
  ) THEN
    -- Ajouter la contrainte d'unicité
    ALTER TABLE employees ADD CONSTRAINT employees_matricule_key UNIQUE (matricule);
    RAISE NOTICE 'Contrainte d''unicité ajoutée sur le champ matricule';
  ELSE
    RAISE NOTICE 'La contrainte d''unicité existe déjà sur le champ matricule';
  END IF;
END $$;

-- 4. Vérifier que la contrainte a été ajoutée
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

-- 5. Vérifier qu'il n'y a plus de doublons
SELECT matricule, COUNT(*) as count
FROM employees 
WHERE matricule IS NOT NULL 
GROUP BY matricule 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 6. Créer un index sur le matricule pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_employees_matricule ON employees(matricule);

-- 7. Vérifier l'index
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'employees' 
  AND indexname = 'idx_employees_matricule';








