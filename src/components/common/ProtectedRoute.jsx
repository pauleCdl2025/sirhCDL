import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ 
  children, 
  isAuthenticated, 
  redirectTo, 
  userType = 'admin',
  fallbackComponent = null 
}) => {
  // Si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion appropriée
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Redirection par défaut selon le type d'utilisateur
    switch (userType) {
      case 'employee':
        return <Navigate to="/employee-login" replace />;
      case 'medical':
        return <Navigate to="/medical-login" replace />;
      case 'admin':
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Si l'utilisateur est authentifié, afficher le composant protégé
  return children || fallbackComponent;
};

export default ProtectedRoute;








