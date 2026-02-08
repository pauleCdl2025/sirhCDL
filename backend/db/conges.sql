

CREATE TABLE IF NOT EXISTS conges (
  id SERIAL PRIMARY KEY,
  nom_employe VARCHAR(255) NOT NULL,
  service VARCHAR(255),
  poste VARCHAR(255),
  date_embauche DATE,
  jours_conges_annuels INTEGER,
  date_demande DATE DEFAULT CURRENT_DATE,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  motif TEXT,
  date_retour DATE,
  jours_pris INTEGER,
  jours_restants INTEGER,
  date_prochaine_attribution DATE,
  type_conge VARCHAR(50) DEFAULT 'Congé payé',
  statut VARCHAR(20) DEFAULT 'En attente',
  date_traitement TIMESTAMP,
  document_path VARCHAR(255)
);

-- Création d'un index sur le nom de l'employé pour des recherches plus rapides
CREATE INDEX idx_conges_employee ON conges (nom_employe);

-- Création d'un index sur le statut pour filtrer facilement par statut
CREATE INDEX idx_conges_status ON conges (statut);

-- Fonction pour mettre à jour automatiquement le timestamp de modification
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.date_traitement = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement date_traitement lorsque le statut change
CREATE TRIGGER update_conges_status_change
BEFORE UPDATE ON conges
FOR EACH ROW
WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
EXECUTE PROCEDURE update_modified_column();