import React, { useState } from 'react';

const DocumentRequestModal = ({ onSubmit, onClose, show }) => {
  const [documentType, setDocumentType] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const documentTypes = [
    { id: 'work_cert', label: 'Attestation de travail' },
    { id: 'salary_cert', label: 'Certificat de salaire' },
    { id: 'employment_contract', label: 'Contrat de travail' },
    { id: 'payslip', label: 'Bulletin de paie' },
    { id: 'reference_letter', label: 'Lettre de recommandation' },
    { id: 'other', label: 'Autre document' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!documentType) newErrors.documentType = 'Veuillez sélectionner un type de document';
    if (!reason) newErrors.reason = 'Veuillez préciser le motif de votre demande';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Prepare form data
      const formData = {
        documentType,
        documentLabel: documentTypes.find(doc => doc.id === documentType)?.label || documentType,
        reason,
        urgency,
        additionalInfo,
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
    setDocumentType('');
    setReason('');
    setUrgency('normal');
    setAdditionalInfo('');
    setErrors({});
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h5 className="modal-title">Nouvelle demande de document</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <form id="documentRequestForm" onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="documentType">Type de document</label>
              <select 
                className={`form-select ${errors.documentType ? 'is-invalid' : ''}`} 
                id="documentType" 
                value={documentType} 
                onChange={(e) => setDocumentType(e.target.value)}
                required
              >
                <option value="">Sélectionnez un type de document</option>
                {documentTypes.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.label}</option>
                ))}
              </select>
              {errors.documentType && <div className="invalid-feedback">{errors.documentType}</div>}
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="urgency">Niveau d'urgence</label>
              <select 
                className="form-select" 
                id="urgency" 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="low">Faible - Dans les 2 semaines</option>
                <option value="normal">Normal - Dans la semaine</option>
                <option value="high">Élevé - Dans les 48 heures</option>
                <option value="urgent">Urgent - Dans les 24 heures</option>
              </select>
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="reason">Motif de la demande</label>
              <textarea 
                className={`form-control ${errors.reason ? 'is-invalid' : ''}`} 
                id="reason" 
                rows="3" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder="Veuillez préciser pourquoi vous avez besoin de ce document..."
                required
              ></textarea>
              {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="additionalInfo">Informations complémentaires (optionnel)</label>
              <textarea 
                className="form-control" 
                id="additionalInfo" 
                rows="2" 
                value={additionalInfo} 
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Précisez toute information supplémentaire utile à votre demande..."
              ></textarea>
            </div>
            
            {documentType === 'other' && (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Pour les demandes de documents spécifiques non listés, veuillez fournir des détails précis dans le champ "Informations complémentaires".
              </div>
            )}
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

export default DocumentRequestModal;