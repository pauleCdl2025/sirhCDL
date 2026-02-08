/**
 * Service d'authentification dédié aux administrateurs
 * Identifiants uniques et séparés des utilisateurs RH et employés
 */

class AdminAuthService {
  /**
   * Identifiants administrateur uniques
   * Ces identifiants sont différents de ceux des utilisateurs RH et employés
   */
  static ADMIN_CREDENTIALS = {
    'admin@system.ga': 'Admin@System2025!',
    'administrateur@centrediagnostic.ga': 'Admin@CDL2025!',
    'superadmin@centrediagnostic.ga': 'SuperAdmin@2025!'
  };

  /**
   * Authentifie un administrateur
   * @param {string} email - Email de l'administrateur
   * @param {string} password - Mot de passe
   * @returns {Promise<{success: boolean, admin?: object, error?: string, token?: string}>}
   */
  async login(email, password) {
    try {
      console.log('🔐 AdminAuthService.login appelé', { email, passwordLength: password?.length });
      
      // Normaliser l'email
      const normalizedEmail = email.trim().toLowerCase();
      console.log('📧 Email normalisé:', normalizedEmail);
      console.log('🔑 Mot de passe reçu:', password);
      console.log('🔑 Mot de passe attendu:', AdminAuthService.ADMIN_CREDENTIALS[normalizedEmail]);
      
      // Vérifier les identifiants admin
      const expectedPassword = AdminAuthService.ADMIN_CREDENTIALS[normalizedEmail];
      console.log('🔍 Comparaison:', { 
        received: password, 
        expected: expectedPassword, 
        match: expectedPassword === password 
      });
      
      if (expectedPassword === password) {
        console.log('✅ Identifiants admin valides');
        
        // Créer l'objet admin
        const adminData = {
          id: `admin_${normalizedEmail}`,
          email: normalizedEmail,
          name: 'Administrateur Système',
          role: 'super_admin',
          nom: 'Administrateur',
          prenom: 'Système',
          poste: 'Administrateur Principal',
          fonction: 'Gestionnaire Système',
          isAdmin: true,
          isSuperAdmin: true,
          permissions: [
            'manage_users',
            'manage_employees',
            'manage_rh',
            'view_all_data',
            'system_config',
            'backup_restore',
            'audit_logs'
          ]
        };

        return {
          success: true,
          admin: adminData,
          token: `admin_token_${Date.now()}`
        };
      }

      // Si les identifiants ne correspondent pas, essayer l'API backend
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: password
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            return {
              success: true,
              admin: data.admin,
              token: data.token
            };
          }
        }

        return {
          success: false,
          error: 'Identifiants administrateur incorrects'
        };
      } catch (apiError) {
        console.error('Erreur API admin:', apiError);
        return {
          success: false,
          error: 'Erreur de connexion au serveur'
        };
      }
    } catch (error) {
      console.error('Erreur AdminAuthService.login:', error);
      return {
        success: false,
        error: 'Une erreur est survenue lors de la connexion'
      };
    }
  }

  /**
   * Vérifie si un email est un email administrateur valide
   * @param {string} email 
   * @returns {boolean}
   */
  isAdminEmail(email) {
    if (!email || !email.includes('@')) return false;
    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = normalizedEmail in AdminAuthService.ADMIN_CREDENTIALS;
    console.log('🔍 Vérification email admin:', { email: normalizedEmail, isAdmin });
    return isAdmin;
  }

  /**
   * Déconnexion de l'administrateur
   */
  logout() {
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('rememberedAdmin');
  }

  /**
   * Récupère l'administrateur actuellement connecté
   * @returns {object|null}
   */
  getCurrentAdmin() {
    const adminData = sessionStorage.getItem('adminUser');
    if (adminData) {
      try {
        return JSON.parse(adminData);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Vérifie si un administrateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getCurrentAdmin();
  }
}

// Exporter une instance unique
const adminAuthService = new AdminAuthService();
export default adminAuthService;

