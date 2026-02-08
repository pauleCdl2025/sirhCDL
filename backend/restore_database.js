const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration de la base de données
const DB_CONFIG = {
  user: 'postgres',
  host: 'localhost',
  password: 'Cdl202407',
  port: 5432
};

// Interface de lecture
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔄 RESTAURATION DE LA BASE DE DONNÉES RH_PORTAL');
console.log('================================================');

// Fonction pour lister les fichiers d'export disponibles
function listExportFiles() {
  const exportDir = path.join(__dirname, 'exports');
  
  if (!fs.existsSync(exportDir)) {
    console.log('❌ Aucun dossier d\'export trouvé. Exécutez d\'abord un export.');
    return [];
  }
  
  const files = fs.readdirSync(exportDir)
    .filter(file => file.endsWith('.sql'))
    .map(file => ({
      name: file,
      path: path.join(exportDir, file),
      stats: fs.statSync(path.join(exportDir, file))
    }))
    .sort((a, b) => b.stats.mtime - a.stats.mtime); // Plus récent en premier
  
  if (files.length === 0) {
    console.log('❌ Aucun fichier d\'export SQL trouvé dans le dossier exports/');
    return [];
  }
  
  console.log('\n📁 Fichiers d\'export disponibles:');
  console.log('==================================');
  
  files.forEach((file, index) => {
    const sizeMB = (file.stats.size / (1024 * 1024)).toFixed(2);
    const date = file.stats.mtime.toLocaleString();
    console.log(`${index + 1}. ${file.name}`);
    console.log(`   📊 Taille: ${sizeMB} MB | 📅 Date: ${date}`);
  });
  
  return files;
}

// Fonction pour demander le nom de la base de destination
function askDatabaseName() {
  return new Promise((resolve) => {
    rl.question('\n📝 Nom de la base de données de destination (défaut: rh_portal): ', (answer) => {
      resolve(answer.trim() || 'rh_portal');
    });
  });
}

// Fonction pour confirmer la restauration
function confirmRestore(filename, dbName) {
  return new Promise((resolve) => {
    console.log('\n⚠️  ATTENTION: Cette opération va:');
    console.log(`   • Supprimer la base '${dbName}' si elle existe`);
    console.log(`   • Créer une nouvelle base '${dbName}'`);
    console.log(`   • Restaurer toutes les données depuis '${filename}'`);
    console.log('   • Cette action est IRREVERSIBLE!');
    
    rl.question('\n❓ Êtes-vous sûr de vouloir continuer? (oui/non): ', (answer) => {
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o');
    });
  });
}

// Fonction pour créer la base de données
function createDatabase(dbName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔨 Création de la base de données '${dbName}'...`);
    
    const command = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -p ${DB_CONFIG.port} -c "CREATE DATABASE ${dbName};"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Si la base existe déjà, on la supprime d'abord
        if (error.message.includes('already exists')) {
          console.log(`⚠️  La base '${dbName}' existe déjà. Suppression en cours...`);
          const dropCommand = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -p ${DB_CONFIG.port} -c "DROP DATABASE ${dbName};"`;
          
          exec(dropCommand, (dropError, dropStdout, dropStderr) => {
            if (dropError) {
              reject(new Error(`Impossible de supprimer la base existante: ${dropError.message}`));
              return;
            }
            
            // Recréer la base
            exec(command, (createError, createStdout, createStderr) => {
              if (createError) {
                reject(new Error(`Impossible de créer la base: ${createError.message}`));
                return;
              }
              console.log(`✅ Base '${dbName}' créée avec succès`);
              resolve();
            });
          });
        } else {
          reject(new Error(`Impossible de créer la base: ${error.message}`));
        }
        return;
      }
      
      console.log(`✅ Base '${dbName}' créée avec succès`);
      resolve();
    });
  });
}

// Fonction pour restaurer la base
function restoreDatabase(filePath, dbName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Restauration de la base '${dbName}' depuis '${path.basename(filePath)}'...`);
    console.log('⏳ Cette opération peut prendre plusieurs minutes...');
    
    const command = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${dbName} -p ${DB_CONFIG.port} < "${filePath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Erreur lors de la restauration: ${error.message}`));
        return;
      }
      
      if (stderr) {
        console.log('⚠️  Avertissements (non critiques):');
        console.log(stderr);
      }
      
      console.log('✅ Restauration terminée avec succès!');
      resolve();
    });
  });
}

// Fonction pour vérifier la restauration
function verifyRestore(dbName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Vérification de la restauration...`);
    
    const command = `PGPASSWORD="${DB_CONFIG.password}" psql -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${dbName} -p ${DB_CONFIG.port} -c "\\dt"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Erreur lors de la vérification: ${error.message}`));
        return;
      }
      
      console.log('📋 Tables restaurées:');
      console.log(stdout);
      resolve();
    });
  });
}

// Fonction principale
async function main() {
  try {
    // Lister les fichiers d'export
    const exportFiles = listExportFiles();
    
    if (exportFiles.length === 0) {
      rl.close();
      return;
    }
    
    // Demander le fichier à restaurer
    const fileIndex = await new Promise((resolve) => {
      rl.question(`\n📝 Choisissez le fichier à restaurer (1-${exportFiles.length}): `, (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < exportFiles.length) {
          resolve(index);
        } else {
          console.log('❌ Choix invalide. Utilisation du fichier le plus récent.');
          resolve(0);
        }
      });
    });
    
    const selectedFile = exportFiles[fileIndex];
    
    // Demander le nom de la base de destination
    const dbName = await askDatabaseName();
    
    // Confirmer la restauration
    const confirmed = await confirmRestore(selectedFile.name, dbName);
    
    if (!confirmed) {
      console.log('❌ Restauration annulée.');
      rl.close();
      return;
    }
    
    // Créer la base de données
    await createDatabase(dbName);
    
    // Restaurer la base
    await restoreDatabase(selectedFile.path, dbName);
    
    // Vérifier la restauration
    await verifyRestore(dbName);
    
    console.log('\n🎉 RESTAURATION TERMINÉE AVEC SUCCÈS!');
    console.log('========================================');
    console.log(`📊 Base restaurée: ${dbName}`);
    console.log(`📁 Source: ${selectedFile.name}`);
    console.log(`📂 Chemin: ${selectedFile.path}`);
    console.log('========================================\n');
    
    console.log('💡 INFORMATIONS:');
    console.log('• Votre base de données a été restaurée avec succès');
    console.log('• Toutes les tables et données sont disponibles');
    console.log('• Vous pouvez maintenant vous connecter à la base');
    
  } catch (error) {
    console.error('\n❌ ERREUR lors de la restauration:');
    console.error(error.message);
    
    if (error.message.includes('psql')) {
      console.error('\n💡 SOLUTION: Vérifiez que PostgreSQL est installé et que psql est dans le PATH');
      console.error('🔗 Télécharger PostgreSQL: https://www.postgresql.org/download/');
    }
  } finally {
    rl.close();
  }
}

// Démarrer le script
main();












