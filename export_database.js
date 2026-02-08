const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function exportDatabase() {
  try {
    console.log('🔄 Export de la base de données en cours...');
    
    // Obtenir la liste de toutes les tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log(`📋 ${tables.length} tables trouvées:`, tables.join(', '));
    
    let sqlContent = `-- Export de la base de données rh_portal\n`;
    sqlContent += `-- Date: ${new Date().toISOString()}\n\n`;
    sqlContent += `SET client_encoding = 'UTF8';\n\n`;
    
    // Exporter la structure et les données de chaque table
    for (const table of tables) {
      console.log(`📊 Export de la table: ${table}`);
      
      // Obtenir la structure de la table
      const structureResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      
      // Créer la commande CREATE TABLE
      sqlContent += `\n-- Table: ${table}\n`;
      sqlContent += `DROP TABLE IF EXISTS ${table} CASCADE;\n`;
      sqlContent += `CREATE TABLE ${table} (\n`;
      
      const columns = [];
      for (const col of structureResult.rows) {
        let colDef = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        }
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        columns.push(colDef);
      }
      
      sqlContent += columns.join(',\n');
      sqlContent += `\n);\n\n`;
      
      // Obtenir les données de la table
      const dataResult = await pool.query(`SELECT * FROM ${table}`);
      
      if (dataResult.rows.length > 0) {
        sqlContent += `-- Données de la table ${table}\n`;
        
        for (const row of dataResult.rows) {
          const keys = Object.keys(row);
          const values = keys.map(key => {
            const value = row[key];
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            return value;
          });
          
          sqlContent += `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        sqlContent += `\n`;
      }
    }
    
    // Exporter les séquences
    const sequencesResult = await pool.query(`
      SELECT sequence_name, last_value
      FROM information_schema.sequences
      WHERE sequence_schema = 'public';
    `);
    
    if (sequencesResult.rows.length > 0) {
      sqlContent += `\n-- Séquences\n`;
      for (const seq of sequencesResult.rows) {
        sqlContent += `SELECT setval('${seq.sequence_name}', ${seq.last_value}, true);\n`;
      }
    }
    
    // Sauvegarder dans un fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `rh_portal_backup_${timestamp}.sql`;
    fs.writeFileSync(filename, sqlContent, 'utf8');
    
    console.log(`✅ Export terminé: ${filename}`);
    console.log(`📁 Fichier créé: ${path.resolve(filename)}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    await pool.end();
    process.exit(1);
  }
}

exportDatabase();

