const express = require('express');
const AutoNotificationService = require('../services/autoNotificationService');

module.exports = (pool) => {
    const router = express.Router();
    const autoNotificationService = new AutoNotificationService(pool);

    // Récupérer toutes les demandes
    router.get('/', async (req, res) => {
        try {
            const query = `
                SELECT er.*, e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
                ORDER BY er.request_date DESC
            `;
            const result = await pool.query(query);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching employee requests:', err);
            res.status(500).json({ error: 'Failed to fetch employee requests', details: err.message });
        }
    });

    // Compter les demandes en attente pour les notifications
    router.get('/count/pending', async (req, res) => {
        try {
            const query = `
                SELECT COUNT(*) as pending_count
                FROM employee_requests 
                WHERE status = 'pending'
            `;
            const result = await pool.query(query);
            res.json({ 
                pendingCount: parseInt(result.rows[0].pending_count),
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error counting pending requests:', err);
            res.status(500).json({ error: 'Failed to count pending requests', details: err.message });
        }
    });

    // Récupérer les demandes d'un employé spécifique
    router.get('/employee/:employeeId', async (req, res) => {
        try {
            const { employeeId } = req.params;
            const query = `
                SELECT er.*, e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
                WHERE er.employee_id = $1
                ORDER BY er.request_date DESC
            `;
            const result = await pool.query(query, [employeeId]);
            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching employee requests:', err);
            res.status(500).json({ error: 'Failed to fetch employee requests', details: err.message });
        }
    });

    // Récupérer une demande par son ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const query = `
                SELECT er.*, e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
                WHERE er.id = $1
            `;
            const result = await pool.query(query, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee request not found' });
            }
            
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching employee request:', err);
            res.status(500).json({ error: 'Failed to fetch employee request', details: err.message });
        }
    });

    // Créer une nouvelle demande
    router.post('/', async (req, res) => {
        try {
            const { 
                employee_id, 
                request_type, 
                request_details, 
                start_date, 
                end_date, 
                reason,
                start_time,
                end_time
            } = req.body;

            const query = `
                INSERT INTO employee_requests 
                (employee_id, request_type, request_details, start_date, end_date, reason, status, request_date, start_time, end_time) 
                VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP, $7, $8) 
                RETURNING *
            `;

            const values = [
                employee_id,
                request_type,
                request_details,
                start_date,
                end_date,
                reason,
                start_time,
                end_time
            ];

            const result = await pool.query(query, values);
            const newRequest = result.rows[0];
            
            // Récupérer les informations de l'employé pour la réponse
            const employeeQuery = `SELECT nom_prenom, poste_actuel, entity, email FROM employees WHERE id = $1`;
            const employeeResult = await pool.query(employeeQuery, [employee_id]);
            
            // Combiner les résultats
            const response = {
                ...newRequest,
                ...(employeeResult.rows[0] || {})
            };

            // Créer des notifications automatiques pour les RH et responsables
            try {
                await autoNotificationService.createRequestNotification({
                    request_id: newRequest.id,
                    employee_id: employee_id,
                    request_type: request_type,
                    title: `${request_type}: ${employeeResult.rows[0]?.nom_prenom || 'Employé'}`,
                    description: reason || request_details,
                    priority: request_type === 'leave_request' ? 'high' : 'normal'
                });
            } catch (notificationError) {
                console.error('❌ Erreur lors de la création de notification automatique:', notificationError);
                // Ne pas faire échouer la création de demande si la notification échoue
            }
            
            res.status(201).json(response);
        } catch (err) {
            console.error('Error creating employee request:', err);
            res.status(500).json({ error: 'Failed to create employee request', details: err.message });
        }
    });

    // Approuver une demande
    router.put('/:id/approve', async (req, res) => {
        try {
            const { id } = req.params;
            const { response_comments } = req.body;

            const query = `
                UPDATE employee_requests 
                SET status = 'approved', 
                    response_date = CURRENT_TIMESTAMP, 
                    response_comments = $1 
                WHERE id = $2 
                RETURNING *
            `;

            const result = await pool.query(query, [response_comments, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee request not found' });
            }

            const approvedRequest = result.rows[0];

            // Récupérer les informations de l'employé pour la réponse
            const employeeQuery = `
                SELECT e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employees e
                JOIN employee_requests er ON e.id = er.employee_id
                WHERE er.id = $1
            `;
            const employeeResult = await pool.query(employeeQuery, [id]);
            
            // Combiner les résultats
            const response = {
                ...approvedRequest,
                ...(employeeResult.rows[0] || {})
            };

            // Créer une notification automatique pour l'employé
            try {
                await autoNotificationService.createApprovalNotification({
                    request_id: approvedRequest.id,
                    employee_id: approvedRequest.employee_id,
                    approver_id: req.user?.id || null, // Si l'authentification est en place
                    status: 'approved',
                    request_type: approvedRequest.request_type,
                    title: `${approvedRequest.request_type}: ${employeeResult.rows[0]?.nom_prenom || 'Demande'}`
                });
            } catch (notificationError) {
                console.error('❌ Erreur lors de la création de notification d\'approbation:', notificationError);
                // Ne pas faire échouer l'approbation si la notification échoue
            }
            
            res.json(response);
        } catch (err) {
            console.error('Error approving employee request:', err);
            res.status(500).json({ error: 'Failed to approve employee request', details: err.message });
        }
    });

    // Refuser une demande
    router.put('/:id/reject', async (req, res) => {
        try {
            const { id } = req.params;
            const { response_comments } = req.body;

            // Vérifier que les commentaires de rejet sont fournis
            if (!response_comments) {
                return res.status(400).json({ error: 'Rejection comments are required' });
            }

            const query = `
                UPDATE employee_requests 
                SET status = 'rejected', 
                    response_date = CURRENT_TIMESTAMP, 
                    response_comments = $1 
                WHERE id = $2 
                RETURNING *
            `;

            const result = await pool.query(query, [response_comments, id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Employee request not found' });
            }

            // Récupérer les informations de l'employé pour la réponse
            const employeeQuery = `
                SELECT e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employees e
                JOIN employee_requests er ON e.id = er.employee_id
                WHERE er.id = $1
            `;
            const employeeResult = await pool.query(employeeQuery, [id]);
            
            // Combiner les résultats
            const response = {
                ...result.rows[0],
                ...(employeeResult.rows[0] || {})
            };
            
            res.json(response);
        } catch (err) {
            console.error('Error rejecting employee request:', err);
            res.status(500).json({ error: 'Failed to reject employee request', details: err.message });
        }
    });

    // Route pour supprimer toutes les demandes des employés (côté RH)
    // IMPORTANT: Cette route doit être définie AVANT /:id pour éviter les conflits
    router.delete('/all', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Récupérer toutes les demandes avant suppression
            const getAllRequestsQuery = `
                SELECT er.*, e.nom_prenom, e.matricule
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
            `;
            const allRequestsResult = await client.query(getAllRequestsQuery);
            const allRequests = allRequestsResult.rows;
            
            // Récupérer l'utilisateur qui effectue la suppression
            const userEmail = req.headers['x-user-email'] || req.user?.email || 'system';
            const userId = req.headers['x-user-id'] || req.user?.id?.toString() || 'system';
            const userType = req.headers['x-user-type'] || req.user?.role || 'rh';
            const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            
            // Enregistrer dans audit_logs pour chaque demande supprimée
            for (const request of allRequests) {
                const entityName = `Demande employé - ${request.nom_prenom || 'Employé inconnu'} (${request.matricule || 'N/A'}) - Type: ${request.request_type || 'N/A'}`;
                
                try {
                    await client.query(`
                        INSERT INTO audit_logs (
                            action_type, entity_type, entity_id, entity_name,
                            user_type, user_id, user_email, description, ip_address, user_agent, status,
                            changes
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    `, [
                        'delete',
                        'employee_request',
                        request.id.toString(),
                        entityName,
                        userType,
                        userId,
                        userEmail,
                        `Demande employé supprimée (suppression en masse): ${entityName}`,
                        ipAddress,
                        userAgent,
                        'success',
                        JSON.stringify({
                            employee_id: request.employee_id,
                            employee_name: request.nom_prenom,
                            matricule: request.matricule,
                            request_type: request.request_type,
                            status: request.status,
                            request_date: request.request_date
                        })
                    ]);
                } catch (auditErr) {
                    console.error(`Erreur audit pour demande ${request.id}:`, auditErr);
                    // Continue même si l'audit échoue pour une demande
                }
            }
            
            // Supprimer toutes les demandes
            const deleteQuery = 'DELETE FROM employee_requests';
            const result = await client.query(deleteQuery);
            
            // Réinitialiser la séquence pour que les prochains IDs commencent à 1
            const resetSequenceQuery = 'ALTER SEQUENCE employee_requests_id_seq RESTART WITH 1';
            await client.query(resetSequenceQuery);
            
            await client.query('COMMIT');
            
            console.log(`✅ Toutes les demandes des employés ont été supprimées (${result.rowCount} lignes) et tracées dans audit_logs`);
            
            res.json({
                success: true,
                message: `Toutes les demandes ont été supprimées avec succès (${result.rowCount} lignes supprimées)`,
                deletedCount: result.rowCount
            });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('❌ Erreur lors de la suppression des demandes:', err);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression des demandes',
                details: err.message
            });
        } finally {
            client.release();
        }
    });

    // Supprimer une demande
    router.delete('/:id', async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;

            // Récupérer les infos de la demande avant suppression
            const requestInfoQuery = `
                SELECT er.*, e.nom_prenom, e.matricule, e.email
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
                WHERE er.id = $1
            `;
            const requestInfoResult = await client.query(requestInfoQuery, [id]);

            if (requestInfoResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Employee request not found' });
            }
            
            const request = requestInfoResult.rows[0];
            const entityName = `Demande employé - ${request.nom_prenom || 'Employé inconnu'} (${request.matricule || 'N/A'}) - Type: ${request.request_type || 'N/A'}`;
            
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
                'employee_request',
                id.toString(),
                entityName,
                userType,
                userId,
                userEmail,
                `Demande employé supprimée: ${entityName}`,
                ipAddress,
                userAgent,
                'success',
                JSON.stringify({
                    employee_id: request.employee_id,
                    employee_name: request.nom_prenom,
                    matricule: request.matricule,
                    request_type: request.request_type,
                    status: request.status,
                    request_date: request.request_date
                })
            ]);

            // Supprimer la demande
            const query = 'DELETE FROM employee_requests WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);
            
            await client.query('COMMIT');
            
            console.log(`✅ Demande employé supprimée (ID: ${id}) et tracée dans audit_logs`);
            res.json({ message: 'Employee request deleted successfully', request: result.rows[0] });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error deleting employee request:', err);
            res.status(500).json({ error: 'Failed to delete employee request', details: err.message });
        } finally {
            client.release();
        }
    });

    // Recherche avec filtres
    router.get('/search/filter', async (req, res) => {
        try {
            const { status, type, employee, startDate, endDate } = req.query;
            
            let conditions = [];
            let params = [];
            let paramIndex = 1;
            
            if (status) {
                conditions.push(`er.status = $${paramIndex}`);
                params.push(status);
                paramIndex++;
            }
            
            if (type) {
                conditions.push(`er.request_type = $${paramIndex}`);
                params.push(type);
                paramIndex++;
            }
            
            if (employee) {
                conditions.push(`e.nom_prenom ILIKE $${paramIndex}`);
                params.push(`%${employee}%`);
                paramIndex++;
            }
            
            if (startDate) {
                conditions.push(`er.request_date >= $${paramIndex}`);
                params.push(startDate);
                paramIndex++;
            }
            
            if (endDate) {
                conditions.push(`er.request_date <= $${paramIndex}`);
                params.push(endDate);
                paramIndex++;
            }
            
            let query = `
                SELECT er.*, e.nom_prenom, e.poste_actuel, e.entity, e.email 
                FROM employee_requests er
                LEFT JOIN employees e ON er.employee_id = e.id
            `;
            
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            
            query += ` ORDER BY er.request_date DESC`;
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error('Error searching employee requests:', err);
            res.status(500).json({ error: 'Failed to search employee requests', details: err.message });
        }
    });

    // Obtenir des statistiques sur les demandes
    router.get('/stats/overview', async (req, res) => {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
                    COUNT(CASE WHEN request_type = 'leave' THEN 1 END) as leaves,
                    COUNT(CASE WHEN request_type = 'absence' THEN 1 END) as absences,
                    COUNT(CASE WHEN request_type = 'document' THEN 1 END) as documents
                FROM employee_requests
            `;
            
            const result = await pool.query(query);
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Error fetching employee request statistics:', err);
            res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
        }
    });


    return router;
};