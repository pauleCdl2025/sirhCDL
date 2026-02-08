import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import MedicalAuthService from '../../services/medicalAuthService';

const PrivateRoute = ({ children, medicalAuth = false }) => {
    // Vérifier l'authentification
    const isAuthenticated = medicalAuth 
        ? MedicalAuthService.isMedecinAuthenticated()
        : AuthService.isAdminAuthenticated();

    // Rediriger vers la page de connexion appropriée si non authentifié
    if (!isAuthenticated) {
        return <Navigate 
            to={medicalAuth ? '/medical-login' : '/login'} 
            replace 
        />;
    }

    // Rendre les enfants si authentifié
    return children;
};

export default PrivateRoute;