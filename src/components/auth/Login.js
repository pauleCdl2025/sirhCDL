import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulation d'un appel API pour l'authentification
      setTimeout(async () => {
        // Identifiants de test (à remplacer par votre logique d'API)
        const validCredentials = {
          'rh@centre-diagnostic.com': 'Rh@2025CDL',
          'admin@centrediagnostic.ga': 'Admin@2025CDL',
          'test@test.com': 'test123'
        };
        
        if (validCredentials[credentials.email] === credentials.password) {
          const userData = {
            email: credentials.email,
            name: 'Admin RH',
            role: 'admin',
            nom: 'Admin',
            prenom: 'RH',
            poste: 'Administration',
            fonction: 'Administrateur RH'
          };
          
          // Utiliser le contexte d'authentification
          const result = await login(credentials.email, credentials.password);
          if (result.success) {
            navigate('/dashboard');
          } else {
            setError(result.error || 'Erreur de connexion');
          }
        } else {
          setError('Identifiants incorrects. Veuillez réessayer.');
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="text-center mb-4">
            <img 
              src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1723636014/Centre_Diagnostic_logo_coucleur_ie6ywu.png" 
              alt="Centre Diagnostic Logo" 
              className="login-logo" 
            />
            <h1 className="login-title">Bienvenue !</h1>
            <p className="login-subtitle">Connectez-vous à votre espace administrateur</p>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-circle me-2"></i> 
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="email" className="form-label">Adresse email</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-envelope"></i></span>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email"
                  name="email"
                  placeholder="Votre adresse email" 
                  value={credentials.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group mb-4">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-lock"></i></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  id="password"
                  name="password"
                  placeholder="Votre mot de passe" 
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>
          
         
        </div>
      </div>
    </div>
  );
};

export default Login;