import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardAdmin from '../dashboard/DashboardAdmin';
import AdminUsersManagement from './AdminUsersManagement';
import AdminLoginHistory from './AdminLoginHistory';
import AdminAuditTrail from './AdminAuditTrail';
import AdminEmployeesManagement from './AdminEmployeesManagement';
import AdminSettings from './AdminSettings';
import AdminStatistics from './AdminStatistics';
import AdminAlerts from './AdminAlerts';
import AdminDeletedItems from './AdminDeletedItems';

const AdminPortalRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = () => {
      const adminUser = sessionStorage.getItem('adminUser');
      const authenticated = !!adminUser;
      console.log('🔐 AdminPortalRoute - Vérification auth:', authenticated ? 'authentifié' : 'non authentifié');
      setIsAuthenticated(authenticated);
      setIsChecking(false);
    };

    // Vérifier immédiatement
    checkAuth();

    // Vérifier périodiquement pour détecter les changements
    const interval = setInterval(checkAuth, 500);

    // Écouter les événements de stockage
    const handleStorageChange = (e) => {
      if (e.key === 'adminUser') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Vérification de l'authentification...</div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    console.log('❌ AdminPortalRoute - Non authentifié, redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  // Afficher le portail admin si authentifié
  console.log('✅ AdminPortalRoute - Authentifié, affichage du portail');
  return (
    <AdminLayout>
      <Routes>
        <Route path="" element={<DashboardAdmin />} />
        <Route path="users" element={<AdminUsersManagement />} />
        <Route path="employees" element={<AdminEmployeesManagement />} />
        <Route path="login-history" element={<AdminLoginHistory />} />
        <Route path="audit-trail" element={<AdminAuditTrail />} />
        <Route path="stats" element={<AdminStatistics />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="deletions" element={<AdminDeletedItems />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPortalRoute;

