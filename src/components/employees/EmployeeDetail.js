import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../../styles/EmployeeDetail.css';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [leaveHistory, setLeaveHistory] = useState([]);
  
  useEffect(() => {
    // Simulate loading employee details
    const fetchEmployeeDetails = () => {
      setIsLoading(true);
      
      // Mock employee data - no API call to avoid errors
      const mockEmployee = {
        id: parseInt(id),
        firstName: 'Aude Nadège',
        lastName: 'DOMINGO',
        email: 'aude.domingo@example.com',
        phone: '+241 23 45 67 89',
        position: 'Responsable laboratoire',
        department: 'Laboratoire',
        company: 'Centre Diagnostic',
        hireDate: '2021-03-03',
        address: '123 Rue Principale, Libreville',
        city: 'Libreville',
        country: 'Gabon',
        birthDate: '1985-06-15',
        gender: 'Femme',
        maritalStatus: 'Mariée',
        children: 2,
        emergencyContact: 'Jean DOMINGO, +241 98 76 54 32',
        salary: 45000,
        contractType: 'CDI',
        managerName: 'Dr. SANMA Farid',
        leaveBalance: 25,
        status: 'active',
        avatar: null,
        documents: [
          { id: 1, name: 'Contrat de travail.pdf', type: 'Contrat', date: '2021-03-03' },
          { id: 2, name: 'CV.pdf', type: 'CV', date: '2021-02-15' },
          { id: 3, name: 'Diplôme.pdf', type: 'Diplôme', date: '2021-02-15' }
        ],
        notes: 'Excellente employée, très investie dans son travail.'
      };
      
      // Mock leave history
      const mockLeaveHistory = [
        {
          id: 3,
          type: 'Congé payé',
          startDate: '2024-08-19',
          endDate: '2024-09-03',
          duration: 14,
          status: 'Approuvé',
          requestDate: '2024-08-01'
        },
        {
          id: 12,
          type: 'Congé maladie',
          startDate: '2024-01-10',
          endDate: '2024-01-15',
          duration: 4,
          status: 'Approuvé',
          requestDate: '2024-01-10'
        },
        {
          id: 24,
          type: 'Congé payé',
          startDate: '2023-07-24',
          endDate: '2023-08-11',
          duration: 15,
          status: 'Approuvé',
          requestDate: '2023-06-15'
        }
      ];
      
      // Simulate delay for loading effect
      setTimeout(() => {
        setEmployee(mockEmployee);
        setLeaveHistory(mockLeaveHistory);
        setIsLoading(false);
      }, 1000);
    };

    fetchEmployeeDetails();
  }, [id]);

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      // In a real application, this would be an API call
      console.log('Deleting employee', id);
      
      // Redirect after deletion
      navigate('/employees');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="alert alert-danger m-4">
        Employé non trouvé.
      </div>
    );
  }

  return (
    <>
      <div className="page-title-wrapper">
        <div className="title-content">
          <h1 className="page-title">Détails de l'employé</h1>
          <p className="page-subtitle">Consultez et gérez les informations de l'employé</p>
        </div>
        <div>
          <Link to="/employees" className="btn btn-outline-primary me-2">
            <i className="fas fa-arrow-left me-2"></i>
            Retour à la liste
          </Link>
          <Link to={`/employees/${id}/edit`} className="btn btn-primary">
            <i className="fas fa-edit me-2"></i>
            Modifier
          </Link>
        </div>
      </div>

      <div className="employee-profile-container">
        <div className="employee-header">
          <div className="employee-avatar-large">
            {employee.avatar ? (
              <img src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
            ) : (
              <div className="avatar-placeholder">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
            )}
          </div>
          <div className="employee-header-info">
            <h2 className="employee-name">{employee.lastName} {employee.firstName}</h2>
            <p className="employee-position">{employee.position}</p>
            <div className="employee-tags">
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-building me-1"></i>
                {employee.department}
              </span>
              <span className="badge bg-light text-dark me-2">
                <i className="fas fa-file-contract me-1"></i>
                {employee.contractType}
              </span>
              <span className={`badge ${employee.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                {employee.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <div className="employee-header-actions">
            <button className="btn btn-outline-danger" onClick={handleDelete}>
              <i className="fas fa-user-slash me-2"></i>
              Désactiver
            </button>
          </div>
        </div>

        <div className="employee-tabs">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-2"></i>
                Profil
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'leave' ? 'active' : ''}`}
                onClick={() => setActiveTab('leave')}
              >
                <i className="fas fa-calendar-alt me-2"></i>
                Congés
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <i className="fas fa-file-alt me-2"></i>
                Documents
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <i className="fas fa-sticky-note me-2"></i>
                Notes
              </button>
            </li>
          </ul>
        </div>

        <div className="employee-tab-content">
          {activeTab === 'profile' && (
            <div className="employee-info-grid">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title"><i className="fas fa-info-circle me-2"></i>Informations personnelles</h5>
                </div>
                <div className="card-body">
                  <div className="employee-info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{employee.email}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Téléphone</div>
                    <div className="info-value">{employee.phone}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Date de naissance</div>
                    <div className="info-value">{new Date(employee.birthDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Genre</div>
                    <div className="info-value">{employee.gender}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Adresse</div>
                    <div className="info-value">{employee.address}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Ville</div>
                    <div className="info-value">{employee.city}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Pays</div>
                    <div className="info-value">{employee.country}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Situation familiale</div>
                    <div className="info-value">{employee.maritalStatus}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Nombre d'enfants</div>
                    <div className="info-value">{employee.children}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Contact d'urgence</div>
                    <div className="info-value">{employee.emergencyContact}</div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title"><i className="fas fa-briefcase me-2"></i>Informations professionnelles</h5>
                </div>
                <div className="card-body">
                  <div className="employee-info-item">
                    <div className="info-label">Entreprise</div>
                    <div className="info-value">{employee.company}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Département</div>
                    <div className="info-value">{employee.department}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Poste</div>
                    <div className="info-value">{employee.position}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Date d'embauche</div>
                    <div className="info-value">{new Date(employee.hireDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Type de contrat</div>
                    <div className="info-value">{employee.contractType}</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Salaire</div>
                    <div className="info-value">{employee.salary.toLocaleString('fr-FR')} XAF</div>
                  </div>
                  <div className="employee-info-item">
                    <div className="info-label">Responsable</div>
                    <div className="info-value">{employee.managerName}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'leave' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title"><i className="fas fa-calendar-alt me-2"></i>Historique des congés</h5>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-plus me-2"></i>
                  Nouvelle demande
                </button>
              </div>
              <div className="card-body">
                <div className="leave-balance-indicator mb-4">
                  <div className="balance-label">Solde de congés</div>
                  <div className="balance-value">{employee.leaveBalance} jours</div>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${(employee.leaveBalance / 30) * 100}%` }}
                      aria-valuenow={employee.leaveBalance} 
                      aria-valuemin="0" 
                      aria-valuemax="30"
                    ></div>
                  </div>
                </div>
                
                {leaveHistory.length === 0 ? (
                  <div className="alert alert-info">
                    Aucun historique de congé disponible.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Date de début</th>
                          <th>Date de fin</th>
                          <th>Durée</th>
                          <th>Statut</th>
                          <th>Date de demande</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveHistory.map((leave) => (
                          <tr key={leave.id}>
                            <td>{leave.type}</td>
                            <td>{new Date(leave.startDate).toLocaleDateString('fr-FR')}</td>
                            <td>{new Date(leave.endDate).toLocaleDateString('fr-FR')}</td>
                            <td>{leave.duration} jours</td>
                            <td>
                              <span className={`badge ${
                                leave.status === 'Approuvé' ? 'bg-success' :
                                leave.status === 'Rejeté' ? 'bg-danger' : 'bg-warning text-dark'
                              }`}>
                                {leave.status}
                              </span>
                            </td>
                            <td>{new Date(leave.requestDate).toLocaleDateString('fr-FR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title"><i className="fas fa-file-alt me-2"></i>Documents</h5>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-upload me-2"></i>
                  Ajouter un document
                </button>
              </div>
              <div className="card-body">
                {employee.documents.length === 0 ? (
                  <div className="alert alert-info">
                    Aucun document disponible.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Date d'ajout</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employee.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.name}</td>
                            <td>{doc.type}</td>
                            <td>{new Date(doc.date).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <div className="btn-group">
                                <button className="btn btn-sm btn-info me-1" title="Télécharger">
                                  <i className="fas fa-download"></i>
                                </button>
                                <button className="btn btn-sm btn-danger" title="Supprimer">
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title"><i className="fas fa-sticky-note me-2"></i>Notes</h5>
              </div>
              <div className="card-body">
                <textarea 
                  className="form-control mb-3" 
                  rows="5" 
                  defaultValue={employee.notes}
                ></textarea>
                <button className="btn btn-primary">
                  <i className="fas fa-save me-2"></i>
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeDetail;