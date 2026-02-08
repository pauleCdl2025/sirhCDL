import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminAuthService from '../../services/adminAuthService';
import '../../styles/AdminLogin.css';
import { FaUserShield, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 handleSubmit appelé', { email, passwordLength: password.length });
    setError('');
    setIsLoading(true);

    // Validation
    if (!email.trim()) {
      console.log('❌ Email vide');
      setError('Veuillez saisir votre email');
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      console.log('❌ Mot de passe vide');
      setError('Veuillez saisir votre mot de passe');
      setIsLoading(false);
      return;
    }

    // Vérifier que c'est bien un email (admin uniquement)
    if (!email.includes('@')) {
      console.log('❌ Email invalide');
      setError('Veuillez utiliser votre email pour vous connecter');
      setIsLoading(false);
      return;
    }

    console.log('✅ Validation passée, tentative de connexion admin...', { email: email.trim() });

    try {
      // Authentification admin uniquement avec le service dédié
      console.log('🔐 Appel de adminAuthService.login...');
      const result = await adminAuthService.login(email.trim(), password);
      console.log('📥 Résultat de login:', result);

      if (result && result.success && result.admin) {
        console.log('✅ Connexion admin réussie');
        
        // Stocker les données admin
        const adminData = {
          ...result.admin,
          id: result.admin.id || `admin_${email.trim()}`,
          email: email.trim(),
          role: 'super_admin',
          isAdmin: true,
          isSuperAdmin: true
        };

        console.log('💾 Données admin à stocker:', adminData);
        sessionStorage.setItem('adminUser', JSON.stringify(adminData));
        sessionStorage.setItem('adminToken', result.token || 'admin-token');
        console.log('✅ Données stockées dans sessionStorage');

        // Se souvenir de l'utilisateur si demandé
        if (rememberMe) {
          localStorage.setItem('rememberedAdmin', email.trim());
        }

        // Rediriger vers le portail admin
        console.log('🔄 Redirection vers /admin-portal...');
        navigate('/admin-portal');
        console.log('✅ navigate appelé');
      } else {
        console.log('❌ Connexion échouée:', result);
        setError(result?.error || 'Identifiants administrateur incorrects');
      }
    } catch (err) {
      console.error('❌ Erreur de connexion admin:', err);
      setError('Une erreur est survenue lors de la connexion: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
      console.log('🏁 handleSubmit terminé');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <FaUserShield />
          </div>
          <h1>Portail Administrateur</h1>
          <p>Accès réservé aux administrateurs</p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="admin-login-form"
          noValidate
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        >
          {error && (
            <div className="admin-login-error">
              <span>{error}</span>
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email administrateur
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" />
              Mot de passe
            </label>
            <div className="admin-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="admin-form-options">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="admin-spinner"></span>
                Connexion...
              </>
            ) : (
              <>
                <FaUserShield />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            Vous n'êtes pas administrateur ?{' '}
            <a href="/login" className="admin-link">
              Accéder au portail RH
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

