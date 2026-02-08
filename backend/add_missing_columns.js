const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function addMissingColumns() {
  try {
    console.log('🔧 Ajout des colonnes manquantes à la table employees...\n');
    
    // Liste des colonnes à ajouter
    const columnsToAdd = [
      {
        name: 'departement',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Département de l\'employé'
      },
      {
        name: 'contact_urgence',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Nom du contact d\'urgence'
      },
      {
        name: 'telephone_urgence',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Téléphone du contact d\'urgence'
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
        comment: 'Mode de paiement (Virement, Chèque, Espèces, etc.)'
      },
      {
        name: 'statut_marital',
        type: 'character varying',
        nullable: 'YES',
        comment: 'Statut marital'
      },
      {
        name: 'enfants',
        type: 'integer',
        nullable: 'YES',
        comment: 'Nombre d\'enfants'
      },
      {
        name: 'salaire_net',
        type: 'numeric(10,2)',
        nullable: 'YES',
        comment: 'Salaire net'
      }
    ];
    
    for (const column of columnsToAdd) {
      try {
        // Vérifier si la colonne existe déjà
        const exists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'employees' AND column_name = $1
          )
        `, [column.name]);
        
        if (!exists.rows[0].exists) {
          await pool.query(`
            ALTER TABLE employees 
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
    
    console.log('\n🎯 Mise à jour de la table employees terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await pool.end();
  }
}

addMissingColumns();

