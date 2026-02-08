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

// Obtenir la date et l'heure actuelles
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `rh_portal_export_${timestamp}.sql`;
const filepath = path.join(exportDir, filename);

console.log('🚀 EXPORT RAPIDE DE LA BASE DE DONNÉES RH_PORTAL');
console.log('================================================');
console.log(`📊 Base: ${DB_CONFIG.database}`);
console.log(`🏠 Hôte: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
console.log(`👤 Utilisateur: ${DB_CONFIG.user}`);
console.log(`📁 Fichier de sortie: ${filename}`);
console.log('================================================\n');

// Commande d'export
const command = `PGPASSWORD="${DB_CONFIG.password}" pg_dump -h ${DB_CONFIG.host} -U ${DB_CONFIG.user} -d ${DB_CONFIG.database} -p ${DB_CONFIG.port} --no-owner --no-privileges --clean --create --if-exists > "${filepath}"`;

console.log('🔄 Export en cours...');
console.log('⏳ Cela peut prendre quelques minutes selon la taille de la base...\n');

// Exécuter l'export
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ ERREUR lors de l\'export:');
    console.error(error.message);
    
    if (error.message.includes('pg_dump')) {
      console.error('\n💡 SOLUTION: Vérifiez que PostgreSQL est installé et que pg_dump est dans le PATH');
      console.error('🔗 Télécharger PostgreSQL: https://www.postgresql.org/download/');
    }
    return;
  }
  
  if (stderr) {
    console.log('⚠️ Avertissements (non critiques):');
    console.log(stderr);
  }
  
  // Vérifier que le fichier a été créé
  if (fs.existsSync(filepath)) {
    const stats = fs.statSync(filepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n✅ EXPORT TERMINÉ AVEC SUCCÈS!');
    console.log('================================');
    console.log(`📂 Fichier: ${filename}`);
    console.log(`📁 Chemin: ${filepath}`);
    console.log(`📊 Taille: ${fileSizeInMB} MB`);
    console.log(`🕐 Timestamp: ${timestamp}`);
    console.log('================================\n');
    
    console.log('💡 INFORMATIONS IMPORTANTES:');
    console.log('• Le fichier contient la structure ET les données de votre base');
    console.log('• Vous pouvez le restaurer avec: psql -U postgres -d rh_portal < fichier.sql');
    console.log('• Sauvegardez ce fichier dans un endroit sûr');
    console.log('• Le format SQL est compatible avec toutes les versions de PostgreSQL\n');
    
  } else {
    console.error('❌ Le fichier d\'export n\'a pas été créé');
  }
});












