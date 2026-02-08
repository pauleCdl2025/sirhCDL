const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl@2025',
  port: 5432,
});

async function addColumnsToDepartHistory() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔄 Ajout des colonnes à la table depart_history...');
    
    // Ajouter les colonnes si elles n'existent pas déjà
    const columns = [
      { name: 'nom_prenom', type: 'VARCHAR(255)' },
      { name: 'matricule', type: 'VARCHAR(50)' },
      { name: 'poste_actuel', type: 'VARCHAR(255)' },
      { name: 'departement', type: 'VARCHAR(100)' },
      { name: 'statut', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(255)' },
      { name: 'telephone', type: 'VARCHAR(50)' }
    ];
    
    for (const column of columns) {
      const checkQuery = `
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'depart_history' AND column_name = $1
        )
      `;
      const exists = await client.query(checkQuery, [column.name]);
      
      if (!exists.rows[0].exists) {
        await client.query(`ALTER TABLE depart_history ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Colonne ${column.name} ajoutée`);
      } else {
        console.log(`ℹ️  Colonne ${column.name} existe déjà`);
      }
    }
    
    // Mettre à jour les enregistrements existants avec les données de la table employees si possible
    console.log('🔄 Mise à jour des enregistrements existants...');
    const updateResult = await client.query(`
      UPDATE depart_history dh
      SET 
        nom_prenom = COALESCE(dh.nom_prenom, e.nom_prenom),
        matricule = COALESCE(dh.matricule, e.matricule),
        poste_actuel = COALESCE(dh.poste_actuel, e.poste_actuel),
        departement = COALESCE(dh.departement, e.departement),
        statut = COALESCE(dh.statut, c.type_contrat),
        email = COALESCE(dh.email, e.email),
        telephone = COALESCE(dh.telephone, e.telephone)
      FROM employees e
      LEFT JOIN contrats c ON c.employee_id = e.id AND c.statut = 'Actif'
      WHERE dh.employee_id = e.id
        AND (dh.nom_prenom IS NULL OR dh.matricule IS NULL OR dh.poste_actuel IS NULL)
    `);
    
    console.log(`✅ ${updateResult.rowCount} enregistrement(s) mis à jour`);
    
    await client.query('COMMIT');
    console.log('✅ Migration terminée avec succès !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addColumnsToDepartHistory()
  .then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });


