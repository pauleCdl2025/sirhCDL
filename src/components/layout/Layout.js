import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import '../../styles/Layout.css';

const Layout = ({ user, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Debug: Log user data
  useEffect(() => {
    console.log('Layout - User data:', user);
  }, [user]);

  useEffect(() => {
    // Handle responsive sidebar
    const handleResponsive = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResponsive();
    window.addEventListener('resize', handleResponsive);

    return () => {
      window.removeEventListener('resize', handleResponsive);
    };
  }, []);

  const toggleSidebar = () => {
    console.log('Layout - Toggling sidebar');
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-container">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        currentPath={location.pathname}
      />
      
      <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <TopNav 
          toggleSidebar={toggleSidebar}
          user={user}
          onLogout={onLogout}
        />
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;