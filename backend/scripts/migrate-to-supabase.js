const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données locale (source)
const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

// Configuration Supabase (destination)
// Remplacer par vos vraies credentials Supabase
const supabasePool = new Pool({
  user: process.env.SUPABASE_DB_USER || 'postgres',
  host: process.env.SUPABASE_DB_HOST || 'db.your-project.supabase.co',
  database: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'your_password',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateTable(tableName, batchSize = 1000) {
  const localClient = await localPool.connect();
  const supabaseClient = await supabasePool.connect();
  
  try {
    console.log(`\n🔄 Migration de la table: ${tableName}`);
    
    // Récupérer le schéma de la table
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `;
    const schemaResult = await localClient.query(schemaQuery, [tableName]);
    
    if (schemaResult.rows.length === 0) {
      console.log(`⚠️  Table ${tableName} n'existe pas dans la source`);
      return;
    }
    
    // Compter les lignes
    const countResult = await localClient.query(`SELECT COUNT(*) FROM ${tableName}`);
    const totalRows = parseInt(countResult.rows[0].count);
    console.log(`   Total de lignes: ${totalRows}`);
    
    if (totalRows === 0) {
      console.log(`   ✅ Table vide, pas de migration nécessaire`);
      return;
    }
    
    // Migrer par batch
    let offset = 0;
    let migrated = 0;
    
    while (offset < totalRows) {
      const dataResult = await localClient.query(
        `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`,
        [batchSize, offset]
      );
      
      if (dataResult.rows.length === 0) break;
      
      // Insérer les données dans Supabase
      for (const row of dataResult.rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const insertQuery = `
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        
        try {
          await supabaseClient.query(insertQuery, values);
          migrated++;
        } catch (err) {
          console.error(`   ❌ Erreur lors de l'insertion:`, err.message);
        }
      }
      
      offset += batchSize;
      console.log(`   Progression: ${migrated}/${totalRows} lignes migrées`);
    }
    
    console.log(`   ✅ Migration terminée: ${migrated} lignes migrées`);
    
  } catch (err) {
    console.error(`   ❌ Erreur lors de la migration de ${tableName}:`, err);
  } finally {
    localClient.release();
    supabaseClient.release();
  }
}

async function migrateAll() {
  console.log('🚀 Début de la migration vers Supabase\n');
  
  // Liste des tables à migrer (ajoutez toutes vos tables)
  const tables = [
    'employees',
    'contrats',
    'conges',
    'absence',
    'historique_recrutement',
    'historique_departs',
    'depart_history',
    'recrutement_history',
    'sanctions_table',
    'notes',
    'evenements',
    'visites_medicales',
    'tasks',
    'interviews',
    'onboarding_history',
    'offboarding_history',
    // Ajoutez toutes vos autres tables
  ];
  
  for (const table of tables) {
    await migrateTable(table);
  }
  
  console.log('\n✅ Migration complète terminée!');
  
  await localPool.end();
  await supabasePool.end();
}

// Exécuter la migration
if (require.main === module) {
  migrateAll()
    .then(() => {
      console.log('✅ Script terminé');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur:', err);
      process.exit(1);
    });
}

module.exports = { migrateTable, migrateAll };
