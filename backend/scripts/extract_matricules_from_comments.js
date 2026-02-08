const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function extractMatriculesFromComments() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔍 Extraction des matricules depuis les commentaires...\n');
    
    // Récupérer tous les enregistrements avec leurs commentaires
    const allRecords = await client.query(`
      SELECT id, nom, prenom, commentaire
      FROM historique_departs
      WHERE commentaire IS NOT NULL
        AND commentaire != ''
    `);
    
    console.log(`📋 ${allRecords.rows.length} enregistrement(s) avec commentaires`);
    
    let updated = 0;
    const matriculePattern = /[Mm]atricule[:\s]+([A-Z0-9\-]+)/gi;
    
    for (const record of allRecords.rows) {
      if (!record.commentaire) continue;
      
      const matches = [...record.commentaire.matchAll(matriculePattern)];
      if (matches.length > 0) {
        const matricule = matches[0][1].trim();
        console.log(`   ✅ ID ${record.id}: ${record.nom} ${record.prenom} -> Matricule trouvé: ${matricule}`);
        
        // Note: historique_departs n'a pas de colonne matricule
        // On ne peut que logger l'information
        // Le matricule sera extrait dynamiquement dans le code backend
      }
    }
    
    console.log(`\n✅ ${updated} enregistrement(s) traités`);
    console.log('\n💡 Note: Les matricules seront extraits dynamiquement par le backend lors de la récupération des données.');
    
    await client.query('COMMIT');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

extractMatriculesFromComments()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });
