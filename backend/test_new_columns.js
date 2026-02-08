const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function testNewColumns() {
  try {
    console.log('🔍 Test des nouvelles colonnes ajoutées...\n');
    
    // Vérifier la structure mise à jour
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      AND column_name IN ('contact_urgence', 'telephone_urgence', 'type_remuneration', 'mode_paiement', 'departement')
      ORDER BY column_name
    `);
    
    console.log('📋 Nouvelles colonnes vérifiées:');
    structure.rows.forEach(row => {
      console.log(`✅ ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    // Vérifier le nombre total de colonnes
    const totalColumns = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns 
      WHERE table_name = 'employees'
    `);
    
    console.log(`\n📊 Total colonnes dans employees: ${totalColumns.rows[0].count}`);
    
    // Test d'insertion avec les nouveaux champs
    console.log('\n🧪 Test d\'insertion avec les nouveaux champs...');
    
    const testData = {
      matricule: 'CDL-2025-TEST',
      nom_prenom: 'Test Utilisateur',
      email: 'test@example.com',
      telephone: '+24112345678',
      genre: 'Homme',
      date_naissance: '1990-01-01',
      lieu: 'Libreville',
      nationalite: 'Gabon',
      statut_marital: 'Célibataire',
      enfants: 0,
      adresse: 'Test Adresse',
      cnss_number: 'TEST123',
      cnamgs_number: 'TEST456',
      contact_urgence: 'Contact Test',
      telephone_urgence: '+24187654321',
      poste_actuel: 'Test Poste',
      type_contrat: 'CDD',
      date_entree: '2025-01-01',
      entity: 'CDL',
      departement: 'IT',
      domaine_fonctionnel: 'Informatique',
      type_remuneration: 'Mensuel',
      mode_paiement: 'Virement bancaire'
    };
    
    const insertResult = await pool.query(`
      INSERT INTO employees (
        matricule, nom_prenom, email, telephone, genre, date_naissance,
        lieu, nationalite, statut_marital, enfants, adresse, cnss_number, 
        cnamgs_number, contact_urgence, telephone_urgence, poste_actuel,
        type_contrat, date_entree, entity, departement, domaine_fonctionnel,
        statut_employe, type_remuneration, mode_paiement, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING id, matricule, nom_prenom, contact_urgence, telephone_urgence, departement, type_remuneration, mode_paiement
    `, [
      testData.matricule, testData.nom_prenom, testData.email, testData.telephone,
      testData.genre, testData.date_naissance, testData.lieu, testData.nationalite,
      testData.statut_marital, testData.enfants, testData.adresse, testData.cnss_number,
      testData.cnamgs_number, testData.contact_urgence, testData.telephone_urgence,
      testData.poste_actuel, testData.type_contrat, testData.date_entree,
      testData.entity, testData.departement, testData.domaine_fonctionnel,
      'Actif', testData.type_remuneration, testData.mode_paiement, new Date()
    ]);
    
    console.log('✅ Test d\'insertion réussi !');
    console.log('📋 Données insérées:', insertResult.rows[0]);
    
    // Nettoyer le test
    await pool.query('DELETE FROM employees WHERE matricule = $1', [testData.matricule]);
    console.log('🧹 Données de test supprimées');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await pool.end();
  }
}

testNewColumns();







