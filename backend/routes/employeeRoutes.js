const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { normalizeEntity } = require('../utils/textNormalizer');

// Fonction pour décoder les entités HTML côté backend
const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  
  let decoded = str;
  
  // Décoder les entités HTML courantes
  const htmlEntities = {
    '&eacute;': 'é',
    '&egrave;': 'è',
    '&agrave;': 'à',
    '&ocirc;': 'ô',
    '&ccedil;': 'ç',
    '&ucirc;': 'û',
    '&icirc;': 'î',
    '&acirc;': 'â',
    '&ecirc;': 'ê',
    '&Agrave;': 'À',
    '&Egrave;': 'È',
    '&Eacute;': 'É',
    '&Acirc;': 'Â',
    '&Ecirc;': 'Ê',
    '&Icirc;': 'Î',
    '&Ocirc;': 'Ô',
    '&Ucirc;': 'Û',
    '&Ccedil;': 'Ç',
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&#x2F;': '/'
  };
  
  // Remplacer les entités HTML
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Décoder les entités numériques
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Corriger les caractères mal encodés spécifiques
  // 'š' -> 'è' (minuscule) pour les noms
  decoded = decoded.replace(/š/g, 'è');
  // 'Š' -> 'è' (minuscule) aussi, car dans les noms on veut généralement la minuscule
  // Sauf si c'est vraiment en début de mot ou après une majuscule
  decoded = decoded.replace(/Š/g, 'è');
  
  // Corriger les cas spécifiques de l'image - Remplacer les virgules par é
  const specificCorrections = [
    { wrong: 'C,phora', correct: 'Céphora' },
    { wrong: 'M,decin', correct: 'Médecin' },
    { wrong: 'gyn,cologue', correct: 'gynécologue' },
    { wrong: 'Op,rateur', correct: 'Opérateur' },
    { wrong: 'secr,taire', correct: 'secrétaire' },
    { wrong: 'm,dicale', correct: 'médicale' },
    { wrong: 'r,nimateur', correct: 'réanimateur' },
    { wrong: 'sup,rieur', correct: 'supérieur' },
    { wrong: 'g,n,rale', correct: 'générale' },
    { wrong: 'Agnšs', correct: 'Agnès' },
    { wrong: 'Sosthšne', correct: 'Sosthène' },
    { wrong: 'VP-M,decin', correct: 'VP-Médecin' },
    { wrong: 'Technicien superieur', correct: 'Technicien supérieur' },
    { wrong: 'anesthesiste', correct: 'anesthésiste' },
    { wrong: 'biologie m,dicale', correct: 'biologie médicale' },
    { wrong: 'imagerie m,dicale', correct: 'imagerie médicale' },
    { wrong: 'C,libataire', correct: 'Célibataire' }
  ];
  
  specificCorrections.forEach(({ wrong, correct }) => {
    decoded = decoded.replace(new RegExp(wrong, 'g'), correct);
  });
  
  // Corriger les virgules qui remplacent les accents é - Approche plus robuste
  // Cette regex remplace les virgules par é quand elles sont suivies d'une lettre minuscule
  decoded = decoded.replace(/([A-Za-z]),(?=[a-z])/g, '$1é');
  
  // Corriger les cas où la virgule est suivie d'une lettre majuscule (comme dans "C,phora")
  decoded = decoded.replace(/([A-Za-z]),(?=[A-Z])/g, '$1é');
  
  // Corriger les cas où la virgule est à la fin d'un mot
  decoded = decoded.replace(/([A-Za-z]),/g, '$1é');
  
  // Corriger les cas spécifiques supplémentaires basés sur l'image
  const additionalCorrections = [
    { wrong: 'Equipière', correct: 'Équipière' },
    { wrong: 'Milène', correct: 'Milène' }, // Déjà correct
    { wrong: 'AmakÈ', correct: 'Amakè' },
    { wrong: 'BOUNGOUERE MABE C,phora', correct: 'BOUNGOUERE MABE Céphora' },
    { wrong: 'CHITOU Bilkis Epse SANMA Folachad, AmakÈ', correct: 'CHITOU Bilkis Epse SANMA Folachad, Amakè' }
  ];
  
  additionalCorrections.forEach(({ wrong, correct }) => {
    decoded = decoded.replace(new RegExp(wrong, 'g'), correct);
  });
  
  // Corriger les cas génériques de virgules qui remplacent é dans les mots français
  const frenchWordCorrections = [
    { pattern: /([A-Za-z]),rateur/g, replacement: '$1érateur' },
    { pattern: /([A-Za-z]),taire/g, replacement: '$1étaire' },
    { pattern: /([A-Za-z]),dicale/g, replacement: '$1édicale' },
    { pattern: /([A-Za-z]),nimateur/g, replacement: '$1éanimateur' },
    { pattern: /([A-Za-z]),rieur/g, replacement: '$1érieur' },
    { pattern: /([A-Za-z]),rale/g, replacement: '$1érale' },
    { pattern: /([A-Za-z]),decin/g, replacement: '$1édecin' },
    { pattern: /([A-Za-z]),dical/g, replacement: '$1édical' },
    { pattern: /([A-Za-z]),nique/g, replacement: '$1énique' },
    { pattern: /([A-Za-z]),trie/g, replacement: '$1étrie' },
    { pattern: /([A-Za-z]),rie/g, replacement: '$1érie' },
    { pattern: /([A-Za-z]),rieux/g, replacement: '$1érieux' },
    { pattern: /([A-Za-z]),rieuse/g, replacement: '$1érieuse' },
    { pattern: /([A-Za-z]),rieusement/g, replacement: '$1érieusement' }
  ];
  
  frenchWordCorrections.forEach(({ pattern, replacement }) => {
    decoded = decoded.replace(pattern, replacement);
  });
  
  return decoded;
};

