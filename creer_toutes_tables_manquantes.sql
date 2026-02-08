-- Script pour créer toutes les tables manquantes
-- Exécutez ce script dans votre base de données PostgreSQL

-- 1. Table des sanctions
CREATE TABLE IF NOT EXISTS sanctions_table (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    sanction_type VARCHAR(100) NOT NULL,
    description TEXT,
    sanction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des contrats
CREATE TABLE IF NOT EXISTS contrats (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    type_contrat VARCHAR(100) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(50) DEFAULT 'actif',
    salaire DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table des congés
CREATE TABLE IF NOT EXISTS conges (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    type_conge VARCHAR(100) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut VARCHAR(50) DEFAULT 'en_attente',
    motif TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table des absences
CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    type_absence VARCHAR(100) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    motif TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table des recrutements
CREATE TABLE IF NOT EXISTS recrutements (
    id SERIAL PRIMARY KEY,
    poste VARCHAR(200) NOT NULL,
    candidat_nom VARCHAR(100),
    candidat_prenom VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_cours',
    date_candidature DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table des départs
CREATE TABLE IF NOT EXISTS departs (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    type_depart VARCHAR(100) NOT NULL,
    date_depart DATE NOT NULL,
    motif TEXT,
    statut VARCHAR(50) DEFAULT 'en_cours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table des performances
CREATE TABLE IF NOT EXISTS performances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    periode VARCHAR(50) NOT NULL,
    note DECIMAL(3,1),
    commentaires TEXT,
    evaluateur VARCHAR(100),
    date_evaluation DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Table des demandes employés
CREATE TABLE IF NOT EXISTS demandes_employes (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER,
    type_demande VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    statut VARCHAR(50) DEFAULT 'en_attente',
    date_demande DATE DEFAULT CURRENT_DATE,
    reponse TEXT,
    date_reponse DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table des événements
CREATE TABLE IF NOT EXISTS evenements (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    date_evenement DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    lieu VARCHAR(200),
    type_evenement VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'planifie',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Table des notes de service
CREATE TABLE IF NOT EXISTS notes_service (
    id SERIAL PRIMARY KEY,
    numero_note VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    categorie VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'brouillon',
    est_public BOOLEAN DEFAULT false,
    auteur VARCHAR(100),
    date_creation DATE DEFAULT CURRENT_DATE,
    date_publication DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer quelques données de test
INSERT INTO sanctions_table (employee_id, sanction_type, description) VALUES
(1, 'Avertissement', 'Retard répété au travail')
ON CONFLICT DO NOTHING;

INSERT INTO contrats (employee_id, type_contrat, date_debut, salaire) VALUES
(1, 'CDI', '2025-01-01', 2500.00)
ON CONFLICT DO NOTHING;

INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, motif) VALUES
(1, 'Congés payés', '2025-07-01', '2025-07-15', 'Vacances d''été')
ON CONFLICT DO NOTHING;

INSERT INTO recrutements (poste, candidat_nom, candidat_prenom, statut) VALUES
('Développeur Full-Stack', 'Dupont', 'Marie', 'en_cours')
ON CONFLICT DO NOTHING;

-- Vérifier les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'sanctions_table', 'contrats', 'conges', 'absences', 
    'recrutements', 'departs', 'performances', 'demandes_employes',
    'evenements', 'notes_service'
)
ORDER BY table_name;








