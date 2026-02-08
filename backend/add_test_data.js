const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432,
  options: '-c client_encoding=UTF8'
});

async function addTestData() {
  try {
    console.log('Ajout de données de test...');
    
    // Vérifier si des données existent déjà
    const existingInterviews = await pool.query('SELECT COUNT(*) FROM interviews');
    const existingTasks = await pool.query('SELECT COUNT(*) FROM tasks');
    
    if (existingInterviews.rows[0].count > 0) {
      console.log('✅ Des entretiens existent déjà');
    } else {
      // Ajouter des entretiens de test
      const sampleInterviews = [
        {
          candidate_name: 'Dr. Aminata Diallo',
          position: 'Médecin Cardiologue',
          interviewer: 'Dr. Pierre Martin',
          interview_date: '2025-01-20',
          interview_time: '14:00',
          duration: 90,
          interview_type: 'face_to_face',
          status: 'scheduled',
          notes: 'Candidat avec 8 ans d\'expérience en cardiologie, spécialisé en échographie cardiaque. Très motivé pour rejoindre notre équipe.',
          location: 'Salle de réunion Cardiologie',
          department: 'Cardiologie'
        },
        {
          candidate_name: 'Mme. Fatou Ndiaye',
          position: 'Infirmière Diplômée d\'État',
          interviewer: 'Mme. Marie Dupont',
          interview_date: '2025-01-18',
          interview_time: '10:30',
          duration: 60,
          interview_type: 'face_to_face',
          status: 'completed',
          notes: 'Excellente candidate avec 5 ans d\'expérience en soins intensifs. Très bonne présentation, recommandée pour embauche.',
          location: 'Bureau RH',
          department: 'Soins Intensifs'
        }
      ];

      for (const interview of sampleInterviews) {
        await pool.query(`
          INSERT INTO interviews (
            candidate_name, position, interviewer, interview_date, 
            interview_time, duration, interview_type, status, 
            notes, location, department
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          interview.candidate_name, interview.position, interview.interviewer,
          interview.interview_date, interview.interview_time, interview.duration,
          interview.interview_type, interview.status, interview.notes,
          interview.location, interview.department
        ]);
      }
      console.log('✅ Données de test pour les entretiens ajoutées');
    }
    
    if (existingTasks.rows[0].count > 0) {
      console.log('✅ Des tâches existent déjà');
    } else {
      // Ajouter des tâches de test
      const sampleTasks = [
        {
          title: 'Renouvellement des contrats médicaux',
          description: 'Vérifier et renouveler les contrats des médecins expirant en février 2025',
          assignee: 'Mme. Marie Dupont',
          priority: 'high',
          status: 'in_progress',
          due_date: '2025-01-25',
          category: 'RH',
          estimated_hours: 12,
          progress: 65,
          notes: '15 contrats à renouveler dont 8 médecins spécialistes. Priorité absolue pour éviter les interruptions de service.'
        },
        {
          title: 'Formation hygiène et sécurité',
          description: 'Organiser la formation obligatoire sur les protocoles d\'hygiène et de sécurité',
          assignee: 'M. Jean-Luc Dubois',
          priority: 'high',
          status: 'completed',
          due_date: '2025-01-15',
          category: 'Formation',
          estimated_hours: 6,
          progress: 100,
          notes: 'Formation terminée avec succès. 45 employés formés sur les nouveaux protocoles COVID-19.'
        },
        {
          title: 'Entretiens recrutement cardiologie',
          description: 'Conduire les entretiens pour les postes vacants en cardiologie',
          assignee: 'Dr. Pierre Martin',
          priority: 'high',
          status: 'pending',
          due_date: '2025-01-28',
          category: 'Recrutement',
          estimated_hours: 8,
          progress: 0,
          notes: '3 candidats cardiologues à rencontrer. Poste urgent pour remplacer Dr. Rousseau parti à la retraite.'
        }
      ];

      for (const task of sampleTasks) {
        await pool.query(`
          INSERT INTO tasks (
            title, description, assignee, priority, status, 
            due_date, category, estimated_hours, progress, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          task.title, task.description, task.assignee, task.priority,
          task.status, task.due_date, task.category, task.estimated_hours,
          task.progress, task.notes
        ]);
      }
      console.log('✅ Données de test pour les tâches ajoutées');
    }
    
    console.log('\n🎉 Données de test ajoutées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de test:', error);
  } finally {
    await pool.end();
  }
}

addTestData();







