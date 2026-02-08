const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { normalizeEntity } = require('../utils/textNormalizer');

// Configuration de multer pour l'upload des CV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/cv');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cv-' + uniqueSuffix + ext);
  }
});

// Filtre pour n'accepter que les fichiers PDF et DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls PDF, DOC et DOCX sont acceptés.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5MB
});

// Fonction pour combiner nom et prénom
const combineFullName = (nom, prenom) => {
  return `${nom} ${prenom}`.trim();
};

// Fonction pour séparer le nom complet
const splitFullName = (fullName) => {
  if (!fullName) return { nom: '', prenom: '' };
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return { nom: parts[0], prenom: '' };
  
  const prenom = parts.pop();
  const nom = parts.join(' ');
  
  return { nom, prenom };
};

module.exports = (pool) => {
  const router = express.Router();

  // Récupérer tous les recrutements
  router.get('/', async (req, res) => {
    try {
      // Récupérer les données de l'ancienne table historique_recrutement
      const queryOld = `
        SELECT * FROM historique_recrutement
        ORDER BY date_recrutement DESC
      `;
      const resultOld = await pool.query(queryOld);
      
      // Récupérer les données de la nouvelle table recrutement_history
      const queryNew = `
        SELECT rh.*, e.nom_prenom, e.matricule, e.poste_actuel, e.departement
        FROM recrutement_history rh
        LEFT JOIN employees e ON rh.employee_id = e.id
        ORDER BY rh.date_recrutement DESC
      `;
      const resultNew = await pool.query(queryNew);
      
      // Transformer les données de l'ancienne table
      const formattedOldResults = resultOld.rows.map(row => ({
        id: row.id,
        fullName: combineFullName(row.nom, row.prenom),
        position: row.poste,
        department: row.departement,
        source: row.motif_recrutement,
        status: row.type_contrat,
        applicationDate: row.date_recrutement,
        hiringDate: row.date_recrutement,
        notes: row.notes,
        recruiter: row.superieur_hierarchique,
        cv_path: row.cv_path,
        type: 'old'
      }));
      
      // Transformer les données de la nouvelle table
      const formattedNewResults = resultNew.rows.map(row => ({
        id: `new_${row.id}`,
        fullName: row.nom_prenom || 'Employé supprimé',
        position: row.poste_recrute || row.poste_actuel || 'Poste inconnu',
        department: row.departement || 'Département inconnu',
        source: row.source_recrutement,
        status: row.type_contrat,
        applicationDate: row.date_recrutement,
        hiringDate: row.date_recrutement,
        notes: row.notes,
        recruiter: 'Onboarding',
        cv_path: null,
        matricule: row.matricule || 'N/A',
        type: 'new'
      }));
      
      // Combiner et trier les résultats
      const allResults = [...formattedOldResults, ...formattedNewResults]
        .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
      
      res.json(normalizeEntity(allResults, 'recrutement'));
    } catch (err) {
      console.error('Error fetching recruitment history:', err);
      res.status(500).json({ error: 'Failed to fetch recruitment history', details: err.message });
    }
  });

  // Récupérer un recrutement par ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Extraire le préfixe et l'ID réel
      let realId, tableName;
      if (id.startsWith('new_')) {
        realId = id.substring(4); // Enlever 'new_'
        tableName = 'recrutement_history';
      } else if (id.startsWith('old_')) {
        realId = id.substring(4); // Enlever 'old_'
        tableName = 'historique_recrutement';
      } else {
        // Pour la compatibilité avec l'ancien format
        realId = id;
        tableName = 'historique_recrutement';
      }
      
      let query, result;
      
      if (tableName === 'recrutement_history') {
        query = `
          SELECT rh.*, e.nom_prenom, e.matricule, e.poste_actuel, e.departement
          FROM recrutement_history rh
          LEFT JOIN employees e ON rh.employee_id = e.id
          WHERE rh.id = $1
        `;
        result = await pool.query(query, [realId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Recruitment record not found' });
        }

        const row = result.rows[0];
        const formattedResult = {
          id: `new_${row.id}`,
          fullName: row.nom_prenom || 'Employé supprimé',
          position: row.poste_recrute || row.poste_actuel || 'Poste inconnu',
          department: row.departement || 'Département inconnu',
          source: row.source_recrutement,
          status: row.type_contrat,
          applicationDate: row.date_recrutement,
          hiringDate: row.date_recrutement,
          notes: row.notes,
          recruiter: 'Onboarding',
          cv_path: null
        };
        
        res.json(normalizeEntity(formattedResult, 'recrutement'));
      } else {
        query = 'SELECT * FROM historique_recrutement WHERE id = $1';
        result = await pool.query(query, [realId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Recruitment record not found' });
        }

        const row = result.rows[0];
        const formattedResult = {
          id: `old_${row.id}`,
          fullName: combineFullName(row.nom, row.prenom),
          position: row.poste,
          department: row.departement,
          source: row.motif_recrutement,
          status: row.type_contrat,
          applicationDate: row.date_recrutement,
          hiringDate: row.date_recrutement,
          notes: row.notes,
          recruiter: row.superieur_hierarchique,
          cv_path: row.cv_path
        };
        
        res.json(normalizeEntity(formattedResult, 'recrutement'));
      }
    } catch (err) {
      console.error('Error fetching recruitment record:', err);
      res.status(500).json({ error: 'Failed to fetch recruitment record', details: err.message });
    }
  });

  // Créer un nouveau recrutement
  router.post('/', upload.single('cv'), async (req, res) => {
    try {
      const { 
        fullName, 
        position, 
        department, 
        source, 
        status, 
        applicationDate, 
        notes,
        recruiter
      } = req.body;

      // Séparer le nom complet
      const { nom, prenom } = splitFullName(fullName);

      // Chemin du CV si uploadé
      const cv_path = req.file ? `/uploads/cv/${req.file.filename}` : null;

      const query = `
        INSERT INTO historique_recrutement 
        (nom, prenom, departement, motif_recrutement, date_recrutement, 
        type_contrat, poste, superieur_hierarchique, notes, cv_path) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
      `;

      const values = [
        nom,
        prenom,
        department,
        source,
        applicationDate,
        status,
        position,
        recruiter || 'Direction générale',
        notes,
        cv_path
      ];

      const result = await pool.query(query, values);
      
      // Formatter la réponse pour le frontend
      const row = result.rows[0];
      const formattedResult = {
        id: row.id,
        fullName: combineFullName(row.nom, row.prenom),
        position: row.poste,
        department: row.departement,
        source: row.motif_recrutement,
        status: row.type_contrat,
        applicationDate: row.date_recrutement,
        hiringDate: row.date_recrutement,
        notes: row.notes,
        recruiter: row.superieur_hierarchique,
        cv_path: row.cv_path
      };

      res.status(201).json(formattedResult);
    } catch (err) {
      console.error('Error creating recruitment record:', err);
      res.status(500).json({ error: 'Failed to create recruitment record', details: err.message });
    }
  });

  // Mettre à jour un recrutement
  router.put('/:id', upload.single('cv'), async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        fullName, 
        position, 
        department, 
        source, 
        status, 
        applicationDate, 
        notes,
        recruiter
      } = req.body;

      // Extraire le préfixe et l'ID réel
      let realId, tableName;
      if (id.startsWith('new_')) {
        realId = id.substring(4); // Enlever 'new_'
        tableName = 'recrutement_history';
      } else if (id.startsWith('old_')) {
        realId = id.substring(4); // Enlever 'old_'
        tableName = 'historique_recrutement';
      } else {
        // Pour la compatibilité avec l'ancien format
        realId = id;
        tableName = 'historique_recrutement';
      }

      // Séparer le nom complet
      const { nom, prenom } = splitFullName(fullName);

      let query, values, result;

      if (tableName === 'recrutement_history') {
        // Mise à jour dans la nouvelle table recrutement_history
        let cv_path_query = '';
        values = [
          nom,
          prenom,
          department,
          source,
          applicationDate,
          status,
          position,
          recruiter || 'Onboarding',
          notes
        ];

        if (req.file) {
          cv_path_query = ', cv_path = $10';
          values.push(`/uploads/cv/${req.file.filename}`);
        }

        values.push(realId);

        query = `
          UPDATE recrutement_history 
          SET nom = $1, 
              prenom = $2, 
              departement = $3, 
              source_recrutement = $4, 
              date_recrutement = $5, 
              type_contrat = $6, 
              poste_recrute = $7, 
              recruteur = $8, 
              notes = $9
              ${cv_path_query}
          WHERE id = $${values.length} 
          RETURNING *
        `;

        result = await pool.query(query, values);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Recruitment record not found' });
        }

        const row = result.rows[0];
        const formattedResult = {
          id: `new_${row.id}`,
          fullName: combineFullName(row.nom, row.prenom),
          position: row.poste_recrute,
          department: row.departement,
          source: row.source_recrutement,
          status: row.type_contrat,
          applicationDate: row.date_recrutement,
          hiringDate: row.date_recrutement,
          notes: row.notes,
          recruiter: row.recruteur,
          cv_path: row.cv_path
        };

        res.json(normalizeEntity(formattedResult, 'recrutement'));
      } else {
        // Mise à jour dans l'ancienne table historique_recrutement
        let cv_path_query = '';
        values = [
          nom,
          prenom,
          department,
          source,
          applicationDate,
          status,
          position,
          recruiter || 'Direction générale',
          notes
        ];

        if (req.file) {
          cv_path_query = ', cv_path = $10';
          values.push(`/uploads/cv/${req.file.filename}`);
        }

        values.push(realId);

        query = `
          UPDATE historique_recrutement 
          SET nom = $1, 
              prenom = $2, 
              departement = $3, 
              motif_recrutement = $4, 
              date_recrutement = $5, 
              type_contrat = $6, 
              poste = $7, 
              superieur_hierarchique = $8, 
              notes = $9
              ${cv_path_query}
          WHERE id = $${values.length} 
          RETURNING *
        `;

        result = await pool.query(query, values);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Recruitment record not found' });
        }

        // Formatter la réponse pour le frontend
        const row = result.rows[0];
        const formattedResult = {
          id: `old_${row.id}`,
          fullName: combineFullName(row.nom, row.prenom),
          position: row.poste,
          department: row.departement,
          source: row.motif_recrutement,
          status: row.type_contrat,
          applicationDate: row.date_recrutement,
          hiringDate: row.date_recrutement,
          notes: row.notes,
          recruiter: row.superieur_hierarchique,
          cv_path: row.cv_path
        };

        res.json(normalizeEntity(formattedResult, 'recrutement'));
      }
    } catch (err) {
      console.error('Error updating recruitment record:', err);
      res.status(500).json({ error: 'Failed to update recruitment record', details: err.message });
    }
  });

  // Supprimer un recrutement
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Extraire le préfixe et l'ID réel
      let realId, tableName;
      if (id.startsWith('new_')) {
        realId = id.substring(4); // Enlever 'new_'
        tableName = 'recrutement_history';
      } else if (id.startsWith('old_')) {
        realId = id.substring(4); // Enlever 'old_'
        tableName = 'historique_recrutement';
      } else {
        // Pour la compatibilité avec l'ancien format
        realId = id;
        tableName = 'historique_recrutement';
      }
      
      let getQuery, deleteQuery, result;
      
      if (tableName === 'recrutement_history') {
        // Pour recrutement_history, pas de CV à supprimer
        // Récupérer les infos avant suppression pour audit_logs
        getQuery = 'SELECT * FROM recrutement_history WHERE id = $1';
        const getResultBefore = await pool.query(getQuery, [realId]);
        const recordBefore = getResultBefore.rows[0];
        
        deleteQuery = 'DELETE FROM recrutement_history WHERE id = $1 RETURNING *';
        result = await pool.query(deleteQuery, [realId]);
      } else {
        // Pour historique_recrutement, supprimer le CV si nécessaire
        getQuery = 'SELECT * FROM historique_recrutement WHERE id = $1';
        const getResult = await pool.query(getQuery, [realId]);
        const recordBefore = getResult.rows[0];
        
        if (recordBefore && recordBefore.cv_path) {
          const cvPath = path.join(__dirname, '..', recordBefore.cv_path);
          // Supprimer le fichier CV s'il existe
          if (fs.existsSync(cvPath)) {
            fs.unlinkSync(cvPath);
          }
        }
        
        deleteQuery = 'DELETE FROM historique_recrutement WHERE id = $1 RETURNING *';
        result = await pool.query(deleteQuery, [realId]);
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Recruitment record not found' });
      }

      // Enregistrer dans audit_logs
      const row = result.rows[0];
      const entityName = tableName === 'recrutement_history' 
        ? (row.nom_prenom || 'Candidat supprimé')
        : combineFullName(row.nom || '', row.prenom || '');
      
      const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
      const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
      const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      try {
        await pool.query(`
          INSERT INTO audit_logs (
            action_type, entity_type, entity_id, entity_name,
            user_type, user_id, user_email, description, ip_address, user_agent, status,
            changes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          'delete',
          'recruitment',
          realId.toString(),
          entityName,
          userType,
          userId,
          userEmail,
          `Enregistrement de recrutement supprimé: ${entityName}`,
          ipAddress,
          userAgent,
          'success',
          JSON.stringify(tableName === 'recrutement_history' ? {
            nom_prenom: row.nom_prenom,
            email: row.email,
            telephone: row.telephone,
            poste: row.poste
          } : {
            nom: row.nom,
            prenom: row.prenom,
            email: row.email,
            telephone: row.telephone
          })
        ]);
        console.log(`✅ Enregistrement de recrutement supprimé (ID: ${realId}) et tracé dans audit_logs`);
      } catch (auditErr) {
        console.error('Erreur lors de l\'enregistrement dans audit_logs:', auditErr);
        // Ne pas faire échouer la suppression si l'audit échoue
      }

      // Formatter la réponse pour le frontend
      let formattedResult;
      
      if (tableName === 'recrutement_history') {
        formattedResult = {
          id: `new_${row.id}`,
          fullName: row.nom_prenom || 'Employé supprimé',
          message: 'Recruitment record deleted successfully'
        };
      } else {
        formattedResult = {
          id: `old_${row.id}`,
          fullName: combineFullName(row.nom, row.prenom),
          message: 'Recruitment record deleted successfully'
        };
      }

      res.json(formattedResult);
    } catch (err) {
      console.error('Error deleting recruitment record:', err);
      res.status(500).json({ error: 'Failed to delete recruitment record', details: err.message });
    }
  });

  // Rechercher des recrutements avec filtres
  router.get('/search/filter', async (req, res) => {
    try {
      const { name, department, status, startDate, endDate } = req.query;
      
      let conditions = [];
      let values = [];
      let paramIndex = 1;
      
      if (name) {
        conditions.push(`(nom ILIKE $${paramIndex} OR prenom ILIKE $${paramIndex})`);
        values.push(`%${name}%`);
        paramIndex++;
      }
      
      if (department) {
        conditions.push(`departement = $${paramIndex}`);
        values.push(department);
        paramIndex++;
      }
      
      if (status) {
        conditions.push(`type_contrat = $${paramIndex}`);
        values.push(status);
        paramIndex++;
      }
      
      if (startDate) {
        conditions.push(`date_recrutement >= $${paramIndex}`);
        values.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        conditions.push(`date_recrutement <= $${paramIndex}`);
        values.push(endDate);
        paramIndex++;
      }
      
      let query = 'SELECT * FROM historique_recrutement';
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY date_recrutement DESC';
      
      const result = await pool.query(query, values);
      
      // Transformer les données pour le frontend
      const formattedResults = result.rows.map(row => ({
        id: row.id,
        fullName: combineFullName(row.nom, row.prenom),
        position: row.poste,
        department: row.departement,
        source: row.motif_recrutement,
        status: row.type_contrat,
        applicationDate: row.date_recrutement,
        hiringDate: row.date_recrutement,
        notes: row.notes,
        recruiter: row.superieur_hierarchique,
        cv_path: row.cv_path
      }));
      
      res.json(normalizeEntity(formattedResults, 'recrutement'));
    } catch (err) {
      console.error('Error searching recruitment records:', err);
      res.status(500).json({ error: 'Failed to search recruitment records', details: err.message });
    }
  });

  // Télécharger un CV
  router.get('/cv/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const query = 'SELECT cv_path FROM historique_recrutement WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0 || !result.rows[0].cv_path) {
        return res.status(404).json({ error: 'CV not found' });
      }

      const cvPath = path.join(__dirname, '..', result.rows[0].cv_path);
      
      if (!fs.existsSync(cvPath)) {
        return res.status(404).json({ error: 'CV file not found' });
      }

      res.download(cvPath);
    } catch (err) {
      console.error('Error downloading CV:', err);
      res.status(500).json({ error: 'Failed to download CV', details: err.message });
    }
  });

  return router;
};