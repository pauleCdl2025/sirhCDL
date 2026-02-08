const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function testOnboardingWithTransaction() {
  try {
    console.log('🔍 Test d\'onboarding avec transaction...\n');
    
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
    
    console.log('📋 Données employeeData:', JSON.stringify(employeeData, null, 2));
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('📋 Début de la transaction...');
      
             // Simuler l'insertion d'un employé
       const employeeResult = await client.query(`
         INSERT INTO employees (
           matricule, 
           nom_prenom, 
           email, 
           telephone, 
           genre, 
           date_naissance,
           lieu,
           nationalite,
           statut_marital,
           enfants,
           adresse,
           cnss_number, 
           cnamgs_number,
           contact_urgence,
           telephone_urgence,
           poste_actuel, 
           type_contrat, 
           date_entree, 
           date_fin_contrat, 
           categorie, 
           responsable, 
           niveau_etude, 
           specialisation,
           entity, 
           departement, 
           domaine_fonctionnel,
           statut_employe,
           salaire_base,
           salaire_net,
           type_remuneration,
           mode_paiement,
           created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) 
         RETURNING *
       `, [
        employeeData.matricule,
        employeeData.nom_prenom,
        employeeData.email,
        employeeData.telephone,
        employeeData.genre,
        employeeData.date_naissance,
        employeeData.lieu_naissance || employeeData.lieu,
        employeeData.nationalite,
        employeeData.situation_maritale || employeeData.statut_marital,
        employeeData.nbr_enfants || employeeData.enfants || 0,
        employeeData.adresse,
        employeeData.cnss_number,
        employeeData.cnamgs_number,
        employeeData.contact_urgence,
        employeeData.telephone_urgence,
        employeeData.poste_actuel,
        employeeData.type_contrat,
        employeeData.date_entree,
        employeeData.date_fin_contrat || null,
        employeeData.categorie,
        employeeData.responsable,
        employeeData.niveau_etude,
        employeeData.specialisation,
        employeeData.entity,
        employeeData.departement,
        employeeData.domaine_fonctionnel,
        'Actif',
        employeeData.salaire_base || null,
        employeeData.salaire_propose || null,
        employeeData.type_remuneration || 'Mensuel',
        employeeData.mode_paiement || 'Virement bancaire',
        new Date()
      ]);

      const newEmployee = employeeResult.rows[0];
      console.log('✅ Employé créé:', newEmployee.id);
      
      // Test de l'insertion du contrat avec transaction
      if (employeeData.type_contrat && employeeData.date_entree) {
        console.log('\n📋 Tentative d\'insertion du contrat avec transaction...');
        
        const insertResult = await client.query(`
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
        
        console.log('✅ Contrat créé avec transaction !');
        console.log('📋 Contrat créé:', insertResult.rows[0]);
      }
      
      await client.query('COMMIT');
      console.log('✅ Transaction commitée avec succès !');
      
      // Nettoyer le test
      await client.query('DELETE FROM contrats WHERE employee_id = $1', [newEmployee.id]);
      await client.query('DELETE FROM employees WHERE id = $1', [newEmployee.id]);
      console.log('🧹 Données de test supprimées');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur dans la transaction:', error.message);
      console.error('Détails:', error);
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Détails:', error);
  } finally {
    await pool.end();
  }
}

testOnboardingWithTransaction();
