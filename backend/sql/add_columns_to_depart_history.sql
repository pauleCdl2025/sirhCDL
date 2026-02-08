-- Script pour ajouter les colonnes nécessaires à la table depart_history
-- pour stocker les informations de l'employé avant sa suppression

-- Ajouter les colonnes si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Nom et prénom
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'nom_prenom') THEN
        ALTER TABLE depart_history ADD COLUMN nom_prenom VARCHAR(255);
    END IF;
    
    -- Matricule
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'matricule') THEN
        ALTER TABLE depart_history ADD COLUMN matricule VARCHAR(50);
    END IF;
    
    -- Poste actuel
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'poste_actuel') THEN
        ALTER TABLE depart_history ADD COLUMN poste_actuel VARCHAR(255);
    END IF;
    
    -- Département
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'departement') THEN
        ALTER TABLE depart_history ADD COLUMN departement VARCHAR(100);
    END IF;
    
    -- Statut (type de contrat)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'statut') THEN
        ALTER TABLE depart_history ADD COLUMN statut VARCHAR(50);
    END IF;
    
    -- Email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'email') THEN
        ALTER TABLE depart_history ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Téléphone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depart_history' AND column_name = 'telephone') THEN
        ALTER TABLE depart_history ADD COLUMN telephone VARCHAR(50);
    END IF;
END $$;

-- Mettre à jour les enregistrements existants avec les données de la table employees si possible
UPDATE depart_history dh
SET 
    nom_prenom = e.nom_prenom,
    matricule = e.matricule,
    poste_actuel = e.poste_actuel,
    departement = e.departement,
    statut = c.type_contrat,
    email = e.email,
    telephone = e.telephone
FROM employees e
LEFT JOIN contrats c ON c.employee_id = e.id AND c.statut = 'Actif'
WHERE dh.employee_id = e.id
  AND (dh.nom_prenom IS NULL OR dh.matricule IS NULL OR dh.poste_actuel IS NULL);


