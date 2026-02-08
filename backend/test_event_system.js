const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
});

async function testEventSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Test du système d\'événements...\n');
    
    // 1. Vérifier la structure de la table evenements
    console.log('1️⃣ Structure de la table evenements:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'evenements' 
      ORDER BY ordinal_position;
    `);
    
    if (columnsResult.rows.length === 0) {
      console.log('❌ Table evenements non trouvée!');
      return;
    }
    
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${row.column_default ? `default: ${row.column_default}` : ''}`);
    });
    
    // 2. Vérifier les événements existants
    console.log('\n2️⃣ Événements existants:');
    const eventsResult = await client.query('SELECT id, name, date, location FROM evenements LIMIT 5');
    
    if (eventsResult.rows.length === 0) {
      console.log('   Aucun événement trouvé');
    } else {
      eventsResult.rows.forEach(event => {
        console.log(`   - ID: ${event.id}, Nom: ${event.name}, Date: ${event.date}, Lieu: ${event.location}`);
      });
    }
    
    // 3. Test de création d'un événement
    console.log('\n3️⃣ Test de création d\'événement:');
    try {
      const testEvent = {
        name: 'Test Événement',
        date: '2024-12-25',
        location: 'Salle de réunion',
        description: 'Événement de test pour vérifier le système'
      };
      
      const insertQuery = `
        INSERT INTO evenements (name, date, location, description) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      
      const insertResult = await client.query(insertQuery, [
        testEvent.name,
        testEvent.date,
        testEvent.location,
        testEvent.description
      ]);
      
      console.log('✅ Événement créé avec succès:', insertResult.rows[0]);
      
      // Supprimer l'événement de test
      await client.query('DELETE FROM evenements WHERE id = $1', [insertResult.rows[0].id]);
      console.log('✅ Événement de test supprimé');
      
    } catch (insertError) {
      console.log('❌ Erreur lors de la création:', insertError.message);
      
      if (insertError.code) {
        console.log('   Code d\'erreur PostgreSQL:', insertError.code);
      }
      if (insertError.detail) {
        console.log('   Détail:', insertError.detail);
      }
      if (insertError.hint) {
        console.log('   Conseil:', insertError.hint);
      }
    }
    
    // 4. Vérifier les triggers
    console.log('\n4️⃣ Vérification des triggers:');
    try {
      const triggerResult = await client.query(`
        SELECT trigger_name, event_manipulation, action_statement
        FROM information_schema.triggers 
        WHERE event_object_table = 'evenements'
      `);
      
      if (triggerResult.rows.length === 0) {
        console.log('   Aucun trigger trouvé');
      } else {
        triggerResult.rows.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation} -> ${trigger.action_statement}`);
        });
      }
    } catch (triggerError) {
      console.log('   ❌ Erreur lors de la vérification des triggers:', triggerError.message);
    }
    
    // 5. Test de validation des données
    console.log('\n5️⃣ Test de validation des données:');
    
    // Test avec des données manquantes
    try {
      await client.query(`
        INSERT INTO evenements (name, date) 
        VALUES ($1, $2)
      `, ['Test sans lieu', '2024-12-25']);
    } catch (validationError) {
      console.log('   ✅ Validation fonctionne (erreur attendue):', validationError.message);
    }
    
    // Test avec une date invalide
    try {
      await client.query(`
        INSERT INTO evenements (name, date, location, description) 
        VALUES ($1, $2, $3, $4)
      `, ['Test date invalide', 'date-invalide', 'Lieu', 'Description']);
    } catch (dateError) {
      console.log('   ✅ Validation de date fonctionne (erreur attendue):', dateError.message);
    }
    
    console.log('\n🎯 Résumé des tests:');
    console.log(`   - Table evenements: ${columnsResult.rows.length} colonnes`);
    console.log(`   - Événements: ${eventsResult.rows.length} trouvés`);
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter les tests
testEventSystem()
  .then(() => {
    console.log('\n✅ Tests terminés');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });











