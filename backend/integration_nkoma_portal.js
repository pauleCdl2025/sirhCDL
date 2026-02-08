const { Pool } = require('pg');
const AutoNotificationService = require('./services/autoNotificationService');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rh_portal',
  password: 'Cdl202407',
  port: 5432
});

class NKOMAPortalIntegration {
  constructor() {
    this.autoNotificationService = new AutoNotificationService(pool);
    this.isMonitoring = false;
  }

  // Démarrer la surveillance des nouvelles demandes
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Surveillance déjà active');
      return;
    }

    console.log('🚀 Démarrage de la surveillance des demandes NKOMA...');
    this.isMonitoring = true;

    // Surveiller les nouvelles demandes toutes les 5 secondes
    this.monitoringInterval = setInterval(async () => {
      await this.checkForNewRequests();
    }, 5000);

    console.log('✅ Surveillance active - Vérification toutes les 5 secondes');
  }

  // Arrêter la surveillance
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Surveillance arrêtée');
  }

  // Vérifier les nouvelles demandes
  async checkForNewRequests() {
    try {
      // Récupérer les demandes créées dans les dernières 10 secondes
      const query = `
        SELECT er.*, e.nom_prenom, e.poste_actuel, e.entity, e.email
        FROM employee_requests er
        LEFT JOIN employees e ON er.employee_id = e.id
        WHERE er.request_date > NOW() - INTERVAL '10 seconds'
        AND er.status = 'pending'
        ORDER BY er.request_date DESC
      `;

      const result = await pool.query(query);
      const newRequests = result.rows;

      if (newRequests.length > 0) {
        console.log(`🔔 ${newRequests.length} nouvelle(s) demande(s) détectée(s)`);
        
        for (const request of newRequests) {
          await this.processNewRequest(request);
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des demandes:', error);
    }
  }

  // Traiter une nouvelle demande
  async processNewRequest(request) {
    try {
      console.log(`📝 Traitement de la demande ${request.id} - ${request.nom_prenom}`);
      
      // Créer les notifications automatiques
      const notifications = await this.autoNotificationService.createRequestNotification({
        request_id: request.id,
        employee_id: request.employee_id,
        request_type: request.request_type,
        title: `${request.request_type}: ${request.nom_prenom}`,
        description: request.reason || request.request_details,
        priority: this.getPriorityForRequestType(request.request_type)
      });

      console.log(`✅ ${notifications.length} notifications créées pour ${request.nom_prenom}`);

      // Log détaillé
      console.log('📊 Détails de la demande:', {
        id: request.id,
        employee: request.nom_prenom,
        type: request.request_type,
        status: request.status,
        date: request.request_date
      });

    } catch (error) {
      console.error(`❌ Erreur lors du traitement de la demande ${request.id}:`, error);
    }
  }

  // Déterminer la priorité selon le type de demande
  getPriorityForRequestType(requestType) {
    const priorities = {
      'leave_request': 'high',
      'conge': 'high',
      'absence': 'normal',
      'contract_renewal': 'urgent',
      'document_request': 'normal'
    };
    return priorities[requestType] || 'normal';
  }

  // Vérifier les demandes en attente
  async checkPendingRequests() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM employee_requests
        WHERE status = 'pending'
      `;
      
      const result = await pool.query(query);
      const pendingCount = parseInt(result.rows[0].count);
      
      console.log(`📋 ${pendingCount} demande(s) en attente`);
      return pendingCount;

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des demandes en attente:', error);
      return 0;
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const stats = await Promise.all([
        pool.query("SELECT COUNT(*) as count FROM employee_requests WHERE status = 'pending'"),
        pool.query("SELECT COUNT(*) as count FROM employee_requests WHERE status = 'approved'"),
        pool.query("SELECT COUNT(*) as count FROM employee_requests WHERE status = 'rejected'"),
        pool.query("SELECT COUNT(*) as count FROM real_time_notifications"),
        pool.query("SELECT COUNT(*) as count FROM employees")
      ]);

      return {
        pendingRequests: parseInt(stats[0].rows[0].count),
        approvedRequests: parseInt(stats[1].rows[0].count),
        rejectedRequests: parseInt(stats[2].rows[0].count),
        totalNotifications: parseInt(stats[3].rows[0].count),
        totalEmployees: parseInt(stats[4].rows[0].count)
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
}

// Interface de ligne de commande
async function main() {
  const integration = new NKOMAPortalIntegration();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      console.log('🚀 Démarrage de l\'intégration NKOMA Portal...');
      await integration.startMonitoring();
      
      // Afficher les statistiques initiales
      const stats = await integration.getStats();
      if (stats) {
        console.log('\n📊 Statistiques initiales:');
        console.log(`   • Demandes en attente: ${stats.pendingRequests}`);
        console.log(`   • Demandes approuvées: ${stats.approvedRequests}`);
        console.log(`   • Demandes refusées: ${stats.rejectedRequests}`);
        console.log(`   • Total notifications: ${stats.totalNotifications}`);
        console.log(`   • Total employés: ${stats.totalEmployees}`);
      }
      
      console.log('\n🎯 Surveillance active - Les notifications seront envoyées en temps réel');
      console.log('💡 Appuyez sur Ctrl+C pour arrêter');
      
      // Garder le processus actif
      process.on('SIGINT', () => {
        console.log('\n⏹️ Arrêt de la surveillance...');
        integration.stopMonitoring();
        process.exit(0);
      });
      
      break;

    case 'stats':
      const currentStats = await integration.getStats();
      if (currentStats) {
        console.log('📊 Statistiques actuelles:');
        console.log(`   • Demandes en attente: ${currentStats.pendingRequests}`);
        console.log(`   • Demandes approuvées: ${currentStats.approvedRequests}`);
        console.log(`   • Demandes refusées: ${currentStats.rejectedRequests}`);
        console.log(`   • Total notifications: ${currentStats.totalNotifications}`);
        console.log(`   • Total employés: ${currentStats.totalEmployees}`);
      }
      break;

    case 'check':
      await integration.checkPendingRequests();
      break;

    default:
      console.log('🚀 Intégration NKOMA Portal - Notifications Temps Réel');
      console.log('\n📋 Commandes disponibles:');
      console.log('  node integration_nkoma_portal.js start  - Démarrer la surveillance');
      console.log('  node integration_nkoma_portal.js stats  - Afficher les statistiques');
      console.log('  node integration_nkoma_portal.js check  - Vérifier les demandes en attente');
      console.log('\n💡 Cette intégration surveille les nouvelles demandes et envoie des notifications automatiques');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NKOMAPortalIntegration;







