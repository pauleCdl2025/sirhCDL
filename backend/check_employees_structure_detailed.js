const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkEmployeesStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table employees...\n');
    
    // Vérifier la structure exacte de la table employees
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes disponibles dans employees:');
    structure.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.column_name} (${row.data_type}) - Nullable: ${row.is_nullable}`);
    });
    
    console.log(`\n📊 Total des colonnes: ${structure.rows.length}`);
    
    // Compter les paramètres dans la requête d'insertion
    const insertQuery = `
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) 
      RETURNING *
    `;
    
    // Compter les colonnes dans la requête
    const columnMatch = insertQuery.match(/INSERT INTO employees \(([\s\S]*?)\) VALUES/);
    if (columnMatch) {
      const columns = columnMatch[1].split(',').map(col => col.trim()).filter(col => col);
      console.log(`\n📊 Colonnes dans la requête d'insertion: ${columns.length}`);
      console.log('📋 Colonnes:', columns);
    }
    
    // Compter les paramètres dans VALUES
    const valuesMatch = insertQuery.match(/VALUES \(([\s\S]*?)\)/);
    if (valuesMatch) {
      const values = valuesMatch[1].split(',').map(val => val.trim()).filter(val => val);
      console.log(`\n📊 Paramètres dans VALUES: ${values.length}`);
      console.log('📋 Paramètres:', values);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Détails:', error);
  } finally {
    await pool.end();
  }
}

checkEmployeesStructure();







