import React, { useState } from 'react';
import '../../styles/EmailModal.css';

const EmailModal = ({ recipient, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    setIsSending(true);
    
    try {
      // Préparer les données de l'email
      const emailData = {
        to: recipient,
        subject,
        message
      };
      
      // Envoyer l'email via la fonction passée par le parent
      await onSend(emailData);
      
      // Fermer la modal après l'envoi
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Une erreur est survenue lors de l\'envoi de l\'email. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="email-modal">
        <div className="modal-header">
          <h5 className="modal-title">Envoyer un email</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="email-recipient" className="form-label">Destinataire</label>
              <input 
                type="email" 
                className="form-control" 
                id="email-recipient" 
                value={recipient} 
                disabled 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email-subject" className="form-label">Sujet <span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                id="email-subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email-message" className="form-label">Message <span className="text-danger">*</span></label>
              <textarea 
                className="form-control" 
                id="email-message" 
                rows="5" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                required 
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              onClick={onClose}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;