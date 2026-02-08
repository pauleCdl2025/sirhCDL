const express = require('express');
const router = express.Router();
const AutoNotificationService = require('../services/autoNotificationService');

module.exports = (pool) => {
    const autoNotificationService = new AutoNotificationService(pool);
  // Get all leave requests
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          l.id, 
          l.employee_id, 
          CONCAT(e.first_name, ' ', e.last_name) as employee_name,
          l.leave_type,
          l.start_date,
          l.end_date,
          l.duration,
          l.reason,
          l.status,
          l.request_date,
          l.approved_by,
          l.approval_date,
          l.rejected_by,
          l.rejection_date,
          l.rejection_reason
        FROM 
          leave_requests l
        JOIN 
          employees e ON l.employee_id = e.id
        ORDER BY 
          l.request_date DESC
      `);
      
      // Transform the data to match frontend expectations
      const leaveRequests = result.rows.map(leave => ({
        id: leave.id,
        employeeId: leave.employee_id,
        employeeName: leave.employee_name,
        leaveType: leave.leave_type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        duration: leave.duration,
        reason: leave.reason,
        status: leave.status,
        requestDate: leave.request_date,
        approvedBy: leave.approved_by,
        approvalDate: leave.approval_date,
        rejectedBy: leave.rejected_by,
        rejectionDate: leave.rejection_date,
        rejectionReason: leave.rejection_reason
      }));
      
      res.json(leaveRequests);
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Get leave requests by employee ID
  router.get('/employee/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      
      const result = await pool.query(`
        SELECT 
          l.id, 
          l.employee_id, 
          CONCAT(e.first_name, ' ', e.last_name) as employee_name,
          l.leave_type,
          l.start_date,
          l.end_date,
          l.duration,
          l.reason,
          l.status,
          l.request_date,
          l.approved_by,
          l.approval_date,
          l.rejected_by,
          l.rejection_date,
          l.rejection_reason
        FROM 
          leave_requests l
        JOIN 
          employees e ON l.employee_id = e.id
        WHERE 
          l.employee_id = $1
        ORDER BY 
          l.request_date DESC
      `, [employeeId]);
      
      // Transform the data to match frontend expectations
      const leaveRequests = result.rows.map(leave => ({
        id: leave.id,
        employeeId: leave.employee_id,
        employeeName: leave.employee_name,
        leaveType: leave.leave_type,
        startDate: leave.start_date,
        endDate: leave.end_date,
        duration: leave.duration,
        reason: leave.reason,
        status: leave.status,
        requestDate: leave.request_date,
        approvedBy: leave.approved_by,
        approvalDate: leave.approval_date,
        rejectedBy: leave.rejected_by,
        rejectionDate: leave.rejection_date,
        rejectionReason: leave.rejection_reason
      }));
      
      res.json(leaveRequests);
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Create new leave request
  router.post('/', async (req, res) => {
    try {
      const { 
        employeeId, 
        leaveType, 
        startDate, 
        endDate, 
        duration, 
        reason 
      } = req.body;
      
      // Calculate duration if not provided (working days between start and end dates)
      let calculatedDuration = duration;
      if (!calculatedDuration) {
        // Here you would normally calculate the working days between startDate and endDate
        // This is a simplified version
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        calculatedDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      
      const result = await pool.query(`
        INSERT INTO leave_requests (
          employee_id, 
          leave_type, 
          start_date, 
          end_date, 
          duration, 
          reason, 
          status, 
          request_date
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
        RETURNING id
      `, [
        employeeId, 
        leaveType, 
        startDate, 
        endDate, 
        calculatedDuration, 
        reason
      ]);
      
      const newLeaveRequest = result.rows[0];

      // Créer des notifications automatiques pour les RH et responsables
      try {
        await autoNotificationService.createRequestNotification({
          request_id: newLeaveRequest.id,
          employee_id: employeeId,
          request_type: 'leave_request',
          title: `Demande de congé - Employé ID ${employeeId}`,
          description: `Demande de congé du ${startDate} au ${endDate}. Type: ${leaveType}. Motif: ${reason}`,
          priority: 'high'
        });
        
        console.log(`📢 Notification automatique créée pour la demande de congé de l'employé ${employeeId}`);
      } catch (notificationError) {
        console.error('❌ Erreur lors de la création de notification automatique:', notificationError);
        // Ne pas faire échouer la création de demande si la notification échoue
      }
      
      res.status(201).json({ 
        id: newLeaveRequest.id,
        message: 'Leave request created successfully' 
      });
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Approve leave request
  router.put('/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { approvedBy } = req.body;
      
      await pool.query(`
        UPDATE leave_requests 
        SET 
          status = 'approved',
          approved_by = $1,
          approval_date = NOW()
        WHERE 
          id = $2
      `, [approvedBy, id]);
      
      res.json({ message: 'Leave request approved successfully' });
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Reject leave request
  router.put('/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const { rejectedBy, rejectionReason } = req.body;
      
      await pool.query(`
        UPDATE leave_requests 
        SET 
          status = 'rejected',
          rejected_by = $1,
          rejection_date = NOW(),
          rejection_reason = $2
        WHERE 
          id = $3
      `, [rejectedBy, rejectionReason, id]);
      
      res.json({ message: 'Leave request rejected successfully' });
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Set leave request status to 'in_progress'
  router.put('/:id/in-progress', async (req, res) => {
    try {
      const { id } = req.params;
      
      await pool.query(`
        UPDATE leave_requests 
        SET 
          status = 'in_progress'
        WHERE 
          id = $1
      `, [id]);
      
      res.json({ message: 'Leave request status updated to in progress' });
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Delete leave request
  router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      
      // Récupérer les infos de la demande avant suppression
      const leaveInfoQuery = `
        SELECT lr.*, e.nom_prenom, e.matricule
        FROM leave_requests lr
        LEFT JOIN employees e ON lr.employee_id = e.id
        WHERE lr.id = $1
      `;
      const leaveInfoResult = await client.query(leaveInfoQuery, [id]);
      
      if (leaveInfoResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      const leaveRequest = leaveInfoResult.rows[0];
      const entityName = `Demande de congé - ${leaveRequest.nom_prenom || 'Employé inconnu'} (${leaveRequest.matricule || 'N/A'})`;
      
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
        'leave_request',
        id.toString(),
        entityName,
        userType,
        userId,
        userEmail,
        `Demande de congé supprimée: ${entityName}`,
        ipAddress,
        userAgent,
        'success',
        JSON.stringify({
          employee_id: leaveRequest.employee_id,
          employee_name: leaveRequest.nom_prenom,
          matricule: leaveRequest.matricule,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
          status: leaveRequest.status,
          leave_type: leaveRequest.leave_type
        })
      ]);
      
      // Supprimer la demande
      await client.query('DELETE FROM leave_requests WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      
      console.log(`✅ Demande de congé supprimée (ID: ${id}) et tracée dans audit_logs`);
      res.json({ message: 'Leave request deleted successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error executing query', err.stack);
      res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
      client.release();
    }
  });

  return router;
};