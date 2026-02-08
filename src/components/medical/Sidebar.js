import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ activeRoute }) => {
    const location = useLocation();

    const menuItems = [
        {
            title: 'Mon Dossier',
            icon: 'fas fa-user-md',
            path: '/medical-file-tracking'
        },
        {
            title: 'Mes Documents',
            icon: 'fas fa-file-upload',
            path: '/medical-documents'
        },
        {
            title: 'Guide des Procédures',
            icon: 'fas fa-question-circle',
            path: '/medical-procedures-guide'
        },
        {
            title: 'Accès RH',
            icon: 'fas fa-shield-alt',
            path: '/medical-hr-access'
        }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <img 
                    src="https://res.cloudinary.com/dd64mwkl2/image/upload/v1723636014/Centre_Diagnostic_logo_coucleur_ie6ywu.png" 
                    alt="Centre Diagnostic Logo" 
                />
            </div>
            
            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {menuItems.map((item, index) => (
                        <li 
                            key={index} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <Link to={item.path} className="nav-link">
                                <div className="nav-icon">
                                    <i className={item.icon}></i>
                                </div>
                                <span className="nav-text">{item.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;