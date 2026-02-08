-- Création de la table historique_recrutement pour PostgreSQL
CREATE TABLE IF NOT EXISTS historique_recrutement (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  departement VARCHAR(100) NOT NULL,
  motif_recrutement VARCHAR(100) NOT NULL,
  date_recrutement DATE NOT NULL,
  type_contrat VARCHAR(50) NOT NULL,
  poste VARCHAR(100) NOT NULL,
  superieur_hierarchique VARCHAR(100) NOT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cv_path VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL
);

-- Création des index pour améliorer les performances des requêtes
CREATE INDEX idx_nom_prenom ON historique_recrutement(nom, prenom);
CREATE INDEX idx_date_recrutement ON historique_recrutement(date_recrutement);
CREATE INDEX idx_departement ON historique_recrutement(departement);
CREATE INDEX idx_type_contrat ON historique_recrutement(type_contrat);

-- Création d'une fonction pour mettre à jour la date de modification automatiquement
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
   NEW.date_modification = CURRENT_TIMESTAMP; 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Création d'un trigger pour mettre à jour la date de modification
CREATE TRIGGER update_historique_recrutement_date_modification
BEFORE UPDATE ON historique_recrutement
FOR EACH ROW
EXECUTE FUNCTION update_date_modification();