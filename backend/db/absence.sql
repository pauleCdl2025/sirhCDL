
CREATE TABLE IF NOT EXISTS absence (
  id SERIAL PRIMARY KEY,
  nom_employe VARCHAR(255) NOT NULL,
  service VARCHAR(255),
  poste VARCHAR(255),
  type_absence VARCHAR(100),
  motif TEXT,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  statut VARCHAR(20) DEFAULT 'En attente',
  date_traitement TIMESTAMP,
  document_path VARCHAR(255),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_retour DATE,
  remuneration VARCHAR(50),
  date_modification TIMESTAMP
);

-- Création d'un index sur nom_employe pour accélérer les recherches
CREATE INDEX idx_absences_employe ON absence(nom_employe);

-- Création d'un index sur date_debut pour faciliter les requêtes par date
CREATE INDEX idx_absences_date ON absence(date_debut);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_absence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   NEW.date_modification = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement les timestamps
CREATE TRIGGER update_absence_timestamp
BEFORE UPDATE ON absence
FOR EACH ROW
EXECUTE PROCEDURE update_absence_timestamp();