const { Pool } = require('pg');

// Configuration de la base de données (à adapter selon votre configuration)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'votre_mot_de_passe', // Remplacez par votre mot de passe
  port: 5432,
});

async function testDatabaseConnection() {
  console.log('🧪 Test de connexion à la base de données\n');

  try {
    // 1. Tester la connexion
    console.log('1️⃣ Test de connexion à la base de données...');
    const client = await pool.connect();
    console.log('✅ Connexion réussie à PostgreSQL');
    
    // 2. Vérifier que la table employees existe
    console.log('\n2️⃣ Vérification de l\'existence de la table employees...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employees'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Table employees trouvée');
    } else {
      console.log('❌ Table employees introuvable');
      client.release();
      return;
    }
    
    // 3. Compter le nombre d'employés
    console.log('\n3️⃣ Comptage des employés dans la table...');
    const countResult = await client.query('SELECT COUNT(*) FROM employees');
    const employeeCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Nombre total d'employés: ${employeeCount}`);
    
    if (employeeCount === 0) {
      console.log('⚠️ Aucun employé trouvé dans la base de données');
      console.log('💡 Vous devez d\'abord ajouter des employés via l\'onboarding ou manuellement');
    } else {
      // 4. Récupérer quelques employés pour vérifier la structure
      console.log('\n4️⃣ Récupération de la structure des données...');
      const sampleResult = await client.query(`
        SELECT 
          id, 
          matricule, 
          nom_prenom, 
          poste_actuel, 
          entity, 
          departement, 
          type_contrat, 
          date_entree
        FROM employees 
        LIMIT 3
      `);
      
      console.log('📋 Exemple d\'employés:');
      sampleResult.rows.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.nom_prenom} (${emp.matricule}) - ${emp.poste_actuel}`);
        console.log(`      Entité: ${emp.entity} - ${emp.departement}`);
        console.log(`      Contrat: ${emp.type_contrat} (entrée: ${emp.date_entree})`);
      });
    }
    
    // 5. Vérifier les colonnes de la table employees
    console.log('\n5️⃣ Structure de la table employees...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'employees'
      ORDER BY ordinal_position
    `);
    
    console.log('🏗️ Colonnes de la table employees:');
    columnsResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    client.release();
    
    console.log('\n🎯 Test de connexion terminé avec succès !');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Vérifiez que PostgreSQL est démarré et accessible');
    } else if (error.code === '28P01') {
      console.log('💡 Vérifiez vos identifiants de connexion (utilisateur/mot de passe)');
    } else if (error.code === '3D000') {
      console.log('💡 Vérifiez que la base de données "rh_portal" existe');
    }
  } finally {
    await pool.end();
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testDatabaseConnection().catch(console.error);
}

module.exports = { testDatabaseConnection };








