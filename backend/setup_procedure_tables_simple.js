const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
  options: '-c client_encoding=UTF8',
  charset: 'utf8',
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

async function setupProcedureTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Début de la configuration des tables de procédures...');
    
    // 1. Créer la table principale des dossiers
    console.log('📝 Création de la table procedure_dossiers...');
    await client.query(`
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
      )
    `);
    console.log('✅ Table procedure_dossiers créée');
    
    // 2. Créer la table des étapes
    console.log('📝 Création de la table procedure_etapes...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_etapes (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) UNIQUE NOT NULL,
        titre VARCHAR(255) NOT NULL,
        couleur VARCHAR(50) DEFAULT 'primary',
        ordre INTEGER NOT NULL,
        next_step VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_etapes créée');
    
    // 3. Créer la table des documents requis
    console.log('📝 Création de la table procedure_documents_requis...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_documents_requis (
        id SERIAL PRIMARY KEY,
        etape_id INTEGER REFERENCES procedure_etapes(id) ON DELETE CASCADE,
        nom_document VARCHAR(255) NOT NULL,
        description TEXT,
        obligatoire BOOLEAN DEFAULT true,
        ordre INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_documents_requis créée');
    
    // 4. Créer la table des documents soumis
    console.log('📝 Création de la table procedure_documents_soumis...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_documents_soumis (
        id SERIAL PRIMARY KEY,
        dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
        document_requis_id INTEGER REFERENCES procedure_documents_requis(id),
        nom_fichier VARCHAR(255) NOT NULL,
        chemin_fichier VARCHAR(500) NOT NULL,
        taille_fichier INTEGER,
        type_mime VARCHAR(100),
        statut VARCHAR(50) DEFAULT 'en_attente',
        commentaire TEXT,
        date_soumission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_validation TIMESTAMP,
        valide_par INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_documents_soumis créée');
    
    // 5. Créer la table des commentaires
    console.log('📝 Création de la table procedure_commentaires...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_commentaires (
        id SERIAL PRIMARY KEY,
        dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
        admin_id INTEGER,
        commentaire TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'note',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_commentaires créée');
    
    // 6. Créer la table des notifications
    console.log('📝 Création de la table procedure_notifications...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_notifications (
        id SERIAL PRIMARY KEY,
        dossier_id INTEGER REFERENCES procedure_dossiers(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        destinataire VARCHAR(255) NOT NULL,
        sujet VARCHAR(255),
        contenu TEXT,
        statut VARCHAR(50) DEFAULT 'envoye',
        date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_reception TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_notifications créée');
    
    // 7. Créer la table des statistiques
    console.log('📝 Création de la table procedure_statistiques...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS procedure_statistiques (
        id SERIAL PRIMARY KEY,
        date_statistique DATE DEFAULT CURRENT_DATE,
        total_dossiers INTEGER DEFAULT 0,
        nouveaux_dossiers INTEGER DEFAULT 0,
        en_cours INTEGER DEFAULT 0,
        completes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table procedure_statistiques créée');
    
    // 8. Créer les index
    console.log('📝 Création des index...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_email ON procedure_dossiers(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_statut ON procedure_dossiers(statut)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_dossiers_date_creation ON procedure_dossiers(date_creation)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_documents_soumis_dossier_id ON procedure_documents_soumis(dossier_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_commentaires_dossier_id ON procedure_commentaires(dossier_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_procedure_notifications_dossier_id ON procedure_notifications(dossier_id)');
    console.log('✅ Index créés');
    
    // 9. Insérer les étapes de procédure
    console.log('📝 Insertion des étapes de procédure...');
    await client.query(`
      INSERT INTO procedure_etapes (nom, titre, couleur, ordre, next_step, description) VALUES
      ('nouveau', 'Dossier créé', 'primary', 1, 'authentification', 'Dossier initial créé par l''administrateur'),
      ('authentification', 'Authentification des diplômes', 'warning', 2, 'homologation', 'Vérification et authentification des diplômes par l''ambassade'),
      ('homologation', 'Demande d''homologation', 'info', 3, 'cnom', 'Demande d''homologation des diplômes'),
      ('cnom', 'Enregistrement CNOM', 'purple', 4, 'autorisation_exercer', 'Enregistrement au Conseil National de l''Ordre des Médecins'),
      ('autorisation_exercer', 'Autorisation d''exercer', 'success', 5, 'autorisation_travail', 'Autorisation d''exercer la médecine'),
      ('autorisation_travail', 'Autorisation de travail', 'success', 6, NULL, 'Autorisation de travail finale')
      ON CONFLICT (nom) DO NOTHING
    `);
    console.log('✅ Étapes de procédure insérées');
    
    // 10. Insérer les documents requis
    console.log('📝 Insertion des documents requis...');
    await client.query(`
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
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Documents requis insérés');
    
    // 11. Insérer les dossiers de test
    console.log('📝 Insertion des dossiers de test...');
    await client.query(`
      INSERT INTO procedure_dossiers (nom, prenom, email, telephone, nationalite, specialite, universite, diplome_pays, statut, commentaire) VALUES
      ('Dupont', 'Jean', 'jean.dupont@example.com', '+33 6 12 34 56 78', 'Française', 'Cardiologie', 'Université Paris Descartes', 'France', 'authentification', 'Dossier en cours d''authentification'),
      ('Smith', 'John', 'john.smith@example.com', '+44 7911 123456', 'Britannique', 'Neurologie', 'Imperial College London', 'Royaume-Uni', 'homologation', 'Demande d''homologation en cours'),
      ('Diallo', 'Mamadou', 'mamadou.diallo@example.com', '+221 77 123 45 67', 'Sénégalaise', 'Pédiatrie', 'Université Cheikh Anta Diop', 'Sénégal', 'nouveau', 'Nouveau dossier créé'),
      ('Morin', 'Sophie', 'sophie.morin@example.com', '+33 6 98 76 54 32', 'Française', 'Dermatologie', 'Université Lyon 1', 'France', 'cnom', 'Enregistrement CNOM en cours'),
      ('Garcia', 'Maria', 'maria.garcia@example.com', '+34 612 345 678', 'Espagnole', 'Gynécologie', 'Université de Barcelone', 'Espagne', 'autorisation_exercer', 'Autorisation d''exercer en cours'),
      ('Kone', 'Fatou', 'fatou.kone@example.com', '+225 07 12 34 56 78', 'Ivoirienne', 'Psychiatrie', 'Université Félix Houphouët-Boigny', 'Côte d''Ivoire', 'autorisation_travail', 'Dossier complet')
      ON CONFLICT (email) DO NOTHING
    `);
    console.log('✅ Dossiers de test insérés');
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const dossiersResult = await client.query('SELECT COUNT(*) as count FROM procedure_dossiers');
    const etapesResult = await client.query('SELECT COUNT(*) as count FROM procedure_etapes');
    const documentsResult = await client.query('SELECT COUNT(*) as count FROM procedure_documents_requis');
    
    console.log(`📋 ${dossiersResult.rows[0].count} dossiers créés`);
    console.log(`📋 ${etapesResult.rows[0].count} étapes de procédure créées`);
    console.log(`📋 ${documentsResult.rows[0].count} documents requis créés`);
    
    console.log('\n🎉 Configuration des tables de procédures terminée avec succès!');
    console.log('🚀 Le système de suivi des procédures est maintenant prêt à être utilisé.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
setupProcedureTables()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });







