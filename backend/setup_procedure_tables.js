const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
  options: '-c client_encoding=UTF8',
  charset: 'utf8',
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

async function setupProcedureTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Début de la configuration des tables de procédures...');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create_procedure_tracking_tables_fixed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Diviser le script en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Exécution de ${commands.length} commandes SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await client.query(command);
          console.log(`✅ Commande ${i + 1}/${commands.length} exécutée avec succès`);
        } catch (error) {
          // Ignorer les erreurs de tables déjà existantes
          if (error.code === '42P07') {
            console.log(`⚠️ Table déjà existante (commande ${i + 1})`);
          } else if (error.code === '42710') {
            console.log(`⚠️ Index déjà existant (commande ${i + 1})`);
          } else {
            console.error(`❌ Erreur lors de l'exécution de la commande ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Vérifier que les tables ont été créées
    console.log('\n🔍 Vérification des tables créées...');
    
    const tablesToCheck = [
      'procedure_dossiers',
      'procedure_etapes',
      'procedure_documents_requis',
      'procedure_documents_soumis',
      'procedure_commentaires',
      'procedure_notifications',
      'procedure_statistiques'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = $1
        `, [tableName]);
        
        if (result.rows[0].count > 0) {
          console.log(`✅ Table ${tableName} créée avec succès`);
        } else {
          console.log(`❌ Table ${tableName} n'a pas été créée`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la vérification de ${tableName}:`, error.message);
      }
    }
    
    // Vérifier les données d'exemple
    console.log('\n📊 Vérification des données d\'exemple...');
    
    try {
      const dossiersResult = await client.query('SELECT COUNT(*) as count FROM procedure_dossiers');
      console.log(`📋 ${dossiersResult.rows[0].count} dossiers de test créés`);
      
      const etapesResult = await client.query('SELECT COUNT(*) as count FROM procedure_etapes');
      console.log(`📋 ${etapesResult.rows[0].count} étapes de procédure créées`);
      
      const documentsResult = await client.query('SELECT COUNT(*) as count FROM procedure_documents_requis');
      console.log(`📋 ${documentsResult.rows[0].count} documents requis créés`);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des données:', error.message);
    }
    
    console.log('\n🎉 Configuration des tables de procédures terminée avec succès!');
    console.log('🚀 Le système de suivi des procédures est maintenant prêt à être utilisé.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
setupProcedureTables()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
