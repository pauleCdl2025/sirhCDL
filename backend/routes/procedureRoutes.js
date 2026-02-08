const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configuration Multer pour les uploads de documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/procedures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, DOC, DOCX, JPG, PNG et GIF sont autorisés'));
    }
  }
});

// GET - Récupérer tous les dossiers avec filtres
router.get('/dossiers', async (req, res) => {
  try {
    const { search, status, specialite, sort = 'date_creation', order = 'DESC', page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT 
        pd.*,
        COUNT(pds.id) as documents_soumis,
        COUNT(pc.id) as commentaires_count
      FROM procedure_dossiers pd
      LEFT JOIN procedure_documents_soumis pds ON pd.id = pds.dossier_id
      LEFT JOIN procedure_commentaires pc ON pd.id = pc.dossier_id
    `;
    
    const whereConditions = [];
    const queryParams = [];
    let paramCount = 0;
    
    // Filtres
    if (search) {
      paramCount++;
      whereConditions.push(`(
        pd.nom ILIKE $${paramCount} OR 
        pd.prenom ILIKE $${paramCount} OR 
        pd.email ILIKE $${paramCount} OR 
        pd.specialite ILIKE $${paramCount}
      )`);
      queryParams.push(`%${search}%`);
    }
    
    if (status) {
      paramCount++;
      whereConditions.push(`pd.statut = $${paramCount}`);
      queryParams.push(status);
    }
    
    if (specialite) {
      paramCount++;
      whereConditions.push(`pd.specialite ILIKE $${paramCount}`);
      queryParams.push(`%${specialite}%`);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' GROUP BY pd.id';
    
    // Tri
    const allowedSortFields = ['date_creation', 'nom', 'prenom', 'statut', 'specialite'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'date_creation';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY pd.${sortField} ${sortOrder}`;
    
    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);
    
    const result = await pool.query(query, queryParams);
    
    // Compter le total pour la pagination
    let countQuery = 'SELECT COUNT(*) FROM procedure_dossiers pd';
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    
    res.json({
      dossiers: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des dossiers' });
  }
});

  // GET - Accès par token (pour les médecins)
router.get('/access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Vérifier si le token existe et n'est pas expiré
    const dossierQuery = `
      SELECT * FROM procedure_dossiers 
      WHERE token_acces = $1 AND date_expiration_token > CURRENT_TIMESTAMP
    `;
    const dossierResult = await pool.query(dossierQuery, [token]);
    
    if (dossierResult.rows.length === 0) {
      return res.status(401).json({ error: 'Token d\'accès invalide ou expiré' });
    }
    
    const dossier = dossierResult.rows[0];
    
    // Récupérer les documents soumis
    const documentsQuery = `
      SELECT 
        pds.*,
        pdr.nom_document,
        pdr.description as description_document
      FROM procedure_documents_soumis pds
      LEFT JOIN procedure_documents_requis pdr ON pds.document_requis_id = pdr.id
      WHERE pds.dossier_id = $1
      ORDER BY pds.date_soumission DESC
    `;
    const documentsResult = await pool.query(documentsQuery, [dossier.id]);
    
    // Récupérer les commentaires
    const commentairesQuery = `
      SELECT * FROM procedure_commentaires 
      WHERE dossier_id = $1 
      ORDER BY date_creation DESC
    `;
    const commentairesResult = await pool.query(commentairesQuery, [dossier.id]);
    
    // Récupérer les notifications
    const notificationsQuery = `
      SELECT * FROM procedure_notifications 
      WHERE dossier_id = $1 
      ORDER BY date_envoi DESC
    `;
    const notificationsResult = await pool.query(notificationsQuery, [dossier.id]);
    
    res.json({
      dossier,
      documents: documentsResult.rows,
      commentaires: commentairesResult.rows,
      notifications: notificationsResult.rows
    });
  } catch (error) {
    console.error('Erreur lors de l\'accès par token:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'accès au dossier' });
  }
});

// GET - Récupérer les statistiques
  router.get('/statistiques', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::INTEGER as total,
          COUNT(CASE WHEN statut = 'nouveau' THEN 1 END)::INTEGER as nouveaux,
          COUNT(CASE WHEN statut IN ('authentification', 'homologation', 'cnom', 'autorisation_exercer') THEN 1 END)::INTEGER as en_cours,
          COUNT(CASE WHEN statut = 'autorisation_travail' THEN 1 END)::INTEGER as completes
        FROM procedure_dossiers
      `);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques' });
    }
  });

// GET - Récupérer un dossier spécifique
router.get('/dossiers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const dossierQuery = `
      SELECT * FROM procedure_dossiers WHERE id = $1
    `;
    const dossierResult = await pool.query(dossierQuery, [id]);
    
    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    const dossier = dossierResult.rows[0];
    
    // Récupérer les documents soumis
    const documentsQuery = `
      SELECT 
        pds.*,
        pdr.nom_document,
        pdr.description as description_document
      FROM procedure_documents_soumis pds
      LEFT JOIN procedure_documents_requis pdr ON pds.document_requis_id = pdr.id
      WHERE pds.dossier_id = $1
      ORDER BY pds.date_soumission DESC
    `;
    const documentsResult = await pool.query(documentsQuery, [id]);
    
    // Récupérer les commentaires
    const commentairesQuery = `
      SELECT * FROM procedure_commentaires 
      WHERE dossier_id = $1 
      ORDER BY date_creation DESC
    `;
    const commentairesResult = await pool.query(commentairesQuery, [id]);
    
    // Récupérer les notifications
    const notificationsQuery = `
      SELECT * FROM procedure_notifications 
      WHERE dossier_id = $1 
      ORDER BY date_envoi DESC
    `;
    const notificationsResult = await pool.query(notificationsQuery, [id]);
    
    res.json({
      dossier,
      documents: documentsResult.rows,
      commentaires: commentairesResult.rows,
      notifications: notificationsResult.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dossier:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du dossier' });
  }
});

// POST - Créer un nouveau dossier
router.post('/dossiers', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      nom,
      prenom,
      email,
      telephone,
      nationalite,
      specialite,
      universite,
      diplome_pays,
      commentaire
    } = req.body;
    
    // Générer un token d'accès unique
    const tokenAcces = crypto.randomBytes(32).toString('hex');
    const dateExpiration = new Date();
    dateExpiration.setDate(dateExpiration.getDate() + 30); // Expire dans 30 jours
    
    const insertQuery = `
      INSERT INTO procedure_dossiers (
        nom, prenom, email, telephone, nationalite, specialite, 
        universite, diplome_pays, commentaire, token_acces, date_expiration_token
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      nom, prenom, email, telephone, nationalite, specialite,
      universite, diplome_pays, commentaire, tokenAcces, dateExpiration
    ]);
    
    const nouveauDossier = result.rows[0];
    
    // Créer un lien d'accès
    const lienAcces = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/medical-access/${tokenAcces}`;
    
    // Mettre à jour le dossier avec le lien d'accès
    await client.query(
      'UPDATE procedure_dossiers SET lien_acces = $1 WHERE id = $2',
      [lienAcces, nouveauDossier.id]
    );
    
    // Enregistrer la notification
    await client.query(`
      INSERT INTO procedure_notifications (
        dossier_id, type, destinataire, sujet, contenu
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      nouveauDossier.id,
      'lien_acces',
      email,
      'Accès à votre dossier médical',
      `Votre dossier a été créé. Accédez-y via ce lien: ${lienAcces}`
    ]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      dossier: { ...nouveauDossier, lien_acces: lienAcces },
      message: 'Dossier créé avec succès'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la création du dossier:', error);
    
    if (error.code === '23505') { // Violation de contrainte unique
      res.status(400).json({ error: 'Un dossier avec cet email existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur serveur lors de la création du dossier' });
    }
  } finally {
    client.release();
  }
});

