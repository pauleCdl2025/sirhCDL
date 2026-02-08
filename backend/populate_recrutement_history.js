const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function populateRecrutementHistory() {
  console.log('🔧 Peuplement de la table recrutement_history...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Vérifier combien d'enregistrements existent déjà
    const existingCount = await client.query('SELECT COUNT(*) FROM recrutement_history');
    console.log(`📊 Enregistrements existants: ${existingCount.rows[0].count}`);
    
    if (parseInt(existingCount.rows[0].count) > 0) {
      console.log('ℹ️ La table contient déjà des données');
      
      // Afficher quelques exemples
      const examples = await client.query('SELECT * FROM recrutement_history LIMIT 3');
      console.log('📋 Exemples d\'enregistrements:');
      examples.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. Employé ID: ${row.employee_id}, Statut: ${row.statut}, Date: ${row.date_recrutement}`);
      });
    } else {
      console.log('🏗️ Création d\'enregistrements de test...');
      
      // Récupérer les employés existants
      const employees = await client.query(`
        SELECT id, type_contrat, date_entree, poste_actuel 
        FROM employees 
        LIMIT 20
      `);
      
      console.log(`📝 Ajout d'enregistrements pour ${employees.rows.length} employés...`);
      
      for (const emp of employees.rows) {
        await client.query(`
          INSERT INTO recrutement_history (
            employee_id, 
            date_recrutement, 
            poste_recrute, 
            type_contrat, 
            statut, 
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          emp.id,
          emp.date_entree || '2024-01-01',
          emp.poste_actuel || 'Poste non spécifié',
          emp.type_contrat || 'CDI',
          'Recruté',
          new Date(),
          new Date()
        ]);
      }
      
      console.log(`✅ ${employees.rows.length} enregistrements créés dans recrutement_history`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎯 Table recrutement_history prête !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors du peuplement:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

populateRecrutementHistory().catch(console.error);








