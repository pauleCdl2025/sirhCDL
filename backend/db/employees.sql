-- Création de la table effectif qui contiendra les données des employés et de leurs contrats
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  statut_dossier VARCHAR(255),
  matricule VARCHAR(50) UNIQUE NOT NULL,
  nom_prenom VARCHAR(255) NOT NULL,
  genre VARCHAR(10),
  date_naissance DATE,
  age INT,
  age_restant INT,
  date_retraite DATE,
  date_entree DATE,
  lieu VARCHAR(100),
  adresse VARCHAR(255),
  telephone VARCHAR(50),
  email VARCHAR(255),
  cnss_number VARCHAR(50),
  cnamgs_number VARCHAR(50),
  poste_actuel VARCHAR(255),
  type_contrat VARCHAR(50),
  date_fin_contrat DATE,
  employee_type VARCHAR(50),
  nationalite VARCHAR(100),
  functional_area VARCHAR(100),
  entity VARCHAR(50),
  responsable VARCHAR(100),
  statut_employe VARCHAR(50),
  statut_marital VARCHAR(50),
  enfants INT,
  niveau_etude VARCHAR(100),
  anciennete VARCHAR(50),
  specialisation TEXT,
  type_remuneration VARCHAR(50),
  payment_mode VARCHAR(50),
  categorie VARCHAR(50),
  salaire_base NUMERIC(10, 2),
  salaire_net NUMERIC(10, 2),
  prime_responsabilite NUMERIC(10, 2),
  prime_penibilite NUMERIC(10, 2),
  prime_logement NUMERIC(10, 2),
  prime_transport NUMERIC(10, 2),
  prime_anciennete NUMERIC(10, 2),
  prime_enfant NUMERIC(10, 2),
  prime_representation NUMERIC(10, 2),
  prime_performance NUMERIC(10, 2),
  prime_astreinte NUMERIC(10, 2),
  honoraires NUMERIC(10, 2),
  indemnite_stage NUMERIC(10, 2),
  timemoto_id VARCHAR(50),
  password VARCHAR(255),
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(50),
  last_login TIMESTAMP,
  password_initialized BOOLEAN DEFAULT FALSE,
  first_login_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour stocker les documents des employés
CREATE TABLE IF NOT EXISTS employee_documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Ajoutez un champ mot de passe à la table employees si ce n'est pas déjà fait
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Ajouter la contrainte d'unicité sur matricule si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'employees_matricule_key' 
    AND table_name = 'employees'
  ) THEN
    ALTER TABLE employees ADD CONSTRAINT employees_matricule_key UNIQUE (matricule);
  END IF;
END $$;

-- Optionnellement, définissez des mots de passe temporaires pour les tests
-- Dans un système réel, vous utiliseriez des mots de passe hachés
UPDATE employees 
SET password = 'password123' 
WHERE password IS NULL;