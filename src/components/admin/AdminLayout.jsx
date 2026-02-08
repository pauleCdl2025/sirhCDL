import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AdminLayout.css';
import { 
  FaUserShield, 
  FaBars, 
  FaTimes, 
  FaSignOutAlt,
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaExclamationTriangle,
  FaCog,
  FaHome,
  FaHistory,
  FaShieldAlt,
  FaTrash
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  React.useEffect(() => {
    // Récupérer les données admin depuis sessionStorage
    const storedAdmin = sessionStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('token');
    navigate('/admin-login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FaHome />,
      path: '/admin-portal',
      exact: true
    },
    {
      title: 'Gestion Utilisateurs',
      icon: <FaUsers />,
      path: '/admin-portal/users'
    },
    {
      title: 'Historique Connexions',
      icon: <FaHistory />,
      path: '/admin-portal/login-history'
    },
    {
      title: 'Journal d\'Audit',
      icon: <FaShieldAlt />,
      path: '/admin-portal/audit-trail'
    },
    {
      title: 'Suppressions',
      icon: <FaTrash />,
      path: '/admin-portal/deletions'
    },
    {
      title: 'Gestion Employés',
      icon: <FaUserTie />,
      path: '/admin-portal/employees'
    },
    {
      title: 'Statistiques',
      icon: <FaChartBar />,
      path: '/admin-portal/stats'
    },
    {
      title: 'Alertes',
      icon: <FaExclamationTriangle />,
      path: '/admin-portal/alerts'
    },
    {
      title: 'Paramètres',
      icon: <FaCog />,
      path: '/admin-portal/settings'
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <img 
              src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1723636014/Centre_Diagnostic_logo_coucleur_ie6ywu.png" 
              alt="Centre Diagnostic Logo" 
              style={{ width: '32px', height: '32px', marginRight: sidebarOpen ? '10px' : '0' }}
            />
            {sidebarOpen && <span>Admin Portal</span>}
          </div>
          <button
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="admin-nav-text">{item.title}</span>}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {sidebarOpen && adminUser && (
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                <FaUserShield />
              </div>
              <div className="admin-user-details">
                <div className="admin-user-name">{adminUser.email}</div>
                <div className="admin-user-role">Administrateur</div>
              </div>
            </div>
          )}
          <button
            className="admin-logout-button"
            onClick={handleLogout}
            title="Déconnexion"
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars />
            </button>
            <h1 className="admin-page-title">
              {menuItems.find(item => isActive(item.path, item.exact))?.title || 'Dashboard Admin'}
            </h1>
          </div>
          <div className="admin-topbar-right">
            {adminUser && (
              <div className="admin-topbar-user">
                <span className="admin-topbar-email">{adminUser.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

