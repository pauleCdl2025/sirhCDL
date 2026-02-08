const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rh_portal',
  password: process.env.DB_PASSWORD || 'Cdl@2025',
  port: parseInt(process.env.DB_PORT) || 5432,
});

async function checkLoginHistory() {
  try {
    console.log('📊 Vérification de l\'historique de connexion...\n');

    // Vérifier les 10 dernières connexions
    const result = await pool.query(`
      SELECT 
        id,
        user_type,
        user_id,
        email,
        matricule,
        login_status,
        login_time,
        created_at,
        ip_address
      FROM login_history
      ORDER BY COALESCE(login_time, created_at) DESC
      LIMIT 10
    `);

    console.log(`✅ Nombre d'entrées trouvées: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('⚠️ Aucune entrée trouvée dans login_history');
      console.log('💡 Vérifiez que la table existe et que les connexions enregistrent bien les données.\n');
    } else {
      console.log('📋 Dernières connexions:\n');
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. Type: ${row.user_type} | ID: ${row.user_id}`);
        console.log(`   Matricule/Email: ${row.matricule || row.email || 'N/A'}`);
        console.log(`   Statut: ${row.login_status}`);
        console.log(`   Date: ${row.login_time || row.created_at}`);
        console.log(`   IP: ${row.ip_address || 'N/A'}`);
        console.log('');
      });
    }

    // Statistiques par type d'utilisateur
    const stats = await pool.query(`
      SELECT 
        user_type,
        login_status,
        COUNT(*) as count
      FROM login_history
      GROUP BY user_type, login_status
      ORDER BY user_type, login_status
    `);

    console.log('📊 Statistiques par type d\'utilisateur:\n');
    if (stats.rows.length > 0) {
      stats.rows.forEach(row => {
        console.log(`   ${row.user_type} - ${row.login_status}: ${row.count}`);
      });
    } else {
      console.log('   Aucune statistique disponible');
    }

    // Vérifier spécifiquement les connexions employés
    const employees = await pool.query(`
      SELECT COUNT(*) as count
      FROM login_history
      WHERE user_type = 'employee'
    `);

    console.log(`\n👤 Connexions employés totales: ${employees.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await pool.end();
  }
}

checkLoginHistory();

