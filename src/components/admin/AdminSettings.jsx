import React, { useState, useEffect } from 'react';
import '../../styles/AdminSettings.css';
import { 
  FaCog, FaSave, FaBell, FaLock, FaServer
} from 'react-icons/fa';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Centre Diagnostic',
      siteEmail: 'contact@centrediagnostic.ga',
      maintenanceMode: false,
      allowRegistrations: true
    },
    security: {
      passwordMinLength: 8,
      requireStrongPassword: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enable2FA: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      notifyOnLogin: true,
      notifyOnPasswordReset: true,
      notifyOnEmployeeCreate: true,
      notifyOnEmployeeDelete: true
    },
    system: {
      backupFrequency: 'daily',
      autoBackup: true,
      logRetentionDays: 90,
      enableAuditLog: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // TODO: Charger depuis l'API quand elle sera disponible
      // const response = await api.get('/api/admin/settings');
      // setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      // TODO: Sauvegarder via l'API
      // await api.put('/api/admin/settings', settings);
      
      // Simulation
      setTimeout(() => {
        setSaveStatus('success');
        setLoading(false);
        setTimeout(() => setSaveStatus(null), 3000);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <h1>
          <FaCog /> Paramètres Administrateur
        </h1>
        <button 
          className={`btn-primary ${saveStatus === 'success' ? 'success' : ''}`}
          onClick={handleSave}
          disabled={loading}
        >
          <FaSave /> {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>

      {saveStatus === 'success' && (
        <div className="alert alert-success">
          ✅ Paramètres enregistrés avec succès !
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="alert alert-error">
          ❌ Erreur lors de l'enregistrement
        </div>
      )}

      <div className="settings-container">
        {/* Général */}
        <div className="settings-section">
          <div className="section-header">
            <FaCog className="section-icon" />
            <h2>Paramètres Généraux</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Nom du site</label>
              <input
                type="text"
                value={settings.general.siteName}
                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Email du site</label>
              <input
                type="email"
                value={settings.general.siteEmail}
                onChange={(e) => updateSetting('general', 'siteEmail', e.target.value)}
              />
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                />
                Mode maintenance
              </label>
              <small>Le site sera inaccessible aux utilisateurs non-admin</small>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.general.allowRegistrations}
                  onChange={(e) => updateSetting('general', 'allowRegistrations', e.target.checked)}
                />
                Autoriser les inscriptions
              </label>
              <small>Permet aux nouveaux utilisateurs de s'inscrire</small>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="settings-section">
          <div className="section-header">
            <FaLock className="section-icon" />
            <h2>Sécurité</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Longueur minimale du mot de passe</label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
              />
            </div>
            <div className="setting-item">
              <label>Timeout de session (minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div className="setting-item">
              <label>Nombre max de tentatives de connexion</label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
              />
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.security.requireStrongPassword}
                  onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                />
                Exiger un mot de passe fort
              </label>
              <small>Majuscules, minuscules, chiffres et caractères spéciaux</small>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.security.enable2FA}
                  onChange={(e) => updateSetting('security', 'enable2FA', e.target.checked)}
                />
                Activer l'authentification à deux facteurs (2FA)
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <FaBell className="section-icon" />
            <h2>Notifications</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                />
                Notifications par email
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                />
                Notifications par SMS
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnLogin}
                  onChange={(e) => updateSetting('notifications', 'notifyOnLogin', e.target.checked)}
                />
                Notifier lors des connexions
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnPasswordReset}
                  onChange={(e) => updateSetting('notifications', 'notifyOnPasswordReset', e.target.checked)}
                />
                Notifier lors des réinitialisations de mot de passe
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnEmployeeCreate}
                  onChange={(e) => updateSetting('notifications', 'notifyOnEmployeeCreate', e.target.checked)}
                />
                Notifier lors de la création d'employé
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnEmployeeDelete}
                  onChange={(e) => updateSetting('notifications', 'notifyOnEmployeeDelete', e.target.checked)}
                />
                Notifier lors de la suppression d'employé
              </label>
            </div>
          </div>
        </div>

        {/* Système */}
        <div className="settings-section">
          <div className="section-header">
            <FaServer className="section-icon" />
            <h2>Paramètres Système</h2>
          </div>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Fréquence de sauvegarde</label>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
              >
                <option value="hourly">Chaque heure</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Rétention des logs (jours)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.system.logRetentionDays}
                onChange={(e) => updateSetting('system', 'logRetentionDays', parseInt(e.target.value))}
              />
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.system.autoBackup}
                  onChange={(e) => updateSetting('system', 'autoBackup', e.target.checked)}
                />
                Sauvegarde automatique
              </label>
            </div>
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.system.enableAuditLog}
                  onChange={(e) => updateSetting('system', 'enableAuditLog', e.target.checked)}
                />
                Activer le journal d'audit
              </label>
              <small>Enregistre toutes les actions importantes</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

