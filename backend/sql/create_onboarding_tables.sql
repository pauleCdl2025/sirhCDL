-- Script SQL pour créer les tables nécessaires à l'onboarding et l'offboarding
-- Exécutez ce script dans votre base de données PostgreSQL

-- Table pour l'historique d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_history (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  date_integration DATE NOT NULL,
  checklist JSONB DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  notes TEXT,
  statut VARCHAR(50) DEFAULT 'Terminé',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_onboarding_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_onboarding_statut 
    CHECK (statut IN ('En cours', 'Terminé', 'Annulé'))
);

-- Table pour l'historique d'offboarding
CREATE TABLE IF NOT EXISTS offboarding_history (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  date_depart DATE NOT NULL,
  motif_depart TEXT,
  checklist JSONB DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  notes TEXT,
  statut VARCHAR(50) DEFAULT 'Terminé',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_offboarding_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_offboarding_statut 
    CHECK (statut IN ('En cours', 'Terminé', 'Annulé'))
);

-- Table pour l'historique des départs (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS depart_history (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  date_depart DATE NOT NULL,
  motif_depart TEXT,
  type_depart VARCHAR(100) DEFAULT 'Démission',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_depart_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE
);

-- Table pour l'historique de recrutement (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS recrutement_history (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  date_recrutement DATE NOT NULL,
  date_fin DATE,
  poste_recrute VARCHAR(100) NOT NULL,
  type_contrat VARCHAR(100),
  salaire_propose DECIMAL(10,2),
  source_recrutement VARCHAR(100),
  notes TEXT,
  statut VARCHAR(50) DEFAULT 'En cours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_recrutement_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_recrutement_statut 
    CHECK (statut IN ('En cours', 'Recruté', 'Parti', 'Annulé'))
);

-- Table pour les contrats (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS contrats (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  type_contrat VARCHAR(100) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  statut VARCHAR(50) DEFAULT 'Actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_contrat_employee 
    FOREIGN KEY (employee_id) 
    REFERENCES employees(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT check_contrat_statut 
    CHECK (statut IN ('Actif', 'Terminé', 'Suspendu', 'En attente'))
);

-- Ajouter des colonnes manquantes à la table employees si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter la colonne statut si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'statut') THEN
    ALTER TABLE employees ADD COLUMN statut VARCHAR(50) DEFAULT 'Actif';
  END IF;
  
  -- Ajouter la colonne date_depart si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'date_depart') THEN
    ALTER TABLE employees ADD COLUMN date_depart DATE;
  END IF;
  
  -- Ajouter la colonne updated_at si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'updated_at') THEN
    ALTER TABLE employees ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
  
  -- Ajouter la colonne departement si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'departement') THEN
    ALTER TABLE employees ADD COLUMN departement VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne domaine_fonctionnel si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'domaine_fonctionnel') THEN
    ALTER TABLE employees ADD COLUMN domaine_fonctionnel VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne categorie si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'categorie') THEN
    ALTER TABLE employees ADD COLUMN categorie VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne responsable si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'responsable') THEN
    ALTER TABLE employees ADD COLUMN responsable VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne niveau_etude si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'niveau_etude') THEN
    ALTER TABLE employees ADD COLUMN niveau_etude VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne specialisation si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'specialisation') THEN
    ALTER TABLE employees ADD COLUMN specialisation VARCHAR(100);
  END IF;
  
  -- Ajouter la colonne date_fin_contrat si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'date_fin_contrat') THEN
    ALTER TABLE employees ADD COLUMN date_fin_contrat DATE;
  END IF;
  
  -- Ajouter la colonne notes si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'notes') THEN
    ALTER TABLE employees ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_onboarding_employee_id ON onboarding_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_date ON onboarding_history(date_integration);
CREATE INDEX IF NOT EXISTS idx_onboarding_statut ON onboarding_history(statut);

