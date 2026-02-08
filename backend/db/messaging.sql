-- Script SQL pour créer la table des messages réels
-- Exécuter ce script dans votre base de données PostgreSQL

-- Créer la table des messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('rh', 'employee')),
  receiver_id INTEGER NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  receiver_type VARCHAR(50) NOT NULL CHECK (receiver_type IN ('rh', 'employee')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, receiver_type);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, timestamp);

-- Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_messages_modtime ON messages;
CREATE TRIGGER update_messages_modtime
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE PROCEDURE update_messages_updated_at();

-- Insérer quelques messages de test (optionnel)
INSERT INTO messages (sender_id, sender_name, sender_type, receiver_id, receiver_name, receiver_type, content) VALUES
(1, 'Service RH', 'rh', 1, 'Jean Dupont', 'employee', 'Bonjour Jean, votre demande de congé a été approuvée.'),
(1, 'Jean Dupont', 'employee', 1, 'Service RH', 'rh', 'Merci beaucoup pour l''information !'),
(1, 'Service RH', 'rh', 2, 'Marie Martin', 'employee', 'Bonjour Marie, n''oubliez pas votre visite médicale demain.'),
(2, 'Marie Martin', 'employee', 1, 'Service RH', 'rh', 'D''accord, je serai présente à 14h.');

-- Vérifier que la table a été créée correctement
SELECT 'Table messages créée avec succès' as status;
SELECT COUNT(*) as total_messages FROM messages;




