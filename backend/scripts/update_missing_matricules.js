const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function updateMissingMatricules() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Mise à jour des matricules manquants dans depart_history...');
    
    // Mettre à jour les enregistrements de depart_history qui n'ont pas de matricule
    // mais ont un employee_id valide
    const updateResult = await client.query(`
      UPDATE depart_history dh
      SET 
          matricule = e.matricule,
          nom_prenom = COALESCE(dh.nom_prenom, e.nom_prenom),
          poste_actuel = COALESCE(dh.poste_actuel, e.poste_actuel),
          departement = COALESCE(dh.departement, e.departement, e.functional_area),
          statut = COALESCE(dh.statut, e.type_contrat),
          email = COALESCE(dh.email, e.email),
          telephone = COALESCE(dh.telephone, e.telephone)
      FROM employees e
      WHERE dh.employee_id = e.id
        AND (dh.matricule IS NULL OR dh.matricule = '' OR dh.matricule = 'N/A')
        AND e.matricule IS NOT NULL
        AND e.matricule != ''
      RETURNING dh.id, dh.matricule
    `);
    
    console.log(`✅ ${updateResult.rowCount} enregistrement(s) mis à jour avec succès`);
    
    // Afficher un résumé
    const summaryResult = await client.query(`
      SELECT 
          COUNT(*) as total_with_matricule
      FROM depart_history dh
      WHERE dh.matricule IS NOT NULL 
        AND dh.matricule != ''
        AND dh.matricule != 'N/A'
    `);
    
    console.log(`📊 Total d'enregistrements avec matricule: ${summaryResult.rows[0].total_with_matricule}`);
    
    // Afficher les enregistrements qui n'ont toujours pas de matricule
    const missingResult = await client.query(`
      SELECT 
          dh.id,
          dh.employee_id,
          dh.nom_prenom,
          dh.date_depart,
          CASE 
            WHEN dh.employee_id IS NULL THEN 'Pas d employee_id'
            ELSE 'Employé supprimé ou matricule manquant'
          END as status
      FROM depart_history dh
      WHERE (dh.matricule IS NULL OR dh.matricule = '' OR dh.matricule = 'N/A')
      ORDER BY dh.date_depart DESC
      LIMIT 10
    `);
    
    if (missingResult.rows.length > 0) {
      console.log(`\n⚠️  ${missingResult.rows.length} enregistrement(s) sans matricule (affichage des 10 premiers):`);
      missingResult.rows.forEach(row => {
        console.log(`   - ID: ${row.id}, Employee ID: ${row.employee_id || 'NULL'}, Nom: ${row.nom_prenom || 'N/A'}, Date: ${row.date_depart}, Status: ${row.status}`);
      });
    } else {
      console.log('\n✅ Tous les enregistrements ont maintenant un matricule!');
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Mise à jour terminée avec succès!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la mise à jour:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

updateMissingMatricules()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
