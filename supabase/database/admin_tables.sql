-- Tables d'administration pour Supabase
-- Exécuter dans le SQL Editor de Supabase si non présentes

-- Table pour l'historique de connexion
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  matricule VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_status VARCHAR(20) NOT NULL,
  failure_reason TEXT,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,
  session_duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_type ON login_history(user_type);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time DESC);

-- Table pour les utilisateurs RH
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
