import React, { useState } from 'react';

const DocumentUploadModal = ({ documentType, onClose, onSubmit }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        // Validation du fichier
        const allowedTypes = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            'image/jpeg', 
            'image/png'
        ];
        
        if (selectedFile) {
            // Vérifier la taille (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('Le fichier est trop volumineux. Taille maximale: 5MB');
                return;
            }
            
            // Vérifier le type de fichier
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Format de fichier non supporté. Utilisez: PDF, DOC, DOCX, JPG, PNG');
                return;
            }
            
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        // Préparer les données du document
        const documentData = {
            type: documentType.type,
            nom: file.name,
            taille: file.size,
            file: file,
            description: description,
            dateUpload: new Date().toISOString()
        };

        // Appeler la fonction de soumission
        onSubmit(documentData);
    };

    return (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-upload me-2"></i>
                            Télécharger : {documentType.nom}
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

                            <div className="mb-3">
                                <label htmlFor="documentFile" className="form-label">
                                    Fichier *
                                </label>
                                <input 
                                    type="file" 
                                    className="form-control" 
                                    id="documentFile"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    required
                                />
                                <div className="form-text">
                                    Formats acceptés : PDF, DOC, DOCX, JPG, PNG<br />
                                    Taille maximale : 5MB
                                </div>
                            </div>

                            {file && (
                                <div className="mb-3">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <i className={`fas fa-file-${
                                                        file.type.includes('pdf') ? 'pdf' :
                                                        file.type.includes('word') ? 'word' :
                                                        file.type.includes('image') ? 'image' : 
                                                        'alt'
                                                    } fa-2x text-primary`}></i>
                                                </div>
                                                <div>
                                                    <strong>{file.name}</strong>
                                                    <div className="text-muted">
                                                        {(file.size / 1024).toFixed(2)} Ko
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-3">
                                <label htmlFor="documentDescription" className="form-label">
                                    Description (optionnel)
                                </label>
                                <textarea 
                                    className="form-control" 
                                    id="documentDescription"
                                    rows="3"
                                    placeholder="Informations complémentaires sur le document"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
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
                                className="btn btn-primary"
                                disabled={!file}
                            >
                                <i className="fas fa-upload me-2"></i>
                                Télécharger
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;