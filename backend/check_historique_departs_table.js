const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function checkHistoriqueDepartsTable() {
  console.log('🔍 Vérification de la table historique_departs...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. Vérifier si la table existe
    console.log('1️⃣ Vérification de l\'existence de la table...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historique_departs'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Table historique_departs existe');
      
      // 2. Vérifier la structure de la table
      console.log('\n2️⃣ Structure de la table historique_departs:');
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'historique_departs'
        ORDER BY ordinal_position
      `);
      
      structure.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // 3. Vérifier le nombre d'enregistrements
      const count = await client.query('SELECT COUNT(*) FROM historique_departs');
      console.log(`\n📊 Nombre d'enregistrements: ${count.rows[0].count}`);
      
    } else {
      console.log('❌ Table historique_departs n\'existe PAS');
      
      // 4. Vérifier quelles tables de départ existent
      console.log('\n3️⃣ Tables de départ disponibles:');
      const departTables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%depart%'
        ORDER BY table_name
      `);
      
      if (departTables.rows.length > 0) {
        console.log('📋 Tables trouvées:');
        departTables.rows.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      } else {
        console.log('❌ Aucune table de départ trouvée');
      }
    }
    
    // 5. Recommandations
    console.log('\n🎯 Recommandations:');
    if (!tableExists.rows[0].exists) {
      console.log('   - Créer la table historique_departs');
      console.log('   - Ou modifier departRoutes.js pour utiliser depart_history');
      console.log('   - Ou fusionner les deux systèmes de gestion des départs');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkHistoriqueDepartsTable().catch(console.error);








