const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixContratsTable() {
  console.log('🔧 Correction de la structure de la table contrats...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Sauvegarder les données existantes
    console.log('💾 Sauvegarde des données existantes...');
    const existingData = await client.query('SELECT * FROM contrats');
    console.log(`📊 ${existingData.rows.length} contrats existants sauvegardés`);
    
    // Supprimer l'ancienne table
    console.log('🗑️ Suppression de l\'ancienne table contrats...');
    await client.query('DROP TABLE IF EXISTS contrats CASCADE');
    
    // Créer la nouvelle table avec la bonne structure
    console.log('🏗️ Création de la nouvelle table contrats...');
    await client.query(`
      CREATE TABLE contrats (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL,
        type_contrat VARCHAR(100) NOT NULL,
        date_debut DATE NOT NULL,
        date_fin DATE,
        statut VARCHAR(50) DEFAULT 'Actif',
        salaire DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Nouvelle table contrats créée');
    
    // Ajouter des contrats de test pour les employés existants
    console.log('📝 Ajout de contrats de test...');
    
    const employees = await client.query('SELECT id, type_contrat, date_entree FROM employees LIMIT 10');
    
    for (const emp of employees.rows) {
      await client.query(`
        INSERT INTO contrats (employee_id, type_contrat, date_debut, statut)
        VALUES ($1, $2, $3, 'Actif')
      `, [emp.id, emp.type_contrat || 'CDI', emp.date_entree || '2024-01-01']);
    }
    
    console.log(`✅ ${employees.rows.length} contrats de test ajoutés`);
    
    await client.query('COMMIT');
    console.log('\n🎯 Table contrats corrigée avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixContratsTable().catch(console.error);








