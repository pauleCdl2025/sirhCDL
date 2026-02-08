const { exec } = require('child_process');
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

// Fonction pour obtenir la date et l'heure actuelles
function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// Fonction pour exporter en format SQL (plain text)
function exportToSQL() {
  const timestamp = getTimestamp();
  const filename = `rh_portal_export_${timestamp}.sql`;
  const filepath = path.join(exportDir, filename);
  
  const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --no-owner --no-privileges --clean --create --if-exists > "${filepath}"`;
  
  console.log('🔄 Export en cours vers SQL...');
  console.log(`📁 Fichier: ${filename}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de l\'export SQL:', error.message);
      return;
    }
    if (stderr) {
      console.log('⚠️ Avertissements:', stderr);
    }
    console.log('✅ Export SQL terminé avec succès!');
    console.log(`📂 Fichier sauvegardé: ${filepath}`);
  });
}

// Fonction pour exporter en format custom (binaire, plus rapide)
function exportToCustom() {
  const timestamp = getTimestamp();
  const filename = `rh_portal_export_${timestamp}.backup`;
  const filepath = path.join(exportDir, filename);
  
  const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --no-owner --no-privileges --format=custom --file="${filepath}"`;
  
  console.log('🔄 Export en cours vers format custom...');
  console.log(`📁 Fichier: ${filename}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de l\'export custom:', error.message);
      return;
    }
    if (stderr) {
      console.log('⚠️ Avertissements:', stderr);
    }
    console.log('✅ Export custom terminé avec succès!');
    console.log(`📂 Fichier sauvegardé: ${filepath}`);
  });
}

// Fonction pour exporter en format directory (pour les gros volumes)
function exportToDirectory() {
  const timestamp = getTimestamp();
  const dirname = `rh_portal_export_${timestamp}`;
  const dirpath = path.join(exportDir, dirname);
  
  const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --no-owner --no-privileges --format=directory --file="${dirpath}"`;
  
  console.log('🔄 Export en cours vers répertoire...');
  console.log(`📁 Répertoire: ${dirname}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de l\'export directory:', error.message);
      return;
    }
    if (stderr) {
      console.log('⚠️ Avertissements:', stderr);
    }
    console.log('✅ Export directory terminé avec succès!');
    console.log(`📂 Répertoire sauvegardé: ${dirpath}`);
  });
}

// Fonction pour exporter uniquement les données (sans structure)
function exportDataOnly() {
  const timestamp = getTimestamp();
  const filename = `rh_portal_data_only_${timestamp}.sql`;
  const filepath = path.join(exportDir, filename);
  
  const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --data-only --no-owner --no-privileges > "${filepath}"`;
  
  console.log('🔄 Export des données uniquement...');
  console.log(`📁 Fichier: ${filename}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de l\'export des données:', error.message);
      return;
    }
    if (stderr) {
      console.log('⚠️ Avertissements:', stderr);
    }
    console.log('✅ Export des données terminé avec succès!');
    console.log(`📂 Fichier sauvegardé: ${filepath}`);
  });
}

// Fonction pour exporter uniquement la structure (sans données)
function exportStructureOnly() {
  const timestamp = getTimestamp();
  const filename = `rh_portal_structure_only_${timestamp}.sql`;
  const filepath = path.join(exportDir, filename);
  
  const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --schema-only --no-owner --no-privileges > "${filepath}"`;
  
  console.log('🔄 Export de la structure uniquement...');
  console.log(`📁 Fichier: ${filename}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de l\'export de la structure:', error.message);
      return;
    }
    if (stderr) {
      console.log('⚠️ Avertissements:', stderr);
    }
    console.log('✅ Export de la structure terminé avec succès!');
    console.log(`📂 Fichier sauvegardé: ${filepath}`);
  });
}

// Fonction pour lister les tables de la base
function listTables() {
  const command = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} -c "\\dt"`;
  
  console.log('📋 Liste des tables de la base de données:');
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de la récupération des tables:', error.message);
      return;
    }
    console.log(stdout);
  });
}

// Fonction pour afficher les informations de la base
function showDatabaseInfo() {
  const command = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} -c "SELECT pg_size_pretty(pg_database_size('${DB_CONFIG.database}'));"`;
  
  console.log('📊 Informations sur la base de données:');
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Erreur lors de la récupération des infos:', error.message);
      return;
    }
    console.log(stdout);
  });
}

// Menu principal
function showMenu() {
  console.log('\n🚀 EXPORT DE LA BASE DE DONNÉES RH_PORTAL');
  console.log('==========================================');
  console.log('1. Export complet en SQL (recommandé)');
  console.log('2. Export en format custom (binaire)');
  console.log('3. Export en répertoire (gros volumes)');
  console.log('4. Export des données uniquement');
  console.log('5. Export de la structure uniquement');
  console.log('6. Lister les tables');
  console.log('7. Informations sur la base');
  console.log('8. Export complet (tous les formats)');
  console.log('0. Quitter');
  console.log('==========================================');
}

// Fonction pour traiter le choix de l'utilisateur
function processChoice(choice) {
  switch (choice) {
    case '1':
      exportToSQL();
      break;
    case '2':
      exportToCustom();
      break;
    case '3':
      exportToDirectory();
      break;
    case '4':
      exportDataOnly();
      break;
    case '5':
      exportStructureOnly();
      break;
    case '6':
      listTables();
      break;
    case '7':
      showDatabaseInfo();
      break;
    case '8':
      console.log('🔄 Export complet en cours...');
      exportToSQL();
      setTimeout(() => exportToCustom(), 2000);
      setTimeout(() => exportToDirectory(), 4000);
      break;
    case '0':
      console.log('👋 Au revoir!');
      process.exit(0);
      break;
    default:
      console.log('❌ Choix invalide. Veuillez réessayer.');
  }
}

// Vérifier si pg_dump est disponible
function checkPgDump() {
  exec('pg_dump --version', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ ERREUR: pg_dump n\'est pas installé ou pas dans le PATH');
      console.error('📋 Veuillez installer PostgreSQL ou ajouter pg_dump au PATH');
      console.error('🔗 https://www.postgresql.org/download/');
      process.exit(1);
    }
    console.log('✅ pg_dump disponible:', stdout.trim());
    console.log('🚀 Démarrage de l\'export...\n');
    
    // Démarrer le menu
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    function askChoice() {
      showMenu();
      rl.question('\nChoisissez une option (0-8): ', (choice) => {
        processChoice(choice);
        setTimeout(askChoice, 1000);
      });
    }
    
    askChoice();
  });
}

// Démarrer le script
console.log('🔍 Vérification de pg_dump...');
checkPgDump();












