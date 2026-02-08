const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function checkAllDepartHistory() {
  const client = await pool.connect();
  try {
    console.log('🔍 Vérification de tous les enregistrements dans depart_history...\n');
    
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
        created_at
      FROM depart_history
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Total: ${result.rows.length} enregistrement(s) dans depart_history\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️ Aucun enregistrement trouvé');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ID: ${row.id}, Employee ID: ${row.employee_id}`);
        console.log(`   Nom: ${row.nom_prenom || 'NULL'}`);
        console.log(`   Matricule: ${row.matricule || 'NULL'}`);
        console.log(`   Poste: ${row.poste_actuel || 'NULL'}`);
        console.log(`   Département: ${row.departement || 'NULL'}`);
        console.log(`   Statut (Type contrat): ${row.statut || 'NULL'}`);
        console.log(`   Email: ${row.email || 'NULL'}`);
        console.log(`   Téléphone: ${row.telephone || 'NULL'}`);
        console.log(`   Date départ: ${row.date_depart || 'NULL'}`);
        console.log(`   Créé le: ${row.created_at || 'NULL'}`);
        console.log('');
      });
    }
    
    // Vérifier les enregistrements avec des valeurs NULL
    const nullCheck = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN matricule IS NULL THEN 1 END) as null_matricule,
        COUNT(CASE WHEN statut IS NULL THEN 1 END) as null_statut,
        COUNT(CASE WHEN departement IS NULL THEN 1 END) as null_departement,
        COUNT(CASE WHEN email IS NULL THEN 1 END) as null_email,
        COUNT(CASE WHEN telephone IS NULL THEN 1 END) as null_telephone
      FROM depart_history
    `);
    
    console.log('\n📊 Statistiques des valeurs NULL:');
    console.log(`   Total enregistrements: ${nullCheck.rows[0].total}`);
    console.log(`   Matricule NULL: ${nullCheck.rows[0].null_matricule}`);
    console.log(`   Statut NULL: ${nullCheck.rows[0].null_statut}`);
    console.log(`   Département NULL: ${nullCheck.rows[0].null_departement}`);
    console.log(`   Email NULL: ${nullCheck.rows[0].null_email}`);
    console.log(`   Téléphone NULL: ${nullCheck.rows[0].null_telephone}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllDepartHistory();


