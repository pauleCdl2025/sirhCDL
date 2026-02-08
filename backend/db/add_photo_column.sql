-- Script pour ajouter le champ photo à la table employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_path VARCHAR(255);

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_employees_photo ON employees(photo_path);

-- Commentaire pour documenter le champ
COMMENT ON COLUMN employees.photo_path IS 'Chemin vers la photo de profil de l\'employé';




