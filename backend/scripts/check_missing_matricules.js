const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function checkMissingMatricules() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Vérification des matricules manquants...\n');
    
    // Vérifier depart_history
    console.log('📋 Table depart_history:');
    const departHistoryResult = await client.query(`
      SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN matricule IS NULL OR matricule = '' OR matricule = 'N/A' THEN 1 END) as sans_matricule,
          COUNT(CASE WHEN matricule IS NOT NULL AND matricule != '' AND matricule != 'N/A' THEN 1 END) as avec_matricule
      FROM depart_history
    `);
    
    const dhStats = departHistoryResult.rows[0];
    console.log(`   Total: ${dhStats.total}`);
    console.log(`   Avec matricule: ${dhStats.avec_matricule}`);
    console.log(`   Sans matricule: ${dhStats.sans_matricule}`);
    
    if (dhStats.sans_matricule > 0) {
      const missing = await client.query(`
        SELECT id, employee_id, nom_prenom, date_depart
        FROM depart_history
        WHERE matricule IS NULL OR matricule = '' OR matricule = 'N/A'
        LIMIT 5
      `);
      console.log(`   Exemples sans matricule:`);
      missing.rows.forEach(row => {
        console.log(`     - ID: ${row.id}, Employee ID: ${row.employee_id || 'NULL'}, Nom: ${row.nom_prenom || 'N/A'}`);
      });
    }
    
    // Vérifier historique_departs
    console.log('\n📋 Table historique_departs:');
    const historiqueResult = await client.query(`
      SELECT COUNT(*) as total
      FROM historique_departs
    `);
    console.log(`   Total: ${historiqueResult.rows[0].total}`);
    
    // Vérifier combien peuvent être matchés avec employees
    const matchableResult = await client.query(`
      SELECT COUNT(DISTINCT hd.id) as matchable
      FROM historique_departs hd
      INNER JOIN employees e ON (
        LOWER(TRIM(e.nom_prenom)) = LOWER(TRIM(CONCAT(hd.nom, ' ', hd.prenom))) OR
        (LOWER(TRIM(SPLIT_PART(e.nom_prenom, ' ', 1))) = LOWER(TRIM(hd.nom)) AND 
         LOWER(TRIM(SPLIT_PART(e.nom_prenom, ' ', 2))) = LOWER(TRIM(hd.prenom))) OR
        (LOWER(TRIM(SPLIT_PART(e.nom_prenom, ' ', 1))) = LOWER(TRIM(hd.prenom)) AND 
         LOWER(TRIM(SPLIT_PART(e.nom_prenom, ' ', 2))) = LOWER(TRIM(hd.nom))) OR
        (LOWER(TRIM(e.nom_prenom)) LIKE LOWER(TRIM(CONCAT('%', hd.nom, '%'))) AND
         LOWER(TRIM(e.nom_prenom)) LIKE LOWER(TRIM(CONCAT('%', hd.prenom, '%'))))
      )
    `);
    console.log(`   Matchables avec employees: ${matchableResult.rows[0].matchable}`);
    
    // Vérifier les enregistrements qui ont un matricule dans le commentaire
    const withMatriculeInComment = await client.query(`
      SELECT COUNT(*) as total
      FROM historique_departs
      WHERE commentaire ~* 'matricule[:\s]+[A-Z0-9\-]+'
    `);
    console.log(`   Avec matricule dans commentaire: ${withMatriculeInComment.rows[0].total}`);
    
  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkMissingMatricules()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