// PUT - Mettre à jour un dossier
router.put('/dossiers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      prenom,
      email,
      telephone,
      nationalite,
      specialite,
      universite,
      diplome_pays,
      statut,
      commentaire
    } = req.body;
    
    const updateQuery = `
      UPDATE procedure_dossiers SET
        nom = COALESCE($1, nom),
        prenom = COALESCE($2, prenom),
        email = COALESCE($3, email),
        telephone = COALESCE($4, telephone),
        nationalite = COALESCE($5, nationalite),
        specialite = COALESCE($6, specialite),
        universite = COALESCE($7, universite),
        diplome_pays = COALESCE($8, diplome_pays),
        statut = COALESCE($9, statut),
        commentaire = COALESCE($10, commentaire),
        derniere_modification = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      nom, prenom, email, telephone, nationalite, specialite,
      universite, diplome_pays, statut, commentaire, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    res.json({
      dossier: result.rows[0],
      message: 'Dossier mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du dossier' });
  }
});

// DELETE - Supprimer un dossier
router.delete('/dossiers/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Supprimer les documents associés
    await client.query('DELETE FROM procedure_documents_soumis WHERE dossier_id = $1', [id]);
    
    // Supprimer les commentaires
    await client.query('DELETE FROM procedure_commentaires WHERE dossier_id = $1', [id]);
    
    // Supprimer les notifications
    await client.query('DELETE FROM procedure_notifications WHERE dossier_id = $1', [id]);
    
    // Supprimer le dossier
    const result = await client.query('DELETE FROM procedure_dossiers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Dossier supprimé avec succès',
      dossier: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la suppression du dossier:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression du dossier' });
  } finally {
    client.release();
  }
});

// POST - Ajouter un commentaire
router.post('/dossiers/:id/commentaires', async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire, type = 'note', admin_id } = req.body;
    
    const insertQuery = `
      INSERT INTO procedure_commentaires (dossier_id, admin_id, commentaire, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [id, admin_id, commentaire, type]);
    
    // Mettre à jour la date de modification du dossier
    await pool.query(
      'UPDATE procedure_dossiers SET derniere_modification = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.status(201).json({
      commentaire: result.rows[0],
      message: 'Commentaire ajouté avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ajout du commentaire' });
  }
});

