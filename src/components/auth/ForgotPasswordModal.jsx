import React, { useState } from 'react';
import '../../styles/ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, userType, identifier }) => {
  const [emailOrMatricule, setEmailOrMatricule] = useState(identifier || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: emailOrMatricule.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(data.message || 'Email de réinitialisation envoyé avec succès');
        if (data.warning) {
          setError(data.warning);
        }
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

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={onClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forgot-password-header">
          <h2>Mot de passe oublié ?</h2>
          <button className="forgot-password-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="forgot-password-body">
          {success ? (
            <div className="forgot-password-success">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Email envoyé !</h3>
              <p>{message}</p>
              {error && (
                <div className="forgot-password-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}
              <p className="forgot-password-instructions">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
                Le lien expire dans 1 heure.
              </p>
              <button className="forgot-password-btn-primary" onClick={onClose}>
                Fermer
              </button>
            </div>
          ) : (
            <>
              <p className="forgot-password-description">
                Entrez votre {userType === 'rh' ? 'adresse email' : userType === 'employee' ? 'matricule' : 'email ou matricule'} 
                et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && (
                <div className="forgot-password-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="forgot-password-form-group">
                  <label htmlFor="identifier">
                    {userType === 'rh' ? 'Adresse email' : userType === 'employee' ? 'Matricule' : 'Email ou Matricule'}
                  </label>
                  <div className="forgot-password-input-group">
                    <i className={`fas ${userType === 'rh' ? 'fa-envelope' : userType === 'employee' ? 'fa-id-card' : 'fa-user'}`}></i>
                    <input
                      type="text"
                      id="identifier"
                      value={emailOrMatricule}
                      onChange={(e) => setEmailOrMatricule(e.target.value)}
                      placeholder={userType === 'rh' ? 'votre@email.com' : userType === 'employee' ? 'CDL-2024-0001' : 'Email ou Matricule'}
                      required
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="forgot-password-actions">
                  <button
                    type="button"
                    className="forgot-password-btn-secondary"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="forgot-password-btn-primary"
                    disabled={isLoading || !emailOrMatricule.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="forgot-password-spinner"></span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Envoyer le lien
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;


