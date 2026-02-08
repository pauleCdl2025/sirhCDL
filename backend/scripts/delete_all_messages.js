require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'Cdl@2025',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function deleteAllMessages() {
  const client = await pool.connect();
  try {
    console.log('🗑️  Suppression de tous les messages entre RH et employés...');
    
    // Compter les messages avant suppression
    const countResult = await client.query('SELECT COUNT(*) as count FROM messages');
    const messageCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Nombre de messages à supprimer: ${messageCount}`);
    
    if (messageCount === 0) {
      console.log('✅ Aucun message à supprimer.');
      return;
    }
    
    // Supprimer tous les messages
    const deleteResult = await client.query('DELETE FROM messages');
    console.log(`✅ ${deleteResult.rowCount} message(s) supprimé(s) avec succès.`);
    
    // Vérifier qu'il ne reste plus de messages
    const verifyResult = await client.query('SELECT COUNT(*) as count FROM messages');
    const remainingCount = parseInt(verifyResult.rows[0].count);
    
    if (remainingCount === 0) {
      console.log('✅ Tous les messages ont été supprimés avec succès.');
    } else {
      console.log(`⚠️  Il reste ${remainingCount} message(s) dans la base de données.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des messages:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
deleteAllMessages()
  .then(() => {
    console.log('✅ Script terminé avec succès.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });


