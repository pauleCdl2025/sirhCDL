const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function testContratSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Test du système de contrats...\n');
    
    // 1. Vérifier la structure de la table contrats
    console.log('1️⃣ Structure de la table contrats:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position;
    `);
    
    if (columnsResult.rows.length === 0) {
      console.log('❌ Table contrats non trouvée!');
      return;
    }
    
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // 2. Vérifier les contrats existants
    console.log('\n2️⃣ Contrats existants:');
    const contratsResult = await client.query('SELECT id, nom_employe, type_contrat FROM contrats LIMIT 5');
    
    if (contratsResult.rows.length === 0) {
      console.log('   Aucun contrat trouvé');
    } else {
      contratsResult.rows.forEach(contrat => {
        console.log(`   - ID: ${contrat.id}, Employé: ${contrat.nom_employe}, Type: ${contrat.type_contrat}`);
      });
    }
    
    // 3. Vérifier les employés existants
    console.log('\n3️⃣ Employés existants:');
    const employeesResult = await client.query('SELECT id, nom_prenom FROM employees LIMIT 5');
    
    if (employeesResult.rows.length === 0) {
      console.log('   Aucun employé trouvé');
    } else {
      employeesResult.rows.forEach(emp => {
        console.log(`   - ID: ${emp.id}, Nom: ${emp.nom_prenom}`);
      });
    }
    
    // 4. Vérifier la table d'historique
    console.log('\n4️⃣ Table d\'historique:');
    try {
      const historyResult = await client.query(`
        SELECT COUNT(*) as count FROM contrat_history
      `);
      console.log(`   ✅ Table contrat_history existe avec ${historyResult.rows[0].count} entrées`);
    } catch (error) {
      console.log('   ❌ Table contrat_history non trouvée:', error.message);
    }
    
    // 5. Test de mise à jour simple
    if (contratsResult.rows.length > 0) {
      console.log('\n5️⃣ Test de mise à jour:');
      const testContratId = contratsResult.rows[0].id;
      
      try {
        // Test avec colonnes existantes
        const testUpdate = await client.query(`
          UPDATE contrats 
          SET updated_at = $1
          WHERE id = $2 
          RETURNING id, updated_at
        `, [new Date().toISOString(), testContratId]);
        
        console.log(`   ✅ Mise à jour réussie pour le contrat ${testContratId}`);
        
      } catch (updateError) {
        console.log(`   ❌ Erreur de mise à jour:`, updateError.message);
      }
    }
    
    console.log('\n🎯 Résumé des tests:');
    console.log(`   - Table contrats: ${columnsResult.rows.length} colonnes`);
    console.log(`   - Contrats: ${contratsResult.rows.length} trouvés`);
    console.log(`   - Employés: ${employeesResult.rows.length} trouvés`);
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter les tests
testContratSystem()
  .then(() => {
    console.log('\n✅ Tests terminés');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });











