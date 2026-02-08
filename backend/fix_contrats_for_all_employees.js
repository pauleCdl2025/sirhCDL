const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixContratsForAllEmployees() {
  console.log('🔧 Correction des contrats pour tous les employés...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Vérifier combien de contrats existent
    const contratsCount = await client.query('SELECT COUNT(*) FROM contrats');
    console.log(`📊 Contrats existants: ${contratsCount.rows[0].count}`);
    
    // 2. Vérifier combien d'employés ont des contrats
    const employeesWithContrats = await client.query(`
      SELECT COUNT(DISTINCT e.id) 
      FROM employees e 
      LEFT JOIN contrats c ON e.id = c.employee_id 
      WHERE c.id IS NOT NULL
    `);
    console.log(`👥 Employés avec contrats: ${employeesWithContrats.rows[0].count}`);
    
    // 3. Récupérer tous les employés qui n'ont pas de contrats
    const employeesWithoutContrats = await client.query(`
      SELECT e.id, e.nom_prenom, e.type_contrat, e.date_entree, e.poste_actuel
      FROM employees e 
      LEFT JOIN contrats c ON e.id = c.employee_id 
      WHERE c.id IS NULL
      ORDER BY e.id
    `);
    
    console.log(`📝 Employés sans contrats: ${employeesWithoutContrats.rows.length}`);
    
    if (employeesWithoutContrats.rows.length > 0) {
      console.log('\n🏗️ Création des contrats manquants...');
      
      for (const emp of employeesWithoutContrats.rows) {
        await client.query(`
          INSERT INTO contrats (
            employee_id, 
            type_contrat, 
            date_debut, 
            statut, 
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          emp.id,
          emp.type_contrat || 'CDI',
          emp.date_entree || '2024-01-01',
          'Actif',
          new Date(),
          new Date()
        ]);
        
        console.log(`   ✅ Contrat créé pour ${emp.nom_prenom} (ID: ${emp.id})`);
      }
      
      console.log(`\n🎯 ${employeesWithoutContrats.rows.length} contrats créés`);
    } else {
      console.log('\n✅ Tous les employés ont déjà des contrats');
    }
    
    // 4. Vérification finale
    const finalContratsCount = await client.query('SELECT COUNT(*) FROM contrats');
    console.log(`\n📊 Total des contrats après correction: ${finalContratsCount.rows[0].count}`);
    
    await client.query('COMMIT');
    console.log('\n🎉 Correction des contrats terminée !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixContratsForAllEmployees().catch(console.error);








