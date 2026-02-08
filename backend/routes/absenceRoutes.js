const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { normalizeEntity } = require('../utils/textNormalizer');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/absences');
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'absence-' + uniqueSuffix + ext);
    }
});

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls PDF, JPG et PNG sont acceptés.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Exportez une fonction qui prend l'objet pool comme argument
module.exports = (pool) => {
    const router = express.Router();

    // Récupérer toutes les absences
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT * FROM absence ORDER BY date_creation DESC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'absence'));
        } catch (err) {
            console.error('Error fetching absences:', err);
            res.status(500).json({ error: 'Failed to fetch absences', details: err.message });
        }
    });

    // Récupérer les absences d'un employé
    router.get('/employe/:nom', async (req, res) => {
        try {
            const { nom } = req.params;
            const query = `
                SELECT * FROM absence WHERE nom_employe = $1 ORDER BY date_debut DESC
            `;
            const result = await pool.query(query, [nom]);
            res.json(normalizeEntity(result.rows, 'absence'));
        } catch (err) {
            console.error('Error fetching employee absences:', err);
            res.status(500).json({ error: 'Failed to fetch employee absences', details: err.message });
        }
    });

    // Créer une nouvelle absence
    router.post('/', upload.single('document'), async (req, res) => {
        try {
            const { 
                nom_employe, 
                service,
                poste,
                type_absence,
                motif,
                date_debut,
                date_fin,
                date_retour,
                remuneration
            } = req.body;

            // Chemin du document uploadé, s'il existe
            const documentPath = req.file ? `/uploads/absences/${req.file.filename}` : null;

            const query = `
                INSERT INTO absence
                (nom_employe, service, poste, type_absence, motif, date_debut, date_fin, date_retour, remuneration, document_path, statut) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING *
            `;

            const values = [
                nom_employe, 
                service || null,
                poste || null,
                type_absence,
                motif,
                date_debut,
                date_fin,
                date_retour || null,
                remuneration || null,
                documentPath,
                'En attente'
            ];

            const result = await pool.query(query, values);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error creating absence:', err);
            res.status(500).json({ error: 'Failed to create absence', details: err.message });
        }
    });

    // Récupérer une absence par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM absence WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Absence not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'absence'));
        } catch (err) {
            console.error('Error fetching absence:', err);
            res.status(500).json({ error: 'Failed to fetch absence', details: err.message });
        }
    });

    // Mettre à jour une absence
    router.put('/:id', upload.single('document'), async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nom_employe, 
                service,
                poste,
                type_absence,
                motif,
                date_debut,
                date_fin,
                date_retour,
                remuneration,
                keep_document
            } = req.body;

            // Vérifier si l'absence existe
            const checkQuery = 'SELECT * FROM absence WHERE id = $1';
            const checkResult = await pool.query(checkQuery, [id]);
            
            if (checkResult.rows.length === 0) {
                return res.status(404).json({ error: 'Absence not found' });
            }
            
            const existingAbsence = checkResult.rows[0];
            
            // Gérer le document
            let documentPath = existingAbsence.document_path;
            
            // Si un nouveau document est uploadé
            if (req.file) {
                documentPath = `/uploads/absences/${req.file.filename}`;
                
                // Supprimer l'ancien document si nécessaire
                if (existingAbsence.document_path) {
                    const oldPath = path.join(__dirname, '..', existingAbsence.document_path);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            } 
            // Si keep_document est false et qu'il n'y a pas de nouveau document, supprimer l'ancien
            else if (keep_document === 'false' && existingAbsence.document_path) {
                const oldPath = path.join(__dirname, '..', existingAbsence.document_path);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                documentPath = null;
            }

            const query = `
                UPDATE absence 
                SET nom_employe = $1, 
                    service = $2, 
                    poste = $3, 
                    type_absence = $4, 
                    motif = $5, 
                    date_debut = $6, 
                    date_fin = $7, 
                    date_retour = $8, 
                    remuneration = $9, 
                    document_path = $10,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $11 
                RETURNING *
            `;

            const values = [
                nom_employe, 
                service || null,
                poste || null,
                type_absence,
                motif,
                date_debut,
                date_fin,
                date_retour || null,
                remuneration || null,
                documentPath,
                id
            ];

            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows[0], 'absence'));
        } catch (err) {
            console.error('Error updating absence:', err);
            res.status(500).json({ error: 'Failed to update absence', details: err.message });
        }
    });

    // Approuver/Refuser une absence
    router.put('/:id/traiter', async (req, res) => {
        try {
            const { id } = req.params;
            const { statut } = req.body;
            
            if (!['Approuvé', 'Refusé'].includes(statut)) {
                return res.status(400).json({ error: 'Statut invalide. Utilisez "Approuvé" ou "Refusé".' });
            }

            const query = `
                UPDATE absence 
                SET statut = $1, 
                    date_traitement = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *
            `;

            const result = await pool.query(query, [statut, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Absence not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'absence'));
        } catch (err) {
            console.error('Error processing absence:', err);
            res.status(500).json({ error: 'Failed to process absence', details: err.message });
        }
    });

    // Supprimer une absence
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Récupérer d'abord les infos pour obtenir le chemin du document
            const getQuery = 'SELECT document_path FROM absence WHERE id = $1';
            const getResult = await pool.query(getQuery, [id]);
            
            if (getResult.rows.length === 0) {
                return res.status(404).json({ error: 'Absence not found' });
            }
            
            const absence = getResult.rows[0];
            
            // Supprimer le document associé s'il existe
            if (absence.document_path) {
                const documentPath = path.join(__dirname, '..', absence.document_path);
                if (fs.existsSync(documentPath)) {
                    fs.unlinkSync(documentPath);
                }
            }
            
            // Récupérer l'utilisateur qui effectue la suppression
            const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
            const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
            const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            
            const entityName = `Absence - ${absence.nom_employe || 'Employé inconnu'} (${absence.type_absence || 'N/A'})`;
            
            // Sauvegarder dans audit_logs avant suppression
            await pool.query(`
                INSERT INTO audit_logs (
                    action_type, entity_type, entity_id, entity_name,
                    user_type, user_id, user_email, description, ip_address, user_agent, status,
                    changes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                'delete',
                'absence',
                id.toString(),
                entityName,
                userType,
                userId,
                userEmail,
                `Absence supprimée: ${entityName}`,
                ipAddress,
                userAgent,
                'success',
                JSON.stringify({
                    nom_employe: absence.nom_employe,
                    type_absence: absence.type_absence,
                    date_debut: absence.date_debut,
                    date_fin: absence.date_fin,
                    service: absence.service
                })
            ]);
            
            // Supprimer l'enregistrement de la base de données
            const deleteQuery = 'DELETE FROM absence WHERE id = $1 RETURNING *';
            const deleteResult = await pool.query(deleteQuery, [id]);

            console.log(`✅ Absence supprimée (ID: ${id}) et tracée dans audit_logs`);
            res.json({ message: 'Absence deleted successfully', absence: deleteResult.rows[0] });
        } catch (err) {
            console.error('Error deleting absence:', err);
            res.status(500).json({ error: 'Failed to delete absence', details: err.message });
        }
    });

    // Rechercher des absences
    router.get('/search/filter', async (req, res) => {
        try {
            const { nom, type, service, debut, fin } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (nom) {
                conditions.push(`nom_employe ILIKE $${paramIndex}`);
                values.push(`%${nom}%`);
                paramIndex++;
            }
            
            if (type) {
                conditions.push(`type_absence = $${paramIndex}`);
                values.push(type);
                paramIndex++;
            }
            
            if (service) {
                conditions.push(`service = $${paramIndex}`);
                values.push(service);
                paramIndex++;
            }
            
            if (debut) {
                conditions.push(`date_debut >= $${paramIndex}`);
                values.push(debut);
                paramIndex++;
            }
            
            if (fin) {
                conditions.push(`date_fin <= $${paramIndex}`);
                values.push(fin);
                paramIndex++;
            }
            
            let query = 'SELECT * FROM absence';
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY date_debut DESC';
            
            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows, 'absence'));
        } catch (err) {
            console.error('Error searching absences:', err);
            res.status(500).json({ error: 'Failed to search absences', details: err.message });
        }
    });

    return router;
};