CREATE INDEX IF NOT EXISTS idx_offboarding_employee_id ON offboarding_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_date ON offboarding_history(date_depart);
CREATE INDEX IF NOT EXISTS idx_offboarding_statut ON offboarding_history(statut);

CREATE INDEX IF NOT EXISTS idx_depart_employee_id ON depart_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_depart_date ON depart_history(date_depart);

CREATE INDEX IF NOT EXISTS idx_recrutement_employee_id ON recrutement_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_recrutement_date ON recrutement_history(date_recrutement);
CREATE INDEX IF NOT EXISTS idx_recrutement_statut ON recrutement_history(statut);

CREATE INDEX IF NOT EXISTS idx_contrats_employee_id ON contrats(employee_id);
CREATE INDEX IF NOT EXISTS idx_contrats_statut ON contrats(statut);
CREATE INDEX IF NOT EXISTS idx_contrats_date_debut ON contrats(date_debut);

CREATE INDEX IF NOT EXISTS idx_employees_statut ON employees(statut);
CREATE INDEX IF NOT EXISTS idx_employees_matricule ON employees(matricule);
CREATE INDEX IF NOT EXISTS idx_employees_departement ON employees(departement);

-- Créer des vues utiles
CREATE OR REPLACE VIEW v_employees_onboarding AS
SELECT 
  e.id,
  e.matricule,
  e.nom_prenom,
  e.email,
  e.poste_actuel,
  e.entity,
  e.departement,
  e.type_contrat,
  e.date_entree,
  e.statut,
  oh.date_integration,
  oh.checklist as onboarding_checklist,
  oh.documents as onboarding_documents,
  oh.notes as onboarding_notes
FROM employees e
LEFT JOIN onboarding_history oh ON e.id = oh.employee_id
WHERE e.statut = 'Actif'
ORDER BY e.nom_prenom;

CREATE OR REPLACE VIEW v_employees_offboarding AS
SELECT 
  e.id,
  e.matricule,
  e.nom_prenom,
  e.poste_actuel,
  e.entity,
  e.departement,
  e.date_depart,
  oh.date_depart as offboarding_date,
  oh.motif_depart,
  oh.checklist as offboarding_checklist,
  oh.documents as offboarding_documents,
  oh.notes as offboarding_notes
FROM employees e
LEFT JOIN offboarding_history oh ON e.id = oh.employee_id
WHERE e.statut = 'Partant'
ORDER BY e.date_depart DESC;

-- Vue pour l'historique complet des employés (recrutement + départ)
CREATE OR REPLACE VIEW v_employees_complete_history AS
SELECT 
  e.id,
  e.matricule,
  e.nom_prenom,
  e.poste_actuel,
  e.entity,
  e.departement,
  e.statut,
  rh.date_recrutement,
  rh.date_fin as date_depart,
  rh.type_contrat,
  rh.source_recrutement,
  rh.notes as recrutement_notes,
  dh.motif_depart,
  dh.type_depart,
  dh.notes as depart_notes,
  CASE 
    WHEN e.statut = 'Actif' THEN 'En poste'
    WHEN e.statut = 'Partant' THEN 'Parti'
    ELSE e.statut
  END as statut_global
FROM employees e
LEFT JOIN recrutement_history rh ON e.id = rh.employee_id AND rh.statut IN ('Recruté', 'Parti')
LEFT JOIN depart_history dh ON e.id = dh.employee_id
ORDER BY e.nom_prenom, rh.date_recrutement DESC;

-- Insérer des données de test (optionnel)
-- INSERT INTO onboarding_history (employee_id, date_integration, checklist, notes) VALUES 
-- (1, '2024-01-15', '{"accueil": true, "formation": true, "equipement": false}', 'Intégration réussie');

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Tables d''onboarding et d''offboarding créées avec succès !';
  RAISE NOTICE 'Vérifiez que toutes les colonnes nécessaires ont été ajoutées à la table employees.';
END $$;
