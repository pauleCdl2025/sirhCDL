const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
};

// Créer le dossier d'export s'il n'existe pas
const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Obtenir la date et l'heure actuelles
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `rh_portal_export_${timestamp}.sql`;
const filepath = path.join(exportDir, filename);

console.log('🚀 EXPORT NODE.JS DE LA BASE DE DONNÉES RH_PORTAL');
console.log('==================================================');
console.log(`📊 Base: ${DB_CONFIG.database}`);
console.log(`🏠 Hôte: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
console.log(`👤 Utilisateur: ${DB_CONFIG.user}`);
console.log(`📁 Fichier de sortie: ${filename}`);
console.log('==================================================\n');

// Créer la connexion à la base
const pool = new Pool(DB_CONFIG);

// Fonction pour obtenir la structure de la base
async function getDatabaseStructure() {
  try {
    console.log('🔍 Récupération de la structure de la base...');
    
    // Récupérer les tables
    const tablesQuery = `
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows;
    
    console.log(`📋 ${tables.length} tables trouvées`);
    
    let sqlContent = '';
    
    // En-tête du fichier SQL
    sqlContent += `-- Export de la base de données ${DB_CONFIG.database}\n`;
    sqlContent += `-- Généré le ${new Date().toLocaleString()}\n`;
    sqlContent += `-- Structure et données\n\n`;
    
    // Pour chaque table
    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        console.log(`📊 Traitement de la table: ${table.table_name}`);
        
        // Récupérer la structure de la table
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `;
        
        const structureResult = await pool.query(structureQuery, [table.table_name]);
        const columns = structureResult.rows;
        
        // Créer la table
        sqlContent += `-- Structure de la table ${table.table_name}\n`;
        sqlContent += `DROP TABLE IF EXISTS "${table.table_name}" CASCADE;\n`;
        sqlContent += `CREATE TABLE "${table.table_name}" (\n`;
        
        const columnDefinitions = columns.map(col => {
          let def = `  "${col.column_name}" ${col.data_type}`;
          if (col.is_nullable === 'NO') def += ' NOT NULL';
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          return def;
        });
        
        sqlContent += columnDefinitions.join(',\n') + '\n);\n\n';
        
        // Récupérer les données
        const dataQuery = `SELECT * FROM "${table.table_name}"`;
        const dataResult = await pool.query(dataQuery);
        const rows = dataResult.rows;
        
        if (rows.length > 0) {
          console.log(`  📥 ${rows.length} lignes de données`);
          
          // Insérer les données
          sqlContent += `-- Données de la table ${table.table_name}\n`;
          
          for (const row of rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            
            sqlContent += `INSERT INTO "${table.table_name}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          sqlContent += '\n';
        } else {
          console.log(`  📭 Aucune donnée`);
        }
      }
    }
    
    // Écrire le fichier
    fs.writeFileSync(filepath, sqlContent, 'utf8');
    
    console.log('\n✅ EXPORT TERMINÉ AVEC SUCCÈS!');
    console.log('================================');
    console.log(`📂 Fichier: ${filename}`);
    console.log(`📁 Chemin: ${filepath}`);
    
    const stats = fs.statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Taille: ${fileSizeInMB} MB`);
    console.log(`🕐 Timestamp: ${timestamp}`);
    console.log('================================\n');
    
    console.log('💡 INFORMATIONS IMPORTANTES:');
    console.log('• Le fichier contient la structure ET les données de votre base');
    console.log('• Format SQL compatible avec PostgreSQL');
    console.log('• Sauvegardez ce fichier dans un endroit sûr\n');
    
  } catch (error) {
    console.error('❌ ERREUR lors de l\'export:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 SOLUTION: Vérifiez que PostgreSQL est démarré');
    } else if (error.code === '28P01') {
      console.error('💡 SOLUTION: Vérifiez le nom d\'utilisateur et le mot de passe');
    } else if (error.code === '3D000') {
      console.error('💡 SOLUTION: Vérifiez que la base de données existe');
    }
  } finally {
    await pool.end();
  }
}

// Démarrer l'export
getDatabaseStructure();












