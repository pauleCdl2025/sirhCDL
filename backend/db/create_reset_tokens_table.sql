-- Script pour créer la table des tokens de réinitialisation de mot de passe
-- Exécutez ce script dans votre base de données PostgreSQL

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(20) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP NULL,
    
    -- Contraintes
    CONSTRAINT fk_employee_matricule 
        FOREIGN KEY (matricule) 
        REFERENCES employees(matricule) 
        ON DELETE CASCADE,
    
    -- Index pour améliorer les performances
    CONSTRAINT unique_active_token 
        UNIQUE (matricule, token)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reset_tokens_matricule ON password_reset_tokens(matricule);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Commentaires sur la table
COMMENT ON TABLE password_reset_tokens IS 'Table pour stocker les tokens de réinitialisation de mot de passe';
COMMENT ON COLUMN password_reset_tokens.matricule IS 'Matricule de l''employé demandant la réinitialisation';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token unique pour la réinitialisation';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Date d''expiration du token (1 heure après création)';
COMMENT ON COLUMN password_reset_tokens.created_at IS 'Date de création du token';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Date d''utilisation du token (NULL si non utilisé)';

-- Nettoyage automatique des tokens expirés (optionnel)
-- Vous pouvez créer un job cron pour exécuter cette requête régulièrement
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW();




