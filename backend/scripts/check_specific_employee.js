const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function checkSpecificEmployee() {
  const client = await pool.connect();
  try {
    console.log('🔍 Recherche de l\'employé IFOUNGA IFOUNGA Réginalde dans depart_history...\n');
    
    // Rechercher par nom
    const result = await client.query(`
      SELECT 
        id,
        employee_id,
        nom_prenom,
        matricule,
        poste_actuel,
        departement,
        statut,
        email,
        telephone,
        date_depart,
        motif_depart,
        type_depart,
        notes,
        created_at
      FROM depart_history
      WHERE nom_prenom ILIKE '%IFOUNGA%' OR nom_prenom ILIKE '%Réginalde%'
      ORDER BY created_at DESC
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Aucun enregistrement trouvé avec ce nom dans depart_history');
      
      // Vérifier dans offboarding_history
      const offboardingResult = await client.query(`
        SELECT employee_id, date_depart, created_at
        FROM offboarding_history
        WHERE employee_id = 53
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      if (offboardingResult.rows.length > 0) {
        console.log('\n⚠️ Mais un offboarding existe pour employee_id = 53:');
        console.log(offboardingResult.rows[0]);
        console.log('\n❌ PROBLÈME: L\'offboarding existe mais pas l\'enregistrement dans depart_history!');
      }
    } else {
      console.log(`✅ ${result.rows.length} enregistrement(s) trouvé(s):\n`);
      result.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}, Employee ID: ${row.employee_id}`);
        console.log(`      Nom complet: ${row.nom_prenom || 'NULL'}`);
        console.log(`      Matricule: ${row.matricule || 'NULL'}`);
        console.log(`      Poste: ${row.poste_actuel || 'NULL'}`);
        console.log(`      Département: ${row.departement || 'NULL'}`);
        console.log(`      Statut: ${row.statut || 'NULL'}`);
        console.log(`      Email: ${row.email || 'NULL'}`);
        console.log(`      Téléphone: ${row.telephone || 'NULL'}`);
        console.log(`      Date départ: ${row.date_depart || 'NULL'}`);
        console.log(`      Motif: ${row.motif_depart || 'NULL'}`);
        console.log(`      Type: ${row.type_depart || 'NULL'}`);
        console.log(`      Créé le: ${row.created_at || 'NULL'}`);
        console.log('');
      });
    }
    
    // Vérifier aussi tous les enregistrements récents
    console.log('\n📋 Derniers 5 enregistrements dans depart_history:');
    const recentResult = await client.query(`
      SELECT id, employee_id, nom_prenom, date_depart, created_at
      FROM depart_history
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    recentResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}, Employee ID: ${row.employee_id}, Nom: ${row.nom_prenom}, Date: ${row.date_depart}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSpecificEmployee();