// POST - Upload de document
router.post('/dossiers/:id/documents', upload.single('document'), async (req, res) => {
  try {
    const { id } = req.params;
    const { document_requis_id, commentaire } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    const insertQuery = `
      INSERT INTO procedure_documents_soumis (
        dossier_id, document_requis_id, nom_fichier, chemin_fichier,
        taille_fichier, type_mime, commentaire
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      id,
      document_requis_id,
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      commentaire
    ]);
    
    res.status(201).json({
      document: result.rows[0],
      message: 'Document uploadé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'upload du document' });
  }
});

// GET - Récupérer les étapes de procédure
router.get('/etapes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procedure_etapes ORDER BY ordre');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des étapes' });
  }
});

// GET - Récupérer les documents requis par étape
router.get('/etapes/:etape/documents', async (req, res) => {
  try {
    const { etape } = req.params;
    
    const query = `
      SELECT pdr.* 
      FROM procedure_documents_requis pdr
      JOIN procedure_etapes pe ON pdr.etape_id = pe.id
      WHERE pe.nom = $1
      ORDER BY pdr.ordre
    `;
    
    const result = await pool.query(query, [etape]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents requis:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des documents requis' });
  }
});

// POST - Renvoyer le lien d'accès
router.post('/dossiers/:id/renvoyer-lien', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer le dossier
    const dossierResult = await pool.query('SELECT * FROM procedure_dossiers WHERE id = $1', [id]);
    
    if (dossierResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }
    
    const dossier = dossierResult.rows[0];
    
    // Générer un nouveau token
    const nouveauToken = crypto.randomBytes(32).toString('hex');
    const nouvelleExpiration = new Date();
    nouvelleExpiration.setDate(nouvelleExpiration.getDate() + 30);
    
    // Mettre à jour le dossier
    await pool.query(
      'UPDATE procedure_dossiers SET token_acces = $1, date_expiration_token = $2 WHERE id = $3',
      [nouveauToken, nouvelleExpiration, id]
    );
    
    // Créer le nouveau lien
    const nouveauLien = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/medical-access/${nouveauToken}`;
    
    // Enregistrer la notification
    await pool.query(`
      INSERT INTO procedure_notifications (
        dossier_id, type, destinataire, sujet, contenu
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      id,
      'lien_acces',
      dossier.email,
      'Nouveau lien d\'accès à votre dossier',
      `Un nouveau lien d'accès a été généré: ${nouveauLien}`
    ]);
    
    res.json({
      lien: nouveauLien,
      message: 'Nouveau lien d\'accès généré et envoyé'
    });
  } catch (error) {
    console.error('Erreur lors du renvoi du lien:', error);
    res.status(500).json({ error: 'Erreur serveur lors du renvoi du lien' });
  }
});

module.exports = router;
