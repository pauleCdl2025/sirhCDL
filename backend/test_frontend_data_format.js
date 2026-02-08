const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function testFrontendDataFormat() {
  try {
    console.log('🔍 Test avec le format exact du frontend...\n');
    
    // Simuler exactement le format envoyé par le frontend
    const formData = {
      employeeInfo: {
        matricule: 'CDL-2025-0001',
        nom_prenom: 'Test User',
        email: 'test@test.com',
        telephone: '0123456789',
        genre: 'Homme',
        date_naissance: '1990-01-01',
        lieu_naissance: 'Libreville',
        nationalite: 'Gabon',
        situation_maritale: 'Célibataire',
        nbr_enfants: 0,
        adresse: 'Libreville',
        cnss_number: '',
        cnamgs_number: '',
        contact_urgence: 'Contact Urgence',
        telephone_urgence: '0987654321'
      },
      professionalInfo: {
        poste_actuel: 'Développeur',
        domaine_fonctionnel: 'IT',
        entity: 'CDL',
        departement: 'IT',
        type_contrat: 'CDI',
        date_entree: '2025-01-01',
        date_fin_contrat: '',
        salaire_base: '500000',
        salaire_propose: '400000',
        source_recrutement: 'Onboarding direct',
        categorie: 'Cadre',
        responsable: 'Direction générale',
        niveau_etude: 'Bac+5',
        specialisation: 'Informatique',
        type_remuneration: 'Mensuel',
        mode_paiement: 'Virement bancaire',
        periode_essai: '90',
        date_fin_essai: '2025-04-01',
        lieu_travail: 'CDL Libreville',
        horaires_travail: '8h-17h',
        date_signature: '2025-01-01',
        conditions_particulieres: 'Conditions de test',
        avantages_sociaux: 'Avantages de test',
        notes: 'Contrat créé via processus d\'onboarding'
      },
      checklist: {
        contrat_signature: true,
        documents_verifies: true,
        acces_configure: true,
        formation_initiale: true,
        presentation_equipe: true
      }
    };
    
    // Simuler le format exact envoyé par le frontend
    const employeeData = {
      ...formData.employeeInfo,
      ...formData.professionalInfo,
      checklist: formData.checklist
    };
    
    console.log('📋 Données employeeData (format frontend):', JSON.stringify(employeeData, null, 2));
    
    const newEmployee = { id: 1 }; // Simuler un employé existant
    
    // Test avec le format exact du frontend
    if (employeeData.type_contrat && employeeData.date_entree) {
      console.log('\n📋 Tentative d\'insertion avec format frontend...');
      
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
      
      console.log('✅ Insertion réussie avec format frontend !');
      console.log('📋 Contrat créé:', insertResult.rows[0]);
      
      // Nettoyer le test
      await pool.query('DELETE FROM contrats WHERE numero_contrat = $1', [`CONTRAT-${newEmployee.id}`]);
      console.log('🧹 Données de test supprimées');
    } else {
      console.log('❌ Conditions non remplies pour l\'insertion du contrat');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Détails:', error);
    
    // Afficher les valeurs des paramètres
    console.log('\n📊 Valeurs des paramètres:');
    const values = [
      'newEmployee.id',
      `CONTRAT-${newEmployee.id}`,
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
    
    values.forEach((value, index) => {
      console.log(`${index + 1}. ${value}`);
    });
  } finally {
    await pool.end();
  }
}

testFrontendDataFormat();







