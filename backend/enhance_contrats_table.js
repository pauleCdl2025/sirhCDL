const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function enhanceContratsTable() {
  try {
    console.log('🔧 Amélioration de la structure de la table contrats...\n');
    
    // Liste des colonnes à ajouter pour un contrat complet
    const columnsToAdd = [
      {
        name: 'numero_contrat',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Numéro de référence du contrat'
      },
      {
        name: 'titre_poste',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Titre du poste dans le contrat'
      },
      {
        name: 'departement',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Département assigné'
      },
      {
        name: 'salaire_brut',
        type: 'numeric(12,2)',
        nullable: 'YES',
        comment: 'Salaire brut mensuel'
      },
      {
        name: 'salaire_net',
        type: 'numeric(12,2)',
        nullable: 'YES',
        comment: 'Salaire net mensuel'
      },
      {
        name: 'type_remuneration',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Type de rémunération (Mensuel, Horaire, etc.)'
      },
      {
        name: 'mode_paiement',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Mode de paiement (Virement, Chèque, etc.)'
      },
      {
        name: 'periode_essai',
        type: 'integer',
        nullable: 'YES',
        comment: 'Durée de la période d\'essai en jours'
      },
      {
        name: 'date_fin_essai',
        type: 'date',
        nullable: 'YES',
        comment: 'Date de fin de la période d\'essai'
      },
      {
        name: 'lieu_travail',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Lieu de travail principal'
      },
      {
        name: 'horaires_travail',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Horaires de travail (ex: 8h-17h)'
      },
      {
        name: 'superieur_hierarchique',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Nom du supérieur hiérarchique'
      },
      {
        name: 'motif_contrat',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Motif de création du contrat'
      },
      {
        name: 'conditions_particulieres',
        type: 'text',
        nullable: 'YES',
        comment: 'Conditions particulières du contrat'
      },
      {
        name: 'avantages_sociaux',
        type: 'text',
        nullable: 'YES',
        comment: 'Avantages sociaux inclus'
      },
      {
        name: 'date_signature',
        type: 'date',
        nullable: 'YES',
        comment: 'Date de signature du contrat'
      },
      {
        name: 'date_effet',
        type: 'date',
        nullable: 'YES',
        comment: 'Date d\'effet du contrat'
      },
      {
        name: 'motif_resiliation',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Motif de résiliation si applicable'
      },
      {
        name: 'date_resiliation',
        type: 'date',
        nullable: 'YES',
        comment: 'Date de résiliation'
      },
      {
        name: 'notes',
        type: 'text',
        nullable: 'YES',
        comment: 'Notes additionnelles'
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        nullable: 'YES',
        comment: 'Date de dernière modification'
      }
    ];
    
    for (const column of columnsToAdd) {
      try {
        // Vérifier si la colonne existe déjà
        const exists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'contrats' AND column_name = $1
          )
        `, [column.name]);
        
        if (!exists.rows[0].exists) {
          await pool.query(`
            ALTER TABLE contrats 
            ADD COLUMN ${column.name} ${column.type}
          `);
          console.log(`✅ Colonne ${column.name} ajoutée`);
        } else {
          console.log(`ℹ️ Colonne ${column.name} existe déjà`);
        }
      } catch (error) {
        console.log(`❌ Erreur lors de l'ajout de ${column.name}:`, error.message);
      }
    }
    
    // Mettre à jour les contrats existants avec les informations de base
    console.log('\n🔄 Mise à jour des contrats existants...');
    
    const updateResult = await pool.query(`
      UPDATE contrats 
      SET 
        numero_contrat = CONCAT('CONTRAT-', id),
        titre_poste = (
          SELECT poste_actuel 
          FROM employees 
          WHERE employees.id = contrats.employee_id
        ),
        departement = (
          SELECT departement 
          FROM employees 
          WHERE employees.id = contrats.employee_id
        ),
        salaire_net = (
          SELECT salaire_net 
          FROM employees 
          WHERE employees.id = contrats.employee_id
        ),
        type_remuneration = (
          SELECT type_remuneration 
          FROM employees 
          WHERE employees.id = contrats.employee_id
        ),
        mode_paiement = (
          SELECT mode_paiement 
          FROM employees 
          WHERE employees.id = contrats.employee_id
        ),
        date_effet = date_debut,
        updated_at = NOW()
      WHERE numero_contrat IS NULL
    `);
    
    console.log(`✅ ${updateResult.rowCount} contrats mis à jour`);
    
    console.log('\n🎯 Amélioration de la table contrats terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await pool.end();
  }
}

enhanceContratsTable();







