const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function testContratInsertion() {
  try {
    console.log('🧪 Test d\'insertion de contrat...\n');
    
    // Vérifier la structure exacte de la table contrats
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'contrats' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes disponibles dans contrats:');
    structure.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    // Test d'insertion avec les colonnes exactes
    const testData = {
      employee_id: 1, // Utiliser un employé existant
      numero_contrat: 'CONTRAT-TEST-001',
      type_contrat: 'CDD',
      titre_poste: 'Test Poste',
      departement: 'IT',
      date_debut: '2025-01-01',
      date_fin: null,
      salaire_brut: 500000,
      salaire_net: 400000,
      type_remuneration: 'Mensuel',
      mode_paiement: 'Virement bancaire',
      periode_essai: 90,
      date_fin_essai: '2025-04-01',
      lieu_travail: 'CDL Libreville',
      horaires_travail: '8h-17h',
      superieur_hierarchique: 'Direction générale',
      motif_contrat: 'Test',
      conditions_particulieres: 'Conditions de test',
      avantages_sociaux: 'Avantages de test',
      date_signature: '2025-01-01',
      date_effet: '2025-01-01',
      statut: 'Actif',
      notes: 'Contrat de test'
    };
    
    console.log('\n🔍 Tentative d\'insertion avec les colonnes exactes...');
    
    const insertResult = await pool.query(`
      INSERT INTO contrats (
        employee_id, 
        numero_contrat,
        type_contrat, 
        titre_poste,
        departement,
        date_debut, 
        date_fin, 
        salaire_brut,
        salaire_net,
        type_remuneration,
        mode_paiement,
        periode_essai,
        date_fin_essai,
        lieu_travail,
        horaires_travail,
        superieur_hierarchique,
        motif_contrat,
        conditions_particulieres,
        avantages_sociaux,
        date_signature,
        date_effet,
        statut,
        notes,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING id, numero_contrat, titre_poste
    `, [
      testData.employee_id,
      testData.numero_contrat,
      testData.type_contrat,
      testData.titre_poste,
      testData.departement,
      testData.date_debut,
      testData.date_fin,
      testData.salaire_brut,
      testData.salaire_net,
      testData.type_remuneration,
      testData.mode_paiement,
      testData.periode_essai,
      testData.date_fin_essai,
      testData.lieu_travail,
      testData.horaires_travail,
      testData.superieur_hierarchique,
      testData.motif_contrat,
      testData.conditions_particulieres,
      testData.avantages_sociaux,
      testData.date_signature,
      testData.date_effet,
      testData.statut,
      testData.notes,
      new Date(),
      new Date()
    ]);
    
    console.log('✅ Insertion réussie !');
    console.log('📋 Contrat créé:', insertResult.rows[0]);
    
    // Nettoyer le test
    await pool.query('DELETE FROM contrats WHERE numero_contrat = $1', [testData.numero_contrat]);
    console.log('🧹 Données de test supprimées');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
  } finally {
    await pool.end();
  }
}

testContratInsertion();







