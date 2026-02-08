import React, { useState } from 'react';

const ETAPE_DETAILS = {
    'nouveau': {
        titre: 'Dossier créé',
        instructions: 'Confirmez que vous avez rassemblé tous les documents de base.'
    },
    'authentification': {
        titre: 'Authentification des diplômes',
        instructions: 'Confirmez que vos diplômes ont été authentifiés par les autorités compétentes.'
    },
    'homologation': {
        titre: 'Demande d\'homologation',
        instructions: 'Confirmez que vous avez déposé votre dossier complet à la DGEC.'
    },
    'cnom': {
        titre: 'Enregistrement CNOM',
        instructions: 'Confirmez votre enregistrement auprès du Conseil National de l\'Ordre des Médecins.'
    },
    'autorisation_exercer': {
        titre: 'Autorisation d\'exercer',
        instructions: 'Confirmez que vous avez obtenu votre autorisation d\'exercer du Ministère de la Santé.'
    },
    'autorisation_travail': {
        titre: 'Autorisation de travail',
        instructions: 'Confirmez que vous avez obtenu votre autorisation finale de travail.'
    }
};

const StepValidationModal = ({ etape, onClose, onSubmit }) => {
    const [justificatif, setJustificatif] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!confirmed) {
            setError('Veuillez confirmer avoir terminé cette étape');
            return;
        }

        if (!justificatif.trim()) {
            setError('Veuillez fournir un justificatif');
            return;
        }

        // Préparer les données de validation
        const validationData = {
            etape: etape,
            justificatif: justificatif,
            dateValidation: new Date().toISOString()
        };

        // Appeler la fonction de soumission
        onSubmit(validationData);
    };

    const currentEtape = ETAPE_DETAILS[etape] || {
        titre: 'Étape',
        instructions: 'Confirmez la progression de votre dossier.'
    };

    return (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-check-double me-2"></i>
                            Valider l'étape : {currentEtape.titre}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                {currentEtape.instructions}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="justificatif" className="form-label">
                                    Justificatif de validation *
                                </label>
                                <textarea 
                                    className="form-control" 
                                    id="justificatif"
                                    rows="4"
                                    placeholder="Décrivez les actions accomplies et confirmez que cette étape est terminée..."
                                    value={justificatif}
                                    onChange={(e) => setJustificatif(e.target.value)}
                                    required
                                ></textarea>
                                <div className="form-text">
                                    Exemple : "J'ai déposé mes diplômes à l'ambassade de France le [date] et j'ai reçu l'attestation d'authentification."
                                </div>
                            </div>

                            <div className="form-check">
                                <input 
                                    type="checkbox" 
                                    className="form-check-input" 
                                    id="confirmValidation"
                                    checked={confirmed}
                                    onChange={(e) => setConfirmed(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="confirmValidation">
                                    Je confirme avoir terminé cette étape et fourni tous les justificatifs requis
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-success"
                                disabled={!confirmed}
                            >
                                <i className="fas fa-check me-2"></i>
                                Valider l'étape
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StepValidationModal;