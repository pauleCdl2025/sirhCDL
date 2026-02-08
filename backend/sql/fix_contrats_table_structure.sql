-- Script pour corriger la structure de la table contrats
-- Ajouter employee_id et créer la relation avec la table employees

-- 1. Ajouter le champ employee_id
ALTER TABLE contrats ADD COLUMN IF NOT EXISTS employee_id INTEGER;

-- 2. Créer la contrainte de clé étrangère
ALTER TABLE contrats 
ADD CONSTRAINT fk_contrats_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- 3. Migrer les données existantes en liant les contrats aux employés par nom
-- Cette requête met à jour employee_id en se basant sur le nom_employe
UPDATE contrats 
SET employee_id = e.id 
FROM employees e 
WHERE contrats.nom_employe = e.nom_prenom 
AND contrats.employee_id IS NULL;

-- 4. Vérifier les contrats qui n'ont pas pu être liés
SELECT id, nom_employe, employee_id 
FROM contrats 
WHERE employee_id IS NULL;

-- 5. Optionnel : Supprimer l'ancienne contrainte unique sur nom_employe
-- (à faire seulement après avoir vérifié que la migration s'est bien passée)
-- ALTER TABLE contrats DROP CONSTRAINT IF EXISTS unique_employee;
-- DROP INDEX IF EXISTS idx_unique_employee;

-- 6. Ajouter un index sur employee_id pour les performances
CREATE INDEX IF NOT EXISTS idx_contrats_employee_id ON contrats(employee_id);

-- 7. Vérifier la nouvelle structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contrats' 
ORDER BY ordinal_position;








