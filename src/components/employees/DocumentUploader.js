import React, { useState } from 'react';

const DOCUMENT_TYPES = [
    { value: 'CNI', label: 'Carte d\'identité / Passeport' },
    { value: 'CV', label: 'CV' },
    { value: 'Diplome', label: 'Diplôme' },
    { value: 'Certificat', label: 'Certificat' },
    { value: 'Contrat', label: 'Contrat de travail' },
    { value: 'CNSS', label: 'Attestation CNSS' },
    { value: 'CNAMGS', label: 'Attestation CNAMGS' },
    { value: 'Autre', label: 'Autre document' }
];

const DocumentUploader = ({ documents, onDocumentUpload }) => {
    const [localDocuments, setLocalDocuments] = useState(documents || []);

    const handleAddDocument = () => {
        const newDocument = {
            type: '',
            file: null,
            preview: null
        };
        setLocalDocuments(prev => [...prev, newDocument]);
    };

    const handleDocumentTypeChange = (index, type) => {
        const updatedDocuments = [...localDocuments];
        updatedDocuments[index].type = type;
        setLocalDocuments(updatedDocuments);
    };

    const handleFileChange = (index, file) => {
        const updatedDocuments = [...localDocuments];
        updatedDocuments[index].file = file;
        updatedDocuments[index].preview = URL.createObjectURL(file);
        setLocalDocuments(updatedDocuments);

        // Notify parent component about document upload
        onDocumentUpload(updatedDocuments);
    };

    const handleRemoveDocument = (index) => {
        const updatedDocuments = localDocuments.filter((_, i) => i !== index);
        setLocalDocuments(updatedDocuments);
        onDocumentUpload(updatedDocuments);
    };

    return (
        <div className="document-upload-container">
            <h3 className="form-section-title">Documents du dossier employé</h3>
            
            <div className="alert alert-info mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Téléversez les documents du dossier employé (CNI, diplômes, certificats, etc.)
            </div>

            {localDocuments.map((doc, index) => (
                <div key={index} className="document-item mb-3 p-3 border rounded">
                    <div className="row">
                        <div className="col-md-5">
                            <label className="form-label">Type de document</label>
                            <select 
                                className="form-select" 
                                value={doc.type}
                                onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {DOCUMENT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Fichier</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(index, e.target.files[0])}
                                required
                            />
                        </div>
                        <div className="col-md-1 d-flex align-items-end">
                            {localDocuments.length > 1 && (
                                <button 
                                    type="button" 
                                    className="btn btn-danger"
                                    onClick={() => handleRemoveDocument(index)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {doc.preview && (
                        <div className="document-preview mt-3">
                            {doc.file.type.startsWith('image/') ? (
                                <img 
                                    src={doc.preview} 
                                    alt="Document preview" 
                                    className="img-thumbnail" 
                                    style={{ maxHeight: '200px', maxWidth: '100%' }}
                                />
                            ) : (
                                <div className="alert alert-info d-flex align-items-center">
                                    <i className="fas fa-file-alt me-2"></i>
                                    <span>{doc.file.name}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="mt-3">
                <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={handleAddDocument}
                >
                    <i className="fas fa-plus me-2"></i>Ajouter un document
                </button>
            </div>
        </div>
    );
};

export default DocumentUploader;