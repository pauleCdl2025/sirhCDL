-- Création de la table contrats avec une structure équivalente à celle de MySQL
CREATE TABLE IF NOT EXISTS contrats (
  id SERIAL PRIMARY KEY,
  nom_employe VARCHAR(255) NOT NULL,
  type_contrat VARCHAR(100) NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE DEFAULT NULL,
  poste VARCHAR(255) DEFAULT '',
  service VARCHAR(255) DEFAULT '',
  contrat_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création d'un index unique sur nom_employe
CREATE UNIQUE INDEX idx_unique_employee ON contrats (nom_employe);

-- Ajouter une contrainte pour nom_employe
ALTER TABLE contrats ADD CONSTRAINT unique_employee UNIQUE (nom_employe);

-- Note: Les données peuvent être importées à l'aide d'un outil d'importation ou
-- de scripts INSERT similaires à ceux fournis dans le dump MySQL.

-- Si nécessaire, vous pouvez ajouter une fonction et un trigger pour mettre à jour
-- automatiquement le champ updated_at lors des modifications
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contrats_modtime
BEFORE UPDATE ON contrats
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();