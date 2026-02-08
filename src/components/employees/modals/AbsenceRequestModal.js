import React, { useState } from 'react';

const AbsenceRequestModal = ({ onSubmit, onClose, show }) => {
  const [absenceType, setAbsenceType] = useState('');
  const [absenceDuration, setAbsenceDuration] = useState('full-day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!absenceType) newErrors.absenceType = 'Veuillez sélectionner un type d\'absence';
    if (!startDate) newErrors.startDate = 'La date de début est requise';
    if (absenceDuration === 'multiple-days' && !endDate) newErrors.endDate = 'La date de fin est requise';
    if (absenceDuration === 'hours' && !startTime) newErrors.startTime = 'L\'heure de début est requise';
    if (absenceDuration === 'hours' && !endTime) newErrors.endTime = 'L\'heure de fin est requise';
    if (!reason) newErrors.reason = 'Le motif de l\'absence est requis';
    
    // Validate that end date is after start date
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }
    
    // Validate times if duration is hours
    if (absenceDuration === 'hours' && startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      if (end <= start) {
        newErrors.endTime = 'L\'heure de fin doit être postérieure à l\'heure de début';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Prepare form data
      const formData = {
        absenceType,
        absenceDuration,
        startDate,
        endDate: absenceDuration === 'multiple-days' ? endDate : startDate,
        startTime: absenceDuration === 'hours' ? startTime : null,
        endTime: absenceDuration === 'hours' ? endTime : null,
        reason,
        document,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      // Pass data to parent component
      onSubmit(formData);
      
      // Reset form
      resetForm();
      
      // Close modal
      if (onClose) {
        onClose();
      }
      
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAbsenceType('');
    setAbsenceDuration('full-day');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
    setDocument(null);
    setErrors({});
  };

  const handleDurationChange = (e) => {
    setAbsenceDuration(e.target.value);
    
    // Reset fields based on duration type
    if (e.target.value !== 'multiple-days') {
      setEndDate('');
    }
    
    if (e.target.value !== 'hours') {
      setStartTime('');
      setEndTime('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h5 className="modal-title">Nouvelle demande d'absence</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <form id="absenceRequestForm" onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label htmlFor="absenceType">Type d'absence</label>
                  <select 
                    className={`form-select ${errors.absenceType ? 'is-invalid' : ''}`} 
                    id="absenceType" 
                    value={absenceType} 
                    onChange={(e) => setAbsenceType(e.target.value)}
                    required
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="sick">Maladie</option>
                    <option value="doctor">Rendez-vous médical</option>
                    <option value="family">Raison familiale</option>
                    <option value="personal">Raison personnelle</option>
                    <option value="other">Autre</option>
                  </select>
                  {errors.absenceType && <div className="invalid-feedback">{errors.absenceType}</div>}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label htmlFor="absenceDuration">Durée</label>
                  <select 
                    className="form-select" 
                    id="absenceDuration" 
                    value={absenceDuration} 
                    onChange={handleDurationChange}
                    required
                  >
                    <option value="full-day">Journée complète</option>
                    <option value="half-day-morning">Demi-journée (matin)</option>
                    <option value="half-day-afternoon">Demi-journée (après-midi)</option>
                    <option value="multiple-days">Plusieurs jours</option>
                    <option value="hours">Heures</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label htmlFor="absenceStartDate">Date de début</label>
                  <input 
                    type="date" 
                    className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} 
                    id="absenceStartDate" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="form-group">
                  <label htmlFor="absenceEndDate">Date de fin</label>
                  <input 
                    type="date" 
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} 
                    id="absenceEndDate" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={absenceDuration !== 'multiple-days'}
                    required={absenceDuration === 'multiple-days'}
                  />
                  {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                </div>
              </div>
            </div>
            
            {absenceDuration === 'hours' && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="startTime">Heure de début</label>
                    <input 
                      type="time" 
                      className={`form-control ${errors.startTime ? 'is-invalid' : ''}`} 
                      id="startTime" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)}
                      required={absenceDuration === 'hours'}
                    />
                    {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="endTime">Heure de fin</label>
                    <input 
                      type="time" 
                      className={`form-control ${errors.endTime ? 'is-invalid' : ''}`} 
                      id="endTime" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)}
                      required={absenceDuration === 'hours'}
                    />
                    {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
                  </div>
                </div>
              </div>
            )}
            
            <div className="form-group mb-3">
              <label htmlFor="absenceReason">Motif de l'absence</label>
              <textarea 
                className={`form-control ${errors.reason ? 'is-invalid' : ''}`} 
                id="absenceReason" 
                rows="3" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder="Veuillez préciser le motif de votre absence..."
                required
              ></textarea>
              {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="absenceDocument">Document justificatif (si nécessaire)</label>
              <input 
                type="file" 
                className="form-control" 
                id="absenceDocument" 
                onChange={handleFileChange}
              />
              <small className="form-text text-muted">Formats acceptés: PDF, JPG, PNG (max. 5 Mo)</small>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Traitement...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Soumettre la demande
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceRequestModal;