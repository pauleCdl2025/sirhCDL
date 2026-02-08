import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css';

const MedicalLogin = () => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation basique
        if (!email.trim()) {
            setError('Veuillez saisir votre adresse email');
            return;
        }

        if (!token.trim()) {
            setError('Veuillez saisir votre token d\'accès');
            return;
        }

        try {
            // Simulation de la vérification du token 
            // IMPORTANT : Remplacez par un véritable appel API
            if (email === 'medecin@centre-diagnostic.com' && token === 'TOKEN123') {
                // Stocker les informations de l'utilisateur
                const userData = {
                    id: 'med001',
                    email: email,
                    nom: 'Dupont',
                    prenom: 'Jean',
                    specialite: 'Médecine Générale',
                    telephone: '+241 76 53 16 84',
                    nationalite: 'Gabonaise',
                    universite: 'Université Omar Bongo'
                };

                // Stocker dans sessionStorage
                sessionStorage.setItem('medecin_user', JSON.stringify(userData));

                // Si "Se souvenir de moi" est coché, stocker aussi dans localStorage
                if (rememberMe) {
                    localStorage.setItem('medecin_user', JSON.stringify(userData));
                }
                
                // Rediriger vers le suivi de dossier
                navigate('/medical-file-tracking');
            } else {
                setError('Token ou email incorrect');
            }
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
            console.error(err);
        }
    };

    return (
        <div className="login-container animated fadeInUp">
            <div className="login-header">
                <img 
                    src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1723636014/Centre_Diagnostic_logo_coucleur_ie6ywu.png" 
                    alt="Centre Diagnostic Logo" 
                    className="login-logo" 
                />
                <h2 className="login-title">Espace Médecin</h2>
                <p className="login-subtitle">Connectez-vous à votre suivi de dossier</p>
            </div>
            
            <div className="login-form">
                {error && (
                    <div className="alert alert-danger animated shake">
                        <i className="fas fa-exclamation-circle me-2"></i>{error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} id="loginForm">
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Adresse email</label>
                        <div className="input-group">
                            <i className="fas fa-envelope input-icon"></i>
                            <input 
                                type="email" 
                                id="email" 
                                className="form-control input-with-icon" 
                                placeholder="Votre adresse email professionnelle" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="token" className="form-label">Token d'accès</label>
                        <div className="input-group">
                            <i className="fas fa-key input-icon"></i>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                id="token" 
                                className="form-control input-with-icon" 
                                placeholder="Votre token d'accès" 
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required 
                            />
                            <span 
                                className="password-toggle" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-3">
                        <div className="form-check">
                            <input 
                                type="checkbox" 
                                className="form-check-input" 
                                id="rememberMe" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="rememberMe">
                                Se souvenir de moi
                            </label>
                        </div>
                        <a href="#forgot-token" className="text-primary">Token perdu ?</a>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block">
                        <i className="fas fa-sign-in-alt me-2"></i>Se connecter
                    </button>
                </form>
                
                <div className="divider">ou contactez</div>
                
                <div className="social-login">
                    <a href="tel:+24176531684" className="social-btn">
                        <i className="fas fa-phone me-2" style={{color: '#00A4EF'}}></i>RH
                    </a>
                    <a href="mailto:rh@centre-diagnostic.com" className="social-btn">
                        <i className="fas fa-envelope me-2" style={{color: '#DB4437'}}></i>Email
                    </a>
                </div>
            </div>
            
            <div className="login-footer">
                <p>Besoin d'aide ? <a href="#contact-support">Contactez le support</a></p>
                <p className="mt-2">© 2025 Centre Diagnostic. Tous droits réservés.</p>
            </div>

            {/* Marquee Banner */}
            
        </div>
    );
};

export default MedicalLogin;