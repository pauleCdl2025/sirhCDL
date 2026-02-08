import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from session storage)
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Une erreur est survenue lors de la vérification de l\'authentification');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        // S'assurer que l'utilisateur a un ID
        const userData = result.user;
        if (!userData.id) {
          userData.id = userData.email || email;
        }
        
        // Store user data in state and session storage
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Erreur de connexion');
      return { success: false, error: err.message || 'Identifiants incorrects' };
    } finally {
      setLoading(false);
    }
  };

  // Set user directly (for unified login)
  const setUserDirectly = (userData) => {
    // S'assurer que l'utilisateur a un ID
    if (userData && !userData.id) {
      userData.id = userData.email || userData.id;
    }
    setUser(userData);
    if (userData) {
      sessionStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.removeItem('user');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setUserDirectly,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;