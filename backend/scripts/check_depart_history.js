const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function checkDepartHistory() {
  const client = await pool.connect();
  try {
    console.log('🔍 Vérification de la table depart_history...\n');
    
    // Vérifier la structure de la table
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'depart_history'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes de la table depart_history:');
    tableInfo.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    console.log('\n📊 Enregistrements dans depart_history:');
    const records = await client.query(`
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
        created_at
      FROM depart_history
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    if (records.rows.length === 0) {
      console.log('   ⚠️ Aucun enregistrement trouvé dans depart_history');
    } else {
      console.log(`   ✅ ${records.rows.length} enregistrement(s) trouvé(s):\n`);
      records.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}, Employee ID: ${row.employee_id}`);
        console.log(`      Nom: ${row.nom_prenom || 'NULL'}`);
        console.log(`      Matricule: ${row.matricule || 'NULL'}`);
        console.log(`      Poste: ${row.poste_actuel || 'NULL'}`);
        console.log(`      Département: ${row.departement || 'NULL'}`);
        console.log(`      Statut: ${row.statut || 'NULL'}`);
        console.log(`      Email: ${row.email || 'NULL'}`);
        console.log(`      Téléphone: ${row.telephone || 'NULL'}`);
        console.log(`      Date départ: ${row.date_depart || 'NULL'}`);
        console.log(`      Créé le: ${row.created_at || 'NULL'}`);
        console.log('');
      });
    }
    
    // Vérifier les employés supprimés récemment
    console.log('🔍 Vérification des employés supprimés récemment...');
    const deletedEmployees = await client.query(`
      SELECT 
        oh.employee_id,
        oh.date_depart,
        oh.created_at as offboarding_created_at,
        CASE WHEN e.id IS NULL THEN 'Supprimé' ELSE 'Existe encore' END as employee_status
      FROM offboarding_history oh
      LEFT JOIN employees e ON oh.employee_id = e.id
      ORDER BY oh.created_at DESC
      LIMIT 5
    `);
    
    if (deletedEmployees.rows.length > 0) {
      console.log(`\n   📋 ${deletedEmployees.rows.length} offboarding(s) récent(s):\n`);
      for (const row of deletedEmployees.rows) {
        console.log(`   Employee ID: ${row.employee_id}`);
        console.log(`      Date départ: ${row.date_depart}`);
        console.log(`      Statut employé: ${row.employee_status}`);
        console.log(`      Offboarding créé le: ${row.offboarding_created_at}`);
        
        // Vérifier si un enregistrement existe dans depart_history
        const dhResult = await client.query(`
          SELECT id, nom_prenom, created_at
          FROM depart_history
          WHERE employee_id = $1
        `, [row.employee_id]);
        
        if (dhResult.rows.length > 0) {
          console.log(`      ✅ Trouvé dans depart_history (ID: ${dhResult.rows[0].id}, Nom: ${dhResult.rows[0].nom_prenom})`);
        } else {
          console.log(`      ❌ NON TROUVÉ dans depart_history`);
        }
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDepartHistory();

