import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { visiteMedicaleService } from '../../services/api';
import '../../styles/Tables.css';
import '../../styles/Forms.css';

const MedicalVisits = () => {
  // States
  const [visites, setVisites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisite, setSelectedVisite] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reminderTarget, setReminderTarget] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [search, setSearch] = useState('');
  const [poste, setPoste] = useState('');
  const [periode, setPeriode] = useState('');
  const [statut, setStatut] = useState('');
  const [postes, setPostes] = useState([]);
  const [statsData, setStatsData] = useState({
    overdueCount: 0,
    days30Count: 0,
    days90Count: 0,
    completedCount: 0
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date_prochaine_visite', direction: 'asc' });
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Validation schema for adding a medical visit
  const visiteSchema = Yup.object().shape({
    nom: Yup.string().required('Le nom est requis'),
    prenom: Yup.string(),
    poste: Yup.string().required('Le poste est requis'),
    date_derniere_visite: Yup.date().required('La date de dernière visite est requise'),
    date_prochaine_visite: Yup.date()
      .required('La date de prochaine visite est requise')
      .min(
        Yup.ref('date_derniere_visite'),
        'La date de prochaine visite doit être postérieure à la date de dernière visite'
      ),
    notes: Yup.string()
  });

  // Validation schema for updating status
  const statusSchema = Yup.object().shape({
    statut: Yup.string().required('Le statut est requis'),
    notes: Yup.string()
  });

  // Validation schema for reminder
  const reminderSchema = Yup.object().shape({
    message: Yup.string().required('Le message est requis'),
    send_email: Yup.boolean(),
    send_sms: Yup.boolean()
  });

  // Fonction d'affichage des notifications
  const showNotificationMessage = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  }, []);

  // Format date from ISO to DD/MM/YYYY
  const formatDate = useCallback((isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR');
  }, []);

  // Calculate statistics from visits data
  const calculateStats = useCallback((visits) => {
    if (!visits || !Array.isArray(visits) || visits.length === 0) {
      console.log('No visits data to calculate stats');
      return;
    }
    
    console.log('Calculating stats from', visits.length, 'visits');
    
    const today = new Date();
    
    // Count overdue visits
    const overdue = visits.filter(v => {
      const nextVisit = new Date(v.date_prochaine_visite);
      return nextVisit < today && v.statut === 'À venir';
    }).length;
    
    // Count visits in next 30 days
    const days30 = visits.filter(v => {
      const nextVisit = new Date(v.date_prochaine_visite);
      const diffDays = Math.ceil((nextVisit - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30 && v.statut === 'À venir';
    }).length;
    
    // Count visits in next 90 days
    const days90 = visits.filter(v => {
      const nextVisit = new Date(v.date_prochaine_visite);
      const diffDays = Math.ceil((nextVisit - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 90 && v.statut === 'À venir';
    }).length;
    
    // Count completed visits
    const completed = visits.filter(v => v.statut === 'Complété').length;
    
    const newStats = {
      overdueCount: overdue,
      days30Count: days30,
      days90Count: days90,
      completedCount: completed
    };
    
    console.log('Calculated stats:', newStats);
    
    // Update stats state
    setStatsData(newStats);
  }, []);

  // Fetch medical visits data and calculate stats
  const fetchVisites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all medical visits
      console.log('Fetching medical visits...');
      const visitesData = await visiteMedicaleService.getAll();
      console.log(`Received ${visitesData.length} visits`);
      
      // Set visits data
      setVisites(visitesData);
      
      // Extract unique job positions for the filter
      const uniquePostes = [...new Set(visitesData.map(v => v.poste).filter(Boolean))].sort();
      setPostes(uniquePostes);
      
      // Calculate statistics client-side
      calculateStats(visitesData);
      
      // Reset pagination to page 1
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching visits:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  // Fetch data on component mount
  useEffect(() => {
    fetchVisites();
  }, [fetchVisites]);

  // Memoize filtered visites based on search criteria
  const filteredVisites = useMemo(() => {
    return visites.filter(visite => {
      const nomPrenom = `${visite.nom} ${visite.prenom}`.toLowerCase();
      const searchLower = search.toLowerCase();
      
      const matchesSearch = search === '' || nomPrenom.includes(searchLower);
      const matchesPoste = poste === '' || visite.poste === poste;
      const matchesStatut = statut === '' || visite.statut === statut;
      
      let matchesPeriode = true;
      if (periode !== '') {
        const today = new Date();
        const nextVisit = new Date(visite.date_prochaine_visite);
        const diffDays = Math.ceil((nextVisit - today) / (1000 * 60 * 60 * 24));
        
        switch (periode) {
          case 'overdue':
            matchesPeriode = diffDays < 0;
            break;
          case '30days':
            matchesPeriode = diffDays >= 0 && diffDays <= 30;
            break;
          case '60days':
            matchesPeriode = diffDays >= 0 && diffDays <= 60;
            break;
          case '90days':
            matchesPeriode = diffDays >= 0 && diffDays <= 90;
            break;
          default:
            matchesPeriode = true;
        }
      }
      
      return matchesSearch && matchesPoste && matchesStatut && matchesPeriode;
    });
  }, [visites, search, poste, periode, statut]);

  // Sort filtered visits based on current sort config
  const sortedVisites = useMemo(() => {
    if (!sortConfig.key) return filteredVisites;
    
    return [...filteredVisites].sort((a, b) => {
      // Handle dates specially
      if (['date_derniere_visite', 'date_prochaine_visite'].includes(sortConfig.key)) {
        const dateA = new Date(a[sortConfig.key] || '1970-01-01');
        const dateB = new Date(b[sortConfig.key] || '1970-01-01');
        return sortConfig.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      
      // Handle other fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredVisites, sortConfig]);

  // Calculate paginated items
  const paginatedVisites = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedVisites.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedVisites, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(sortedVisites.length / itemsPerPage);
  }, [sortedVisites, itemsPerPage]);

  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle search with API
  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: search,
        poste: poste,
        periode: periode,
        statut: statut
      };
      
      const results = await visiteMedicaleService.search(filters);
      setVisites(results);
      calculateStats(results);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error searching data:', err);
      setError('Erreur lors de la recherche. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  }, [search, poste, periode, statut, calculateStats]);

  // Reset filters and reload all data
  const handleResetFilters = useCallback(async () => {
    setSearch('');
    setPoste('');
    setPeriode('');
    setStatut('');
    
    await fetchVisites();
  }, [fetchVisites]);

  // Handle add visite form submission
  const handleAddVisite = useCallback(async (values, { resetForm }) => {
    try {
      setIsLoading(true);
      
      // Set default status to "À venir" if not provided
      const visiteData = {
        ...values,
        statut: values.statut || 'À venir'
      };
      
      const newVisite = await visiteMedicaleService.create(visiteData);
      
      // Add the new visite to the list
      const updatedVisites = [newVisite, ...visites];
      setVisites(updatedVisites);
      
      // Recalculate stats with the updated list
      calculateStats(updatedVisites);
      
      resetForm();
      setShowAddModal(false);
      showNotificationMessage('La visite médicale a été ajoutée avec succès.');
    } catch (err) {
      console.error('Error adding visite:', err);
      setError('Erreur lors de l\'ajout de la visite médicale. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [visites, calculateStats, showNotificationMessage]);

  // Handle delete visite
  const handleDeleteVisite = useCallback(async (visiteId) => {
    try {
      setIsLoading(true);
      
      // Call API to delete visite
      await visiteMedicaleService.delete(visiteId);
      
      // Remove from local state
      const updatedVisites = visites.filter(v => v.id !== visiteId);
      setVisites(updatedVisites);
      
      // Recalculate stats with the updated list
      calculateStats(updatedVisites);
      
      // Success notification
      showNotificationMessage('La visite médicale a été supprimée avec succès.', 'success');
      
      // Close delete modal
      setShowDeleteModal(false);
      setSelectedVisite(null);
    } catch (err) {
      console.error('Error deleting visite:', err);
      setError('Erreur lors de la suppression de la visite médicale. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [visites, calculateStats, showNotificationMessage]);

  // Open delete modal
  const handleShowDeleteModal = useCallback((visite) => {
    setSelectedVisite(visite);
    setShowDeleteModal(true);
  }, []);

  // Handle status update form submission
  const handleUpdateStatus = useCallback(async (values) => {
    try {
      setIsLoading(true);
      
      if (!selectedVisite) {
        throw new Error('Aucune visite sélectionnée');
      }
      
      const updatedVisite = await visiteMedicaleService.updateStatus(selectedVisite.id, values);
      
      // Update the visites list
      const updatedVisites = visites.map(visite => 
        visite.id === updatedVisite.id ? updatedVisite : visite
      );
      
      // Update the visites state
      setVisites(updatedVisites);
      
      // Recalculate stats with the updated list
      calculateStats(updatedVisites);
      
      setShowUpdateModal(false);
      showNotificationMessage('Le statut de la visite a été mis à jour avec succès.');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedVisite, visites, calculateStats, showNotificationMessage]);

  // Handle viewing visite details
  const handleViewVisite = useCallback(async (visite) => {
    try {
      setIsLoading(true);
      
      // Fetch the latest data for this visite
      const visiteDetails = await visiteMedicaleService.getById(visite.id);
      setSelectedVisite(visiteDetails);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching visite details:', err);
      setError('Erreur lors de la récupération des détails de la visite.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle updating visite status
  const handleShowUpdateModal = useCallback((visite) => {
    setSelectedVisite(visite);
    setShowUpdateModal(true);
  }, []);

  // Handle sending reminder (show modal)
  const handleShowReminderModal = useCallback((visite) => {
    setReminderTarget(visite);
    setShowReminderModal(true);
  }, []);

  // Handle send reminder submission
  const handleSendReminder = useCallback(async (values) => {
    if (!reminderTarget) return;
    
    try {
      setIsSendingReminder(true);
      
      // Prepare reminder data (réservé pour usage futur)
      // eslint-disable-next-line no-unused-vars
      const reminderData = {
        visite_id: reminderTarget.id,
        employee_name: `${reminderTarget.nom} ${reminderTarget.prenom}`,
        message: values.message,
        send_email: values.send_email,
        send_sms: values.send_sms
      };
      
      // In a real app, you would call an API endpoint to send a reminder
      // await visiteMedicaleService.sendReminder(reminderData);
      
      // Since this is a demo, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotificationMessage(`Un rappel a été envoyé à ${reminderTarget.nom} ${reminderTarget.prenom}.`);
      setShowReminderModal(false);
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Erreur lors de l\'envoi du rappel. Veuillez réessayer.');
    } finally {
      setIsSendingReminder(false);
    }
  }, [reminderTarget, showNotificationMessage]);

  // Handle export to CSV
  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      
      // Convert data to CSV
      const convertToCSV = (objArray) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = 'Nom,Prénom,Poste,Dernière visite,Prochaine visite,Statut,Notes\r\n';
    
        for (let i = 0; i < array.length; i++) {
          let line = '';
          line += `"${array[i].nom || ''}",`;
          line += `"${array[i].prenom || ''}",`;
          line += `"${array[i].poste || ''}",`;
          line += `"${formatDate(array[i].date_derniere_visite)}",`;
          line += `"${formatDate(array[i].date_prochaine_visite)}",`;
          line += `"${array[i].statut || ''}",`;
          line += `"${(array[i].notes || '').replace(/"/g, '""')}"\r\n`;
          str += line;
        }
        return str;
      };
    
      // Créer et télécharger le fichier
      const csvContent = convertToCSV(filteredVisites);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `visites_medicales_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotificationMessage('Export réussi. Le fichier a été téléchargé.');
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Erreur lors de l\'exportation des données.');
    } finally {
      setIsExporting(false);
    }
  }, [filteredVisites, showNotificationMessage, formatDate]);

  // Get status badge styling
  const getStatusBadge = useCallback((status, nextVisitDate) => {
    const today = new Date();
    const nextVisit = nextVisitDate ? new Date(nextVisitDate) : null;
    const diffDays = nextVisit ? Math.ceil((nextVisit - today) / (1000 * 60 * 60 * 24)) : null;
    
    let badgeClass = '';
    let statusText = status || 'Non défini';
    
    if (status === 'Complété') {
      badgeClass = 'badge-completed';
    } else if (status === 'Planifié') {
      badgeClass = 'badge-active';
    } else if (status === 'Annulé') {
      badgeClass = 'badge-overdue';
    } else {
      // À venir
      if (diffDays !== null) {
        if (diffDays < 0) {
          badgeClass = 'badge-overdue';
          statusText = 'En retard';
        } else if (diffDays <= 30) {
          badgeClass = 'badge-upcoming';
          statusText = 'Bientôt';
        } else {
          badgeClass = 'badge-active';
        }
      } else {
        badgeClass = 'badge-pending';
      }
    }
    
    return { badgeClass, statusText };
  }, []);

  // Calculate days remaining or overdue
  const getDaysInfo = useCallback((nextVisitDate, status) => {
    if (status !== 'À venir' || !nextVisitDate) return null;
    
    const today = new Date();
    const nextVisit = new Date(nextVisitDate);
    const diffDays = Math.ceil((nextVisit - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        isOverdue: true,
        days: Math.abs(diffDays)
      };
    } else if (diffDays <= 30) {
      return {
        isUpcoming: true,
        days: diffDays
      };
    }
    
    return null;
  }, []);

  // Change page in pagination
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  // Generate pagination items
  const getPaginationItems = useCallback(() => {
    const items = [];
    
    // First page always
    items.push(
      <li key="first" className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
        <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
      </li>
    );
    
    // Ellipsis after first page if needed
    if (currentPage > 3) {
      items.push(
        <li key="ellipsis1" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages as they're always shown
      
      items.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }
    
    // Ellipsis before last page if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <li key="ellipsis2" className="page-item disabled">
          <span className="page-link">...</span>
        </li>
      );
    }
    
    // Last page always (if more than 1 page)
    if (totalPages > 1) {
      items.push(
        <li key="last" className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
        </li>
      );
    }
    
    return items;
  }, [currentPage, totalPages, handlePageChange]);

  return (
    <>
      <div className="page-title-wrapper fade-in-up">
        <h1 className="page-title">Suivi des visites médicales</h1>
        <p className="page-subtitle">Gérez et suivez les visites médicales de vos collaborateurs</p>
      </div>
      
      {/* Notification */}
      {notification.show && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show slide-in-right`} role="alert">
          <i className={`fas fa-${notification.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification({ ...notification, show: false })}
            aria-label="Fermer"
          ></button>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show slide-in-right" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Fermer"
          ></button>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="stats-row fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card" onClick={() => { setPeriode('overdue'); handleSearch(); }}>
          <div className="stat-icon stat-icon-red">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statsData.overdueCount}</div>
            <div className="stat-label">Visites en retard</div>
          </div>
        </div>
        
        <div className="stat-card" onClick={() => { setPeriode('30days'); handleSearch(); }}>
          <div className="stat-icon stat-icon-orange">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statsData.days30Count}</div>
            <div className="stat-label">Dans les 30 jours</div>
          </div>
        </div>
        
        <div className="stat-card" onClick={() => { setPeriode('90days'); handleSearch(); }}>
          <div className="stat-icon stat-icon-blue">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statsData.days90Count}</div>
            <div className="stat-label">Dans les 90 jours</div>
          </div>
        </div>
        
        <div className="stat-card" onClick={() => { setStatut('Complété'); handleSearch(); }}>
          <div className="stat-icon stat-icon-green">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statsData.completedCount}</div>
            <div className="stat-label">Visites complétées</div>
          </div>
        </div>
      </div>
      
      {/* Filters Card */}
      <div className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <h3 className="card-title"><i className="fas fa-filter me-2"></i>Filtres et actions</h3>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label htmlFor="search" className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search"></i></span>
                <input 
                  type="text" 
                  className="form-control" 
                  id="search" 
                  placeholder="Nom ou prénom..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="poste" className="form-label">Poste</label>
              <select 
                className="form-select" 
                id="poste"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
              >
                <option value="">Tous les postes</option>
                {postes.map((p, index) => (
                  <option key={index} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="periode" className="form-label">Période</label>
              <select 
                className="form-select" 
                id="periode"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
              >
                <option value="">Toutes les périodes</option>
                <option value="overdue">En retard</option>
                <option value="30days">30 prochains jours</option>
                <option value="60days">60 prochains jours</option>
                <option value="90days">90 prochains jours</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="statut" className="form-label">Statut</label>
              <select 
                className="form-select" 
                id="statut"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="À venir">À venir</option>
                <option value="Planifié">Planifié</option>
                <option value="Complété">Complété</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>
          
          <div className="d-flex justify-content-between">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSearch}
            >
              <i className="fas fa-search btn-icon"></i>Filtrer
            </button>
            
            <div>
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={handleResetFilters}
              >
                <i className="fas fa-redo-alt btn-icon"></i>Réinitialiser
              </button>
              
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus btn-icon"></i>Ajouter une visite
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visites Table Card */}
      <div className="card fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="card-title"><i className="fas fa-table me-2"></i>Visites médicales</h3>
          <div>
            <span className="badge bg-primary rounded-pill">{filteredVisites.length} résultat(s)</span>
            <button 
              className="btn btn-sm btn-outline-primary ms-2" 
              onClick={handleExport}
              disabled={isExporting || filteredVisites.length === 0}
            >
              {isExporting ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              ) : (
                <i className="fas fa-file-export me-1"></i>
              )}
              Exporter
            </button>
          </div>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-muted">Chargement des données...</p>
            </div>
          ) : filteredVisites.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <h5>Aucune visite médicale trouvée</h5>
              <p className="text-muted mb-3">
                {(search || poste || periode || statut) ? 
                  'Aucun résultat ne correspond à vos critères de recherche.' : 
                  'Aucune visite médicale n\'a été enregistrée pour le moment.'
                }
              </p>
              {(search || poste || periode || statut) ? (
                <button className="btn btn-outline-secondary" onClick={handleResetFilters}>
                  <i className="fas fa-filter-circle-xmark me-2"></i>Réinitialiser les filtres
                </button>
              ) : (
                <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
                  <i className="fas fa-plus me-2"></i>Ajouter une visite
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover" id="visiteTable">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('nom')}>
                        Collaborateur
                        {sortConfig.key === 'nom' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="sortable" onClick={() => handleSort('poste')}>
                        Poste
                        {sortConfig.key === 'poste' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="sortable" onClick={() => handleSort('date_derniere_visite')}>
                        Dernière visite
                        {sortConfig.key === 'date_derniere_visite' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="sortable" onClick={() => handleSort('date_prochaine_visite')}>
                        Prochaine visite
                        {sortConfig.key === 'date_prochaine_visite' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th className="sortable" onClick={() => handleSort('statut')}>
                        Statut
                        {sortConfig.key === 'statut' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-1`}></i>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVisites.map((visite) => {
                      const { badgeClass, statusText } = getStatusBadge(visite.statut, visite.date_prochaine_visite);
                      const daysInfo = getDaysInfo(visite.date_prochaine_visite, visite.statut);
                      
                      return (
                        <tr key={visite.id} className={daysInfo?.isOverdue ? 'table-danger' : daysInfo?.isUpcoming ? 'table-warning' : ''}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-2" style={{
                                backgroundColor: `hsl(${(visite.nom?.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                              }}>
                                {visite.nom?.charAt(0)}{visite.prenom?.charAt(0)}
                              </div>
                              <div>
                                <div className="employee-name">{visite.nom}</div>
                                <div className="small text-muted">{visite.prenom}</div>
                              </div>
                            </div>
                          </td>
                          <td>{visite.poste}</td>
                          <td>{formatDate(visite.date_derniere_visite)}</td>
                          <td>
                            {formatDate(visite.date_prochaine_visite)}
                            {daysInfo?.isUpcoming && (
                              <span className="ms-2 badge bg-warning text-dark">
                                Dans {daysInfo.days} jour{daysInfo.days > 1 ? 's' : ''}
                              </span>
                            )}
                            {daysInfo?.isOverdue && (
                              <span className="ms-2 badge bg-danger">
                                Retard de {daysInfo.days} jour{daysInfo.days > 1 ? 's' : ''}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={`badge-pill ${badgeClass}`}>{statusText}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={() => handleViewVisite(visite)}
                                title="Voir détails"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-warning" 
                                onClick={() => handleShowUpdateModal(visite)}
                                title="Mettre à jour le statut"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-info" 
                                onClick={() => handleShowReminderModal(visite)}
                                title="Envoyer rappel"
                              >
                                <i className="fas fa-bell"></i>
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleShowDeleteModal(visite)}
                                title="Supprimer la visite"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="pagination-info">
                    Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, filteredVisites.length)} à {Math.min(currentPage * itemsPerPage, filteredVisites.length)} sur {filteredVisites.length} résultats
                  </div>
                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1}
                          aria-label="Précédent"
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>
                      
                      {getPaginationItems()}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          disabled={currentPage === totalPages}
                          aria-label="Suivant"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Add Visite Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title">
                <i className="fas fa-plus-circle me-2"></i>
                Ajouter une visite médicale
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowAddModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{
                nom: '',
                prenom: '',
                poste: '',
                date_derniere_visite: '',
                date_prochaine_visite: '',
                notes: ''
              }}
              validationSchema={visiteSchema}
              onSubmit={handleAddVisite}
            >
              {({ errors, touched, values, setFieldValue, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="nom" className="form-label">Nom <span className="text-danger">*</span></label>
                        <Field
                          name="nom"
                          type="text"
                          className={`form-control ${errors.nom && touched.nom ? 'is-invalid' : ''}`}
                          placeholder="Nom de famille"
                        />
                        <ErrorMessage name="nom" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="prenom" className="form-label">Prénom</label>
                        <Field
                          name="prenom"
                          type="text"
                          className={`form-control ${errors.prenom && touched.prenom ? 'is-invalid' : ''}`}
                          placeholder="Prénom"
                        />
                        <ErrorMessage name="prenom" component="div" className="invalid-feedback" />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="poste" className="form-label">Poste <span className="text-danger">*</span></label>
                      <Field
                        name="poste"
                        type="text"
                        className={`form-control ${errors.poste && touched.poste ? 'is-invalid' : ''}`}
                        placeholder="Intitulé du poste"
                        list="postes-list"
                      />
                      <datalist id="postes-list">
                        {postes.map((p, index) => (
                          <option key={index} value={p} />
                        ))}
                      </datalist>
                      <ErrorMessage name="poste" component="div" className="invalid-feedback" />
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="date_derniere_visite" className="form-label">Date de la dernière visite <span className="text-danger">*</span></label>
                        <Field
                          name="date_derniere_visite"
                          type="date"
                          className={`form-control ${errors.date_derniere_visite && touched.date_derniere_visite ? 'is-invalid' : ''}`}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFieldValue('date_derniere_visite', value);
                            
                            // Automatically calculate next visit (1 year later)
                            if (value) {
                              const date = new Date(value);
                              date.setFullYear(date.getFullYear() + 1);
                              setFieldValue(
                                'date_prochaine_visite', 
                                date.toISOString().split('T')[0]
                              );
                            }
                          }}
                        />
                        <ErrorMessage name="date_derniere_visite" component="div" className="invalid-feedback" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="date_prochaine_visite" className="form-label">Date de la prochaine visite <span className="text-danger">*</span></label>
                        <Field
                          name="date_prochaine_visite"
                          type="date"
                          className={`form-control ${errors.date_prochaine_visite && touched.date_prochaine_visite ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage name="date_prochaine_visite" component="div" className="invalid-feedback" />
                        <div className="form-text">Par défaut, 1 an après la dernière visite</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes (optionnel)</label>
                      <Field
                        as="textarea"
                        name="notes"
                        className="form-control"
                        rows="3"
                        placeholder="Informations complémentaires"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowAddModal(false)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={isLoading || !(isValid && dirty)}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Ajouter
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* View Visite Modal */}
      {showViewModal && selectedVisite && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-info-circle me-2"></i>
                Détails de la visite médicale
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowViewModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="text-center mb-4">
                <div className="avatar-circle avatar-lg mx-auto mb-2" style={{
                  backgroundColor: `hsl(${(selectedVisite.nom?.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                }}>
                  {selectedVisite.nom?.charAt(0)}{selectedVisite.prenom?.charAt(0)}
                </div>
                <h4>{selectedVisite.nom} {selectedVisite.prenom}</h4>
                <p className="text-muted mb-0">{selectedVisite.poste}</p>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="section-header">
                    <i className="fas fa-calendar-check me-2 text-primary"></i>
                    <span>Dates de visite</span>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Dernière visite</div>
                      <div className="info-value">{formatDate(selectedVisite.date_derniere_visite)}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Prochaine visite</div>
                      <div className="info-value d-flex align-items-center">
                        {formatDate(selectedVisite.date_prochaine_visite)}
                        {getDaysInfo(selectedVisite.date_prochaine_visite, selectedVisite.statut)?.isUpcoming && (
                          <span className="ms-2 badge bg-warning text-dark">
                            Dans {getDaysInfo(selectedVisite.date_prochaine_visite, selectedVisite.statut).days} jour(s)
                          </span>
                        )}
                        {getDaysInfo(selectedVisite.date_prochaine_visite, selectedVisite.statut)?.isOverdue && (
                          <span className="ms-2 badge bg-danger">
                            Retard de {getDaysInfo(selectedVisite.date_prochaine_visite, selectedVisite.statut).days} jour(s)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Statut actuel</div>
                      <div className="info-value">
                        <span className={`badge-pill ${getStatusBadge(selectedVisite.statut, selectedVisite.date_prochaine_visite).badgeClass}`}>
                          {getStatusBadge(selectedVisite.statut, selectedVisite.date_prochaine_visite).statusText}
                        </span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Date d'ajout</div>
                      <div className="info-value">{formatDate(selectedVisite.date_creation)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedVisite.notes && (
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="section-header">
                      <i className="fas fa-sticky-note me-2 text-primary"></i>
                      <span>Notes</span>
                    </div>
                    <div className="notes-content p-3 bg-light rounded">
                      {selectedVisite.notes}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="action-buttons-container">
                <button 
                  className="action-button update-status"
                  onClick={() => {
                    setShowViewModal(false);
                    handleShowUpdateModal(selectedVisite);
                  }}
                >
                  <i className="fas fa-edit action-icon"></i>
                  <span>Modifier statut</span>
                </button>
                
                <button 
                  className="action-button send-reminder"
                  onClick={() => {
                    setShowViewModal(false);
                    handleShowReminderModal(selectedVisite);
                  }}
                >
                  <i className="fas fa-bell action-icon"></i>
                  <span>Envoyer rappel</span>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Status Modal */}
      {showUpdateModal && selectedVisite && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-warning text-dark">
              <h5 className="modal-title">
                <i className="fas fa-edit me-2"></i>
                Mettre à jour le statut
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowUpdateModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{
                statut: selectedVisite.statut || 'À venir',
                notes: selectedVisite.notes || ''
              }}
              validationSchema={statusSchema}
              onSubmit={handleUpdateStatus}
            >
              {({ errors, touched, values, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Collaborateur</label>
                      <div className="d-flex align-items-center p-2 bg-light rounded">
                        <div className="avatar-circle me-2" style={{
                          backgroundColor: `hsl(${(selectedVisite.nom?.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                        }}>
                          {selectedVisite.nom?.charAt(0)}{selectedVisite.prenom?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold">{selectedVisite.nom} {selectedVisite.prenom}</div>
                          <div className="text-muted small">{selectedVisite.poste}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="statut" className="form-label">Statut <span className="text-danger">*</span></label>
                      <Field
                        as="select"
                        name="statut"
                        className={`form-select ${errors.statut && touched.statut ? 'is-invalid' : ''}`}
                      >
                        <option value="À venir">À venir</option>
                        <option value="Planifié">Planifié</option>
                        <option value="Complété">Complété</option>
                        <option value="Annulé">Annulé</option>
                      </Field>
                      <ErrorMessage name="statut" component="div" className="invalid-feedback" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="notes" className="form-label">Notes (optionnel)</label>
                      <Field
                        as="textarea"
                        name="notes"
                        className="form-control"
                        rows="3"
                        placeholder="Informations complémentaires"
                      />
                    </div>
                    
                    {values.statut === 'Complété' && (
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        En marquant cette visite comme "Complétée", la date de la dernière visite sera mise à jour à la date du jour.
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowUpdateModal(false)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-warning"
                      disabled={isLoading || !(isValid && dirty)}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Mettre à jour
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* Send Reminder Modal */}
      {showReminderModal && reminderTarget && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-info text-white">
              <h5 className="modal-title">
                <i className="fas fa-bell me-2"></i>
                Envoyer un rappel
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowReminderModal(false)}
              ></button>
            </div>
            <Formik
              initialValues={{
                message: `Rappel : Votre visite médicale est prévue pour le ${formatDate(reminderTarget.date_prochaine_visite)}.`,
                send_email: true,
                send_sms: false
              }}
              validationSchema={reminderSchema}
              onSubmit={handleSendReminder}
            >
              {({ errors, touched, isValid, dirty }) => (
                <Form>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Destinataire</label>
                      <div className="d-flex align-items-center p-2 bg-light rounded">
                        <div className="avatar-circle me-2" style={{
                          backgroundColor: `hsl(${(reminderTarget.nom?.charCodeAt(0) || 0) * 10}, 70%, 60%)`,
                        }}>
                          {reminderTarget.nom?.charAt(0)}{reminderTarget.prenom?.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold">{reminderTarget.nom} {reminderTarget.prenom}</div>
                          <div className="text-muted small">{reminderTarget.poste}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message <span className="text-danger">*</span></label>
                      <Field
                        as="textarea"
                        name="message"
                        className={`form-control ${errors.message && touched.message ? 'is-invalid' : ''}`}
                        rows="4"
                      />
                      <ErrorMessage name="message" component="div" className="invalid-feedback" />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Options d'envoi</label>
                      <div className="d-flex flex-column">
                        <div className="form-check mb-2">
                          <Field
                            type="checkbox"
                            name="send_email"
                            id="send_email"
                            className="form-check-input"
                          />
                          <label className="form-check-label" htmlFor="send_email">
                            <i className="fas fa-envelope me-2 text-primary"></i>
                            Envoyer par email
                          </label>
                        </div>
                        <div className="form-check">
                          <Field
                            type="checkbox"
                            name="send_sms"
                            id="send_sms"
                            className="form-check-input"
                          />
                          <label className="form-check-label" htmlFor="send_sms">
                            <i className="fas fa-sms me-2 text-primary"></i>
                            Envoyer par SMS
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setShowReminderModal(false)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-info"
                      disabled={isSendingReminder || !(isValid && dirty)}
                    >
                      {isSendingReminder ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Envoyer le rappel
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      
      {/* Delete Visite Modal */}
      {showDeleteModal && selectedVisite && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">
                <i className="fas fa-trash-alt me-2"></i>
                Supprimer la visite médicale
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                Êtes-vous sûr de vouloir supprimer la visite médicale de {selectedVisite.nom} {selectedVisite.prenom} (Poste: {selectedVisite.poste}) ?
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => handleDeleteVisite(selectedVisite.id)}
              >
                <i className="fas fa-trash-alt me-2"></i>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Styles CSS */}
      <style>{`
        /* Animations */
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Modal styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          width: 100%;
          max-width: 700px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Stat cards */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;
        }
        
        .stat-icon-red { background-color: #dc3545; }
        .stat-icon-orange { background-color: #fd7e14; }
        .stat-icon-blue { background-color: #0d6efd; }
        .stat-icon-green { background-color: #198754; }
        
        .stat-content {
          flex: 1;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .stat-label {
          color: #6c757d;
          font-size: 14px;
        }
        
        /* Card styles */
        .card {
          border: none;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .card-header {
          padding: 16px 20px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #eaeaea;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .card-body {
          padding: 20px;
        }
        
        /* Table styles */
        .table th {
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 2px solid #e9ecef;
        }
        
        .table td {
          vertical-align: middle;
          padding: 12px 16px;
        }
        
        .sortable {
          cursor: pointer;
          position: relative;
          padding-right: 24px;
          transition: background-color 0.2s;
        }
        
        .sortable:hover {
          background-color: #f8f9fa;
        }
        
        .sortable i {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        /* Badge styles */
        .badge-pill {
          padding: 6px 12px;
          border-radius: 50px;
          font-weight: 500;
          font-size: 12px;
          display: inline-block;
        }
        
        .badge-completed {
          background-color: #198754;
          color: white;
        }
        
        .badge-active {
          background-color: #0d6efd;
          color: white;
        }
        
        .badge-overdue {
          background-color: #dc3545;
          color: white;
        }
        
        .badge-upcoming {
          background-color: #fd7e14;
          color: white;
        }
        
        .badge-pending {
          background-color: #6c757d;
          color: white;
        }
        
        /* Action buttons */
        .action-buttons {
          display: flex;
          gap: 5px;
          justify-content: center;
        }
        
        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }
        
        /* View details page */
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .avatar-lg {
          width: 80px;
          height: 80px;
          font-size: 28px;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .info-item {
          margin-bottom: 10px;
        }
        
        .info-label {
          font-size: 12px;
          color: #6c757d;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-weight: 500;
        }
        
        .notes-content {
          white-space: pre-line;
        }
        
        .action-buttons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        
        .action-button {
          flex: 1;
          min-width: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background-color: #f8f9fa;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .action-button:hover {
          background-color: #e9ecef;
          transform: translateY(-2px);
        }
        
        .action-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .update-status .action-icon {
          color: #fd7e14;
        }
        
        .send-reminder .action-icon {
          color: #0dcaf0;
        }
        
        /* Pagination styles */
        .pagination-info {
          color: #6c757d;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
          
          .modal-content {
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default MedicalVisits;
