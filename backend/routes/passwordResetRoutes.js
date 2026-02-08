const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Le pool sera passé en paramètre depuis server.js
module.exports = (pool) => {

// Configuration email (à adapter selon votre serveur SMTP)
// Supporte plusieurs configurations : Gmail, SMTP personnalisé, ou mode test
const getEmailTransporter = () => {
  // Si les variables d'environnement sont configurées, utiliser un vrai transport
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const smtpService = process.env.SMTP_SERVICE || 'gmail';
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    
    // Si SMTP_HOST est défini, utiliser une configuration SMTP personnalisée
    if (smtpHost) {
      console.log(`📧 Configuration SMTP personnalisée: ${smtpHost}:${smtpPort}`);
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true pour 465, false pour les autres ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Pour les certificats auto-signés
        }
      });
    }
    
    // Sinon, utiliser le service par défaut (gmail, outlook, etc.)
    console.log(`📧 Configuration SMTP avec service: ${smtpService}`);
    return nodemailer.createTransport({
      service: smtpService,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Sinon, utiliser un transport de test (pour le développement)
  // Les emails seront loggés dans la console mais pas envoyés
  console.log('⚠️ Configuration SMTP non trouvée. Utilisation du mode test (emails non envoyés).');
  console.log('💡 Pour activer l\'envoi d\'emails, configurez SMTP_USER et SMTP_PASS dans .env');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@example.com',
      pass: 'test'
    }
  });
};

// Route pour demander une réinitialisation de mot de passe
// Supporte à la fois les employés (matricule) et les utilisateurs RH (email)
router.post('/request-reset', async (req, res) => {
  console.log('📧 POST /request-reset - Requête reçue');
  console.log('📧 Body:', req.body);
  
  try {
    // Vérifier que pool est disponible
    if (!pool) {
      console.error('❌ Pool de base de données non disponible');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration serveur'
      });
    }
    
    const { identifier } = req.body; // Peut être un email (RH) ou un matricule (Employé)
    
    if (!identifier) {
      console.log('⚠️ Identifiant manquant');
      return res.status(400).json({ 
        success: false, 
        message: 'L\'identifiant (email ou matricule) est requis' 
      });
    }
    
    console.log('🔍 Recherche de l\'utilisateur avec l\'identifiant:', identifier);

    let user = null;
    let userType = null;
    let identifierField = null;

    // Détecter si c'est un email (RH) ou un matricule (Employé)
    const isEmail = identifier.includes('@');
    
    if (isEmail) {
      // Rechercher dans la table users pour les RH
      const userQuery = 'SELECT * FROM users WHERE email = $1';
      const userResult = await pool.query(userQuery, [identifier.toLowerCase().trim()]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Aucun utilisateur trouvé avec cet email' 
        });
      }
      
      user = userResult.rows[0];
      userType = 'rh';
      identifierField = user.email;
    } else {
      // Rechercher dans la table employees pour les employés
      const employeeQuery = 'SELECT * FROM employees WHERE matricule = $1';
      const employeeResult = await pool.query(employeeQuery, [identifier.toUpperCase().trim()]);
      
      if (employeeResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Aucun employé trouvé avec ce matricule' 
        });
      }
      
      user = employeeResult.rows[0];
      userType = 'employee';
      identifierField = user.matricule;
      
      if (!user.email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Aucun email associé à ce matricule. Contactez les RH.' 
        });
      }
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Vérifier si la table password_reset_tokens existe, sinon la créer
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          identifier VARCHAR(255) NOT NULL,
          user_type VARCHAR(20) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          used_at TIMESTAMP NULL
        )
      `);
      
      // Créer les index
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_reset_tokens_identifier ON password_reset_tokens(identifier);
        CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);
      `);
    } catch (tableError) {
      console.log('Table password_reset_tokens existe déjà ou erreur:', tableError.message);
    }

    // Supprimer les anciens tokens pour cet identifiant
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE identifier = $1 AND user_type = $2',
      [identifierField, userType]
    );

    // Sauvegarder le nouveau token dans la base de données
    const tokenQuery = `
      INSERT INTO password_reset_tokens (identifier, user_type, token, expires_at, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    
    await pool.query(tokenQuery, [identifierField, userType, resetToken, resetTokenExpiry]);

    // Envoyer l'email de réinitialisation
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    console.log('🔗 Lien de réinitialisation:', resetLink);
    const userName = user.nom_prenom || user.name || user.email || identifierField;
    const userIdentifier = userType === 'employee' ? user.matricule : user.email;
    
    const mailOptions = {
      from: 'noreply@centre-diagnostic.com',
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - Portail RH',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0;">Réinitialisation de mot de passe</h2>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Bonjour ${userName},</p>
            <p style="color: #666;">Vous avez demandé la réinitialisation de votre mot de passe pour le portail RH.</p>
            <p style="color: #666;">Votre identifiant : <strong>${userIdentifier}</strong></p>
            <p style="color: #666;">Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color: #e74c3c; font-weight: bold;">⚠️ Attention : Ce lien expire dans 1 heure.</p>
            <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              Centre de Diagnostic - Portail RH<br>
              Ceci est un email automatique, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      `
    };

    try {
      const transporter = getEmailTransporter();
      await transporter.sendMail(mailOptions);
      
      res.json({
        success: true,
        message: 'Email de réinitialisation envoyé avec succès',
        email: user.email,
        userType: userType
      });
      
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      
      // Si l'email échoue, on peut quand même créer le token (pour les tests)
      // En production, vous pourriez vouloir retourner une erreur
      res.json({
        success: true,
        message: 'Token de réinitialisation créé. Note: L\'email n\'a pas pu être envoyé.',
        token: resetToken, // Pour les tests uniquement
        email: user.email,
        userType: userType,
        warning: 'Email non envoyé - vérifiez la configuration SMTP'
      });
    }

  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Message:', error.message);
    
    // S'assurer qu'une réponse n'a pas déjà été envoyée
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Route pour réinitialiser le mot de passe avec le token
router.post('/reset-password', async (req, res) => {
  console.log('🔐 POST /reset-password - Requête reçue');
  
  try {
    // Vérifier que pool est disponible
    if (!pool) {
      console.error('❌ Pool de base de données non disponible');
      return res.status(500).json({
        success: false,
        message: 'Erreur de configuration serveur'
      });
    }
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      console.log('⚠️ Token ou mot de passe manquant');
      return res.status(400).json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      });
    }

    // Vérifier le token
    const tokenQuery = `
      SELECT * FROM password_reset_tokens 
      WHERE token = $1 AND expires_at > NOW() 
      ORDER BY created_at DESC LIMIT 1
    `;
    
    const tokenResult = await pool.query(tokenQuery, [token]);
    
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    const resetToken = tokenResult.rows[0];
    
    // Mettre à jour le mot de passe selon le type d'utilisateur
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    if (resetToken.user_type === 'rh') {
      // Mettre à jour pour les utilisateurs RH
      const updateQuery = 'UPDATE users SET password = $1 WHERE email = $2';
      await pool.query(updateQuery, [hashedPassword, resetToken.identifier]);
    } else {
      // Mettre à jour pour les employés
      const updateQuery = 'UPDATE employees SET password = $1 WHERE matricule = $2';
      await pool.query(updateQuery, [hashedPassword, resetToken.identifier]);
    }
    
    // Supprimer le token utilisé
    const deleteTokenQuery = 'DELETE FROM password_reset_tokens WHERE token = $1';
    await pool.query(deleteTokenQuery, [token]);
    
    res.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour mot de passe:', error);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Message:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// Route pour vérifier la validité d'un token
router.get('/verify-token/:token', async (req, res) => {
  console.log('🔍 GET /verify-token/:token - Requête reçue');
  console.log('🔍 Token:', req.params.token);
  
  try {
    // Vérifier que pool est disponible
    if (!pool) {
      console.error('❌ Pool de base de données non disponible');
      return res.status(500).json({
        valid: false,
        message: 'Erreur de configuration serveur'
      });
    }
    
    const { token } = req.params;
    
    const tokenQuery = `
      SELECT * FROM password_reset_tokens 
      WHERE token = $1 AND expires_at > NOW()
    `;
    
    const tokenResult = await pool.query(tokenQuery, [token]);
    
    if (tokenResult.rows.length === 0) {
      console.log('⚠️ Token invalide ou expiré');
      return res.json({
        valid: false,
        message: 'Token invalide ou expiré'
      });
    }
    
    console.log('✅ Token valide pour:', tokenResult.rows[0].identifier);
    res.json({
      valid: true,
      identifier: tokenResult.rows[0].identifier,
      userType: tokenResult.rows[0].user_type,
      expiresAt: tokenResult.rows[0].expires_at
    });

  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Message:', error.message);
    
    if (!res.headersSent) {
      res.status(500).json({
        valid: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

  return router;
};

