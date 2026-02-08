const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./auth');

module.exports = (pool) => {
  // Identifiants de test (fallback si l'utilisateur n'existe pas en base)
  const testCredentials = {
    'rh@centre-diagnostic.com': 'Rh@2025CDL',
    'admin@centrediagnostic.ga': 'Admin@2025CDL',
    'test@test.com': 'test123'
  };

  // Login route
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔐 Tentative de connexion RH:', { email, hasPassword: !!password });
      
      // Normaliser l'email
      const normalizedEmail = email?.trim().toLowerCase();
      
      if (!normalizedEmail || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email et mot de passe sont requis' 
        });
      }

      // Vérifier d'abord les identifiants de test (fallback)
      if (testCredentials[normalizedEmail] === password) {
        console.log('✅ Connexion réussie avec identifiants de test');
        
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
            
            console.log('📝 Enregistrement de la connexion RH dans login_history:', {
              user_type: 'rh',
              user_id: normalizedEmail,
              email: normalizedEmail,
              login_status: 'success',
              ip_address: ipAddress
            });
            
            const insertQuery = `
              INSERT INTO login_history (
                user_type, user_id, email, ip_address, user_agent, login_status
              ) VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id, login_time, created_at
            `;
            
            const params = ['rh', normalizedEmail, normalizedEmail, ipAddress, userAgent, 'success'];
            
            console.log('🔍 Exécution de la requête SQL avec params:', params);
            
            const result = await pool.query(insertQuery, params);
            
            if (result.rows && result.rows.length > 0) {
              console.log('✅ Connexion RH enregistrée avec succès dans login_history');
              console.log('   ID:', result.rows[0].id);
              console.log('   login_time:', result.rows[0].login_time);
              console.log('   created_at:', result.rows[0].created_at);
            } else {
              console.error('⚠️ Insertion réussie mais aucun ID retourné');
            }
          }
        } catch (logError) {
          console.error('❌ Erreur lors de l\'enregistrement de l\'historique de connexion RH:', logError);
          console.error('❌ Détails de l\'erreur:', {
            message: logError.message,
            code: logError.code,
            detail: logError.detail,
            stack: logError.stack
          });
        }
        
        // Créer un token JWT pour les identifiants de test
        const token = jwt.sign(
          { 
            id: normalizedEmail,
            email: normalizedEmail, 
            role: 'admin' 
          },
          process.env.JWT_SECRET || 'fallback-secret-key',
          { expiresIn: '24h' }
        );
        
        return res.json({
          success: true,
          token,
          user: {
            id: normalizedEmail,
            email: normalizedEmail,
            name: 'Admin RH',
            role: 'admin',
            nom: 'Admin',
            prenom: 'RH',
            poste: 'Administration',
            fonction: 'Administrateur RH'
          }
        });
      }
      
      // Si pas d'identifiants de test, chercher en base de données
      if (pool) {
        try {
          const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [normalizedEmail]
          );
          
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            
            // Vérifier si le compte est bloqué ou suspendu
            if (user.status === 'suspended' || user.status === 'inactive') {
              console.log('❌ Tentative de connexion avec un compte bloqué/suspendu:', normalizedEmail);
              try {
                const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
                const userAgent = req.headers['user-agent'] || 'unknown';
                await pool.query(`
                  INSERT INTO login_history (
                    user_type, user_id, email, ip_address, user_agent, login_status, failure_reason
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, ['rh', user.id.toString(), user.email, ipAddress, userAgent, 'failed', `Compte ${user.status === 'suspended' ? 'suspendu' : 'inactif'}`]);
              } catch (logError) {
                console.error('Erreur lors de l\'enregistrement:', logError);
              }
              return res.status(403).json({ 
                success: false,
                message: 'Ce compte est bloqué. Veuillez contacter l\'administrateur.' 
              });
            }
            
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (isPasswordValid) {
              console.log('✅ Authentification réussie pour l\'utilisateur RH:', user.email);
              
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
                } else {
                  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
                  const userAgent = req.headers['user-agent'] || 'unknown';
                  
                  console.log('📝 Enregistrement de la connexion RH (DB) dans login_history:', {
                    user_type: 'rh',
                    user_id: user.id.toString(),
                    email: user.email,
                    login_status: 'success'
                  });
                  
                  const result = await pool.query(`
                    INSERT INTO login_history (
                      user_type, user_id, email, ip_address, user_agent, login_status
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id, login_time, created_at
                  `, ['rh', user.id.toString(), user.email, ipAddress, userAgent, 'success']);
                  
                  if (result.rows && result.rows.length > 0) {
                    console.log('✅ Connexion RH (DB) enregistrée avec succès dans login_history, ID:', result.rows[0].id);
                  }
                }
                
                // Mettre à jour last_login
                await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
                console.log('✅ last_login mis à jour pour l\'utilisateur RH ID:', user.id);
              } catch (logError) {
                console.error('❌ Erreur lors de l\'enregistrement de l\'historique de connexion RH:', logError);
                console.error('❌ Détails de l\'erreur:', {
                  message: logError.message,
                  code: logError.code,
                  detail: logError.detail
                });
              }
              
              // Create JWT token
              const token = jwt.sign(
                { 
                  id: user.id, 
                  email: user.email, 
                  role: user.role 
                },
                process.env.JWT_SECRET || 'fallback-secret-key',
                { expiresIn: '24h' }
              );
              
              return res.json({
                success: true,
                token,
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  firstName: user.first_name,
                  lastName: user.last_name,
                  role: user.role
                }
              });
            }
          }
        } catch (dbError) {
          console.error('Erreur base de données:', dbError);
          // Continue avec le fallback si la base de données échoue
        }
      }
      
      // Enregistrer la tentative échouée dans login_history
      try {
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        await pool.query(`
          INSERT INTO login_history (
            user_type, user_id, email, ip_address, user_agent, login_status, failure_reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, ['rh', normalizedEmail, normalizedEmail, ipAddress, userAgent, 'failed', 'Identifiants incorrects']);
      } catch (logError) {
        console.error('Erreur lors de l\'enregistrement de l\'historique:', logError);
      }

      // Si aucun identifiant ne correspond
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants incorrects' 
      });
    } catch (err) {
      console.error('Error during login:', err.stack);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: err.message 
      });
    }
  });

  // Register route
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password, firstName, lastName, role = 'user' } = req.body;
      
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      const result = await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, first_name, last_name, role`,
        [username, email, hashedPassword, firstName, lastName, role]
      );
      
      const newUser = result.rows[0];
      
      // Create JWT token
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          role: newUser.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Return user data and token
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          role: newUser.role
        }
      });
    } catch (err) {
      console.error('Error during registration:', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Get current user route
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await pool.query(
        'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = result.rows[0];
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      });
    } catch (err) {
      console.error('Error getting current user:', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  return router;
};