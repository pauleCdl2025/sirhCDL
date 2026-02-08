-- Script pour vérifier et créer la table des sanctions
-- Exécutez ce script dans votre base de données PostgreSQL

-- 1. Vérifier si la table existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'sanctions_table'
);

-- 2. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS sanctions_table (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    sanction_type VARCHAR(100) NOT NULL,
    description TEXT,
    sanction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sanctions_employee_id ON sanctions_table(employee_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_date ON sanctions_table(sanction_date);

-- 4. Insérer quelques données de test
INSERT INTO sanctions_table (employee_id, sanction_type, description, sanction_date) VALUES
(1, 'Avertissement', 'Retard répété au travail', '2025-01-15'),
(1, 'Suspension', 'Non-respect des règles de sécurité', '2025-01-20')
ON CONFLICT DO NOTHING;

-- 5. Vérifier le contenu
SELECT 
    s.*,
    e.nom as employee_name,
    e.prenom as employee_firstname
FROM sanctions_table s
LEFT JOIN employees e ON s.employee_id = e.id
ORDER BY s.sanction_date DESC;
