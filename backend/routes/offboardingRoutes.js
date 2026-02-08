const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const offboardingRoutes = (pool) => {
  const router = express.Router();

  // Configuration de Multer pour l'upload des documents
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/offboarding');
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
      files: 10 // Max 10 fichiers
    },
    fileFilter: (req, file, cb) => {
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

  // Route pour finaliser le départ d'un employé (offboarding)
  router.post('/offboarding', upload.array('documents'), async (req, res) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const offboardingData = JSON.parse(req.body.offboardingData);
      const documents = req.files || [];
      
      // Vérifier si l'employé existe et est actif (pas déjà partant)
      const employeeResult = await client.query(
        'SELECT * FROM employees WHERE id = $1 AND statut = $2',
        [offboardingData.employee_id, 'Actif']
      );
      
      if (employeeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false, 
          message: 'Employé non trouvé ou déjà partant' 
        });
      }

      const employee = employeeResult.rows[0];

      // Récupérer le type de contrat actif
      const contratResult = await client.query(
        'SELECT type_contrat FROM contrats WHERE employee_id = $1 AND statut = $2 LIMIT 1',
        [offboardingData.employee_id, 'Actif']
      );
      const typeContrat = contratResult.rows.length > 0 ? contratResult.rows[0].type_contrat : null;

      // Enregistrer dans l'historique des départs AVANT de supprimer l'employé
      // Sauvegarder toutes les informations de l'employé pour l'historique
      console.log('📝 Enregistrement dans depart_history pour employee_id:', offboardingData.employee_id);
      // Récupérer le département depuis departement ou functional_area
      const departementValue = employee.departement || employee.functional_area || '';
      console.log('📝 Données employé:', {
        nom_prenom: employee.nom_prenom,
        matricule: employee.matricule,
        poste_actuel: employee.poste_actuel,
        departement: employee.departement,
        functional_area: employee.functional_area,
        departement_final: departementValue,
        email: employee.email,
        telephone: employee.telephone,
        type_contrat: employee.type_contrat
      });
      
      let departHistoryResult;
      try {
        departHistoryResult = await client.query(`
          INSERT INTO depart_history (
            employee_id, 
            date_depart, 
            motif_depart, 
            type_depart,
            notes,
            nom_prenom,
            matricule,
            poste_actuel,
            departement,
            statut,
            email,
            telephone,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `, [
          offboardingData.employee_id,
          offboardingData.date_depart,
          offboardingData.motif_depart || '',
          offboardingData.type_depart || 'Démission',
          offboardingData.notes || '',
        employee.nom_prenom || '',
        employee.matricule || '',
        employee.poste_actuel || '',
        (employee.departement || employee.functional_area || '').trim(), // Utiliser departement ou functional_area
        (typeContrat || employee.type_contrat || '').trim(), // Type de contrat
          employee.email || '',
          employee.telephone || '',
          new Date()
        ]);
        
        console.log('✅ Enregistrement créé dans depart_history avec ID:', departHistoryResult.rows[0]?.id);
      } catch (departHistoryError) {
        console.error('❌ Erreur lors de l\'insertion dans depart_history:', departHistoryError);
        console.error('❌ Message:', departHistoryError.message);
        console.error('❌ Code:', departHistoryError.code);
        console.error('❌ Détails:', departHistoryError.detail);
        throw new Error(`Erreur lors de l'enregistrement dans depart_history: ${departHistoryError.message}`);
      }

      // Supprimer l'employé de la table employees
      await client.query(
        'DELETE FROM employees WHERE id = $1',
        [offboardingData.employee_id]
      );

      // Mettre à jour le statut du contrat
      await client.query(
        'UPDATE contrats SET statut = $1, date_fin = $2, updated_at = $3 WHERE employee_id = $4 AND statut = $5',
        ['Terminé', offboardingData.date_depart, new Date(), offboardingData.employee_id, 'Actif']
      );

      // Enregistrer l'historique d'offboarding
      const offboardingResult = await client.query(`
        INSERT INTO offboarding_history (
          employee_id, 
          date_depart, 
          motif_depart, 
          checklist, 
          documents, 
          notes,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `, [
        offboardingData.employee_id,
        offboardingData.date_depart,
        offboardingData.motif_depart || '',
        JSON.stringify(offboardingData.checklist || {}),
        documents.map(doc => doc.filename),
        offboardingData.notes || '',
        new Date()
      ]);

      // Mettre à jour l'historique de recrutement pour marquer la fin
      const newNotes = `Départ le ${offboardingData.date_depart} (${offboardingData.motif_depart || 'Départ'}) - Employé supprimé`;
      
      await client.query(`
        UPDATE recrutement_history 
        SET 
          date_fin = $1,
          statut = 'Parti',
          notes = $2,
          updated_at = $3
        WHERE employee_id = $4 AND statut = 'Recruté'
      `, [
        offboardingData.date_depart,
        newNotes,
        new Date(),
        offboardingData.employee_id
      ]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Offboarding terminé avec succès',
        offboarding: offboardingResult.rows[0],
        employee: {
          id: employee.id,
          matricule: employee.matricule,
          nom_prenom: employee.nom_prenom,
          date_depart: offboardingData.date_depart
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de l\'offboarding:', error);
      
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
        message: 'Erreur lors de l\'offboarding: ' + error.message
      });
    } finally {
      client.release();
    }
  });

  // Route pour récupérer l'historique d'offboarding d'un employé
  router.get('/offboarding/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      const result = await pool.query(`
        SELECT oh.*, e.nom_prenom, e.matricule, e.poste_actuel
        FROM offboarding_history oh
        JOIN employees e ON oh.employee_id = e.id
        WHERE oh.employee_id = $1
        ORDER BY oh.created_at DESC
      `, [employeeId]);
      
      res.json({
        success: true,
        offboarding: result.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'offboarding:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération: ' + error.message
      });
    }
  });

  // Route pour récupérer tous les offboarding récents
  router.get('/offboarding', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT oh.*, e.nom_prenom, e.matricule, e.poste_actuel
        FROM offboarding_history oh
        JOIN employees e ON oh.employee_id = e.id
        ORDER BY oh.created_at DESC
        LIMIT 50
      `);
      
      res.json({
        success: true,
        offboarding: result.rows
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offboarding:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération: ' + error.message
      });
    }
  });

  // Route pour récupérer les employés actifs (pour la sélection)
  router.get('/active', async (req, res) => {
    try {
      console.log('🔍 Récupération des employés actifs depuis la base de données...');
      
      const result = await pool.query(`
        SELECT 
          id, 
          matricule, 
          nom_prenom, 
          poste_actuel, 
          entity, 
          departement, 
          type_contrat, 
          date_entree,
          email,
          telephone
        FROM employees 
        ORDER BY nom_prenom ASC
      `);
      
      console.log(`✅ ${result.rows.length} employés récupérés depuis la base de données`);
      
      res.json({
        success: true,
        employees: result.rows
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des employés actifs:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération: ' + error.message
      });
    }
  });

  // Route pour télécharger un document d'offboarding
  router.get('/offboarding/document/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/offboarding', filename);
      
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

  // Route pour supprimer un document d'offboarding
  router.delete('/offboarding/document/:filename', async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../uploads/offboarding', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        
        // Mettre à jour la base de données pour retirer le document
        await pool.query(`
          UPDATE offboarding_history 
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

  // Route pour annuler un offboarding (remettre l'employé comme actif)
  router.post('/offboarding/:employeeId/cancel', async (req, res) => {
    res.status(400).json({
      success: false,
      message: 'Impossible d\'annuler un offboarding. L\'employé a été supprimé de l\'effectif.'
    });
  });

  return router;
};

module.exports = offboardingRoutes;
