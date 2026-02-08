const express = require('express');
const bcrypt = require('bcryptjs'); // Pour comparer les mots de passe hachés

module.exports = (pool) => {
  const router = express.Router();

  // Route d'authentification des employés
  router.post('/login', async (req, res) => {
    try {
      const { matricule, password } = req.body;

      // Validation des données
      if (!matricule || !password) {
        return res.status(400).json({
          success: false,
          message: 'Matricule et mot de passe sont requis'
        });
      }

      console.log('🔐 Tentative de connexion pour le matricule:', matricule);

      // Authentification avec la vraie base de données
      // Rechercher l'employé UNIQUEMENT par matricule
      const getEmployeeQuery = `
        SELECT * FROM employees 
        WHERE matricule = $1 AND matricule != ''
      `;
      
      const employeeResult = await pool.query(getEmployeeQuery, [matricule]);
      
      if (employeeResult.rows.length === 0) {
        console.log('❌ Employé non trouvé avec le matricule:', matricule);
        
        // Enregistrer la tentative échouée
        try {
          const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          
          await pool.query(`
            INSERT INTO login_history (
              user_type, user_id, matricule, ip_address, user_agent, login_status, failure_reason
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, ['employee', matricule, matricule, ipAddress, userAgent, 'failed', 'Matricule introuvable']);
        } catch (logError) {
          console.error('Erreur lors de l\'enregistrement de l\'historique:', logError);
        }
        
        return res.status(401).json({ 
          success: false, 
          message: 'Matricule ou mot de passe incorrect' 
        });
      }

      const employee = employeeResult.rows[0];
      console.log('👤 Employé trouvé:', employee.nom_prenom, 'avec le matricule:', matricule);

      // Vérifier si le compte est inactif/bloqué
      if (employee.statut_employe === 'Inactif') {
        console.log('❌ Tentative de connexion avec un compte inactif:', matricule);
        try {
          const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          await pool.query(`
            INSERT INTO login_history (
              user_type, user_id, email, matricule, ip_address, user_agent, login_status, failure_reason
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, ['employee', employee.id.toString(), employee.email || null, matricule, ipAddress, userAgent, 'failed', 'Compte inactif']);
        } catch (logError) {
          console.error('Erreur lors de l\'enregistrement:', logError);
        }
        return res.status(403).json({ 
          success: false, 
          message: 'Ce compte est bloqué. Veuillez contacter l\'administrateur.' 
        });
      }

      // Vérifier le mot de passe avec support pour migration progressive
      // Supporte à la fois les mots de passe en clair (legacy) et hashés (nouveau)
      let isPasswordValid = false;
      
      // Vérifier si le mot de passe est hashé (commence par $2a$, $2b$, ou $2y$)
      if (employee.password && employee.password.startsWith('$2')) {
        // Mot de passe hashé avec bcrypt
        isPasswordValid = await bcrypt.compare(password, employee.password);
      } else {
        // Mot de passe en clair (legacy) - migration progressive
        isPasswordValid = employee.password === password;
        
        // Si la connexion réussit avec un mot de passe en clair, le hasher automatiquement
        if (isPasswordValid) {
          try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await pool.query(
              'UPDATE employees SET password = $1 WHERE id = $2',
              [hashedPassword, employee.id]
            );
            console.log('✅ Mot de passe migré vers bcrypt pour le matricule:', matricule);
          } catch (hashError) {
            console.error('⚠️ Erreur lors de la migration du mot de passe:', hashError);
            // Continuer quand même la connexion
          }
        }
      }

      if (!isPasswordValid) {
        console.log('❌ Mot de passe incorrect pour le matricule:', matricule);
        
        // Enregistrer la tentative échouée
        try {
          const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          
          await pool.query(`
            INSERT INTO login_history (
              user_type, user_id, email, matricule, ip_address, user_agent, login_status, failure_reason
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, ['employee', employee.id.toString(), employee.email || null, matricule, ipAddress, userAgent, 'failed', 'Mot de passe incorrect']);
        } catch (logError) {
          console.error('Erreur lors de l\'enregistrement de l\'historique:', logError);
        }
        
        return res.status(401).json({ 
          success: false, 
          message: 'Matricule ou mot de passe incorrect' 
        });
      }

      console.log('✅ Authentification réussie pour le matricule:', matricule);

      // Enregistrer dans login_history
      try {
        // Vérifier d'abord si la table existe
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'login_history'
          );
        `);
        
        if (!tableExists.rows[0]?.exists) {
          console.error('❌ Table login_history n\'existe pas !');
          console.log('💡 Exécutez: cd backend && node scripts/create_admin_tables.js');
        } else {
          const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          
          console.log('📝 Enregistrement de la connexion employé dans login_history:', {
            user_type: 'employee',
            user_id: employee.id.toString(),
            email: employee.email || null,
            matricule: matricule,
            login_status: 'success',
            ip_address: ipAddress
          });
          
          const insertQuery = `
            INSERT INTO login_history (
              user_type, user_id, email, matricule, ip_address, user_agent, login_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, login_time, created_at
          `;
          
          const params = [
            'employee', 
            employee.id.toString(), 
            employee.email || null, 
            matricule, 
            ipAddress, 
            userAgent, 
            'success'
          ];
          
          console.log('🔍 Exécution de la requête SQL avec params:', params);
          
          const result = await pool.query(insertQuery, params);
          
          if (result.rows && result.rows.length > 0) {
            console.log('✅ Connexion employé enregistrée avec succès dans login_history');
            console.log('   ID:', result.rows[0].id);
            console.log('   login_time:', result.rows[0].login_time);
            console.log('   created_at:', result.rows[0].created_at);
          } else {
            console.error('⚠️ Insertion réussie mais aucun ID retourné');
          }
        }
        
        // Mettre à jour last_login (même si l'historique échoue)
        try {
          await pool.query('UPDATE employees SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [employee.id]);
          console.log('✅ last_login mis à jour pour l\'employé ID:', employee.id);
        } catch (updateError) {
          console.error('⚠️ Erreur lors de la mise à jour de last_login:', updateError.message);
        }
      } catch (logError) {
        console.error('❌ Erreur lors de l\'enregistrement de l\'historique de connexion employé:', logError);
        console.error('❌ Détails de l\'erreur:', {
          message: logError.message,
          code: logError.code,
          detail: logError.detail,
          stack: logError.stack
        });
        // Ne pas faire échouer la connexion si l'historique échoue
      }

      // Ne jamais renvoyer le mot de passe au client
      const { password: _, ...employeeData } = employee;

      // Renvoyer les informations de l'employé
      res.json({ 
        success: true, 
        employee: employeeData
      });

    } catch (err) {
      console.error('💥 Erreur lors de l\'authentification:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Une erreur est survenue pendant l\'authentification', 
        details: err.message 
      });
    }
  });

  // Route pour changer le mot de passe
  router.put('/change-password', async (req, res) => {
    try {
      const { employeeId, currentPassword, newPassword } = req.body;

      // Validation des données
      if (!employeeId || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis'
        });
      }

      // Vérifier que le nouveau mot de passe respecte les critères de sécurité
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
        });
      }

      // Récupérer l'employé et vérifier l'ancien mot de passe
      const getEmployeeQuery = `
        SELECT * FROM employees 
        WHERE id = $1
      `;
      const employeeResult = await pool.query(getEmployeeQuery, [employeeId]);

      if (employeeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employé non trouvé'
        });
      }

      const employee = employeeResult.rows[0];

      // Vérifier l'ancien mot de passe avec support pour migration progressive
      let currentPasswordMatch = false;
      
      // Vérifier si le mot de passe est hashé
      if (employee.password && employee.password.startsWith('$2')) {
        // Mot de passe hashé avec bcrypt
        currentPasswordMatch = await bcrypt.compare(currentPassword, employee.password);
      } else {
        // Mot de passe en clair (legacy)
        currentPasswordMatch = currentPassword === employee.password;
      }

      if (!currentPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'L\'ancien mot de passe est incorrect'
        });
      }

      // Hasher le nouveau mot de passe
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Mettre à jour le mot de passe dans la base de données
      const updatePasswordQuery = `
        UPDATE employees 
        SET password = $1 
        WHERE id = $2
      `;
      await pool.query(updatePasswordQuery, [hashedNewPassword, employeeId]);

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });

    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du changement de mot de passe',
        details: err.message
      });
    }
  });

  return router;
};