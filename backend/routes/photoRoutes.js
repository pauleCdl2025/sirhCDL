const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const router = express.Router();

// Configuration multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads', 'photos');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `employee-${uniqueSuffix}${ext}`);
  }
});

// Filtre pour accepter seulement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Route pour uploader la photo d'un employé
router.post('/upload-photo/:employeeId', upload.single('photo'), async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    console.log(`📸 Upload de photo pour l'employé ${employeeId}:`, req.file.filename);

    // Mettre à jour la base de données avec le chemin de la photo
    const photoPath = `/uploads/photos/${req.file.filename}`;
    
    const updateQuery = `
      UPDATE employees 
      SET photo_path = $1 
      WHERE id = $2
      RETURNING id, nom_prenom, photo_path
    `;

    const result = await pool.query(updateQuery, [photoPath, employeeId]);

    if (result.rows.length === 0) {
      // Supprimer le fichier uploadé si l'employé n'existe pas
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    console.log(`✅ Photo mise à jour pour ${result.rows[0].nom_prenom}`);

    res.json({
      success: true,
      message: 'Photo uploadée avec succès',
      data: {
        employeeId: result.rows[0].id,
        employeeName: result.rows[0].nom_prenom,
        photoPath: result.rows[0].photo_path
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de la photo:', error);
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de la photo',
      error: error.message
    });
  }
});

// Route pour supprimer la photo d'un employé
router.delete('/delete-photo/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    console.log(`🗑️ Suppression de photo pour l'employé ${employeeId}`);

    // Récupérer le chemin de la photo actuelle
    const getPhotoQuery = `
      SELECT photo_path, nom_prenom 
      FROM employees 
      WHERE id = $1
    `;

    const photoResult = await pool.query(getPhotoQuery, [employeeId]);

    if (photoResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const currentPhotoPath = photoResult.rows[0].photo_path;
    const employeeName = photoResult.rows[0].nom_prenom;

    // Supprimer le fichier physique s'il existe
    if (currentPhotoPath) {
      const fullPath = path.join(__dirname, 'uploads', 'photos', path.basename(currentPhotoPath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️ Fichier photo supprimé: ${fullPath}`);
      }
    }

    // Mettre à jour la base de données
    const updateQuery = `
      UPDATE employees 
      SET photo_path = NULL 
      WHERE id = $1
      RETURNING id, nom_prenom
    `;

    const result = await pool.query(updateQuery, [employeeId]);

    console.log(`✅ Photo supprimée pour ${result.rows[0].nom_prenom}`);

    res.json({
      success: true,
      message: 'Photo supprimée avec succès',
      data: {
        employeeId: result.rows[0].id,
        employeeName: result.rows[0].nom_prenom
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la photo',
      error: error.message
    });
  }
});

// Route pour servir les photos statiquement
router.use('/photos', express.static(path.join(__dirname, 'uploads', 'photos')));

module.exports = (poolInstance) => {
  pool = poolInstance;
  return router;
};