// Fonction pour décoder tous les champs d'un employé
const decodeEmployeeFields = (employee) => {
  if (!employee) return employee;
  
  const decoded = {
    ...employee,
    // Informations personnelles
    nom_prenom: decodeHtmlEntities(employee.nom_prenom),
    adresse: decodeHtmlEntities(employee.adresse),
    nationalite: decodeHtmlEntities(employee.nationalite),
    
    // Informations professionnelles
    poste_actuel: decodeHtmlEntities(employee.poste_actuel),
    functional_area: decodeHtmlEntities(employee.functional_area),
    entity: decodeHtmlEntities(employee.entity),
    type_contrat: decodeHtmlEntities(employee.type_contrat),
    responsable: decodeHtmlEntities(employee.responsable),
    statut_employe: decodeHtmlEntities(employee.statut_employe),
    
    // Autres champs importants
    lieu: decodeHtmlEntities(employee.lieu),
    specialisation: decodeHtmlEntities(employee.specialisation),
    niveau_etude: decodeHtmlEntities(employee.niveau_etude)
  };
  
  // Appliquer aussi la normalisation des accents
  return normalizeEntity(decoded, 'employee');
};

// Fonction pour corriger les données d'encodage dans la base de données
const fixEncodingInDatabase = async (pool) => {
  try {
    // Corriger les noms avec des virgules mal encodées
    const updateQueries = [
      "UPDATE employees SET nom_prenom = REPLACE(nom_prenom, 'C,phora', 'Céphora') WHERE nom_prenom LIKE '%C,phora%'",
      "UPDATE employees SET nom_prenom = REPLACE(nom_prenom, 'M,decin', 'Médecin') WHERE nom_prenom LIKE '%M,decin%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'gyn,cologue', 'gynécologue') WHERE poste_actuel LIKE '%gyn,cologue%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'Op,rateur', 'Opérateur') WHERE poste_actuel LIKE '%Op,rateur%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'secr,taire', 'secrétaire') WHERE poste_actuel LIKE '%secr,taire%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'm,dicale', 'médicale') WHERE poste_actuel LIKE '%m,dicale%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'r,nimateur', 'réanimateur') WHERE poste_actuel LIKE '%r,nimateur%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'sup,rieur', 'supérieur') WHERE poste_actuel LIKE '%sup,rieur%'",
      "UPDATE employees SET functional_area = REPLACE(functional_area, 'g,n,rale', 'générale') WHERE functional_area LIKE '%g,n,rale%'",
      "UPDATE employees SET nom_prenom = REPLACE(nom_prenom, 'Agnšs', 'Agnès') WHERE nom_prenom LIKE '%Agnšs%'",
      "UPDATE employees SET nom_prenom = REPLACE(nom_prenom, 'Sosthšne', 'Sosthène') WHERE nom_prenom LIKE '%Sosthšne%'",
      "UPDATE employees SET nom_prenom = REPLACE(nom_prenom, 'AmakÈ', 'Amakè') WHERE nom_prenom LIKE '%AmakÈ%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'Equipière', 'Équipière') WHERE poste_actuel LIKE '%Equipière%'",
      "UPDATE employees SET poste_actuel = REPLACE(poste_actuel, 'biologie m,dicale', 'biologie médicale') WHERE poste_actuel LIKE '%biologie m,dicale%'",
      "UPDATE employees SET statut_marital = REPLACE(statut_marital, 'C,libataire', 'Célibataire') WHERE statut_marital LIKE '%C,libataire%'"
    ];
    
    for (const query of updateQueries) {
      await pool.query(query);
    }
    
    console.log('Correction de l\'encodage terminée');
  } catch (error) {
    console.error('Erreur lors de la correction de l\'encodage:', error);
  }
};

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir;
        
        // Définir le dossier de destination selon le type de fichier
        if (file.fieldname === 'photo') {
            uploadDir = path.join(__dirname, '../uploads/photos');
        } else {
            uploadDir = path.join(__dirname, '../uploads/employee-documents');
        }
        
        // Créer le répertoire s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique pour éviter les collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        
        if (file.fieldname === 'photo') {
            cb(null, `employee-photo-${uniqueSuffix}${ext}`);
        } else {
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    }
});

