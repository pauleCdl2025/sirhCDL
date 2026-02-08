import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../styles/ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token manquant dans l\'URL');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/password-reset/verify-token/${token}`);
        const data = await response.json();

        if (data.valid) {
          setTokenValid(true);
          setUserInfo(data);
        } else {
          setError(data.message || 'Token invalide ou expiré');
        }
      } catch (err) {
        console.error('Erreur vérification token:', err);
        setError('Erreur de connexion. Veuillez réessayer.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="reset-password-loading">
              <div className="reset-password-spinner"></div>
              <p>Vérification du lien de réinitialisation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="reset-password-success">
              <div className="success-icon-large">
                <i className="fas fa-check-circle"></i>
              </div>
              <h2>Mot de passe réinitialisé !</h2>
              <p>Votre mot de passe a été mis à jour avec succès.</p>
              <p className="reset-password-redirect">
                Redirection vers la page de connexion dans quelques secondes...
              </p>
              <button
                className="reset-password-btn-primary"
                onClick={() => navigate('/login')}
              >
                Aller à la page de connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="reset-password-error-state">
              <div className="error-icon-large">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Lien invalide ou expiré</h2>
              <p>{error || 'Ce lien de réinitialisation n\'est plus valide.'}</p>
              <p className="reset-password-help">
                Les liens de réinitialisation expirent après 1 heure.
                Veuillez demander un nouveau lien.
              </p>
              <button
                className="reset-password-btn-primary"
                onClick={() => navigate('/login')}
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1>Réinitialiser votre mot de passe</h1>
            <p>Entrez votre nouveau mot de passe ci-dessous</p>
          </div>

          {error && (
            <div className="reset-password-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="reset-password-form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <div className="reset-password-input-group">
                <i className="fas fa-lock"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
                <i
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} reset-password-toggle`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <small className="reset-password-hint">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
              </small>
            </div>

            <div className="reset-password-form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div className="reset-password-input-group">
                <i className="fas fa-lock"></i>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  disabled={isLoading}
                />
                <i
                  className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} reset-password-toggle`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                ></i>
              </div>
            </div>

            <button
              type="submit"
              className="reset-password-btn-primary reset-password-btn-block"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <span className="reset-password-spinner"></span>
                  Réinitialisation en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-key me-2"></i>
                  Réinitialiser le mot de passe
                </>
              )}
            </button>
          </form>

          <div className="reset-password-footer">
            <a href="/login">
              <i className="fas fa-arrow-left me-2"></i>
              Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


