const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixHistoriqueDepartsSequence() {
  console.log('🔧 Réparation de la séquence de la table historique_departs...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Vérifier l'état actuel de la séquence
    console.log('1️⃣ Vérification de l\'état actuel de la séquence...');
    const sequenceInfo = await client.query(`
      SELECT 
        pg_get_serial_sequence('historique_departs', 'id') as sequence_name,
        currval(pg_get_serial_sequence('historique_departs', 'id')) as current_value
    `);
    
    if (sequenceInfo.rows[0].sequence_name) {
      console.log('✅ Séquence trouvée:', sequenceInfo.rows[0].sequence_name);
      console.log('📊 Valeur actuelle:', sequenceInfo.rows[0].current_value);
    } else {
      console.log('❌ Aucune séquence trouvée pour la colonne id');
    }
    
    // 2. Vérifier la valeur maximale de l'ID dans la table
    console.log('\n2️⃣ Vérification de la valeur maximale de l\'ID...');
    const maxId = await client.query('SELECT MAX(id) as max_id FROM historique_departs');
    console.log('📊 ID maximum dans la table:', maxId.rows[0].max_id);
    
    // 3. Vérifier le nombre total d'enregistrements
    const totalCount = await client.query('SELECT COUNT(*) as total FROM historique_departs');
    console.log('📊 Nombre total d\'enregistrements:', totalCount.rows[0].total);
    
    // 4. Réparer la séquence
    console.log('\n3️⃣ Réparation de la séquence...');
    if (maxId.rows[0].max_id) {
      const nextValue = parseInt(maxId.rows[0].max_id) + 1;
      console.log('🔧 Définition de la prochaine valeur de séquence à:', nextValue);
      
      await client.query(`
        SELECT setval(pg_get_serial_sequence('historique_departs', 'id'), $1, false)
      `, [maxId.rows[0].max_id]);
      
      console.log('✅ Séquence réparée');
    }
    
    // 5. Vérifier que la réparation a fonctionné
    console.log('\n4️⃣ Vérification de la réparation...');
    const newSequenceInfo = await client.query(`
      SELECT currval(pg_get_serial_sequence('historique_departs', 'id')) as current_value
    `);
    console.log('📊 Nouvelle valeur de séquence:', newSequenceInfo.rows[0].current_value);
    
    // 6. Test de création d'un enregistrement
    console.log('\n5️⃣ Test de création d\'un enregistrement...');
    const testQuery = `
      INSERT INTO historique_departs 
      (nom, prenom, departement, statut, poste, date_depart, motif_depart, commentaire) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id
    `;
    
    const testValues = [
      'TEST',
      'SEQUENCE',
      'IT',
      'Parti',
      'Développeur',
      '2025-08-14',
      'Test de réparation de séquence',
      'Test après réparation'
    ];
    
    const testResult = await client.query(testQuery, testValues);
    console.log('✅ Test de création réussi - Nouvel ID:', testResult.rows[0].id);
    
    // 7. Supprimer l'enregistrement de test
    await client.query('DELETE FROM historique_departs WHERE id = $1', [testResult.rows[0].id]);
    console.log('✅ Enregistrement de test supprimé');
    
    await client.query('COMMIT');
    console.log('\n🎉 Séquence réparée avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la réparation:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixHistoriqueDepartsSequence().catch(console.error);








