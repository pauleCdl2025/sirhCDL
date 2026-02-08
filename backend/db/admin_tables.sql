-- Table pour l'historique de connexion
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL, -- 'rh', 'employee', 'admin'
  user_id VARCHAR(255) NOT NULL, -- email pour RH/Admin, matricule pour employé
  email VARCHAR(255),
  matricule VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'blocked'
  failure_reason TEXT, -- Raison en cas d'échec
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  session_duration INTEGER, -- Durée en secondes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_login_history_user_type ON login_history(user_type);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history(email);
CREATE INDEX IF NOT EXISTS idx_login_history_matricule ON login_history(matricule);

-- Table d'audit pour tracer toutes les actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'password_reset', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'employee', 'contract', 'document', etc.
  entity_id VARCHAR(255) NOT NULL, -- ID de l'entité concernée
  entity_name VARCHAR(255), -- Nom/description de l'entité pour faciliter la lecture
  user_type VARCHAR(20) NOT NULL, -- 'admin', 'rh', 'employee'
  user_id VARCHAR(255) NOT NULL, -- ID de l'utilisateur qui a effectué l'action
  user_email VARCHAR(255),
  changes JSONB, -- Anciennes et nouvelles valeurs (format JSON)
  description TEXT, -- Description textuelle de l'action
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed', 'error'
  error_message TEXT, -- Message d'erreur si échec
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type ON audit_logs(user_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_action ON audit_logs(entity_type, action_type);

-- Table pour les utilisateurs RH (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255), -- ID de l'admin qui a créé le compte
  updated_by VARCHAR(255) -- ID de l'admin qui a modifié le compte
);

-- Index pour les utilisateurs RH
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

