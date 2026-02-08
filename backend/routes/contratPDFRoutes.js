const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const contratPDFService = require('../services/contratPDFService');
const pool = require('../db');

const router = express.Router();

// Configuration de multer pour l'upload des logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/logos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo-centre${ext}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés'));
    }
  }
});

// Upload du logo du centre
router.post('/upload-logo', logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    res.json({
      message: 'Logo uploadé avec succès',
      filename: req.file.filename,
      path: `/uploads/logos/${req.file.filename}`
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du logo:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du logo' });
  }
});

// Générer un contrat PDF
router.post('/generate/:contratId', async (req, res) => {
  try {
    const { contratId } = req.params;
    
    // Récupérer les données du contrat
    const contratQuery = `
      SELECT c.*, e.nom_prenom, e.matricule 
      FROM contrats c 
      JOIN employees e ON c.employee_id = e.id 
      WHERE c.id = $1
    `;
    
    const contratResult = await pool.query(contratQuery, [contratId]);
    
    if (contratResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }

    const contrat = contratResult.rows[0];
    const employee = {
      nom_prenom: contrat.nom_prenom,
      matricule: contrat.matricule
    };

    // Générer le PDF
    const pdfPath = await contratPDFService.generateContratPDF(contrat, employee);
    
    // Récupérer le nom du fichier
    const filename = path.basename(pdfPath);
    
    res.json({
      message: 'Contrat PDF généré avec succès',
      filename: filename,
      path: pdfPath,
      url: `/uploads/contrats/${filename}`
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
  }
});

// Télécharger un contrat PDF
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/contrats', filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

// Visualiser un contrat PDF
router.get('/view/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/contrats', filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erreur lors de la visualisation:', error);
    res.status(500).json({ error: 'Erreur lors de la visualisation' });
  }
});

// Lister tous les contrats PDF générés
router.get('/list', async (req, res) => {
  try {
    const contrats = await contratPDFService.listGeneratedContrats();
    res.json(contrats);
  } catch (error) {
    console.error('Erreur lors de la liste des contrats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la liste' });
  }
});

// Supprimer un contrat PDF
router.delete('/delete/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await contratPDFService.deleteGeneratedContrat(filename);
    
    if (success) {
      res.json({ message: 'Contrat supprimé avec succès' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Récupérer le logo actuel
router.get('/logo', async (req, res) => {
  try {
    const logoPath = path.join(__dirname, '../uploads/logos/logo-centre.png');
    
    if (await fs.pathExists(logoPath)) {
      res.sendFile(logoPath);
    } else {
      res.status(404).json({ error: 'Logo non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du logo:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du logo' });
  }
});

module.exports = router;








