const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const matriculeService = require('../services/matriculeService');

const onboardingRoutes = (pool) => {
  const router = express.Router();
  const matriculeSvc = matriculeService(pool);

  // Configuration de Multer pour l'upload des documents
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/onboarding');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
      files: 5, // Max 5 fichiers (réduit de 10)
      fieldSize: 2 * 1024 * 1024 // 2MB pour les champs
    },
    fileFilter: (req, file, cb) => {
      console.log('📄 Processing file:', file.originalname);
      
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Type de fichier non autorisé. Types acceptés: PDF, JPG, PNG, DOC, DOCX'), false);
      }
    }
  });

  // Validation des données d'onboarding
  const validateOnboardingData = (employeeData) => {
    const errors = [];
    
    // Validation des informations personnelles
    if (!employeeData.nom_prenom || employeeData.nom_prenom.trim().length < 2) {
      errors.push('Le nom et prénom sont obligatoires et doivent contenir au moins 2 caractères');
    }
    
    if (!employeeData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
      errors.push('L\'email est obligatoire et doit être valide');
    }
    
    if (!employeeData.telephone || employeeData.telephone.trim().length < 8) {
      errors.push('Le numéro de téléphone est obligatoire et doit contenir au moins 8 chiffres');
    }
    
    if (!employeeData.date_naissance) {
      errors.push('La date de naissance est obligatoire');
    }
    
    // Validation des informations professionnelles
    if (!employeeData.poste_actuel || employeeData.poste_actuel.trim().length < 2) {
      errors.push('Le poste actuel est obligatoire');
    }
    
    if (!employeeData.type_contrat) {
      errors.push('Le type de contrat est obligatoire');
    }
    
    if (!employeeData.date_entree) {
      errors.push('La date d\'entrée est obligatoire');
    }
    
    if (!employeeData.entity) {
      errors.push('L\'entité est obligatoire');
    }
    
    if (!employeeData.departement) {
      errors.push('Le département est obligatoire');
    }
    
    return errors;
  };

  // Route pour créer un nouvel employé (onboarding)
  router.post('/onboarding', upload.array('documents'), async (req, res) => {
    const startTime = Date.now();
    const client = await pool.connect();
    let employeeData = null;
    
    try {
      console.log('🚀 Début du traitement onboarding');
      console.log('📊 Contenu de req.body:', req.body);
      console.log('📄 Fichiers reçus:', req.files);
      
      await client.query('BEGIN');
      
      // Vérifier si employeeData est présent dans req.body
      if (!req.body.employeeData) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Données employé manquantes',
          receivedData: req.body
        });
      }
      
      employeeData = JSON.parse(req.body.employeeData);
      const documents = req.files || [];
      
      // Validation des données
      const validationErrors = validateOnboardingData(employeeData);
      if (validationErrors.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Données invalides',
          errors: validationErrors
        });
      }
      
      // Générer un matricule unique si non fourni
      if (!employeeData.matricule) {
        employeeData.matricule = await matriculeSvc.generateUniqueMatricule();
      }
      
      // Vérifier si le matricule existe déjà
      const isUnique = await matriculeSvc.isMatriculeUnique(employeeData.matricule);
      if (!isUnique) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          message: 'Un employé avec ce matricule existe déjà',
          matricule: employeeData.matricule
        });
      }
      
      // Insérer l'employé dans la table employees
      const employeeResult = await client.query(`
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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32) 
        RETURNING *
      `, [
        employeeData.matricule,
        employeeData.nom_prenom,
        employeeData.email,
        employeeData.telephone,
        employeeData.genre,
        employeeData.date_naissance,
        employeeData.lieu_naissance || employeeData.lieu,
        employeeData.nationalite,
        employeeData.situation_maritale || employeeData.statut_marital,
        employeeData.nbr_enfants || employeeData.enfants || 0,
        employeeData.adresse,
        employeeData.cnss_number,
        employeeData.cnamgs_number,
        employeeData.contact_urgence,
        employeeData.telephone_urgence,
        employeeData.poste_actuel,
        employeeData.type_contrat,
        employeeData.date_entree,
        employeeData.date_fin_contrat || null,
        employeeData.categorie,
        employeeData.responsable,
        employeeData.niveau_etude,
        employeeData.specialisation,
        employeeData.entity,
        employeeData.departement,
        employeeData.domaine_fonctionnel,
        'Actif',
        employeeData.salaire_base || null,
        employeeData.salaire_propose || null,
        employeeData.type_remuneration || 'Mensuel',
        employeeData.mode_paiement || 'Virement bancaire',
        new Date()
      ]);

      const newEmployee = employeeResult.rows[0];

      // Enregistrer l'historique d'onboarding
      const onboardingResult = await client.query(`
        INSERT INTO onboarding_history (
          employee_id, 
          date_integration, 
          checklist, 
          documents, 
          notes,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
      `, [
        newEmployee.id,
        employeeData.date_entree,
        JSON.stringify(employeeData.checklist || {}),
        documents.map(doc => doc.filename),
        employeeData.notes || '',
        new Date()
      ]);

      // Enregistrer dans l'historique de recrutement
      await client.query(`
        INSERT INTO recrutement_history (
          employee_id, 
          date_recrutement, 
          poste_recrute, 
          type_contrat,
          salaire_propose,
          source_recrutement,
          notes,
          statut,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newEmployee.id,
        employeeData.date_entree,
        employeeData.poste_actuel,
        employeeData.type_contrat,
        employeeData.salaire_propose || null,
        employeeData.source_recrutement || 'Onboarding direct',
        employeeData.notes || 'Recrutement via processus d\'onboarding',
        'Recruté',
        new Date()
      ]);

      // Enregistrer les informations de contrat
      if (employeeData.type_contrat && employeeData.date_entree) {
        await client.query(`
          INSERT INTO contrats (
            employee_id, 
            numero_contrat,
            type_contrat, 
            titre_poste,
            departement,
            date_debut, 
            date_fin, 
            salaire_brut,
            salaire_net,
            type_remuneration,
            mode_paiement,
            periode_essai,
            date_fin_essai,
            lieu_travail,
            horaires_travail,
            superieur_hierarchique,
            motif_contrat,
            conditions_particulieres,
            avantages_sociaux,
            date_signature,
            date_effet,
            statut,
            notes,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        `, [
          newEmployee.id,
          `CONTRAT-${newEmployee.id}`,
          employeeData.type_contrat,
          employeeData.poste_actuel,
          employeeData.departement,
          employeeData.date_entree,
          employeeData.date_fin_contrat || null,
          employeeData.salaire_base || null,
          employeeData.salaire_propose || null,
          employeeData.type_remuneration || 'Mensuel',
          employeeData.mode_paiement || 'Virement bancaire',
          employeeData.periode_essai || null,
          employeeData.date_fin_essai || null,
          employeeData.lieu_travail || employeeData.entity || 'CDL',
          employeeData.horaires_travail || '8h-17h',
          employeeData.responsable || 'Direction générale',
          employeeData.source_recrutement || 'Onboarding direct',
          employeeData.conditions_particulieres || null,
          employeeData.avantages_sociaux || null,
          employeeData.date_signature || employeeData.date_entree,
          employeeData.date_entree,
          'Actif',
          employeeData.notes || 'Contrat créé via processus d\'onboarding',
          new Date(),
          new Date()
        ]);
      }

      await client.query('COMMIT');

      const duration = Date.now() - startTime;
      console.log(`✅ Onboarding terminé en ${duration}ms`);

      res.json({
        success: true,
        message: 'Onboarding terminé avec succès',
        employee: newEmployee,
        onboarding: onboardingResult.rows[0],
        processingTime: duration
      });

    } catch (error) {
      await client.query('ROLLBACK');
      const duration = Date.now() - startTime;
      console.error(`❌ Erreur onboarding après ${duration}ms:`, error);
      
      // Supprimer les fichiers uploadés en cas d'erreur
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'onboarding: ' + error.message,
        processingTime: duration
      });
    } finally {
      client.release();
    }
  });

  // Route pour récupérer l'historique d'onboarding d'un employé
  router.get('/onboarding/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      const result = await pool.query(`
        SELECT oh.*, e.nom_prenom, e.matricule
        FROM onboarding_history oh
        JOIN employees e ON oh.employee_id = e.id
        WHERE oh.employee_id = $1
        ORDER BY oh.created_at DESC
      `, [employeeId]);
      
      res.json({
        success: true,
        onboarding: result.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'onboarding:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération: ' + error.message
      });
    }
  });

  // Route pour récupérer tous les onboarding récents
  router.get('/onboarding', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT oh.*, e.nom_prenom, e.matricule, e.poste_actuel
        FROM onboarding_history oh
        JOIN employees e ON oh.employee_id = e.id
        ORDER BY oh.created_at DESC
        LIMIT 50
      `);
      
      res.json({
        success: true,
        onboarding: result.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des onboarding:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération: ' + error.message
      });
    }
  });

  // Route pour télécharger un document d'onboarding
  router.get('/onboarding/document/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/onboarding', filename);
      
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement: ' + error.message
      });
    }
  });

  // Route pour supprimer un document d'onboarding
  router.delete('/onboarding/document/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/onboarding', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        
        // Mettre à jour la base de données pour retirer le document
        await pool.query(`
          UPDATE onboarding_history 
          SET documents = array_remove(documents, $1)
          WHERE $1 = ANY(documents)
        `, [filename]);
        
        res.json({
          success: true,
          message: 'Document supprimé avec succès'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression: ' + error.message
      });
    }
  });

  return router;
};

module.exports = onboardingRoutes;
