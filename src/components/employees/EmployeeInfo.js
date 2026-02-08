import React from 'react';

const EmployeeInfo = ({ employee, leaveBalance }) => {
  return (
    <>
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Informations personnelles</h5>
            <div className="personal-info mt-3">
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Nom complet:</div>
                <div className="info-value">{employee.nom_prenom || 'Non renseigné'}</div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Email:</div>
                <div className="info-value">{employee.email || 'Non renseigné'}</div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Téléphone:</div>
                <div className="info-value">{employee.telephone || 'Non renseigné'}</div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Adresse:</div>
                <div className="info-value">{employee.adresse || 'Non renseigné'}</div>
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-sm btn-outline-primary">
                <i className="fas fa-pencil-alt me-1"></i> Mettre à jour mes informations
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Informations professionnelles</h5>
            <div className="personal-info mt-3">
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Poste:</div>
                <div className="info-value">{employee.poste_actuel || 'Non renseigné'}</div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Service:</div>
                <div className="info-value">{employee.entity || 'Non renseigné'}</div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Contrat:</div>
                <div className="info-value">
                  <span className={`badge bg-${employee.type_contrat === 'CDI' ? 'success' : (employee.type_contrat === 'CDD' ? 'warning' : 'info')}`}>
                    {employee.type_contrat || 'Non renseigné'}
                  </span>
                </div>
              </div>
              <div className="d-flex mb-2">
                <div className="info-label fw-bold me-2">Date d'embauche:</div>
                <div className="info-value">{employee.date_embauche_formatted || 'Non renseigné'}</div>
              </div>
              {employee.date_fin_contrat_formatted && (
                <div className="d-flex mb-2">
                  <div className="info-label fw-bold me-2">Fin de contrat:</div>
                  <div className="info-value">{employee.date_fin_contrat_formatted}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-lg-4 col-md-6 mb-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Solde de congés</h5>
            <div className="mt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="progress-info">
                  <span className="progress-label">Congés utilisés</span>
                  <span className="progress-percentage">{leaveBalance.used_days} / {leaveBalance.total_days} jours</span>
                </div>
              </div>
              <div className="progress mb-4" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-primary" 
                  role="progressbar" 
                  style={{ width: `${(leaveBalance.used_days / leaveBalance.total_days) * 100}%` }} 
                  aria-valuenow={leaveBalance.used_days} 
                  aria-valuemin="0" 
                  aria-valuemax={leaveBalance.total_days}
                ></div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div className="leave-stat">
                  <div className="leave-value">{leaveBalance.total_days}</div>
                  <div className="leave-label">Total</div>
                </div>
                <div className="leave-stat">
                  <div className="leave-value">{leaveBalance.used_days}</div>
                  <div className="leave-label">Utilisés</div>
                </div>
                <div className="leave-stat">
                  <div className="leave-value">{leaveBalance.remaining_days}</div>
                  <div className="leave-label">Restants</div>
                </div>
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">Année {leaveBalance.year}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeInfo;