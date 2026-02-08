-- Création de la table d'historique des contrats
-- Cette table permet de tracer toutes les actions effectuées sur les contrats

CREATE TABLE IF NOT EXISTS contrat_history (
    id SERIAL PRIMARY KEY,
    contrat_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    user_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT fk_contrat_history_contrat 
        FOREIGN KEY (contrat_id) 
        REFERENCES contrats(id) 
        ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contrat_history_contrat_id ON contrat_history(contrat_id);
CREATE INDEX IF NOT EXISTS idx_contrat_history_timestamp ON contrat_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_contrat_history_action ON contrat_history(action);

-- Commentaires sur la table
COMMENT ON TABLE contrat_history IS 'Historique des actions effectuées sur les contrats';
COMMENT ON COLUMN contrat_history.id IS 'Identifiant unique de l''entrée d''historique';
COMMENT ON COLUMN contrat_history.contrat_id IS 'ID du contrat concerné';
COMMENT ON COLUMN contrat_history.action IS 'Type d''action effectuée (create, update, delete, send, download, etc.)';
COMMENT ON COLUMN contrat_history.description IS 'Description détaillée de l''action';
COMMENT ON COLUMN contrat_history.user_name IS 'Nom de l''utilisateur qui a effectué l''action';
COMMENT ON COLUMN contrat_history.timestamp IS 'Date et heure de l''action';

-- Insertion de données d'exemple (optionnel)
-- INSERT INTO contrat_history (contrat_id, action, description, user_name) VALUES
-- (1, 'create', 'Contrat créé dans le système', 'Système'),
-- (1, 'update', 'Informations du contrat mises à jour', 'Admin RH'),
-- (1, 'send', 'Contrat envoyé à l''employé', 'Système');











