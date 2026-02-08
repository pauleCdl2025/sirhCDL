const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AutoNotificationService = require('../services/autoNotificationService');
const { normalizeEntity } = require('../utils/textNormalizer');

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/conges');
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'conge-' + uniqueSuffix + ext);
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
    const autoNotificationService = new AutoNotificationService(pool);

    // Récupérer tous les congés
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT * FROM conges
                ORDER BY date_demande DESC
            `;
            const result = await pool.query(query);
            res.json(normalizeEntity(result.rows, 'conge'));
        } catch (err) {
            console.error('Error fetching conges:', err);
            res.status(500).json({ error: 'Failed to fetch conges', details: err.message });
        }
    });

    // Créer un nouveau congé
    router.post('/', upload.single('document'), async (req, res) => {
        try {
            // Debug: Afficher les données reçues
            console.log('📥 Données reçues pour création de congé:');
            console.log('📋 req.body:', JSON.stringify(req.body, null, 2));
            console.log('📋 req.file:', req.file);
            
            const { 
                nom_employe, 
                service, 
                poste, 
                date_embauche,
                jours_conges_annuels,
                date_demande,
                date_debut, 
                date_fin, 
                motif,
                date_retour,
                jours_pris,
                jours_restants,
                date_prochaine_attribution,
                type_conge
            } = req.body;

            // Debug: Afficher les dates extraites
            console.log('📅 Dates extraites:');
            console.log('📅 date_debut:', date_debut, 'Type:', typeof date_debut);
            console.log('📅 date_fin:', date_fin, 'Type:', typeof date_fin);
            console.log('📅 date_retour:', date_retour, 'Type:', typeof date_retour);
            console.log('📅 date_embauche:', date_embauche, 'Type:', typeof date_embauche);
            console.log('📅 date_demande:', date_demande, 'Type:', typeof date_demande);
            console.log('📅 date_prochaine_attribution:', date_prochaine_attribution, 'Type:', typeof date_prochaine_attribution);

            // Chemin du document uploadé, s'il existe
            const documentPath = req.file ? `/uploads/conges/${req.file.filename}` : null;

            // Fonction pour nettoyer et valider les dates
            const cleanDate = (dateValue) => {
                if (!dateValue) return null;
                
                // Si c'est un objet ou un tableau, essayer d'extraire la première valeur
                if (typeof dateValue === 'object') {
                    if (Array.isArray(dateValue)) {
                        dateValue = dateValue[0];
                    } else if (dateValue.toString) {
                        dateValue = dateValue.toString();
                    } else {
                        return null;
                    }
                }
                
                // Si c'est une string, essayer de la parser
                if (typeof dateValue === 'string') {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                return null;
            };

            // Nettoyer toutes les dates
            const cleanDateDebut = cleanDate(date_debut);
            const cleanDateFin = cleanDate(date_fin);
            const cleanDateRetour = cleanDate(date_retour);
            const cleanDateEmbauche = cleanDate(date_embauche);
            const cleanDateDemande = cleanDate(date_demande) || new Date().toISOString().split('T')[0];
            const cleanDateProchaineAttribution = cleanDate(date_prochaine_attribution);

            console.log('🧹 Dates nettoyées:');
            console.log('🧹 date_debut:', cleanDateDebut);
            console.log('🧹 date_fin:', cleanDateFin);
            console.log('🧹 date_retour:', cleanDateRetour);
            console.log('🧹 date_embauche:', cleanDateEmbauche);
            console.log('🧹 date_demande:', cleanDateDemande);
            console.log('🧹 date_prochaine_attribution:', cleanDateProchaineAttribution);

            const query = `
                INSERT INTO conges 
                (nom_employe, service, poste, date_embauche, jours_conges_annuels,
                date_demande, date_debut, date_fin, motif, date_retour, jours_pris,
                jours_restants, date_prochaine_attribution, type_conge, statut, document_path) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                RETURNING *
            `;

            const values = [
                nom_employe, 
                service || null, 
                poste || null,
                cleanDateEmbauche,
                jours_conges_annuels || null,
                cleanDateDemande,
                cleanDateDebut, 
                cleanDateFin,
                motif || null,
                cleanDateRetour,
                jours_pris || null,
                jours_restants || null,
                cleanDateProchaineAttribution,
                type_conge || 'Congé payé',
                'En attente', // Statut par défaut
                documentPath
            ];

            const result = await pool.query(query, values);
            const newConge = result.rows[0];

            // Créer des notifications automatiques pour les RH et responsables
            try {
                // Récupérer l'ID de l'employé à partir du nom
                const employeeQuery = `SELECT id FROM employees WHERE nom_prenom ILIKE $1 LIMIT 1`;
                const employeeResult = await pool.query(employeeQuery, [`%${nom_employe}%`]);
                
                if (employeeResult.rows.length > 0) {
                    const employeeId = employeeResult.rows[0].id;
                    
                    await autoNotificationService.createRequestNotification({
                        request_id: newConge.id,
                        employee_id: employeeId,
                        request_type: 'leave_request',
                        title: `Demande de congé - ${nom_employe}`,
                        description: `Demande de congé du ${cleanDateDebut} au ${cleanDateFin}. Motif: ${motif || 'Non spécifié'}`,
                        priority: 'high'
                    });
                    
                    console.log(`📢 Notification automatique créée pour la demande de congé de ${nom_employe}`);
                } else {
                    console.log(`⚠️ Employé ${nom_employe} non trouvé pour la notification automatique`);
                }
            } catch (notificationError) {
                console.error('❌ Erreur lors de la création de notification automatique:', notificationError);
                // Ne pas faire échouer la création de congé si la notification échoue
            }

            res.status(201).json(newConge);
        } catch (err) {
            console.error('Error creating conge:', err);
            res.status(500).json({ error: 'Failed to create conge', details: err.message });
        }
    });

    // Récupérer un congé par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM conges WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Conge not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'conge'));
        } catch (err) {
            console.error('Error fetching conge:', err);
            res.status(500).json({ error: 'Failed to fetch conge', details: err.message });
        }
    });

    // Récupérer les congés par nom d'employé
    router.get('/employee/:name', async (req, res) => {
        try {
            const { name } = req.params;
            const query = 'SELECT * FROM conges WHERE nom_employe ILIKE $1 ORDER BY date_demande DESC';
            const result = await pool.query(query, [`%${name}%`]);
            res.json(normalizeEntity(result.rows, 'conge'));
        } catch (err) {
            console.error('Error fetching employee conges:', err);
            res.status(500).json({ error: 'Failed to fetch employee conges', details: err.message });
        }
    });

    // Mettre à jour un congé
    router.put('/:id', upload.single('document'), async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nom_employe, 
                service, 
                poste, 
                date_embauche,
                jours_conges_annuels,
                date_demande,
                date_debut, 
                date_fin, 
                motif,
                date_retour,
                jours_pris,
                jours_restants,
                date_prochaine_attribution,
                type_conge,
                statut
            } = req.body;

            // Chemin du document uploadé, s'il existe
            const documentPath = req.file ? `/uploads/conges/${req.file.filename}` : null;

            const query = `
                UPDATE conges 
                SET nom_employe = $1, 
                    service = $2, 
                    poste = $3, 
                    date_embauche = $4,
                    jours_conges_annuels = $5,
                    date_demande = $6,
                    date_debut = $7, 
                    date_fin = $8, 
                    motif = $9,
                    date_retour = $10,
                    jours_pris = $11,
                    jours_restants = $12,
                    date_prochaine_attribution = $13,
                    type_conge = $14,
                    statut = $15,
                    document_path = $16
                WHERE id = $17 
                RETURNING *
            `;

            const values = [
                nom_employe, 
                service || null, 
                poste || null,
                date_embauche || null,
                jours_conges_annuels || null,
                date_demande || new Date(),
                date_debut, 
                date_fin,
                motif || null,
                date_retour || null,
                jours_pris || null,
                jours_restants || null,
                date_prochaine_attribution || null,
                type_conge || 'Congé payé',
                statut || 'En attente',
                documentPath,
                id
            ];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Conge not found' });
            }

            res.json(normalizeEntity(result.rows[0], 'conge'));
        } catch (err) {
            console.error('Error updating conge:', err);
            res.status(500).json({ error: 'Failed to update conge', details: err.message });
        }
    });

    // Approuver un congé
    router.put('/:id/approve', async (req, res) => {
        try {
            const { id } = req.params;
            
            const query = `
                UPDATE conges 
                SET statut = 'Approuvé',
                    date_traitement = CURRENT_TIMESTAMP
                WHERE id = $1 
                RETURNING *
            `;
            
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Conge not found' });
            }
            
            res.json(normalizeEntity(result.rows[0], 'conge'));
        } catch (err) {
            console.error('Error approving conge:', err);
            res.status(500).json({ error: 'Failed to approve conge', details: err.message });
        }
    });

    // Refuser un congé
    router.put('/:id/reject', async (req, res) => {
        try {
            const { id } = req.params;
            const { motif_refus } = req.body;
            
            const query = `
                UPDATE conges 
                SET statut = 'Refusé',
                    date_traitement = CURRENT_TIMESTAMP,
                    motif = CASE WHEN $1 IS NOT NULL THEN 
                                CASE WHEN motif IS NULL OR motif = '' 
                                    THEN $1 
                                    ELSE motif || ' | Motif de refus: ' || $1 
                                END
                            ELSE motif END
                WHERE id = $2 
                RETURNING *
            `;
            
            const result = await pool.query(query, [motif_refus || null, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Conge not found' });
            }
            
            res.json(normalizeEntity(result.rows[0], 'conge'));
        } catch (err) {
            console.error('Error rejecting conge:', err);
            res.status(500).json({ error: 'Failed to reject conge', details: err.message });
        }
    });

    // Supprimer un congé
    router.delete('/:id', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            // Récupérer les infos du congé avant suppression
            const congeInfoQuery = 'SELECT * FROM conges WHERE id = $1';
            const congeInfoResult = await client.query(congeInfoQuery, [id]);
            
            if (congeInfoResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Conge not found' });
            }
            
            const conge = congeInfoResult.rows[0];
            const entityName = `Congé ${conge.type_conge || 'N/A'} - ${conge.nom_employe || 'Employé inconnu'} (${conge.date_debut || 'N/A'})`;
            
            // Récupérer l'utilisateur qui effectue la suppression
            const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
            const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
            const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            
            // Sauvegarder dans audit_logs avant suppression
            await client.query(`
                INSERT INTO audit_logs (
                    action_type, entity_type, entity_id, entity_name,
                    user_type, user_id, user_email, description, ip_address, user_agent, status,
                    changes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                'delete',
                'conge',
                id.toString(),
                entityName,
                userType,
                userId,
                userEmail,
                `Congé supprimé: ${entityName}`,
                ipAddress,
                userAgent,
                'success',
                JSON.stringify({
                    type_conge: conge.type_conge,
                    nom_employe: conge.nom_employe,
                    date_debut: conge.date_debut,
                    date_fin: conge.date_fin,
                    statut: conge.statut,
                    service: conge.service
                })
            ]);
            
            // Supprimer le congé
            const query = 'DELETE FROM conges WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);
            
            await client.query('COMMIT');
            
            console.log(`✅ Congé supprimé (ID: ${id}) et tracé dans audit_logs`);
            res.json({ message: 'Conge deleted successfully', conge: normalizeEntity(result.rows[0], 'conge') });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error deleting conge:', err);
            res.status(500).json({ error: 'Failed to delete conge', details: err.message });
        } finally {
            client.release();
        }
    });

    // Récupérer les congés par statut
    router.get('/status/:status', async (req, res) => {
        try {
            const { status } = req.params;
            const query = 'SELECT * FROM conges WHERE statut = $1 ORDER BY date_demande DESC';
            const result = await pool.query(query, [status]);
            res.json(normalizeEntity(result.rows, 'conge'));
        } catch (err) {
            console.error('Error fetching conges by status:', err);
            res.status(500).json({ error: 'Failed to fetch conges by status', details: err.message });
        }
    });

    // Recherche avancée des congés
    router.get('/search/filter', async (req, res) => {
        try {
            const { 
                employee, 
                service, 
                type, 
                status, 
                startDateFrom, 
                startDateTo 
            } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (employee) {
                conditions.push(`nom_employe ILIKE $${paramIndex}`);
                values.push(`%${employee}%`);
                paramIndex++;
            }
            
            if (service) {
                conditions.push(`service = $${paramIndex}`);
                values.push(service);
                paramIndex++;
            }
            
            if (type) {
                conditions.push(`type_conge = $${paramIndex}`);
                values.push(type);
                paramIndex++;
            }
            
            if (status) {
                conditions.push(`statut = $${paramIndex}`);
                values.push(status);
                paramIndex++;
            }
            
            if (startDateFrom) {
                conditions.push(`date_debut >= $${paramIndex}`);
                values.push(startDateFrom);
                paramIndex++;
            }
            
            if (startDateTo) {
                conditions.push(`date_debut <= $${paramIndex}`);
                values.push(startDateTo);
                paramIndex++;
            }
            
            let query = 'SELECT * FROM conges';
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY date_demande DESC';
            
            const result = await pool.query(query, values);
            res.json(normalizeEntity(result.rows, 'conge'));
        } catch (err) {
            console.error('Error searching conges:', err);
            res.status(500).json({ error: 'Failed to search conges', details: err.message });
        }
    });

    return router;
};