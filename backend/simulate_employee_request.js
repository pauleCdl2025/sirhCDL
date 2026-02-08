const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
});

async function simulateEmployeeRequest() {
  try {
    console.log('🚀 Simulation d\'une demande d\'employé...');

    // Récupérer un employé aléatoire
    const employeeResult = await pool.query('SELECT id, nom_prenom FROM employees ORDER BY RANDOM() LIMIT 1');
    const employee = employeeResult.rows[0];
    
    if (!employee) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    console.log(`📋 Employé sélectionné: ${employee.nom_prenom} (ID: ${employee.id})`);

    // Types de demandes possibles
    const requestTypes = [
      {
        type: 'leave_request',
        details: 'Congé annuel',
        start_date: '2025-01-15',
        end_date: '2025-01-20',
        reason: 'Congé annuel pour repos familial'
      },
      {
        type: 'absence',
        details: 'Absence médicale',
        start_date: '2025-01-10',
        end_date: '2025-01-12',
        reason: 'Consultation médicale et examens'
      },
      {
        type: 'document_request',
        details: 'Attestation de travail',
        start_date: null,
        end_date: null,
        reason: 'Demande d\'attestation pour démarches administratives'
      }
    ];

    // Sélectionner un type de demande aléatoire
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)];

    console.log(`📝 Type de demande: ${requestType.type}`);
    console.log(`📅 Détails: ${requestType.details}`);

    // Insérer la demande dans la base de données
    const query = `
      INSERT INTO employee_requests 
      (employee_id, request_type, request_details, start_date, end_date, reason, status, request_date) 
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP) 
      RETURNING *
    `;

    const values = [
      employee.id,
      requestType.type,
      requestType.details,
      requestType.start_date,
      requestType.end_date,
      requestType.reason
    ];

    const result = await pool.query(query, values);
    const newRequest = result.rows[0];

    console.log('✅ Demande créée avec succès !');
    console.log('📊 Détails de la demande:', {
      id: newRequest.id,
      employee_id: newRequest.employee_id,
      request_type: newRequest.request_type,
      status: newRequest.status,
      request_date: newRequest.request_date
    });

    console.log('\n🎯 Résultat attendu:');
    console.log('1. Les RH et responsables devraient recevoir une notification automatique');
    console.log('2. La notification devrait apparaître instantanément dans leur TopNav');
    console.log('3. Le badge de notifications devrait s\'incrémenter');
    console.log('4. Une notification toast du navigateur devrait apparaître');

    console.log('\n📱 Pour tester:');
    console.log('1. Ouvrez votre application dans le navigateur');
    console.log('2. Connectez-vous avec un compte RH ou responsable');
    console.log('3. La notification devrait apparaître automatiquement');

    return newRequest;

  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
  } finally {
    await pool.end();
  }
}

async function simulateMultipleRequests() {
  try {
    console.log('🚀 Simulation de plusieurs demandes d\'employés...');

    // Récupérer plusieurs employés
    const employeesResult = await pool.query('SELECT id, nom_prenom FROM employees ORDER BY RANDOM() LIMIT 5');
    const employees = employeesResult.rows;

    if (employees.length === 0) {
      console.log('❌ Aucun employé trouvé');
      return;
    }

    const requestTypes = [
      { type: 'leave_request', details: 'Congé annuel', reason: 'Congé annuel pour repos familial' },
      { type: 'absence', details: 'Absence médicale', reason: 'Consultation médicale' },
      { type: 'document_request', details: 'Attestation de travail', reason: 'Démarches administratives' },
      { type: 'leave_request', details: 'Congé maladie', reason: 'Arrêt maladie prescrit par le médecin' },
      { type: 'absence', details: 'Absence personnelle', reason: 'Rendez-vous personnel important' }
    ];

    const requests = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const requestType = requestTypes[i % requestTypes.length];

      console.log(`\n📝 Création de demande pour ${employee.nom_prenom}: ${requestType.type}`);

      const query = `
        INSERT INTO employee_requests 
        (employee_id, request_type, request_details, reason, status, request_date) 
        VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP) 
        RETURNING *
      `;

      const result = await pool.query(query, [
        employee.id,
        requestType.type,
        requestType.details,
        requestType.reason
      ]);

      const newRequest = result.rows[0];
      requests.push(newRequest);

      console.log(`✅ Demande créée (ID: ${newRequest.id})`);
    }

    console.log(`\n🎉 ${requests.length} demandes créées avec succès !`);
    console.log('\n📱 Les RH et responsables devraient maintenant recevoir plusieurs notifications');

    return requests;

  } catch (error) {
    console.error('❌ Erreur lors de la simulation multiple:', error);
  } finally {
    await pool.end();
  }
}

// Interface de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'single':
    simulateEmployeeRequest();
    break;
  case 'multiple':
    simulateMultipleRequests();
    break;
  default:
    console.log('🚀 Script de simulation des demandes d\'employés');
    console.log('\n📋 Commandes disponibles:');
    console.log('  node simulate_employee_request.js single   - Simuler une demande');
    console.log('  node simulate_employee_request.js multiple - Simuler plusieurs demandes');
    console.log('\n💡 Ce script créera de vraies demandes dans la base de données');
    console.log('   et déclenchera les notifications automatiques pour les RH');
    break;
}







