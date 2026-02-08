import React, { useState } from 'react';
import TopNav from './TopNav';
import MessageBox from './MessageBox';
import UserDropdown from './UserDropdown';
import NotificationsDropdown from './NotificationsDropdown';

const TopNavTest = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Mock user data for testing
  const mockUser = {
    name: 'Jean Dupont',
    email: 'jean.dupont@centre-diagnostic.com',
    role: 'admin',
    poste: 'Responsable RH'
  };

  const toggleSidebar = () => {
    console.log('Toggle sidebar clicked');
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMessageBox = () => {
    console.log('Toggle message box clicked');
    setShowMessageBox(!showMessageBox);
    setShowUserDropdown(false);
    setShowNotificationsDropdown(false);
  };

  const toggleUserDropdown = () => {
    console.log('Toggle user dropdown clicked');
    setShowUserDropdown(!showUserDropdown);
    setShowMessageBox(false);
    setShowNotificationsDropdown(false);
  };

  const toggleNotificationsDropdown = () => {
    console.log('Toggle notifications dropdown clicked');
    setShowNotificationsDropdown(!showNotificationsDropdown);
    setShowMessageBox(false);
    setShowUserDropdown(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>Test de la TopNav</h1>
      <p>Ce composant teste le bon fonctionnement de la barre de navigation supérieure.</p>
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        backgroundColor: 'white',
        marginBottom: '20px'
      }}>
        <TopNav 
          toggleSidebar={toggleSidebar}
          toggleMessageBox={toggleMessageBox}
          toggleUserDropdown={toggleUserDropdown}
          toggleNotificationsDropdown={toggleNotificationsDropdown}
          user={mockUser}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>État des composants :</h3>
        <ul>
          <li>Sidebar collapsed: {sidebarCollapsed ? 'Oui' : 'Non'}</li>
          <li>Message box visible: {showMessageBox ? 'Oui' : 'Non'}</li>
          <li>User dropdown visible: {showUserDropdown ? 'Oui' : 'Non'}</li>
          <li>Notifications dropdown visible: {showNotificationsDropdown ? 'Oui' : 'Non'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Actions de test :</h3>
        <button 
          onClick={toggleSidebar}
          style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Toggle Sidebar
        </button>
        <button 
          onClick={toggleMessageBox}
          style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Toggle Message Box
        </button>
        <button 
          onClick={toggleUserDropdown}
          style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px' }}
        >
          Toggle User Dropdown
        </button>
        <button 
          onClick={toggleNotificationsDropdown}
          style={{ margin: '5px', padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Toggle Notifications
        </button>
      </div>

      {/* Dropdowns de test */}
      {showMessageBox && (
        <div style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h4>Message Box de test</h4>
          <p>Ceci est une boîte de message de test pour vérifier le bon fonctionnement.</p>
          <button onClick={() => setShowMessageBox(false)}>Fermer</button>
        </div>
      )}

      {showUserDropdown && (
        <div style={{ 
          position: 'fixed', 
          top: '100px', 
          right: '20px', 
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          minWidth: '250px'
        }}>
          <h4>User Dropdown de test</h4>
          <p>Utilisateur: {mockUser.name}</p>
          <p>Email: {mockUser.email}</p>
          <p>Rôle: {mockUser.role}</p>
          <button onClick={() => setShowUserDropdown(false)}>Fermer</button>
        </div>
      )}

      {showNotificationsDropdown && (
        <div style={{ 
          position: 'fixed', 
          top: '100px', 
          right: '75px', 
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          minWidth: '300px'
        }}>
          <h4>Notifications de test</h4>
          <ul>
            <li>Nouvelle demande de congé</li>
            <li>Rapport mensuel généré</li>
            <li>Mise à jour du système</li>
          </ul>
          <button onClick={() => setShowNotificationsDropdown(false)}>Fermer</button>
        </div>
      )}

      {/* Overlay */}
      {(showMessageBox || showUserDropdown || showNotificationsDropdown) && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => {
            setShowMessageBox(false);
            setShowUserDropdown(false);
            setShowNotificationsDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default TopNavTest;
