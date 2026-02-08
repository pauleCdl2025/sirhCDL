const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function fixIdColumn() {
  console.log('🔧 Correction de la colonne ID de la table historique_departs...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Vérifier l'état actuel
    console.log('1️⃣ État actuel de la colonne ID...');
    const currentState = await client.query(`
      SELECT column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'historique_departs' AND column_name = 'id'
    `);
    
    console.log('   Valeur par défaut:', currentState.rows[0].column_default);
    console.log('   Nullable:', currentState.rows[0].is_nullable);
    
    // 2. Créer une séquence si elle n'existe pas
    console.log('\n2️⃣ Création de la séquence...');
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS historique_departs_id_seq
      START WITH 54
      INCREMENT BY 1
      NO MINVALUE
      NO MAXVALUE
      CACHE 1
    `);
    console.log('✅ Séquence créée');
    
    // 3. Modifier la colonne ID pour utiliser la séquence
    console.log('\n3️⃣ Modification de la colonne ID...');
    await client.query(`
      ALTER TABLE historique_departs 
      ALTER COLUMN id SET DEFAULT nextval('historique_departs_id_seq')
    `);
    console.log('✅ Colonne ID modifiée');
    
    // 4. Définir la valeur actuelle de la séquence
    console.log('\n4️⃣ Synchronisation de la séquence...');
    const maxId = await client.query('SELECT MAX(id) FROM historique_departs');
    if (maxId.rows[0].max) {
      await client.query(`
        SELECT setval('historique_departs_id_seq', $1, true)
      `, [maxId.rows[0].max]);
      console.log('✅ Séquence synchronisée avec ID max:', maxId.rows[0].max);
    }
    
    // 5. Test de création
    console.log('\n5️⃣ Test de création d\'un enregistrement...');
    const testQuery = `
      INSERT INTO historique_departs 
      (nom, prenom, departement, statut, poste, date_depart, motif_depart, commentaire) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING id
    `;
    
    const testValues = [
      'TEST',
      'FIXED',
      'IT',
      'Parti',
      'Développeur',
      '2025-08-14',
      'Test après correction',
      'Test de la colonne ID corrigée'
    ];
    
    const testResult = await client.query(testQuery, testValues);
    console.log('✅ Test de création réussi - Nouvel ID:', testResult.rows[0].id);
    
    // 6. Supprimer l'enregistrement de test
    await client.query('DELETE FROM historique_departs WHERE id = $1', [testResult.rows[0].id]);
    console.log('✅ Enregistrement de test supprimé');
    
    await client.query('COMMIT');
    console.log('\n🎉 Colonne ID corrigée avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la correction:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixIdColumn().catch(console.error);








