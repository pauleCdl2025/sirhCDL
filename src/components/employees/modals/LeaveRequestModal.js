import React, { useState } from 'react';

const LeaveRequestModal = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    details: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form data before submitting
    if (!formData.leaveType || !formData.startDate || !formData.endDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    onSubmit(formData);
    
    // Reset form
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      details: ''
    });

    // Use data attributes for modal dismissal
    const closeButton = document.querySelector('#leaveRequestModal [data-bs-dismiss="modal"]');
    if (closeButton) {
      closeButton.click();
    }
  };

  return (
    <div className="modal fade" id="leaveRequestModal" tabIndex="-1" aria-labelledby="leaveRequestModalLabel" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="leaveRequestModalLabel">
              <i className="fas fa-calendar-alt me-2"></i>Demande de congé
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="leaveType" className="form-label">Type de congé</label>
                <select 
                  className="form-select" 
                  id="leaveType" 
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionnez un type de congé</option>
                  <option value="annual">Congé annuel</option>
                  <option value="sick">Congé maladie</option>
                  <option value="special">Congé spécial</option>
                  <option value="maternity">Congé maternité</option>
                  <option value="paternity">Congé paternité</option>
                </select>
              </div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="startDate" className="form-label">Date de début</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="startDate" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="endDate" className="form-label">Date de fin</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="endDate" 
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="reason" className="form-label">Motif</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="reason" 
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Motif de la demande de congé"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="details" className="form-label">Détails supplémentaires</label>
                <textarea 
                  className="form-control" 
                  id="details" 
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Informations complémentaires (optionnel)"
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-paper-plane me-2"></i>Soumettre la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;