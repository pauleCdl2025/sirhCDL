import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importations des composants
import UnifiedLogin from './components/auth/UnifiedLogin';
import MedicalLogin from './components/medical/MedicalLogin';
import Dashboard from './components/dashboard/Dashboard';
import NewEmployee from './components/employees/NewEmployee';
import EmployeeList from './components/employees/EmployeeList';
import EmployeeDetail from './components/employees/EmployeeDetail';
import LeaveManagement from './components/leaves/LeaveManagement';
import Sanctions from './components/hr/Sanctions';
import AbsenceManagement from './components/leaves/AbsenceManagement';
import ContractManagement from './components/contracts/ContractManagement';
import ContratPDFManager from './components/contracts/ContratPDFManager';
import RecruitmentHistory from './components/recruitment/RecruitmentHistory';
import DepartureHistory from './components/employees/DepartureHistory';
import PerformanceManagement from './components/performance/PerformanceManagement';
import ServiceNotes from './components/notes/ServiceNotes';
import EmployeeRequests from './components/requests/EmployeeRequests';
import MedicalVisits from './components/medical/MedicalVisits';
import ProcedureTracking from './components/recruitment/ProcedureTracking';
import Layout from './components/layout/Layout';
import ContractAlerts from './components/employees/ContractAlerts';
import EmployeePortal from './components/employees/EmployeePortal'; 
import MedicalFileTracking from './components/medical/MedicalFileTracking';
import EventManagement from './components/event/EventManagement';
import EditEmployee from './components/employees/EditEmployee';
import Onboarding from './components/onboarding/Onboarding';
import Offboarding from './components/onboarding/Offboarding';
import InterviewManagement from './components/hr/InterviewManagement';
import TaskManagement from './components/hr/TaskManagement';
import MedicalAccess from './components/medical/MedicalAccess';
import ChartsPage from './components/dashboard/ChartsPage';
import DashboardAdmin from './components/dashboard/DashboardAdmin';
import AdminPortalRoute from './components/admin/AdminPortalRoute';

