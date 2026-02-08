-- Création de la table historique_departs dans PostgreSQL
CREATE TABLE IF NOT EXISTS historique_departs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  departement VARCHAR(100) NOT NULL,
  statut VARCHAR(50) NOT NULL,
  poste VARCHAR(100) NOT NULL,
  date_depart DATE NOT NULL,
  motif_depart VARCHAR(100) NOT NULL,
  commentaire TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index
CREATE INDEX idx_nom_prenom_depart ON historique_departs (nom, prenom);
CREATE INDEX idx_date_depart ON historique_departs (date_depart);
CREATE INDEX idx_departement_depart ON historique_departs (departement);
CREATE INDEX idx_motif_depart ON historique_departs (motif_depart);

-- Fonction pour mettre à jour automatiquement la date de modification
CREATE OR REPLACE FUNCTION update_historique_departs_modtime()
RETURNS TRIGGER AS $$
BEGIN
   NEW.date_modification = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la date de modification
CREATE TRIGGER update_historique_departs_modtime
BEFORE UPDATE ON historique_departs
FOR EACH ROW
EXECUTE FUNCTION update_historique_departs_modtime();

