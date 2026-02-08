const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'rh_portal',
  user: 'postgres',
  password: 'Cdl202407'
});

async function checkLatestEmployee() {
  try {
    // Vérifier le dernier employé ajouté
    const latestEmployee = await pool.query(`
      SELECT id, matricule, nom_prenom, poste_actuel, date_entree, statut_employe, created_at
      FROM employees 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('Derniers employés ajoutés:');
    latestEmployee.rows.forEach((employee, index) => {
      console.log(`${index + 1}. ID: ${employee.id}, Matricule: ${employee.matricule}, Nom: ${employee.nom_prenom}, Poste: ${employee.poste_actuel}, Date entrée: ${employee.date_entree}, Statut: ${employee.statut_employe}`);
    });
    
    // Vérifier l'historique d'onboarding
    const latestOnboarding = await pool.query(`
      SELECT oh.*, e.nom_prenom, e.matricule
      FROM onboarding_history oh
      JOIN employees e ON oh.employee_id = e.id
      ORDER BY oh.created_at DESC 
      LIMIT 3
    `);
    
    console.log('\nDerniers onboarding:');
    latestOnboarding.rows.forEach((onboarding, index) => {
      console.log(`${index + 1}. Employee: ${onboarding.nom_prenom} (${onboarding.matricule}), Date intégration: ${onboarding.date_integration}, Documents: ${onboarding.documents ? onboarding.documents.length : 0}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

checkLatestEmployee();







