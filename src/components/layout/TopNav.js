import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/api';
import UserDropdown from './UserDropdown';
import '../../styles/TopNav.css';

const TopNav = ({ 
  toggleSidebar, 
  user,
  onLogout 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for click outside detection
  const searchRef = useRef(null);
  const userRef = useRef(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search results
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
        setSearchResults([]);
      }

      // Close user dropdown
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const results = await searchService.search(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow clicking on search results
    setTimeout(() => {
      setIsSearchFocused(false);
      setSearchResults([]);
    }, 200);
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    
    // Navigate based on result type
    switch (result.type) {
      case 'employee':
        navigate(`/employees/${result.id}`);
        break;
      case 'contract':
        navigate('/contrats');
        break;
      case 'note':
        navigate('/service-notes');
        break;
      default:
        break;
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'RH';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleUserProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserDropdown(!showUserDropdown);
  };

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Get user display info with fallbacks
  const userName = user?.name || user?.nom || user?.prenom || 'Admin RH';
  const userRole = user?.role || user?.poste || user?.fonction || 'Administration';

  return (
    <div className="top-nav-container">
      <nav className="top-nav">
        <button 
          className="toggle-sidebar" 
          onClick={handleSidebarToggle}
          title="Basculer la barre latérale"
        >
          <i className="fas fa-bars"></i>
        </button>
        
        <div className="top-nav-search" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              className={`search-input ${isSearchFocused ? 'focused' : ''}`}
              placeholder="Rechercher un employé, un contrat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button type="submit" className="search-submit" title="Rechercher">
              <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} search-icon`}></i>
            </button>
          </form>
          
          {/* Search Results Dropdown */}
          {isSearchFocused && (searchResults.length > 0 || isSearching) && (
            <div className="search-results-dropdown">
              {isSearching ? (
                <div className="search-loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Recherche en cours...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="search-results-list">
                  {searchResults.map((result) => (
                    <div 
                      key={result.id}
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="search-result-icon">
                        <i className={`fas ${
                          result.type === 'employee' ? 'fa-user' :
                          result.type === 'contract' ? 'fa-file-signature' :
                          'fa-file-alt'
                        }`}></i>
                      </div>
                      <div className="search-result-content">
                        <div className="search-result-title">{result.name}</div>
                        <div className="search-result-subtitle">
                          {result.email || result.status || result.category || result.department}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() && (
                <div className="search-no-results">
                  <i className="fas fa-search"></i>
                  <span>Aucun résultat trouvé</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="top-nav-actions">
          <div ref={userRef}>
            <div 
              className="user-profile" 
              id="userProfile" 
              onClick={handleUserProfileClick}
              title="Menu utilisateur"
            >
              <div className="user-avatar">
                {getInitials(userName)}
              </div>
              <div className="user-info">
                <div className="user-name">
                  {userName}
                </div>
                <div className="user-title">
                  {userRole}
                </div>
              </div>
              <i className="fas fa-chevron-down user-dropdown-arrow"></i>
            </div>
            
            {showUserDropdown && (
              <UserDropdown 
                user={user}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopNav;