const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function createTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Création des tables manquantes...');
    
    // 1. Table des sanctions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sanctions_table (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER,
        sanction_type VARCHAR(100) NOT NULL,
        description TEXT,
        sanction_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table sanctions_table créée');
    
    // 2. Table des contrats
    await client.query(`
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
    `);
    console.log('✅ Table contrats créée');
    
    // 3. Table des congés
    await client.query(`
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
    `);
    console.log('✅ Table conges créée');
    
    // 4. Table des absences
    await client.query(`
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
    `);
    console.log('✅ Table absences créée');
    
    // 5. Table des recrutements
    await client.query(`
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
    `);
    console.log('✅ Table recrutements créée');
    
    // 6. Table des départs
    await client.query(`
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
    `);
    console.log('✅ Table departs créée');
    
    // 7. Table des performances
    await client.query(`
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
    `);
    console.log('✅ Table performances créée');
    
    // 8. Table des demandes employés
    await client.query(`
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
    `);
    console.log('✅ Table demandes_employes créée');
    
    // 9. Table des événements
    await client.query(`
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
    `);
    console.log('✅ Table evenements créée');
    
    // 10. Table des notes de service
    await client.query(`
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
    `);
    console.log('✅ Table notes_service créée');
    
    // Insérer quelques données de test
    await client.query(`
      INSERT INTO sanctions_table (employee_id, sanction_type, description) VALUES
      (1, 'Avertissement', 'Retard répété au travail')
      ON CONFLICT DO NOTHING;
    `);
    
    await client.query(`
      INSERT INTO contrats (employee_id, type_contrat, date_debut, salaire) VALUES
      (1, 'CDI', '2025-01-01', 2500.00)
      ON CONFLICT DO NOTHING;
    `);
    
    await client.query(`
      INSERT INTO conges (employee_id, type_conge, date_debut, date_fin, motif) VALUES
      (1, 'Congés payés', '2025-07-01', '2025-07-15', 'Vacances d''été')
      ON CONFLICT DO NOTHING;
    `);
    
    await client.query(`
      INSERT INTO recrutements (poste, candidat_nom, candidat_prenom, statut) VALUES
      ('Développeur Full-Stack', 'Dupont', 'Marie', 'en_cours')
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('✅ Données de test insérées');
    
    // Vérifier les tables créées
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'sanctions_table', 'contrats', 'conges', 'absences', 
        'recrutements', 'departs', 'performances', 'demandes_employes',
        'evenements', 'notes_service'
      )
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables créées avec succès:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables().catch(console.error);