// Composant principal avec authentification
function AppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isEmployeeAuthenticated, setIsEmployeeAuthenticated] = useState(false);
  const [isMedicalAuthenticated, setIsMedicalAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check admin authentication
    const storedAdminUser = sessionStorage.getItem('adminUser');
    if (storedAdminUser) {
      setIsAdminAuthenticated(true);
    }

    // Check employee authentication
    const storedEmployeeUser = sessionStorage.getItem('employeeUser');
    if (storedEmployeeUser) {
      setIsEmployeeAuthenticated(true);
    }

    // Check medical authentication
    const storedMedicalUser = sessionStorage.getItem('medecin_user');
    if (storedMedicalUser) {
      setIsMedicalAuthenticated(true);
    }

    // Écouter les changements dans sessionStorage pour mettre à jour l'état
    const handleStorageChange = (e) => {
      if (e.key === 'adminUser') {
        setIsAdminAuthenticated(!!e.newValue);
      } else if (e.key === 'employeeUser') {
        setIsEmployeeAuthenticated(!!e.newValue);
      } else if (e.key === 'medecin_user') {
        setIsMedicalAuthenticated(!!e.newValue);
      }
    };

    // Écouter les événements storage (pour les autres onglets)
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier périodiquement pour détecter les changements dans le même onglet
    const interval = setInterval(() => {
      const currentAdminUser = sessionStorage.getItem('adminUser');
      if (!!currentAdminUser !== isAdminAuthenticated) {
        setIsAdminAuthenticated(!!currentAdminUser);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isAdminAuthenticated]);

  const handleAdminLogout = () => {
    logout();
  };

  const handleEmployeeLogout = () => {
    setIsEmployeeAuthenticated(false);
    sessionStorage.removeItem('employeeUser');
  };

  const handleMedicalLogin = (userData) => {
    setIsMedicalAuthenticated(true);
    sessionStorage.setItem('medecin_user', JSON.stringify(userData));
  };

  return (
    <Routes>
      {/* Admin Login Route - Redirige vers le login unifié */}
      <Route 
        path="/admin-login" 
        element={<Navigate to="/login" replace />} 
      />

      {/* Admin Portal Routes */}
      <Route 
        path="/admin-portal/*" 
        element={<AdminPortalRoute />}
      />

      {/* Home Route - Redirects based on user type */}
      <Route 
        path="/home" 
        element={
          isAdminAuthenticated ? 
          <Navigate to="/admin-portal" replace /> :
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          isEmployeeAuthenticated ? 
          <Navigate to="/EmployeePortal" replace /> :
          isMedicalAuthenticated ? 
          <Navigate to="/medical-file-tracking" replace /> :
          <Navigate to="/login" replace />
        } 
      />

      {/* Unified Login Route (RH + Employees + Admin) */}
      <Route 
        path="/login" 
        element={
          isAdminAuthenticated ? 
          <Navigate to="/admin-portal" replace /> :
          isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          isEmployeeAuthenticated ? 
          <Navigate to="/EmployeePortal" replace /> :
          <UnifiedLogin />
        } 
      />


      {/* Employee Login Route (redirect to unified login) */}
      <Route 
        path="/employee-login" 
        element={<Navigate to="/login" replace />} 
      />

      {/* Medical Login Route */}
      <Route 
        path="/medical-login" 
        element={
          isMedicalAuthenticated ? 
          <Navigate to="/medical-file-tracking" replace /> : 
          <MedicalLogin onLogin={handleMedicalLogin} />
        } 
      />
      
      {/* Protected Admin Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
          <Layout user={user} onLogout={handleAdminLogout} /> : 
          isEmployeeAuthenticated ? 
          <Navigate to="/EmployeePortal" replace /> :
          isMedicalAuthenticated ? 
          <Navigate to="/medical-file-tracking" replace /> :
          <Navigate to="/login" replace />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-employee" element={<NewEmployee />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="leave-management" element={<LeaveManagement />} />
        <Route path="absences" element={<AbsenceManagement />} />
        <Route path="sanctions" element={<Sanctions />} />
        <Route path="contrats" element={<ContractManagement />} />
        <Route path="contrats-pdf" element={<ContratPDFManager />} />
        <Route path="performance-management" element={<PerformanceManagement />} />
        <Route path="service-notes" element={<ServiceNotes />} />
        <Route path="employee-requests" element={<EmployeeRequests />} />
        <Route path="recruitment-history" element={<RecruitmentHistory />} />
        <Route path="departure-history" element={<DepartureHistory />} />
        <Route path="medical-visits" element={<MedicalVisits />} />
        <Route path="procedure-tracking" element={<ProcedureTracking />} />
        <Route path="contract-alerts" element={<ContractAlerts />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="edit-employee/:id" element={<EditEmployee />} />
        <Route path="onboarding" element={<Onboarding />} />
        <Route path="offboarding" element={<Offboarding />} />
                       <Route path="interviews" element={<InterviewManagement />} />
                       <Route path="tasks" element={<TaskManagement />} />
                       <Route path="charts" element={<ChartsPage />} />
                       <Route path="admin-dashboard" element={<DashboardAdmin />} />
                       
                       {/* Routes pour les fonctionnalités de la TopNav */}
                       <Route path="help" element={<div>Page Aide - À implémenter</div>} />
                       <Route path="notifications" element={<div>Page Notifications - À implémenter</div>} />
      </Route>

      {/* Protected Employee Routes */}
      <Route 
        path="/EmployeePortal" 
        element={
          (() => {
            // Vérifier directement dans sessionStorage pour une détection en temps réel
            const employeeUser = sessionStorage.getItem('employeeUser');
            const isAuth = !!employeeUser || isEmployeeAuthenticated;
            
            if (isAuth) {
              return <EmployeePortal onLogout={handleEmployeeLogout} />;
            } else {
              return <Navigate to="/login" replace />;
            }
          })()
        } 
      />

      {/* Protected Medical Routes */}
      <Route 
        path="/medical-file-tracking" 
        element={
          isMedicalAuthenticated ? 
          <MedicalFileTracking /> : 
          <Navigate to="/medical-login" replace />
        } 
      />

      {/* Medical Access Portal (Public Route) */}
      <Route 
        path="/medical-access/:token" 
        element={<MedicalAccess />} 
      />
      
            {/* Default Redirect */}
            <Route 
              path="*" 
              element={
                isAdminAuthenticated ? 
                <Navigate to="/admin-portal" replace /> :
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                isEmployeeAuthenticated ? 
                <Navigate to="/EmployeePortal" replace /> :
                isMedicalAuthenticated ? 
                <Navigate to="/medical-file-tracking" replace /> :
                <Navigate to="/login" replace />
              }
            />
    </Routes>
  );
}

// Composant App principal avec AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;