// Créer une instance de multer avec la configuration
const upload = multer({ storage: storage });

// Exportez une fonction qui prend l'objet pool comme argument
module.exports = (pool) => {
    const router = express.Router();

    // Récupérer tous les employés
    router.get('/', async (req, res) => {
        try {
            // Corriger l'encodage dans la base de données d'abord
            await fixEncodingInDatabase(pool);
            
            const query = `
                SELECT * FROM employees 
                ORDER BY nom_prenom ASC
            `;
            const result = await pool.query(query);
            // Décoder les champs avant d'envoyer au frontend
            const decodedEmployees = result.rows.map(decodeEmployeeFields);
            res.json(decodedEmployees);
        } catch (err) {
            console.error('Error fetching employees:', err);
            res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
        }
    });

    // Recherche d'employés avec filtres
    router.get('/search', async (req, res) => {
        try {
            const { search, entity, type_contrat, functional_area } = req.query;
            
            let conditions = [];
            let values = [];
            let paramIndex = 1;
            
            if (search) {
                conditions.push(`(nom_prenom ILIKE $${paramIndex} OR matricule ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR poste_actuel ILIKE $${paramIndex})`);
                values.push(`%${search}%`);
                paramIndex++;
            }
            
            if (entity) {
                conditions.push(`entity = $${paramIndex}`);
                values.push(entity);
                paramIndex++;
            }
            
            if (type_contrat) {
                conditions.push(`type_contrat = $${paramIndex}`);
                values.push(type_contrat);
                paramIndex++;
            }
            
            if (functional_area) {
                conditions.push(`functional_area = $${paramIndex}`);
                values.push(functional_area);
                paramIndex++;
            }
            
            let query = 'SELECT * FROM employees';
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            query += ' ORDER BY nom_prenom ASC';
            
            const result = await pool.query(query, values);
            // Décoder les champs avant d'envoyer au frontend
            const decodedEmployees = result.rows.map(decodeEmployeeFields);
            res.json(decodedEmployees);
        } catch (err) {
            console.error('Error searching employees:', err);
            res.status(500).json({ error: 'Failed to search employees', details: err.message });
        }
    });

    // Route pour récupérer les documents d'un employé (doit être avant /:id)
    router.get('/:id/documents', async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT 
                    id,
                    employee_id,
                    document_type,
                    file_name,
                    file_path,
                    upload_date,
                    CASE 
                        WHEN file_path LIKE '%.pdf' THEN 'pdf'
                        WHEN file_path LIKE '%.doc' OR file_path LIKE '%.docx' THEN 'word'
                        WHEN file_path LIKE '%.xls' OR file_path LIKE '%.xlsx' THEN 'excel'
                        WHEN file_path LIKE '%.jpg' OR file_path LIKE '%.jpeg' OR file_path LIKE '%.png' THEN 'image'
                        ELSE 'other'
                    END as file_type
                FROM employee_documents 
                WHERE employee_id = $1 
                ORDER BY upload_date DESC
            `;
            const result = await pool.query(query, [id]);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching employee documents:', err);
            res.status(500).json({ error: 'Failed to fetch employee documents', details: err.message });
        }
    });

    // Route pour télécharger un document d'employé (doit être avant /:id)
    router.get('/documents/:documentId/download', async (req, res) => {
        try {
            const { documentId } = req.params;
            const query = 'SELECT file_path, file_name FROM employee_documents WHERE id = $1';
            const result = await pool.query(query, [documentId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Document not found' });
            }
            
            const document = result.rows[0];
            const filePath = path.join(__dirname, '..', document.file_path);
            
            if (fs.existsSync(filePath)) {
                res.download(filePath, document.file_name);
            } else {
                res.status(404).json({ error: 'File not found on server' });
            }
        } catch (err) {
            console.error('Error downloading document:', err);
            res.status(500).json({ error: 'Failed to download document', details: err.message });
        }
    });

    // Route pour visualiser un document d'employé (doit être avant /:id)
    router.get('/documents/:documentId/view', async (req, res) => {
        try {
            const { documentId } = req.params;
            const query = 'SELECT file_path, file_name FROM employee_documents WHERE id = $1';
            const result = await pool.query(query, [documentId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Document not found' });
            }
            
            const document = result.rows[0];
            const filePath = path.join(__dirname, '..', document.file_path);
            
            if (fs.existsSync(filePath)) {
                res.sendFile(path.resolve(filePath));
            } else {
                res.status(404).json({ error: 'File not found on server' });
            }
        } catch (err) {
            console.error('Error viewing document:', err);
            res.status(500).json({ error: 'Failed to view document', details: err.message });
        }
    });

    // Récupérer un employé par ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = 'SELECT * FROM employees WHERE id = $1';
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            
            // Décoder les champs avant d'envoyer au frontend
            const decodedEmployee = decodeEmployeeFields(result.rows[0]);
            res.json(decodedEmployee);
        } catch (err) {
            console.error('Error fetching employee:', err);
            res.status(500).json({ error: 'Failed to fetch employee', details: err.message });
        }
    });

    // Créer un nouvel employé (avec téléchargement de fichiers et photos)
    router.post('/', upload.fields([
        { name: 'documents', maxCount: 10 },
        { name: 'photo', maxCount: 1 }
    ]), async (req, res) => {
        console.log('⭐ POST /employees - Début de la requête');
        console.log('Body reçu:', req.body);
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Assurez-vous que nom_prenom est bien défini (champ obligatoire)
            if (!req.body.noms) {
                throw new Error('Le champ nom_prenom est obligatoire');
            }
            
            // Mappage des champs du formulaire frontend à la structure de la base de données
            const employeeData = {
                nom_prenom: req.body.noms, // ⭐ Champ obligatoire
                genre: req.body.genre || 'Non spécifié',
                date_naissance: req.body.date_naissance || null,
                date_entree: req.body.date_embauche || null,
                lieu: req.body.lieu || null,
                adresse: req.body.adresse || null,
                telephone: req.body.telephone || null,
                email: req.body.email || null,
                cnss_number: req.body.cnss_number || null,
                cnamgs_number: req.body.cnamgs_number || null,
                poste_actuel: req.body.poste_actuel || null,
                type_contrat: req.body.type_contrat || null,
                date_fin_contrat: req.body.date_fin_contrat || null,
                employee_type: req.body.statut_local_expat || null,
                nationalite: req.body.pays || 'Gabon',
                functional_area: req.body.domaine_fonctionnel || null,
                entity: req.body.entity || null,
                statut_marital: req.body.situation_maritale || null,
                enfants: req.body.nbr_enfants ? parseInt(req.body.nbr_enfants) : 0,
                niveau_etude: req.body.niveau_academique || null,
                specialisation: req.body.diplome || null,
                type_remuneration: req.body.pay || null,
                payment_mode: req.body.payment_mode || null,
                categorie: req.body.categorie_convention || null,
                salaire_base: req.body.salaire_base ? parseFloat(req.body.salaire_base) : 0,
                prime_responsabilite: req.body.prime_responsabilite ? parseFloat(req.body.prime_responsabilite) : 0,
                prime_transport: req.body.transport ? parseFloat(req.body.transport) : 0,
                prime_logement: req.body.logement ? parseFloat(req.body.logement) : 0,
                // Ajoutez d'autres champs au besoin...
            };
            
            console.log('⭐ Données mappées:', employeeData);
            
            // Construire la requête SQL dynamiquement
            const fields = Object.keys(employeeData).filter(key => employeeData[key] !== null);
            const placeholders = fields.map((_, index) => `$${index + 1}`);
            const values = fields.map(field => employeeData[field]);
            
            const query = `
                INSERT INTO employees (${fields.join(', ')})
                VALUES (${placeholders.join(', ')})
                RETURNING *
            `;
            
            console.log('⭐ Requête SQL:', query);
            console.log('⭐ Valeurs:', values);
            
            const result = await client.query(query, values);
            const newEmployee = result.rows[0];
            
            console.log('⭐ Employé créé avec succès, ID:', newEmployee.id);
            
            // Traitement de la photo
            if (req.files && req.files.photo && req.files.photo.length > 0) {
                const photoFile = req.files.photo[0];
                console.log(`⭐ Photo uploadée: ${photoFile.originalname}`);
                
                // Mettre à jour l'employé avec le chemin de la photo
                const photoPath = `/uploads/photos/${path.basename(photoFile.path)}`;
                const updatePhotoQuery = `
                    UPDATE employees 
                    SET photo_path = $1 
                    WHERE id = $2
                `;
                
                await client.query(updatePhotoQuery, [photoPath, newEmployee.id]);
                console.log(`⭐ Photo mise à jour pour l'employé ${newEmployee.id}`);
            }
            
            // Traitement des documents
            if (req.files && req.files.documents && req.files.documents.length > 0) {
                console.log(`⭐ Traitement de ${req.files.documents.length} documents`);
                
                for (let i = 0; i < req.files.documents.length; i++) {
                    const file = req.files.documents[i];
                    const documentType = Array.isArray(req.body.document_types) 
                        ? req.body.document_types[i] 
                        : (req.body.document_types || 'Autre');
                    
                    console.log(`⭐ Document ${i+1}: ${file.originalname}, type: ${documentType}`);
                    
                    const docQuery = `
                        INSERT INTO employee_documents (
                            employee_id, document_type, file_name, file_path, upload_date
                        )
                        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                    `;
                    
                    await client.query(docQuery, [
                        newEmployee.id,
                        documentType,
                        file.originalname,
                        file.path
                    ]);
                }
            }
            
            await client.query('COMMIT');
            console.log('⭐ Transaction validée');
            
            res.status(201).json(newEmployee);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Erreur lors de la création de l\'employé:');
            console.error('Message:', err.message);
            console.error('Stack:', err.stack);
            
            res.status(500).json({ 
                error: 'Failed to create employee', 
                details: err.message,
                stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
            });
        } finally {
            client.release();
        }
    });

    // Route de test simple sans multer
    router.post('/test-simple', async (req, res) => {
        console.log('⭐ POST /employees/test-simple - Test sans multer');
        console.log('Body reçu:', req.body);
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Valider que nom_prenom est présent (obligatoire)
            if (!req.body.nom_prenom && !req.body.noms) {
                throw new Error('Le nom de l\'employé est obligatoire');
            }
            
            // Insérer un employé avec les champs minimaux requis
            const query = `
                INSERT INTO employees (
                    nom_prenom,
                    genre,
                    date_entree,
                    poste_actuel
                )
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const values = [
                req.body.nom_prenom || req.body.noms,
                req.body.genre || 'Non spécifié',
                req.body.date_entree || req.body.date_embauche || new Date().toISOString().split('T')[0],
                req.body.poste_actuel || 'Poste test'
            ];
            
            console.log('⭐ Requête SQL:', query);
            console.log('⭐ Valeurs:', values);
            
            const result = await client.query(query, values);
            const newEmployee = result.rows[0];
            
            await client.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Employé test créé avec succès',
                data: newEmployee
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Erreur lors du test simple:');
            console.error('Message:', err.message);
            console.error('Stack:', err.stack);
            
            res.status(500).json({ 
                success: false,
                error: 'Test failed', 
                details: err.message,
                stack: err.stack
            });
        } finally {
            client.release();
        }
    });

    // Mettre à jour un employé
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            // Extraire les données du corps de la requête
            const {
                statut_dossier,
                matricule,
                nom_prenom,
                genre,
                date_naissance,
                date_entree,
                lieu,
                adresse,
                telephone,
                email,
                cnss_number,
                cnamgs_number,
                poste_actuel,
                type_contrat,
                date_fin_contrat,
                employee_type,
                nationalite,
                functional_area,
                entity,
                responsable,
                statut_employe,
                statut_marital,
                enfants,
                niveau_etude,
                specialisation,
                type_remuneration,
                payment_mode,
                categorie,
                salaire_base,
                salaire_net,
                prime_responsabilite,
                prime_penibilite,
                prime_logement,
                prime_transport,
                prime_anciennete,
                prime_enfant,
                prime_representation,
                prime_performance,
                prime_astreinte,
                honoraires,
                indemnite_stage,
                timemoto_id,
                emergency_contact,
                emergency_phone
            } = req.body;

            // Calculer l'âge si la date de naissance est fournie
            let age = null;
            let age_restant = null;
            let date_retraite = null;
            
            if (date_naissance) {
                const birthDate = new Date(date_naissance);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                
                // Ajuster l'âge si l'anniversaire de cette année n'est pas encore passé
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                // Calculer la date de retraite (supposons 65 ans)
                const retraiteAge = 65;
                age_restant = retraiteAge - age;
                
                date_retraite = new Date(birthDate);
                date_retraite.setFullYear(birthDate.getFullYear() + retraiteAge);
            }

            // Calculer l'ancienneté
            let anciennete = null;
            if (date_entree) {
                const entryDate = new Date(date_entree);
                const today = new Date();
                const diffTime = Math.abs(today - entryDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const diffYears = Math.floor(diffDays / 365);
                const diffMonths = Math.floor((diffDays % 365) / 30);
                
                anciennete = `${diffYears} ans ${diffMonths} mois`;
            }

            // Mettre à jour l'employé dans la base de données
            const query = `
                UPDATE employees
                SET 
                    statut_dossier = $1,
                    matricule = $2,
                    nom_prenom = $3,
                    genre = $4,
                    date_naissance = $5,
                    age = $6,
                    age_restant = $7,
                    date_retraite = $8,
                    date_entree = $9,
                    lieu = $10,
                    adresse = $11,
                    telephone = $12,
                    email = $13,
                    cnss_number = $14,
                    cnamgs_number = $15,
                    poste_actuel = $16,
                    type_contrat = $17,
                    date_fin_contrat = $18,
                    employee_type = $19,
                    nationalite = $20,
                    functional_area = $21,
                    entity = $22,
                    responsable = $23,
                    statut_employe = $24,
                    statut_marital = $25,
                    enfants = $26,
                    niveau_etude = $27,
                    anciennete = $28,
                    specialisation = $29,
                    type_remuneration = $30,
                    payment_mode = $31,
                    categorie = $32,
                    salaire_base = $33,
                    salaire_net = $34,
                    prime_responsabilite = $35,
                    prime_penibilite = $36,
                    prime_logement = $37,
                    prime_transport = $38,
                    prime_anciennete = $39,
                    prime_enfant = $40,
                    prime_representation = $41,
                    prime_performance = $42,
                    prime_astreinte = $43,
                    honoraires = $44,
                    indemnite_stage = $45,
                    timemoto_id = $46,
                    emergency_contact = $47,
                    emergency_phone = $48,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $49
                RETURNING *
            `;

            const values = [
                statut_dossier,
                matricule,
                nom_prenom,
                genre,
                date_naissance,
                age,
                age_restant,
                date_retraite,
                date_entree,
                lieu,
                adresse,
                telephone,
                email,
                cnss_number,
                cnamgs_number,
                poste_actuel,
                type_contrat,
                date_fin_contrat,
                employee_type,
                nationalite,
                functional_area,
                entity,
                responsable,
                statut_employe,
                statut_marital,
                enfants,
                niveau_etude,
                anciennete,
                specialisation,
                type_remuneration,
                payment_mode,
                categorie,
                salaire_base || 0,
                salaire_net || 0,
                prime_responsabilite || 0,
                prime_penibilite || 0,
                prime_logement || 0,
                prime_transport || 0,
                prime_anciennete || 0,
                prime_enfant || 0,
                prime_representation || 0,
                prime_performance || 0,
                prime_astreinte || 0,
                honoraires || 0,
                indemnite_stage || 0,
                timemoto_id,
                emergency_contact,
                emergency_phone,
                id
            ];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            res.json(result.rows[0]);
        } catch (err) {
            console.error('Error updating employee:', err);
            res.status(500).json({ error: 'Failed to update employee', details: err.message });
        }
    });

    // Supprimer un employé
   // Version améliorée : Supprimer un employé avec motif de départ personnalisé
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { id } = req.params;
        const { 
            motif_depart = 'Suppression du dossier employé', 
            commentaire_supplementaire = '',
            date_depart_effective = null 
        } = req.body;
        
        // 1. Récupérer les données de l'employé avant suppression
        const getEmployeeQuery = 'SELECT * FROM employees WHERE id = $1';
        const employeeResult = await client.query(getEmployeeQuery, [id]);

        if (employeeResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employee = employeeResult.rows[0];
        
        // 2. Amélioration de l'extraction nom/prénom
        const fullName = employee.nom_prenom || '';
        let nom = '';
        let prenom = '';
        
        if (fullName.includes(',')) {
            // Format "NOM, Prénom"
            const parts = fullName.split(',');
            nom = parts[0].trim();
            prenom = parts[1] ? parts[1].trim() : '';
        } else {
            // Format "Prénom NOM" ou "Prénom1 Prénom2 NOM"
            const nameParts = fullName.trim().split(' ');
            if (nameParts.length === 1) {
                nom = nameParts[0];
                prenom = '';
            } else {
                nom = nameParts[nameParts.length - 1]; // Dernier mot = nom
                prenom = nameParts.slice(0, -1).join(' '); // Reste = prénom(s)
            }
        }
        
        // 3. Construire le commentaire détaillé
        const commentaireComplet = [
            commentaire_supplementaire,
            `Employé supprimé du système le ${new Date().toLocaleDateString('fr-FR')}.`,
            `Informations: Matricule: ${employee.matricule || 'N/A'}, Email: ${employee.email || 'N/A'}, Téléphone: ${employee.telephone || 'N/A'}`,
            employee.date_entree ? `Date d'entrée: ${new Date(employee.date_entree).toLocaleDateString('fr-FR')}` : '',
            employee.entity ? `Entité: ${employee.entity}` : ''
        ].filter(Boolean).join(' | ');
        
        // 4. Insérer l'employé dans l'historique des départs
        const insertDepartureQuery = `
            INSERT INTO historique_departs 
            (nom, prenom, departement, statut, poste, date_depart, motif_depart, commentaire, date_creation) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
            RETURNING *
        `;

        const departureValues = [
            nom,
            prenom,
            employee.functional_area || 'Non spécifié',
            employee.type_contrat || 'Non spécifié',
            employee.poste_actuel || 'Non spécifié',
            date_depart_effective || new Date().toISOString().split('T')[0], // Date de départ effective ou aujourd'hui
            motif_depart,
            commentaireComplet
        ];

        const departureResult = await client.query(insertDepartureQuery, departureValues);
        
        // 5. Récupérer l'utilisateur qui effectue la suppression
        const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
        const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
        const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        // 6. Sauvegarder dans audit_logs avant suppression
        await client.query(`
            INSERT INTO audit_logs (
                action_type, entity_type, entity_id, entity_name,
                user_type, user_id, user_email, description, ip_address, user_agent, status,
                changes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
            'delete',
            'employee',
            id.toString(),
            `${employee.nom_prenom} (${employee.matricule || 'N/A'})`,
            userType,
            userId,
            userEmail,
            `Employé supprimé: ${employee.nom_prenom} (${employee.matricule || 'N/A'}) - Motif: ${motif_depart}`,
            ipAddress,
            userAgent,
            'success',
            JSON.stringify({
                nom_prenom: employee.nom_prenom,
                matricule: employee.matricule,
                email: employee.email,
                poste_actuel: employee.poste_actuel,
                functional_area: employee.functional_area,
                type_contrat: employee.type_contrat,
                date_entree: employee.date_entree,
                motif_depart: motif_depart,
                date_depart_effective: date_depart_effective || new Date().toISOString().split('T')[0]
            })
        ]);
        
        // 7. Supprimer l'employé des tables liées d'abord (si nécessaire)
        // Supprimer les documents liés
        await client.query('DELETE FROM employee_documents WHERE employee_id = $1', [id]);
        
        // 8. Supprimer l'employé
        const deleteEmployeeQuery = 'DELETE FROM employees WHERE id = $1 RETURNING *';
        const deleteResult = await client.query(deleteEmployeeQuery, [id]);

        // 9. Valider la transaction
        await client.query('COMMIT');
        
        console.log(`✅ Employee ${employee.nom_prenom} (ID: ${id}) deleted successfully`);
        console.log(`✅ Departure record created with ID: ${departureResult.rows[0].id}`);

        res.json({ 
            success: true,
            message: 'Employee deleted successfully and added to departure history', 
            data: {
                deleted_employee: {
                    id: deleteResult.rows[0].id,
                    nom_prenom: deleteResult.rows[0].nom_prenom,
                    email: deleteResult.rows[0].email,
                    poste: deleteResult.rows[0].poste_actuel
                },
                departure_record: departureResult.rows[0]
            }
        });

    } catch (err) {
        // En cas d'erreur, annuler la transaction
        await client.query('ROLLBACK');
        console.error('❌ Error deleting employee and creating departure record:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete employee and create departure record', 
            details: err.message 
        });
    } finally {
        client.release();
    }
});

// Route supplémentaire pour supprimer un employé avec motif personnalisé (POST pour envoyer des données dans le body)
router.post('/:id/delete-with-departure', async (req, res) => {
    // Cette route utilise la même logique mais permet d'envoyer des données dans le body plus facilement
    req.method = 'DELETE';
    return router.delete('/:id')(req, res);
});
    // Route pour récupérer les employés dont le contrat expire bientôt (dans les 30 jours)
    router.get('/alerts/expiring-contracts', async (req, res) => {
        try {
            // Utiliser le paramètre daysThreshold ou la valeur par défaut 30
            const daysThreshold = parseInt(req.query.daysThreshold) || 30;
            
            const today = new Date().toISOString().split('T')[0];
            const futureDateLimit = new Date();
            futureDateLimit.setDate(futureDateLimit.getDate() + daysThreshold);
            const futureDateStr = futureDateLimit.toISOString().split('T')[0];
            
            // Ne vérifiez que les contrats avec des dates valides
            const query = `
                SELECT * FROM employees 
                WHERE date_fin_contrat IS NOT NULL 
                AND date_fin_contrat >= $1 
                AND date_fin_contrat <= $2
                AND type_contrat IN ('CDD', 'Prestataire', 'stage PNPE', 'Stage')
                ORDER BY date_fin_contrat ASC
            `;
            
            const result = await pool.query(query, [today, futureDateStr]);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching expiring contracts:', err);
            res.status(500).json({ error: 'Failed to fetch expiring contracts', details: err.message });
        }
    });

    // Route pour lister les emails des employés (pour les tests)
    router.get('/list/emails', async (req, res) => {
        try {
            const query = 'SELECT id, nom_prenom, email FROM employees WHERE email IS NOT NULL AND email != \'\' ORDER BY nom_prenom';
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching employee emails:', err);
            res.status(500).json({ error: 'Failed to fetch employee emails', details: err.message });
        }
    });


    // Route pour obtenir des statistiques sur les employés
    router.get('/stats/overview', async (req, res) => {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_employees,
                    COUNT(CASE WHEN type_contrat = 'CDI' THEN 1 END) as permanent_employees,
                    COUNT(CASE WHEN type_contrat = 'CDD' THEN 1 END) as temporary_employees,
                    COUNT(CASE WHEN type_contrat = 'stage PNPE' OR type_contrat = 'Stage' THEN 1 END) as interns,
                    COUNT(CASE WHEN type_contrat = 'Prestataire' THEN 1 END) as providers,
                    COUNT(DISTINCT entity) as total_entities,
                    COUNT(DISTINCT functional_area) as total_departments
                FROM employees
            `;
            
            const statsResult = await pool.query(statsQuery);
            
            const entityDistributionQuery = `
                SELECT entity, COUNT(*) as count
                FROM employees
                WHERE entity IS NOT NULL AND entity != ''
                GROUP BY entity
                ORDER BY count DESC
            `;
            
            const entityResult = await pool.query(entityDistributionQuery);
            
            const departmentDistributionQuery = `
                SELECT functional_area as department, COUNT(*) as count
                FROM employees
                WHERE functional_area IS NOT NULL AND functional_area != ''
                GROUP BY functional_area
                ORDER BY count DESC
            `;
            
            const departmentResult = await pool.query(departmentDistributionQuery);

            const contractTypeDistributionQuery = `
                SELECT type_contrat, COUNT(*) as count
                FROM employees
                WHERE type_contrat IS NOT NULL AND type_contrat != ''
                GROUP BY type_contrat
                ORDER BY count DESC
            `;
            
            const contractTypeResult = await pool.query(contractTypeDistributionQuery);

            const nationalityDistributionQuery = `
                SELECT nationalite, COUNT(*) as count
                FROM employees
                WHERE nationalite IS NOT NULL AND nationalite != ''
                GROUP BY nationalite
                ORDER BY count DESC
            `;
            
            const nationalityResult = await pool.query(nationalityDistributionQuery);
            
            res.json({
                overview: statsResult.rows[0],
                entityDistribution: entityResult.rows,
                departmentDistribution: departmentResult.rows,
                contractTypeDistribution: contractTypeResult.rows,
                nationalityDistribution: nationalityResult.rows
            });
        } catch (err) {
            console.error('Error fetching employee statistics:', err);
            res.status(500).json({ error: 'Failed to fetch employee statistics', details: err.message });
        }
    });

    // Route pour générer des matricules uniques pour tous les employés
    router.post('/generate-matricules', async (req, res) => {
      try {
        console.log('🚀 Début de la génération des matricules uniques...');
        
        // D'abord, récupérer tous les employés triés par ID
        const getEmployeesQuery = `
          SELECT id, nom_prenom, date_entree, poste_actuel
          FROM employees 
          ORDER BY id
        `;
        
        const employeesResult = await pool.query(getEmployeesQuery);
        const employees = employeesResult.rows;
        
        console.log(`📋 ${employees.length} employés trouvés pour la génération de matricules`);
        
        // Générer des matricules uniques pour chaque employé
        let matriculeCounter = 1;
        const matriculeUpdates = [];
        
        for (const employee of employees) {
          // Format: CDL-YYYY-XXXX (CDL = Centre Diagnostic Libreville, YYYY = année d'entrée, XXXX = numéro séquentiel)
          const entryYear = employee.date_entree ? new Date(employee.date_entree).getFullYear() : 2024;
          const matricule = `CDL-${entryYear}-${String(matriculeCounter).padStart(4, '0')}`;
          
          matriculeUpdates.push({
            id: employee.id,
            matricule: matricule,
            nom_prenom: employee.nom_prenom
          });
          
          matriculeCounter++;
        }
        
        // Mettre à jour chaque employé avec son matricule unique
        for (const update of matriculeUpdates) {
          const updateQuery = `
            UPDATE employees 
            SET matricule = $1
            WHERE id = $2
          `;
          
          await pool.query(updateQuery, [update.matricule, update.id]);
          console.log(`✅ ${update.matricule} assigné à ${update.nom_prenom}`);
        }
        
        console.log(`🎯 ${matriculeUpdates.length} matricules uniques générés avec succès`);
        
        // Récupérer la liste mise à jour des employés avec leurs matricules
        const getUpdatedEmployeesQuery = `
          SELECT id, nom_prenom, matricule, date_entree, poste_actuel, entity
          FROM employees 
          ORDER BY id
        `;
        
        const updatedEmployeesResult = await pool.query(getUpdatedEmployeesQuery);
        
        // Vérifier qu'il n'y a pas de doublons
        const matricules = updatedEmployeesResult.rows.map(emp => emp.matricule);
        const uniqueMatricules = [...new Set(matricules)];
        
        if (matricules.length !== uniqueMatricules.length) {
          console.log('⚠️ ATTENTION: Des doublons de matricules ont été détectés!');
        } else {
          console.log('✅ Vérification: Tous les matricules sont uniques');
        }
        
        // Afficher quelques exemples
        console.log('\n📋 Exemples de matricules générés:');
        updatedEmployeesResult.rows.slice(0, 10).forEach(emp => {
          console.log(`   ${emp.matricule} - ${emp.nom_prenom} (${emp.poste_actuel})`);
        });
        
        res.json({
          success: true,
          message: `${matriculeUpdates.length} matricules uniques ont été générés avec succès`,
          totalEmployees: matriculeUpdates.length,
          uniqueMatricules: uniqueMatricules.length,
          employees: updatedEmployeesResult.rows
        });
        
      } catch (err) {
        console.error('💥 Erreur lors de la génération des matricules:', err);
        res.status(500).json({
          success: false,
          message: 'Une erreur est survenue lors de la génération des matricules',
          details: err.message
        });
      }
    });

    return router;
};