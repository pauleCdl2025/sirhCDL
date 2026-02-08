-- Table structure for visites_medicales

CREATE TABLE IF NOT EXISTS visites_medicales (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  poste VARCHAR(100) NOT NULL,
  date_derniere_visite DATE NOT NULL,
  date_prochaine_visite DATE NOT NULL,
  statut VARCHAR(50) NOT NULL DEFAULT 'À venir',
  notes TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);