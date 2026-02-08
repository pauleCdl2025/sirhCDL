-- Script pour créer les tables de suivi des procédures médicales
-- Base de données: rh_portal

-- Table principale des dossiers de procédure
CREATE TABLE IF NOT EXISTS procedure_dossiers (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    nationalite VARCHAR(100),
    specialite VARCHAR(100),
    universite VARCHAR(255),
    diplome_pays VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'nouveau',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT,
    lien_acces VARCHAR(500),
    token_acces VARCHAR(255),
    date_expiration_token TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des étapes de procédure
CREATE TABLE IF NOT EXISTS procedure_etapes (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    couleur VARCHAR(50) DEFAULT 'primary',
    ordre INTEGER NOT NULL,
    next_step VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents requis par étape
CREATE TABLE IF NOT EXISTS procedure_documents_requis (
    id SERIAL PRIMARY KEY,
    etape_id INTEGER REFERENCES procedure_etapes(id) ON DELETE CASCADE,
    nom_document VARCHAR(255) NOT NULL,
    description TEXT,
    obligatoire BOOLEAN DEFAULT true,
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents soumis par les médecins
CREATE TABLE IF NOT EXISTS procedure_documents_soumis (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
    document_requis_id INTEGER REFERENCES procedure_documents_requis(id),
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    taille_fichier INTEGER,
    type_mime VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_attente', -- en_attente, approuve, rejete
    commentaire TEXT,
    date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    valide_par INTEGER, -- ID de l'admin qui a validé
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commentaires et notes sur les dossiers
CREATE TABLE IF NOT EXISTS procedure_commentaires (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
    admin_id INTEGER, -- ID de l'admin qui a ajouté le commentaire
    commentaire TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'note', -- note, avertissement, validation
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications envoyées
CREATE TABLE IF NOT EXISTS procedure_notifications (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- email, sms, lien_acces
    destinataire VARCHAR(255) NOT NULL,
    sujet VARCHAR(255),
    contenu TEXT,
    statut VARCHAR(50) DEFAULT 'envoye', -- envoye, echec, en_attente
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_reception TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des statistiques
CREATE TABLE IF NOT EXISTS procedure_statistiques (
    id SERIAL PRIMARY KEY,
    date_statistique DATE DEFAULT CURRENT_DATE,
    total_dossiers INTEGER DEFAULT 0,
    nouveaux_dossiers INTEGER DEFAULT 0,
    en_cours INTEGER DEFAULT 0,
    completes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des étapes de procédure par défaut
INSERT INTO procedure_etapes (nom, titre, couleur, ordre, next_step, description) VALUES
('nouveau', 'Dossier créé', 'primary', 1, 'authentification', 'Dossier initial créé par l''administrateur'),
('authentification', 'Authentification des diplômes', 'warning', 2, 'homologation', 'Vérification et authentification des diplômes par l''ambassade'),
('homologation', 'Demande d''homologation', 'info', 3, 'cnom', 'Demande d''homologation des diplômes'),
('cnom', 'Enregistrement CNOM', 'purple', 4, 'autorisation_exercer', 'Enregistrement au Conseil National de l''Ordre des Médecins'),
('autorisation_exercer', 'Autorisation d''exercer', 'success', 5, 'autorisation_travail', 'Autorisation d''exercer la médecine'),
('autorisation_travail', 'Autorisation de travail', 'success', 6, NULL, 'Autorisation de travail finale')
ON CONFLICT (nom) DO NOTHING;

-- Insertion des documents requis par étape
INSERT INTO procedure_documents_requis (etape_id, nom_document, description, obligatoire, ordre) VALUES
((SELECT id FROM procedure_etapes WHERE nom = 'nouveau'), 'diplome', 'Diplôme de médecine (original et copie)', true, 1),
((SELECT id FROM procedure_etapes WHERE nom = 'nouveau'), 'piece_identite', 'Pièce d''identité (passeport)', true, 2),
((SELECT id FROM procedure_etapes WHERE nom = 'nouveau'), 'releves_notes', 'Relevés de notes', true, 3),
((SELECT id FROM procedure_etapes WHERE nom = 'nouveau'), 'acte_naissance', 'Acte de naissance', true, 4),
((SELECT id FROM procedure_etapes WHERE nom = 'authentification'), 'diplome_authentifie', 'Diplômes authentifiés par l''ambassade', true, 1),
((SELECT id FROM procedure_etapes WHERE nom = 'authentification'), 'attestation_ambassade', 'Attestation d''authentification', true, 2),
((SELECT id FROM procedure_etapes WHERE nom = 'homologation'), 'demande_homologation', 'Demande d''homologation complète', true, 1),
((SELECT id FROM procedure_etapes WHERE nom = 'homologation'), 'attestation_homologation', 'Attestation d''homologation', true, 2),
((SELECT id FROM procedure_etapes WHERE nom = 'cnom'), 'inscription_cnom', 'Inscription au CNOM', true, 1),
((SELECT id FROM procedure_etapes WHERE nom = 'cnom'), 'carte_professionnelle', 'Carte professionnelle', true, 2),
((SELECT id FROM procedure_etapes WHERE nom = 'autorisation_exercer'), 'autorisation_exercer', 'Autorisation d''exercer', true, 1),
((SELECT id FROM procedure_etapes WHERE nom = 'autorisation_travail'), 'autorisation_travail', 'Autorisation de travail', true, 1)
ON CONFLICT DO NOTHING;

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_email ON procedure_dossiers(email);
CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_statut ON procedure_dossiers(statut);
CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_date_creation ON procedure_dossiers(date_creation);
CREATE INDEX IF NOT EXISTS idx_procedure_documents_soumis_dossier_id ON procedure_documents_soumis(dossier_id);
CREATE INDEX IF NOT EXISTS idx_procedure_commentaires_dossier_id ON procedure_commentaires(dossier_id);
CREATE INDEX IF NOT EXISTS idx_procedure_notifications_dossier_id ON procedure_notifications(dossier_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_procedure_dossiers_updated_at 
    BEFORE UPDATE ON procedure_dossiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les statistiques
CREATE OR REPLACE FUNCTION calculer_statistiques_procedure()
RETURNS TABLE(
    total INTEGER,
    nouveaux INTEGER,
    en_cours INTEGER,
    completes INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total,
        COUNT(CASE WHEN statut = 'nouveau' THEN 1 END)::INTEGER as nouveaux,
        COUNT(CASE WHEN statut IN ('authentification', 'homologation', 'cnom', 'autorisation_exercer') THEN 1 END)::INTEGER as en_cours,
        COUNT(CASE WHEN statut = 'autorisation_travail' THEN 1 END)::INTEGER as completes
    FROM procedure_dossiers;
END;
$$ LANGUAGE plpgsql;

-- Insertion de quelques dossiers de test
INSERT INTO procedure_dossiers (nom, prenom, email, telephone, nationalite, specialite, universite, diplome_pays, statut, commentaire) VALUES
('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Française', 'Cardiologie', 'Université Paris Descartes', 'France', 'authentification', 'Dossier en cours d''authentification'),
('Smith', 'John', 'john.smith@example.com', '+44 7911 123456', 'Britannique', 'Neurologie', 'Imperial College London', 'Royaume-Uni', 'homologation', 'Demande d''homologation en cours'),
('Diallo', 'Mamadou', 'mamadou.diallo@example.com', '+221 77 123 45 67', 'Sénégalaise', 'Pédiatrie', 'Université Cheikh Anta Diop', 'Sénégal', 'nouveau', 'Nouveau dossier créé'),
('Morin', 'Sophie', 'sophie.morin@example.com', '+33 6 98 76 54 32', 'Française', 'Dermatologie', 'Université Lyon 1', 'France', 'cnom', 'Enregistrement CNOM en cours'),
('Garcia', 'Maria', 'maria.garcia@example.com', '+34 612 345 678', 'Espagnole', 'Gynécologie', 'Université de Barcelone', 'Espagne', 'autorisation_exercer', 'Autorisation d''exercer en cours'),
('Kone', 'Fatou', 'fatou.kone@example.com', '+225 07 12 34 56 78', 'Ivoirienne', 'Psychiatrie', 'Université Félix Houphouët-Boigny', 'Côte d''Ivoire', 'autorisation_travail', 'Dossier complet')
ON CONFLICT (email) DO NOTHING;

COMMIT;







