const pool = require('./db');

async function createHRTasksTable() {
  try {
    console.log('🔍 Connexion à la base de données...');
    
    // Créer la table des tâches RH
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS hr_tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'Moyenne',
        status VARCHAR(50) DEFAULT 'Planifié',
        assigned_to VARCHAR(255) NOT NULL,
        due_date DATE NOT NULL,
        category VARCHAR(100) DEFAULT 'Général',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ Table hr_tasks créée ou déjà existante');
    
    // Insérer des données d'exemple
    const insertDataQuery = `
      INSERT INTO hr_tasks (title, description, priority, status, assigned_to, due_date, category)
      VALUES 
        ('Mise à jour des contrats', 'Vérifier et mettre à jour les contrats arrivant à expiration dans les 3 mois', 'Haute', 'En cours', 'Marie Martin', '2025-01-25', 'Contrats'),
        ('Formation sécurité', 'Organiser la formation sécurité pour les nouveaux employés du mois de janvier', 'Moyenne', 'Planifié', 'Pierre Durand', '2025-01-30', 'Formation'),
        ('Évaluation des performances', 'Finaliser les évaluations de fin d''année pour tous les employés', 'Haute', 'Terminé', 'Sophie Bernard', '2025-01-15', 'Performance'),
        ('Recrutement développeur', 'Lancer le processus de recrutement pour un poste de développeur senior', 'Haute', 'En cours', 'Thomas Moreau', '2025-02-10', 'Recrutement'),
        ('Mise à jour des procédures', 'Réviser et mettre à jour les procédures RH internes', 'Basse', 'Planifié', 'Claire Dubois', '2025-02-15', 'Procédures'),
        ('Gestion des congés', 'Traiter les demandes de congés en attente et planifier les remplacements', 'Moyenne', 'En cours', 'Anne Rousseau', '2025-01-28', 'Congés'),
        ('Audit des dossiers', 'Effectuer un audit complet des dossiers employés pour la conformité', 'Haute', 'Planifié', 'Marc Dubois', '2025-02-20', 'Conformité'),
        ('Formation managers', 'Préparer la session de formation des nouveaux managers', 'Moyenne', 'Planifié', 'Julie Martin', '2025-02-05', 'Formation')
      ON CONFLICT DO NOTHING
    `;
    
    const result = await pool.query(insertDataQuery);
    console.log(`✅ ${result.rowCount} tâches RH d'exemple insérées`);
    
    // Vérifier le contenu
    const checkQuery = await pool.query('SELECT COUNT(*) FROM hr_tasks');
    console.log(`📊 Total des tâches RH dans la table : ${checkQuery.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table :', error.message);
  } finally {
    await pool.end();
    console.log('🔌 Connexion à la base de données fermée');
  }
}

// Exécuter le script
createHRTasksTable();








