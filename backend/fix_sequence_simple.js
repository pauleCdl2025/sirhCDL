const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixSequenceSimple() {
  console.log('🔧 Réparation simple de la séquence...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier la valeur maximale de l'ID
    console.log('1️⃣ Vérification de la valeur maximale de l\'ID...');
    const maxId = await client.query('SELECT MAX(id) as max_id FROM historique_departs');
    console.log('📊 ID maximum dans la table:', maxId.rows[0].max_id);
    
    // 2. Réparer la séquence directement
    console.log('\n2️⃣ Réparation de la séquence...');
    if (maxId.rows[0].max_id) {
      const nextValue = parseInt(maxId.rows[0].max_id) + 1;
      console.log('🔧 Définition de la prochaine valeur de séquence à:', nextValue);
      
      await client.query(`
        SELECT setval('historique_departs_id_seq', $1, false)
      `, [maxId.rows[0].max_id]);
      
      console.log('✅ Séquence réparée');
    }
    
    // 3. Test de création
    console.log('\n3️⃣ Test de création d\'un enregistrement...');
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
      'Test de réparation',
      'Test après réparation'
    ];
    
    const testResult = await client.query(testQuery, testValues);
    console.log('✅ Test de création réussi - Nouvel ID:', testResult.rows[0].id);
    
    // 4. Supprimer l'enregistrement de test
    await client.query('DELETE FROM historique_departs WHERE id = $1', [testResult.rows[0].id]);
    console.log('✅ Enregistrement de test supprimé');
    
    console.log('\n🎉 Séquence réparée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSequenceSimple().catch(console.error);








