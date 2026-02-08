const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkTableConstraints() {
  console.log('🔍 Vérification des contraintes de la table historique_departs...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier la structure de la table
    console.log('1️⃣ Structure de la table historique_departs:');
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'historique_departs'
      ORDER BY ordinal_position
    `);
    
    structure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 2. Vérifier les contraintes
    console.log('\n2️⃣ Contraintes de la table:');
    const constraints = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'historique_departs'::regclass
    `);
    
    if (constraints.rows.length > 0) {
      constraints.rows.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
        console.log(`     Définition: ${constraint.constraint_definition}`);
      });
    } else {
      console.log('   Aucune contrainte trouvée');
    }
    
    // 3. Vérifier les index
    console.log('\n3️⃣ Index de la table:');
    const indexes = await client.query(`
      SELECT 
        indexname as index_name,
        indexdef as index_definition
      FROM pg_indexes
      WHERE tablename = 'historique_departs'
    `);
    
    if (indexes.rows.length > 0) {
      indexes.rows.forEach(index => {
        console.log(`   - ${index.index_name}`);
        console.log(`     Définition: ${index.index_definition}`);
      });
    } else {
      console.log('   Aucun index trouvé');
    }
    
    // 4. Vérifier les séquences
    console.log('\n4️⃣ Séquences associées:');
    const sequences = await client.query(`
      SELECT 
        sequence_name,
        last_value,
        is_called
      FROM information_schema.sequences
      WHERE sequence_name LIKE '%historique_departs%'
    `);
    
    if (sequences.rows.length > 0) {
      sequences.rows.forEach(seq => {
        console.log(`   - ${seq.sequence_name}: last_value=${seq.last_value}, is_called=${seq.is_called}`);
      });
    } else {
      console.log('   Aucune séquence trouvée');
    }
    
    // 5. Vérifier les données
    console.log('\n5️⃣ Données de la table:');
    const data = await client.query(`
      SELECT id, nom, prenom, date_creation
      FROM historique_departs
      ORDER BY id DESC
      LIMIT 5
    `);
    
    if (data.rows.length > 0) {
      console.log('   Derniers enregistrements:');
      data.rows.forEach(row => {
        console.log(`     ID: ${row.id}, Nom: ${row.nom} ${row.prenom}, Créé: ${row.date_creation}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTableConstraints().catch(console.error);








