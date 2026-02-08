import React, { useState, useEffect, useRef } from 'react';

const CodeModal = ({ show, onClose, onConfirm, title = "Vérification" }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const mockExpectedCode = '1234'; // In a real app, this would be retrieved from API or sent to user

  useEffect(() => {
    // Focus first input when modal opens
    if (show && inputRefs[0].current) {
      setTimeout(() => {
        inputRefs[0].current.focus();
      }, 100);
    }
    
    // Reset code when modal closes
    if (!show) {
      setCode(['', '', '', '']);
      setError('');
    }
  }, [show]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update code array
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Clear error when user types
    if (error) setError('');
    
    // Auto-focus next input if value is entered
    if (value && index < 3 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.trim().replace(/\D/g, '').substring(0, 4);
        if (pastedCode.length === 4) {
          const newCode = pastedCode.split('');
          setCode(newCode);
          inputRefs[3].current.focus();
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const enteredCode = code.join('');
    
    // Validate code length
    if (enteredCode.length !== 4) {
      setError('Veuillez entrer un code à 4 chiffres');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate verification
    setTimeout(() => {
      if (enteredCode === mockExpectedCode) {
        onConfirm();
        onClose();
      } else {
        setError('Code incorrect. Veuillez réessayer.');
        // Reset code on error
        setCode(['', '', '', '']);
        // Focus first input
        inputRefs[0].current.focus();
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const handleResendCode = () => {
    // Simulate resending code
    setError('');
    setCode(['', '', '', '']);
    inputRefs[0].current.focus();
    
    // Show success message
    setTimeout(() => {
      alert('Un nouveau code a été envoyé à votre adresse email.');
    }, 500);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container code-modal">
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body">
          <div className="text-center mb-4">
            <div className="verification-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <p className="verification-text">
              Veuillez saisir le code à 4 chiffres envoyé à votre adresse email pour confirmer cette action.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  className="code-input"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  required
                />
              ))}
            </div>
            
            {error && (
              <div className="error-message text-center mt-3">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}
            
            <div className="text-center mt-4">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting || code.join('').length !== 4}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Vérification...
                  </>
                ) : (
                  'Vérifier'
                )}
              </button>
              
              <button
                type="button"
                className="btn btn-link mt-3"
                onClick={handleResendCode}
              >
                Je n'ai pas reçu de code. Renvoyer.
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;