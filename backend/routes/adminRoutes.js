const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Route pour obtenir les statistiques globales des deux portails
  router.get('/stats/overview', async (req, res) => {
    try {
      console.log('📊 Récupération des statistiques admin...');

      // Statistiques des utilisateurs RH
      let rhUsersStats = {
        total_users: 0,
        admins: 0,
        rh_users: 0
      };
      try {
        // Vérifier si la table users existe
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        
        if (tableCheck.rows[0]?.exists) {
          const rhUsersQuery = `
            SELECT 
              COUNT(*) as total_rh_users,
              COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
              COUNT(CASE WHEN role = 'rh' THEN 1 END) as total_rh
            FROM users
          `;
          const rhUsersResult = await pool.query(rhUsersQuery);
          if (rhUsersResult.rows.length > 0) {
            rhUsersStats = {
              total_users: parseInt(rhUsersResult.rows[0]?.total_rh_users) || 0,
              admins: parseInt(rhUsersResult.rows[0]?.total_admins) || 0,
              rh_users: parseInt(rhUsersResult.rows[0]?.total_rh) || 0
            };
          }
        } else {
          console.log('⚠️ Table users n\'existe pas');
        }
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération des utilisateurs RH:', err.message);
      }

      // Statistiques des employés
      let employeesStats = {
        total_employees: 0,
        active: 0,
        inactive: 0,
        cdi: 0,
        cdd: 0,
        interns: 0
      };
      try {
        const employeesQuery = `
          SELECT 
            COUNT(*) as total_employees,
            COUNT(CASE WHEN type_contrat = 'CDI' THEN 1 END) as cdi_count,
            COUNT(CASE WHEN type_contrat = 'CDD' THEN 1 END) as cdd_count,
            COUNT(CASE WHEN type_contrat = 'Stage' OR type_contrat = 'stage PNPE' THEN 1 END) as interns_count,
            COUNT(CASE WHEN statut_employe = 'Actif' THEN 1 END) as active_employees,
            COUNT(CASE WHEN statut_employe = 'Inactif' THEN 1 END) as inactive_employees
          FROM employees
        `;
        const employeesResult = await pool.query(employeesQuery);
        if (employeesResult.rows.length > 0) {
          employeesStats = {
            total_employees: parseInt(employeesResult.rows[0]?.total_employees) || 0,
            active: parseInt(employeesResult.rows[0]?.active_employees) || 0,
            inactive: parseInt(employeesResult.rows[0]?.inactive_employees) || 0,
            cdi: parseInt(employeesResult.rows[0]?.cdi_count) || 0,
            cdd: parseInt(employeesResult.rows[0]?.cdd_count) || 0,
            interns: parseInt(employeesResult.rows[0]?.interns_count) || 0
          };
        }
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération des statistiques employés:', err.message);
      }

      // Statistiques des contrats expirant bientôt
      let expiringContracts = 0;
      try {
        const expiringContractsQuery = `
          SELECT COUNT(*) as expiring_soon
          FROM employees
          WHERE date_fin_contrat IS NOT NULL 
            AND date_fin_contrat BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
            AND (type_contrat != 'CDI' OR type_contrat IS NULL)
        `;
        const expiringContractsResult = await pool.query(expiringContractsQuery);
        expiringContracts = parseInt(expiringContractsResult.rows[0]?.expiring_soon) || 0;
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération des contrats expirant:', err.message);
      }

      // Statistiques des demandes d'employés
      let employeeRequestsStats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      };
      try {
        const requestsQuery = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
          FROM employee_requests
        `;
        const requestsResult = await pool.query(requestsQuery);
        if (requestsResult.rows.length > 0) {
          employeeRequestsStats = {
            total: parseInt(requestsResult.rows[0].total) || 0,
            pending: parseInt(requestsResult.rows[0].pending) || 0,
            approved: parseInt(requestsResult.rows[0].approved) || 0,
            rejected: parseInt(requestsResult.rows[0].rejected) || 0
          };
        }
      } catch (err) {
        console.log('⚠️ Table employee_requests non disponible:', err.message);
      }

      // Statistiques des absences
      let absencesStats = {
        total: 0,
        this_month: 0
      };
      try {
        const absencesQuery = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN date_debut >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as this_month
          FROM absence
        `;
        const absencesResult = await pool.query(absencesQuery);
        if (absencesResult.rows.length > 0) {
          absencesStats = {
            total: parseInt(absencesResult.rows[0].total) || 0,
            this_month: parseInt(absencesResult.rows[0].this_month) || 0
          };
        }
      } catch (err) {
        console.log('⚠️ Table absence non disponible:', err.message);
      }

      // Statistiques des visites médicales
      let medicalVisitsStats = {
        total: 0,
        overdue: 0,
        upcoming_30_days: 0
      };
      try {
        const today = new Date().toISOString().split('T')[0];
        const medicalVisitsQuery = `
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN date_prochaine_visite < $1::date AND statut = 'À venir' THEN 1 END) as overdue,
            COUNT(CASE WHEN date_prochaine_visite >= $1::date AND date_prochaine_visite <= ($1::date + INTERVAL '30 days') AND statut = 'À venir' THEN 1 END) as upcoming_30_days
          FROM visites_medicales
        `;
        const medicalVisitsResult = await pool.query(medicalVisitsQuery, [today]);
        if (medicalVisitsResult.rows.length > 0) {
          medicalVisitsStats = {
            total: parseInt(medicalVisitsResult.rows[0].total) || 0,
            overdue: parseInt(medicalVisitsResult.rows[0].overdue) || 0,
            upcoming_30_days: parseInt(medicalVisitsResult.rows[0].upcoming_30_days) || 0
          };
        }
      } catch (err) {
        console.log('⚠️ Table visites_medicales non disponible:', err.message);
      }

      // Répartition par département
      let departmentDistribution = [];
      try {
        const departmentDistributionQuery = `
          SELECT 
            COALESCE(functional_area, 'Non spécifié') as department,
            COUNT(*) as count
          FROM employees
          WHERE functional_area IS NOT NULL AND functional_area != ''
          GROUP BY functional_area
          ORDER BY count DESC
          LIMIT 10
        `;
        const departmentResult = await pool.query(departmentDistributionQuery);
        departmentDistribution = departmentResult.rows.map(row => ({
          name: row.department,
          count: parseInt(row.count) || 0
        }));
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération de la répartition par département:', err.message);
      }

      // Répartition par entité
      let entityDistribution = [];
      try {
        const entityDistributionQuery = `
          SELECT 
            COALESCE(entity, 'Non spécifié') as entity,
            COUNT(*) as count
          FROM employees
          WHERE entity IS NOT NULL AND entity != ''
          GROUP BY entity
          ORDER BY count DESC
          LIMIT 10
        `;
        const entityResult = await pool.query(entityDistributionQuery);
        entityDistribution = entityResult.rows.map(row => ({
          name: row.entity,
          count: parseInt(row.count) || 0
        }));
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération de la répartition par entité:', err.message);
      }

      // Activité récente (derniers 7 jours)
      let recentActivity = {
        new_employees: 0,
        new_users: 0
      };
      try {
        const recentActivityQuery = `
          SELECT 
            'employees' as type,
            COUNT(*) as count
          FROM employees
          WHERE created_at >= (CURRENT_DATE - INTERVAL '7 days')
          UNION ALL
          SELECT 
            'users' as type,
            COUNT(*) as count
          FROM users
          WHERE created_at >= (CURRENT_DATE - INTERVAL '7 days')
        `;
        const recentActivityResult = await pool.query(recentActivityQuery);
        recentActivity = {
          new_employees: parseInt(recentActivityResult.rows.find(r => r.type === 'employees')?.count) || 0,
          new_users: parseInt(recentActivityResult.rows.find(r => r.type === 'users')?.count) || 0
        };
      } catch (err) {
        console.log('⚠️ Erreur lors de la récupération de l\'activité récente:', err.message);
      }

      const stats = {
        rh_portal: rhUsersStats,
        employee_portal: employeesStats,
        alerts: {
          expiring_contracts: expiringContracts,
          medical_visits_overdue: medicalVisitsStats.overdue,
          medical_visits_upcoming: medicalVisitsStats.upcoming_30_days
        },
        requests: employeeRequestsStats,
        absences: absencesStats,
        medical_visits: medicalVisitsStats,
        distributions: {
          departments: departmentDistribution,
          entities: entityDistribution
        },
        recent_activity: recentActivity
      };

      console.log('✅ Statistiques admin récupérées avec succès');
      res.json(stats);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des statistiques admin:', err);
      res.status(500).json({ 
        error: 'Failed to fetch admin statistics', 
        details: err.message 
      });
    }
  });

  // Route pour obtenir les utilisateurs RH
  router.get('/users/rh', async (req, res) => {
    try {
      const query = `
        SELECT 
          id,
          email,
          nom_prenom,
          role,
          created_at,
          last_login
        FROM users
        WHERE role IN ('admin', 'rh')
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching RH users:', err);
      res.status(500).json({ error: 'Failed to fetch RH users', details: err.message });
    }
  });

  // Route pour obtenir les employés actifs
  router.get('/employees/active', async (req, res) => {
    try {
      const query = `
        SELECT 
          id,
          matricule,
          nom_prenom,
          email,
          poste_actuel,
          functional_area,
          entity,
          type_contrat,
          date_entree,
          statut_employe
        FROM employees
        WHERE statut_employe = 'Actif'
        ORDER BY nom_prenom ASC
        LIMIT 100
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching active employees:', err);
      res.status(500).json({ error: 'Failed to fetch active employees', details: err.message });
    }
  });

  // Route pour obtenir l'historique de connexion
  router.get('/login-history', async (req, res) => {
    try {
      const { userType, userId, limit = 100, offset = 0 } = req.query;
      
      console.log('📥 Récupération de l\'historique de connexion:', { userType, userId, limit, offset });
      
      // Vérifier d'abord si la table existe
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'login_history'
        );
      `);
      
      if (!tableCheck.rows[0]?.exists) {
        console.error('❌ Table login_history n\'existe pas !');
        return res.status(500).json({ 
          error: 'Table login_history does not exist',
          message: 'Veuillez exécuter: cd backend && node scripts/create_admin_tables.js'
        });
      }
      
      let query = 'SELECT * FROM login_history WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (userType) {
        query += ` AND user_type = $${paramIndex}`;
        params.push(userType);
        paramIndex++;
      }

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      // Utiliser created_at au lieu de login_time si login_time n'existe pas
      query += ` ORDER BY COALESCE(login_time, created_at) DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      console.log('🔍 Requête SQL:', query);
      console.log('📊 Paramètres:', params);

      const result = await pool.query(query, params);
      
      console.log('✅ Historique récupéré:', result.rows.length, 'entrées');
      if (result.rows.length > 0) {
        console.log('📋 Types d\'utilisateurs trouvés:', [...new Set(result.rows.map(r => r.user_type))]);
        console.log('📋 Première entrée:', {
          id: result.rows[0].id,
          user_type: result.rows[0].user_type,
          user_id: result.rows[0].user_id,
          matricule: result.rows[0].matricule,
          email: result.rows[0].email,
          login_status: result.rows[0].login_status,
          login_time: result.rows[0].login_time,
          created_at: result.rows[0].created_at
        });
      } else {
        console.log('⚠️ Aucune entrée trouvée dans login_history');
      }
      
      res.json(result.rows);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération de l\'historique de connexion:', err);
      console.error('❌ Détails:', {
        message: err.message,
        code: err.code,
        detail: err.detail,
        stack: err.stack
      });
      res.status(500).json({ error: 'Failed to fetch login history', details: err.message });
    }
  });

  // Route pour récupérer uniquement les suppressions (action_type = 'delete')
  router.get('/audit-logs/deletions', async (req, res) => {
    try {
      const { entityType, startDate, endDate, limit = 100, offset = 0 } = req.query;
      
      console.log('📥 Récupération des suppressions depuis audit_logs:', { entityType, startDate, endDate, limit, offset });
      
      let query = 'SELECT * FROM audit_logs WHERE action_type = $1';
      const params = ['delete'];
      let paramIndex = 2;

      if (entityType) {
        query += ` AND entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      console.log('🔍 Requête SQL:', query);
      console.log('📊 Paramètres:', params);

      const result = await pool.query(query, params);
      
      console.log('✅ Suppressions récupérées:', result.rows.length, 'entrées');
      console.log('📋 Types d\'entités supprimées:', [...new Set(result.rows.map(r => r.entity_type))]);
      
      res.json(result.rows);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des suppressions:', err);
      res.status(500).json({ error: 'Failed to fetch deletions', details: err.message });
    }
  });

  // Route pour obtenir les logs d'audit
  router.get('/audit-logs', async (req, res) => {
    try {
      const { 
        actionType, 
        entityType, 
        userId, 
        startDate, 
        endDate, 
        limit = 100, 
        offset = 0 
      } = req.query;
      
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (actionType) {
        query += ` AND action_type = $${paramIndex}`;
        params.push(actionType);
        paramIndex++;
      }

      if (entityType) {
        query += ` AND entity_type = $${paramIndex}`;
        params.push(entityType);
        paramIndex++;
      }

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
    }
  });

  // Route pour réinitialiser le mot de passe d'un utilisateur RH
  router.post('/users/rh/:userId/reset-password', async (req, res) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const adminUser = req.headers['x-admin-user'] || 'system'; // Récupérer depuis le token

      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le mot de passe
      const updateQuery = `
        UPDATE users 
        SET password = $1, 
            password_changed_at = CURRENT_TIMESTAMP,
            updated_by = $2
        WHERE id = $3
        RETURNING id, email, role
      `;
      const result = await pool.query(updateQuery, [hashedPassword, adminUser, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Enregistrer dans les logs d'audit
      const auditQuery = `
        INSERT INTO audit_logs (
          action_type, entity_type, entity_id, entity_name,
          user_type, user_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await pool.query(auditQuery, [
        'password_reset',
        'user',
        userId,
        result.rows[0].email,
        'admin',
        adminUser,
        `Mot de passe réinitialisé pour l'utilisateur RH: ${result.rows[0].email}`,
        'success'
      ]);

      res.json({ 
        success: true, 
        message: 'Password reset successfully',
        user: result.rows[0]
      });
    } catch (err) {
      console.error('Error resetting password:', err);
      res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
  });

  // Route pour réinitialiser le mot de passe d'un employé
  router.post('/employees/:employeeId/reset-password', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { newPassword } = req.body;
      const adminUser = req.headers['x-admin-user'] || 'system';

      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Mettre à jour le mot de passe
      const updateQuery = `
        UPDATE employees 
        SET password = $1,
            password_initialized = true
        WHERE id = $2
        RETURNING id, matricule, nom_prenom, email
      `;
      const result = await pool.query(updateQuery, [hashedPassword, employeeId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Enregistrer dans les logs d'audit
      const auditQuery = `
        INSERT INTO audit_logs (
          action_type, entity_type, entity_id, entity_name,
          user_type, user_id, description, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await pool.query(auditQuery, [
        'password_reset',
        'employee',
        employeeId,
        result.rows[0].nom_prenom,
        'admin',
        adminUser,
        `Mot de passe réinitialisé pour l'employé: ${result.rows[0].nom_prenom} (${result.rows[0].matricule})`,
        'success'
      ]);

      res.json({ 
        success: true, 
        message: 'Password reset successfully',
        employee: result.rows[0]
      });
    } catch (err) {
      console.error('Error resetting employee password:', err);
      res.status(500).json({ error: 'Failed to reset password', details: err.message });
    }
  });

  // Route pour obtenir tous les utilisateurs (RH + Employés)
  router.get('/users/all', async (req, res) => {
    try {
      const { search, userType, limit = 100, offset = 0 } = req.query;

      // Récupérer les utilisateurs RH
      let rhUsers = [];
      try {
        // Vérifier si la table users existe
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          );
        `);
        
        if (tableCheck.rows[0]?.exists) {
          let rhQuery = `
            SELECT 
              id, 
              email, 
              COALESCE(first_name, '') as first_name, 
              COALESCE(last_name, '') as last_name,
              COALESCE(nom_prenom, '') as nom_prenom,
              role, 
              status, 
              last_login, 
              created_at 
            FROM users 
            WHERE 1=1
          `;
          const rhParams = [];
          let paramIndex = 1;

          if (userType === 'rh' || !userType) {
            if (search) {
              rhQuery += ` AND (
                email ILIKE $${paramIndex} 
                OR first_name ILIKE $${paramIndex} 
                OR last_name ILIKE $${paramIndex}
                OR nom_prenom ILIKE $${paramIndex}
              )`;
              rhParams.push(`%${search}%`);
              paramIndex++;
            }

            rhQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            rhParams.push(parseInt(limit), parseInt(offset));

            const rhResult = await pool.query(rhQuery, rhParams);
            rhUsers = rhResult.rows.map(row => {
              const fullName = row.nom_prenom || 
                              `${row.first_name || ''} ${row.last_name || ''}`.trim() || 
                              row.email;
              return {
                ...row,
                user_type: 'rh',
                identifier: row.email,
                name: fullName,
                nom_prenom: fullName
              };
            });
          }
        } else {
          console.log('⚠️ Table users n\'existe pas');
        }
      } catch (err) {
        console.error('Error fetching RH users:', err);
      }

      // Récupérer les employés
      let employees = [];
      try {
        if (userType === 'employee' || !userType) {
          let empQuery = `
            SELECT id, matricule, nom_prenom, email, poste_actuel, statut_employe, last_login, created_at 
            FROM employees 
            WHERE 1=1
          `;
          const empParams = [];
          let paramIndex = 1;

          if (search) {
            empQuery += ` AND (matricule ILIKE $${paramIndex} OR nom_prenom ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
            empParams.push(`%${search}%`);
            paramIndex++;
          }

          empQuery += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
          empParams.push(parseInt(limit), parseInt(offset));

          const empResult = await pool.query(empQuery, empParams);
          employees = empResult.rows.map(row => ({
            ...row,
            user_type: 'employee',
            identifier: row.matricule,
            role: 'employee',
            status: row.statut_employe,
            name: row.nom_prenom
          }));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }

      const allUsers = [...rhUsers, ...employees];
      res.json(allUsers);
    } catch (err) {
      console.error('Error fetching all users:', err);
      res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
  });

  // Route pour bloquer/débloquer un utilisateur
  router.patch('/users/:userType/:userId/toggle-status', async (req, res) => {
    try {
      const { userType, userId } = req.params;
      const { status } = req.body; // 'active', 'inactive', 'suspended' pour RH, 'Actif'/'Inactif' pour employés
      const adminUser = req.headers['x-admin-user'] || 'system';

      let entityName = '';
      let updateQuery = '';
      let currentStatus = '';

      if (userType === 'rh') {
        // Vérifier si l'utilisateur existe
        const userInfo = await pool.query(`
          SELECT email, first_name, last_name, nom_prenom, status
          FROM users 
          WHERE id = $1
        `, [userId]);
        
        if (userInfo.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        const row = userInfo.rows[0];
        entityName = row.nom_prenom || 
                    `${row.first_name || ''} ${row.last_name || ''}`.trim() || 
                    row.email;
        currentStatus = row.status;

        // Mettre à jour le statut
        updateQuery = 'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
        await pool.query(updateQuery, [status, userId]);

        // Enregistrer dans audit_logs
        await pool.query(`
          INSERT INTO audit_logs (
            action_type, entity_type, entity_id, entity_name,
            user_type, user_id, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'update',
          'user',
          userId,
          entityName,
          'admin',
          adminUser,
          `Statut utilisateur RH modifié: ${entityName} (${currentStatus} → ${status})`,
          'success'
        ]);

      } else if (userType === 'employee') {
        // Vérifier si l'employé existe
        const empInfo = await pool.query(`
          SELECT nom_prenom, matricule, statut_employe
          FROM employees 
          WHERE id = $1
        `, [userId]);
        
        if (empInfo.rows.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        const row = empInfo.rows[0];
        entityName = `${row.nom_prenom} (${row.matricule})`;
        currentStatus = row.statut_employe;

        // Mettre à jour le statut (pour les employés, on utilise statut_employe)
        updateQuery = 'UPDATE employees SET statut_employe = $1 WHERE id = $2';
        await pool.query(updateQuery, [status, userId]);

        // Enregistrer dans audit_logs
        await pool.query(`
          INSERT INTO audit_logs (
            action_type, entity_type, entity_id, entity_name,
            user_type, user_id, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'update',
          'employee',
          userId,
          entityName,
          'admin',
          adminUser,
          `Statut employé modifié: ${entityName} (${currentStatus} → ${status})`,
          'success'
        ]);

      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      res.json({ 
        success: true, 
        message: `Statut mis à jour avec succès`,
        status: status 
      });
    } catch (err) {
      console.error('Error toggling user status:', err);
      res.status(500).json({ error: 'Failed to update user status', details: err.message });
    }
  });

  // Route pour supprimer un utilisateur (avec traçabilité)
  router.delete('/users/:userType/:userId', async (req, res) => {
    try {
      const { userType, userId } = req.params;
      const adminUser = req.headers['x-admin-user'] || 'system';

      let entityName = '';
      let deleteQuery = '';

      if (userType === 'rh') {
        // Récupérer les infos avant suppression
        const userInfo = await pool.query(`
          SELECT email, first_name, last_name, nom_prenom 
          FROM users 
          WHERE id = $1
        `, [userId]);
        if (userInfo.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        const row = userInfo.rows[0];
        entityName = row.nom_prenom || 
                    `${row.first_name || ''} ${row.last_name || ''}`.trim() || 
                    row.email;

        // Sauvegarder dans audit_logs avant suppression
        await pool.query(`
          INSERT INTO audit_logs (
            action_type, entity_type, entity_id, entity_name,
            user_type, user_id, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'delete',
          'user',
          userId,
          entityName,
          'admin',
          adminUser,
          `Utilisateur RH supprimé: ${entityName}`,
          'success'
        ]);

        deleteQuery = 'DELETE FROM users WHERE id = $1';
      } else if (userType === 'employee') {
        // Récupérer les infos avant suppression
        const empInfo = await pool.query('SELECT nom_prenom, matricule FROM employees WHERE id = $1', [userId]);
        if (empInfo.rows.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        entityName = `${empInfo.rows[0].nom_prenom} (${empInfo.rows[0].matricule})`;

        // Sauvegarder dans audit_logs avant suppression
        await pool.query(`
          INSERT INTO audit_logs (
            action_type, entity_type, entity_id, entity_name,
            user_type, user_id, description, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          'delete',
          'employee',
          userId,
          entityName,
          'admin',
          adminUser,
          `Employé supprimé: ${entityName}`,
          'success'
        ]);

        deleteQuery = 'DELETE FROM employees WHERE id = $1';
      } else {
        return res.status(400).json({ error: 'Invalid user type' });
      }

      await pool.query(deleteQuery, [userId]);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
  });

  return router;
};

