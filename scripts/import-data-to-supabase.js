#!/usr/bin/env node
/**
 * Import des données vers Supabase depuis rh_portail.sql
 * 
 * Méthode 1 (recommandée): Utilise psql si disponible
 * Méthode 2: Instructions pour import manuel
 * 
 * Variables d'environnement requises:
 *   DB_HOST=db.dwpkqdiunxbgumepkveb.supabase.co
 *   DB_USER=postgres
 *   DB_NAME=postgres
 *   DB_PASSWORD=votre_mot_de_passe_supabase
 *   DB_PORT=5432
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Préférer le fichier données uniquement si les tables existent déjà
const dataOnlyFile = path.join(__dirname, '..', 'rh_portail_DATA_ONLY.sql');
const fullFile = path.join(__dirname, '..', 'rh_portail.sql');
const sqlFile = fs.existsSync(dataOnlyFile) ? dataOnlyFile : fullFile;

// Vérifier que le fichier existe
if (!fs.existsSync(sqlFile)) {
  console.error('❌ Fichier rh_portail.sql introuvable');
  console.log('\n   Si vos tables Supabase existent déjà (vides), exécutez d\'abord:');
  console.log('   node scripts/extract-data-only.js');
  process.exit(1);
}

const host = process.env.DB_HOST || 'db.dwpkqdiunxbgumepkveb.supabase.co';
const user = process.env.DB_USER || 'postgres';
const database = process.env.DB_NAME || 'postgres';
const password = process.env.DB_PASSWORD;
const port = process.env.DB_PORT || '5432';

if (!password) {
  console.error('❌ Mot de passe requis. Définissez DB_PASSWORD');
  console.log('\n   Exemple: set DB_PASSWORD=votre_mot_de_passe');
  console.log('   Puis: node scripts/import-data-to-supabase.js');
  process.exit(1);
}

console.log('📦 Import des données vers Supabase\n');
console.log(`   Fichier: ${path.basename(sqlFile)}`);
console.log(`   Host: ${host}\n`);

// Essayer psql
function runWithPsql() {
  return new Promise((resolve, reject) => {
    const psqlArgs = ['-h', host, '-p', port, '-U', user, '-d', database, '-f', sqlFile];
    const psql = spawn('psql', psqlArgs, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PGPASSWORD: password, PGSSLMODE: 'require' }
    });

    psql.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`psql exit code: ${code}`));
    });

    psql.on('error', (err) => reject(err));
  });
}

// Vérifier si psql est disponible
function checkPsql() {
  return new Promise((resolve) => {
    const check = spawn('psql', ['--version'], {
      stdio: 'pipe',
      shell: true
    });
    check.on('close', (code) => resolve(code === 0));
    check.on('error', () => resolve(false));
  });
}

(async () => {
  try {
    const hasPsql = await checkPsql();

    if (hasPsql) {
      console.log('✅ psql détecté - Lancement de l\'import...\n');
      await runWithPsql();
      console.log('\n✅ Import terminé avec succès!');
    } else {
      console.log('⚠️  psql n\'est pas installé ou pas dans le PATH.\n');
      console.log('📋 Méthode alternative - Import manuel:\n');
      console.log('1. Installez PostgreSQL (inclut psql):');
      console.log('   https://www.postgresql.org/download/windows/\n');
      console.log('2. Ou utilisez la connexion directe dans un client SQL:');
      console.log(`   Host: ${host}`);
      console.log(`   Port: ${port}`);
      console.log(`   Database: ${database}`);
      console.log(`   User: ${user}\n`);
      console.log('3. Avec pgAdmin ou DBeaver:');
      console.log('   - Connectez-vous à Supabase');
      console.log('   - Exécutez le fichier rh_portail.sql\n');
      console.log('4. Via Supabase Dashboard:');
      console.log('   - Le SQL Editor ne supporte pas COPY.');
      console.log('   - Utilisez "rh_portail_supabase.sql" pour le schéma.');
      console.log('   - Pour les données: utilisez psql ou un client externe.');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
    process.exit(1);
  }
})();
