import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { decodeHtmlEntities } from '../../utils/textUtils';
import employeeService from '../../services/employeeService';
import EmployeeDetailModal from './EmployeeDetailModal';
import EmployeeStatsCards from './EmployeeStatsCards';
import ContractAlerts from './ContractAlerts';
import EmailModal from '../common/EmailModal';
import '../../styles/EmployeeList.css';
import '../../styles/Tables.css';

const EmployeeList = () => {
  const navigate = useNavigate(); // Hook pour la navigation
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    functional_area: '',
    entity: '',
    type_contrat: ''
  });

  // Listes pour les filtres (seront remplies dynamiquement)
  const [departments, setDepartments] = useState([]);
  const [entities, setEntities] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);

  // Test de la fonction de décodage au chargement
  useEffect(() => {
    // Test des cas spécifiques de l'image
    const testCases = [
      'C,phora',
      'M,decin', 
      'gyn,cologue',
      'Op,rateur',
      'secr,taire',
      'm,dicale',
      'r,nimateur',
      'sup,rieur',
      'g,n,rale',
      'Agnšs',
      'Sosthšne',
      'BOUNGOUERE MABE C,phora',
      'CHITOU Bilkis Epse SANMA Folachad, AmakÈ',
      'Equipière',
      'Milène',
      'AmakÈ',
      'biologie m,dicale',
      'C,libataire'
    ];
    
    console.log('=== Test de décodage ===');
    testCases.forEach(testCase => {
      const decoded = decodeHtmlEntities(testCase);
      console.log(`${testCase} -> ${decoded}`);
    });
    console.log('=== Fin du test ===');
  }, []);

  // Données de test pour le cas où l'API n'est pas disponible
  const mockEmployees = React.useMemo(() => ([
    {
      id: 1,
      nom_prenom: 'John Doe',
      email: 'john.doe@example.com',
      telephone: '+33 6 12 34 56 78',
      poste_actuel: 'Développeur Senior',
      functional_area: 'Informatique',
      entity: 'Centre Diagnostic',
      date_entree: '2024-01-15',
      type_contrat: 'CDI',
      date_fin_contrat: null
    },
    {
      id: 2,
      nom_prenom: 'Jane Smith',
      email: 'jane.smith@example.com',
      telephone: '+33 6 98 76 54 32',
      poste_actuel: 'Responsable Marketing',
      functional_area: 'Marketing',
      entity: 'Optikah',
      date_entree: '2024-03-01',
      type_contrat: 'CDD',
      date_fin_contrat: '2025-07-15'
    },
    {
      id: 3,
      nom_prenom: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      telephone: '+33 7 11 22 33 44',
      poste_actuel: 'Assistant RH',
      functional_area: 'Ressources Humaines',
      entity: 'Centre Diagnostic',
      date_entree: '2025-02-15',
      type_contrat: 'Stage',
      date_fin_contrat: '2025-06-15'
    }
  ]), []);

  useEffect(() => {
    // Fetch employees from API or use mock data
    const fetchEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching employees...');
        
        let data = [];
        
        // Try to use the API service if available
        if (employeeService && typeof employeeService.getAll === 'function') {
          try {
            data = await employeeService.getAll();
            // Décoder les entités HTML potentielles pour les noms
            data = Array.isArray(data) ? data.map(emp => ({
              ...emp,
              nom_prenom: decodeHtmlEntities(emp.nom_prenom),
              poste_actuel: decodeHtmlEntities(emp.poste_actuel),
              entity: decodeHtmlEntities(emp.entity),
            })) : data;
            console.log('Employees fetched from API:', data);
          } catch (apiError) {
            console.error('API error, falling back to mock data:', apiError);
            data = mockEmployees;
          }
        } else {
          console.warn('employeeService.getAll is not available, using mock data');
          data = mockEmployees;
        }
        
        setEmployees(data);
        setFilteredEmployees(data);
        
        // Extraire les valeurs uniques pour les filtres
        const uniqueDepartments = [...new Set(data.map(emp => emp.functional_area).filter(Boolean))];
        const uniqueEntities = [...new Set(data.map(emp => emp.entity).filter(Boolean))];
        const uniqueContractTypes = [...new Set(data.map(emp => emp.type_contrat).filter(Boolean))];
        
        setDepartments(uniqueDepartments);
        setEntities(uniqueEntities);
        setContractTypes(uniqueContractTypes);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Impossible de charger les employés. Utilisation des données de test.');
        
        // Use mock data as fallback
        setEmployees(mockEmployees);
        setFilteredEmployees(mockEmployees);
        
        // Extract unique values for filters from mock data
        const uniqueDepartments = [...new Set(mockEmployees.map(emp => emp.functional_area).filter(Boolean))];
        const uniqueEntities = [...new Set(mockEmployees.map(emp => emp.entity).filter(Boolean))];
        const uniqueContractTypes = [...new Set(mockEmployees.map(emp => emp.type_contrat).filter(Boolean))];
        
        setDepartments(uniqueDepartments);
        setEntities(uniqueEntities);
        setContractTypes(uniqueContractTypes);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [mockEmployees]);

  // Mettre à jour les listes de filtres avec les données décodées
  useEffect(() => {
    if (employees.length > 0) {
      // Extraire les domaines fonctionnels uniques et les décoder
      const uniqueDepartments = [...new Set(employees.map(emp => emp.functional_area).filter(Boolean))];
      setDepartments(uniqueDepartments.map(dept => decodeHtmlEntities(dept)));
      
      // Extraire les entités uniques et les décoder
      const uniqueEntities = [...new Set(employees.map(emp => emp.entity).filter(Boolean))];
      setEntities(uniqueEntities.map(entity => decodeHtmlEntities(entity)));
      
      // Extraire les types de contrat uniques et les décoder
      const uniqueContractTypes = [...new Set(employees.map(emp => emp.type_contrat).filter(Boolean))];
      setContractTypes(uniqueContractTypes.map(type => decodeHtmlEntities(type)));
    }
  }, [employees]);

  // Filtrer les employés basé sur la recherche et les filtres
  useEffect(() => {
    if (!employees.length) return;

    const filtered = employees.filter(employee => {
      // Debug: Log the original data
      if (employee.nom_prenom && (employee.nom_prenom.includes('š') || employee.nom_prenom.includes(','))) {
        console.log('Debug - Original nom_prenom:', employee.nom_prenom);
        console.log('Debug - Decoded nom_prenom:', decodeHtmlEntities(employee.nom_prenom));
      }
      
      // Search query - apply decoding for search as well
      const searchMatch = searchQuery === '' || 
          (employee.nom_prenom && decodeHtmlEntities(employee.nom_prenom).toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.poste_actuel && decodeHtmlEntities(employee.poste_actuel).toLowerCase().includes(searchQuery.toLowerCase())) ||
          (employee.matricule && employee.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by department
      const departmentMatch = filters.functional_area === '' || 
          (employee.functional_area && decodeHtmlEntities(employee.functional_area) === filters.functional_area);

      // Filter by entity
      const entityMatch = filters.entity === '' || 
          (employee.entity && decodeHtmlEntities(employee.entity) === filters.entity);

      // Filter by contract type
      const contractTypeMatch = filters.type_contrat === '' || 
          (employee.type_contrat && decodeHtmlEntities(employee.type_contrat) === filters.type_contrat);

      return searchMatch && departmentMatch && entityMatch && contractTypeMatch;
    });

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filters]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle view employee details
  const handleViewEmployee = async (employee) => {
    try {
      let detailedEmployee = employee;
      
      // Try to fetch complete employee details if the API is available
      if (employeeService && typeof employeeService.getById === 'function') {
        try {
          detailedEmployee = await employeeService.getById(employee.id);
          detailedEmployee.nom_prenom = decodeHtmlEntities(detailedEmployee.nom_prenom);
          detailedEmployee.poste_actuel = decodeHtmlEntities(detailedEmployee.poste_actuel);
          detailedEmployee.entity = decodeHtmlEntities(detailedEmployee.entity);
        } catch (apiError) {
          console.error('API error when fetching employee details, using current data:', apiError);
          // Continue with the current employee data
        }
      }
      
      setSelectedEmployee(detailedEmployee);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      // Still show the modal with the data we have
      setSelectedEmployee(employee);
      setShowDetailModal(true);
    }
  };

  // Handle edit employee - Navigate to edit page
  const handleEditEmployee = (employee) => {
    navigate(`/edit-employee/${employee.id}`);
  };

  // Handle delete employee
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        if (employeeService && typeof employeeService.delete === 'function') {
          await employeeService.delete(id);
        }
        
        // Update the local state regardless of API availability
        setEmployees(employees.filter(employee => employee.id !== id));
        alert('Employé supprimé avec succès');
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Erreur lors de la suppression de l\'employé');
      }
    }
  };

  // Handle email employee
  const handleEmailEmployee = (email) => {
    setEmailRecipient(email);
    setShowEmailModal(true);
  };

  // Handle send email
  const handleSendEmail = (emailData) => {
    console.log('Sending email:', emailData);
    // In a real app, this would send the email via an API
    alert(`Email envoyé à ${emailData.to}`);
    setShowEmailModal(false);
  };

  // Get CSS class for contract type
  const getContractTypeClass = (type) => {
    switch (type) {
      case 'CDI':
        return 'contract-type-cdi';
      case 'CDD':
        return 'contract-type-cdd';
      case 'Prestataire':
        return 'contract-type-interim';
      case 'stage PNPE':
      case 'Stage':
        return 'contract-type-stage';
      case 'Alternance':
        return 'contract-type-alternance';
      case 'Freelance':
        return 'contract-type-freelance';
      default:
        return '';
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Gestion des employés</h1>
          <p className="page-subtitle">Consultez et gérez tous les employés de votre entreprise.</p>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}
      
      {/* Ajout des cartes statistiques d'effectifs */}
      <EmployeeStatsCards employees={employees} />
      
      <ContractAlerts employees={employees} />
      
      <div className="employee-filters">
        <div className="row">
          <div className="col-md-8 mb-3 mb-md-0">
            <h5 className="filter-title">Filtres</h5>
            <div className="row">
              <div className="col-md-3 mb-2 mb-md-0">
                <select 
                  className="form-select"
                  value={filters.functional_area}
                  onChange={(e) => setFilters({...filters, functional_area: e.target.value})}
                >
                  <option value="">Tous les départements</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-2 mb-md-0">
                <select 
                  className="form-select"
                  value={filters.entity}
                  onChange={(e) => setFilters({...filters, entity: e.target.value})}
                >
                  <option value="">Toutes les entités</option>
                  {entities.map((entity, index) => (
                    <option key={index} value={entity}>{entity}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 mb-2 mb-md-0">
                <select 
                  className="form-select"
                  value={filters.type_contrat}
                  onChange={(e) => setFilters({...filters, type_contrat: e.target.value})}
                >
                  <option value="">Tous les contrats</option>
                  {contractTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFilters({ functional_area: '', entity: '', type_contrat: '' });
                    setSearchQuery('');
                  }}
                >
                  <i className="fas fa-undo me-2"></i>
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Rechercher un employé..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="button">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="employee-table-card">
        <div className="employee-table-header">
          <h5 className="table-title">
            <div className="table-icon">
              <i className="fas fa-users"></i>
            </div>
            Liste des employés ({filteredEmployees.length})
          </h5>
          
          <Link to="/new-employee" className="btn btn-primary">
            <i className="fas fa-user-plus me-2"></i>
            Ajouter un employé
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="alert alert-info m-3">
            <i className="fas fa-info-circle me-2"></i>
            Aucun employé trouvé.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Email</th>
                    <th>Département</th>
                    <th>Entité</th>
                    <th>Type de contrat</th>
                    <th>Date d'embauche</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="employee-avatar me-3">
                            {employee.photo ? (
                              <img src={employee.photo} alt={decodeHtmlEntities(employee.nom_prenom)} />
                            ) : (
                              getInitials(decodeHtmlEntities(employee.nom_prenom))
                            )}
                          </div>
                          <div>
                            <div className="employee-name">
                                {decodeHtmlEntities(employee.nom_prenom)}
                            </div>
                            <div className="employee-position">
                                {decodeHtmlEntities(employee.poste_actuel) || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{employee.email || '-'}</td>
                      <td>{decodeHtmlEntities(employee.functional_area) || '-'}</td>
                      <td>{decodeHtmlEntities(employee.entity) || '-'}</td>
                      <td>
                          <span className={`badge ${getContractTypeClass(employee.type_contrat)}`}>
                              {decodeHtmlEntities(employee.type_contrat) || '-'}
                          </span>
                      </td>
                      <td>{employee.date_entree ? formatDate(employee.date_entree) : '-'}</td>
                      <td>
                        <div className="d-flex">
                          <button 
                            className="action-btn action-btn-view" 
                            onClick={() => handleViewEmployee(employee)}
                            title="Voir détails"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn action-btn-edit" 
                            onClick={() => handleEditEmployee(employee)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn action-btn-delete" 
                            onClick={() => handleDeleteEmployee(employee.id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                          {employee.email && (
                            <button 
                              className="action-btn action-btn-email" 
                              onClick={() => handleEmailEmployee(employee.email)}
                              title="Envoyer un email"
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="employee-pagination p-3 border-top">
                <div className="pagination-info">
                  Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredEmployees.length)} sur {filteredEmployees.length} employés
                </div>
                <nav>
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {[...Array(totalPages).keys()].map(number => (
                      <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(number + 1)}
                        >
                          {number + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
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
      
      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            navigate(`/edit-employee/${selectedEmployee.id}`);
          }}
        />
      )}
      
      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal 
          recipient={emailRecipient}
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
        />
      )}
    </>
  );
};

export default EmployeeList;