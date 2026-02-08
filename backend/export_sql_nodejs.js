const pool = require('./db');
const fs = require('fs');
const path = require('path');

// Créer le dossier d'export s'il n'existe pas
const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Obtenir la date et l'heure actuelles
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `rh_portal_export_${timestamp}.sql`;
const filepath = path.join(exportDir, filename);

console.log('🚀 EXPORT DE LA BASE DE DONNÉES RH_PORTAL (Node.js)');
console.log('==================================================');
console.log(`📁 Fichier de sortie: ${filename}`);
console.log('==================================================\n');

let sqlContent = '';

// Fonction pour ajouter du contenu SQL
function addSQL(content) {
  sqlContent += content + '\n';
}

// En-tête du fichier SQL
addSQL('-- ============================================');
addSQL('-- EXPORT DE LA BASE DE DONNÉES RH_PORTAL');
addSQL(`-- Date: ${new Date().toISOString()}`);
addSQL('-- ============================================\n');
addSQL('-- Encodage: UTF-8\n');
addSQL('BEGIN;\n');

async function exportDatabase() {
  try {
    console.log('🔄 Récupération de la liste des tables...');
    
    // Récupérer toutes les tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`✅ ${tables.length} tables trouvées\n`);
    
    // Pour chaque table
    for (const table of tables) {
      console.log(`📋 Export de la table: ${table}...`);
      
      // Récupérer la structure de la table
      const createTableResult = await pool.query(`
        SELECT 
          'CREATE TABLE IF NOT EXISTS ' || quote_ident(table_name) || ' (' ||
          string_agg(
            quote_ident(column_name) || ' ' || 
            CASE 
              WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
              WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
              WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
              WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
              WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
              WHEN data_type = 'time without time zone' THEN 'TIME'
              WHEN data_type = 'time with time zone' THEN 'TIMETZ'
              WHEN data_type = 'double precision' THEN 'DOUBLE PRECISION'
              WHEN data_type = 'real' THEN 'REAL'
              WHEN data_type = 'integer' THEN 'INTEGER'
              WHEN data_type = 'bigint' THEN 'BIGINT'
              WHEN data_type = 'smallint' THEN 'SMALLINT'
              WHEN data_type = 'boolean' THEN 'BOOLEAN'
              WHEN data_type = 'text' THEN 'TEXT'
              WHEN data_type = 'bytea' THEN 'BYTEA'
              WHEN data_type = 'date' THEN 'DATE'
              WHEN data_type = 'json' THEN 'JSON'
              WHEN data_type = 'jsonb' THEN 'JSONB'
              ELSE UPPER(data_type)
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE 
              WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default
              ELSE ''
            END,
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        GROUP BY table_name;
      `, [table]);
      
      if (createTableResult.rows.length > 0) {
        addSQL(`-- Table: ${table}`);
        addSQL(createTableResult.rows[0].create_statement);
        addSQL('');
      }
      
      // Récupérer les contraintes de clé primaire
      const pkResult = await pool.query(`
        SELECT
          'ALTER TABLE ' || quote_ident(tc.table_name) || 
          ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) || 
          ' PRIMARY KEY (' || string_agg(quote_ident(kcu.column_name), ', ' ORDER BY kcu.ordinal_position) || ');' as pk_statement
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
        GROUP BY tc.table_name, tc.constraint_name;
      `, [table]);
      
      if (pkResult.rows.length > 0) {
        pkResult.rows.forEach(row => {
          addSQL(row.pk_statement);
        });
        addSQL('');
      }
      
      // Récupérer les index
      const indexResult = await pool.query(`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = $1
        AND indexname NOT LIKE '%_pkey';
      `, [table]);
      
      if (indexResult.rows.length > 0) {
        indexResult.rows.forEach(row => {
          addSQL(row.indexdef + ';');
        });
        addSQL('');
      }
      
      // Récupérer les séquences associées (optionnel, peut être omis)
      // Les séquences seront recréées automatiquement avec les colonnes SERIAL
      
      // Récupérer les données
      const dataResult = await pool.query(`SELECT * FROM ${table}`);
      
      if (dataResult.rows.length > 0) {
        addSQL(`-- Données de la table: ${table}`);
        addSQL(`INSERT INTO ${table} VALUES`);
        
        const values = dataResult.rows.map((row, index) => {
          const rowValues = Object.keys(row).map(key => {
            const value = row[key];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              // Échapper les apostrophes et les backslashes
              return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
            }
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            }
            if (typeof value === 'boolean') {
              return value ? 'TRUE' : 'FALSE';
            }
            if (Buffer.isBuffer(value)) {
              return `'\\x${value.toString('hex')}'`;
            }
            return value;
          });
          const comma = index < dataResult.rows.length - 1 ? ',' : ';';
          return `(${rowValues.join(', ')})${comma}`;
        });
        
        addSQL(values.join('\n'));
        addSQL('');
      } else {
        addSQL(`-- Aucune donnée dans la table: ${table}`);
        addSQL('');
      }
      
      console.log(`   ✅ ${dataResult.rows.length} lignes exportées`);
    }
    
    // Fermer la transaction
    addSQL('COMMIT;');
    
    // Écrire le fichier
    fs.writeFileSync(filepath, sqlContent, 'utf8');
    
    const stats = fs.statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ EXPORT TERMINÉ AVEC SUCCÈS!');
    console.log('================================');
    console.log(`📂 Fichier: ${filename}`);
    console.log(`📁 Chemin: ${filepath}`);
    console.log(`📊 Taille: ${fileSizeInMB} MB`);
    console.log(`📋 Tables exportées: ${tables.length}`);
    console.log('================================\n');
    
    console.log('💡 INFORMATIONS IMPORTANTES:');
    console.log('• Le fichier contient la structure ET les données de votre base');
    console.log('• Format SQL standard compatible PostgreSQL');
    console.log('• Sauvegardez ce fichier dans un endroit sûr');
    console.log('• Vous pouvez restaurer avec: psql -U postgres -d rh_portal < fichier.sql\n');
    
  } catch (error) {
    console.error('❌ ERREUR lors de l\'export:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Lancer l'export
exportDatabase().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

