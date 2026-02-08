const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function debugOnboardingInsertion() {
  try {
    console.log('🔍 Debug de l\'insertion onboarding...\n');
    
    // Simuler les données d'onboarding
    const employeeData = {
      type_contrat: 'CDI',
      poste_actuel: 'Développeur',
      departement: 'IT',
      date_entree: '2025-01-01',
      date_fin_contrat: null,
      salaire_base: 500000,
      salaire_propose: 400000,
      type_remuneration: 'Mensuel',
      mode_paiement: 'Virement bancaire',
      periode_essai: 90,
      date_fin_essai: '2025-04-01',
      lieu_travail: 'CDL Libreville',
      horaires_travail: '8h-17h',
      responsable: 'Direction générale',
      source_recrutement: 'Onboarding direct',
      conditions_particulieres: 'Conditions de test',
      avantages_sociaux: 'Avantages de test',
      date_signature: '2025-01-01',
      notes: 'Contrat créé via processus d\'onboarding'
    };
    
    const newEmployee = { id: 1 }; // Simuler un employé existant
    
    console.log('📋 Tentative d\'insertion avec la requête onboarding...');
    
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
      newEmployee.id,
      `CONTRAT-${newEmployee.id}`,
      employeeData.type_contrat,
      employeeData.poste_actuel,
      employeeData.departement,
      employeeData.date_entree,
      employeeData.date_fin_contrat || null,
      employeeData.salaire_base || null,
      employeeData.salaire_propose || null,
      employeeData.type_remuneration || 'Mensuel',
      employeeData.mode_paiement || 'Virement bancaire',
      employeeData.periode_essai || null,
      employeeData.date_fin_essai || null,
      employeeData.lieu_travail || employeeData.entity || 'CDL',
      employeeData.horaires_travail || '8h-17h',
      employeeData.responsable || 'Direction générale',
      employeeData.source_recrutement || 'Onboarding direct',
      employeeData.conditions_particulieres || null,
      employeeData.avantages_sociaux || null,
      employeeData.date_signature || employeeData.date_entree,
      employeeData.date_entree,
      'Actif',
      employeeData.notes || 'Contrat créé via processus d\'onboarding',
      new Date(),
      new Date()
    ]);
    
    console.log('✅ Insertion réussie !');
    console.log('📋 Contrat créé:', insertResult.rows[0]);
    
    // Nettoyer le test
    await pool.query('DELETE FROM contrats WHERE numero_contrat = $1', [`CONTRAT-${newEmployee.id}`]);
    console.log('🧹 Données de test supprimées');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
    
    // Afficher le nombre de paramètres
    const params = [
      'newEmployee.id',
      'CONTRAT-${newEmployee.id}',
      'employeeData.type_contrat',
      'employeeData.poste_actuel',
      'employeeData.departement',
      'employeeData.date_entree',
      'employeeData.date_fin_contrat || null',
      'employeeData.salaire_base || null',
      'employeeData.salaire_propose || null',
      'employeeData.type_remuneration || \'Mensuel\'',
      'employeeData.mode_paiement || \'Virement bancaire\'',
      'employeeData.periode_essai || null',
      'employeeData.date_fin_essai || null',
      'employeeData.lieu_travail || employeeData.entity || \'CDL\'',
      'employeeData.horaires_travail || \'8h-17h\'',
      'employeeData.responsable || \'Direction générale\'',
      'employeeData.source_recrutement || \'Onboarding direct\'',
      'employeeData.conditions_particulieres || null',
      'employeeData.avantages_sociaux || null',
      'employeeData.date_signature || employeeData.date_entree',
      'employeeData.date_entree',
      '\'Actif\'',
      'employeeData.notes || \'Contrat créé via processus d\'onboarding\'',
      'new Date()',
      'new Date()'
    ];
    
    console.log(`\n📊 Nombre de paramètres: ${params.length}`);
    console.log('📋 Paramètres:');
    params.forEach((param, index) => {
      console.log(`${index + 1}. ${param}`);
    });
  } finally {
    await pool.end();
  }
}

debugOnboardingInsertion();







