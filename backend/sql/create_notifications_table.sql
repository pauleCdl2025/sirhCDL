-- Création de la table des notifications pour les employés
-- Cette table permet d'envoyer des messages et contrats aux employés

CREATE TABLE IF NOT EXISTS employee_notifications (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'contract', 'message', 'alert', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB, -- Données supplémentaires (contrat, fichier, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Contraintes
    CONSTRAINT fk_employee_notifications_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_employee_notifications_employee_id ON employee_notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_notifications_type ON employee_notifications(type);
CREATE INDEX IF NOT EXISTS idx_employee_notifications_is_read ON employee_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_employee_notifications_created_at ON employee_notifications(created_at);

-- Commentaires sur la table
COMMENT ON TABLE employee_notifications IS 'Notifications envoyées aux employés (contrats, messages, alertes)';
COMMENT ON COLUMN employee_notifications.id IS 'Identifiant unique de la notification';
COMMENT ON COLUMN employee_notifications.employee_id IS 'ID de l\'employé destinataire';
COMMENT ON COLUMN employee_notifications.type IS 'Type de notification (contract, message, alert)';
COMMENT ON COLUMN employee_notifications.title IS 'Titre de la notification';
COMMENT ON COLUMN employee_notifications.message IS 'Message de la notification';
COMMENT ON COLUMN employee_notifications.data IS 'Données supplémentaires au format JSON';
COMMENT ON COLUMN employee_notifications.is_read IS 'Indique si la notification a été lue';
COMMENT ON COLUMN employee_notifications.created_at IS 'Date et heure de création de la notification';
COMMENT ON COLUMN employee_notifications.read_at IS 'Date et heure de lecture de la notification';











