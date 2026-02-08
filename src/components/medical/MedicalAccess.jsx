import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faFileAlt, faUpload, faTimes, faClock, faEye,
  faDownload, faComment, faBell, faLock
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/MedicalAccess.css';

const MedicalAccess = () => {
  const { token } = useParams();
  const [dossier, setDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [commentaires, setCommentaires] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Schéma de validation pour l'upload de documents
  const uploadSchema = Yup.object().shape({
    commentaire: Yup.string().max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
  });

  const fetchDossierData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/procedures/access/${token}`);
      const { dossier, documents, commentaires, notifications } = response.data;
      
      setDossier(dossier);
      setDocuments(documents || []);
      setCommentaires(commentaires || []);
      setNotifications(notifications || []);
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier:', error);
      setError('Token d\'accès invalide ou expiré');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDossierData();
    }
  }, [token, fetchDossierData]);

  const handleDocumentUpload = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('document', selectedDocument);
      formData.append('document_requis_id', selectedDocument.requis_id);
      if (values.commentaire) {
        formData.append('commentaire', values.commentaire);
      }

      await axios.post(`/api/procedures/dossiers/${dossier.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Recharger les données
      await fetchDossierData();
      setShowUploadModal(false);
      setSelectedDocument(null);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du document');
    }
  };

  const getStatusColor = (statut) => {
    const colors = {
      'nouveau': 'primary',
      'authentification': 'warning',
      'homologation': 'info',
      'cnom': 'purple',
      'autorisation_exercer': 'success',
      'autorisation_travail': 'success'
    };
    return colors[statut] || 'secondary';
  };

  const getStatusTitle = (statut) => {
    const titles = {
      'nouveau': 'Dossier créé',
      'authentification': 'Authentification des diplômes',
      'homologation': 'Demande d\'homologation',
      'cnom': 'Enregistrement CNOM',
      'autorisation_exercer': 'Autorisation d\'exercer',
      'autorisation_travail': 'Autorisation de travail'
    };
    return titles[statut] || statut;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="medical-access-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-3">Chargement de votre dossier...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medical-access-error">
        <div className="error-container">
          <FontAwesomeIcon icon={faLock} className="error-icon" />
          <h2>Accès refusé</h2>
          <p>{error}</p>
          <p>Veuillez contacter l'administration pour obtenir un nouveau lien d'accès.</p>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="medical-access-error">
        <div className="error-container">
          <FontAwesomeIcon icon={faTimes} className="error-icon" />
          <h2>Dossier non trouvé</h2>
          <p>Le dossier associé à ce lien n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-access-container">
      {/* Header */}
      <div className="medical-access-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1>
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Portail d'accès médical
              </h1>
              <p className="text-muted">
                Bienvenue, Dr. {dossier.prenom} {dossier.nom}
              </p>
            </div>
            <div className="col-md-4 text-end">
              <div className={`badge bg-${getStatusColor(dossier.statut)} fs-6`}>
                {getStatusTitle(dossier.statut)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="medical-access-nav">
        <div className="container">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FontAwesomeIcon icon={faEye} className="me-2" />
                Vue d'ensemble
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                Documents ({documents.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                <FontAwesomeIcon icon={faComment} className="me-2" />
                Commentaires ({commentaires.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <FontAwesomeIcon icon={faBell} className="me-2" />
                Notifications ({notifications.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content */}
      <div className="medical-access-content">
        <div className="container">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5>
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Informations personnelles
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Nom :</strong> {dossier.nom}</p>
                        <p><strong>Prénom :</strong> {dossier.prenom}</p>
                        <p><strong>Email :</strong> {dossier.email}</p>
                        <p><strong>Téléphone :</strong> {dossier.telephone}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Nationalité :</strong> {dossier.nationalite}</p>
                        <p><strong>Spécialité :</strong> {dossier.specialite}</p>
                        <p><strong>Université :</strong> {dossier.universite}</p>
                        <p><strong>Pays du diplôme :</strong> {dossier.diplome_pays}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {dossier.commentaire && (
                  <div className="card mt-3">
                    <div className="card-header">
                      <h5>
                        <FontAwesomeIcon icon={faComment} className="me-2" />
                        Commentaire administratif
                      </h5>
                    </div>
                    <div className="card-body">
                      <p>{dossier.commentaire}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5>
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      Dates importantes
                    </h5>
                  </div>
                  <div className="card-body">
                    <p><strong>Création :</strong> {formatDate(dossier.date_creation)}</p>
                    <p><strong>Dernière modification :</strong> {formatDate(dossier.derniere_modification)}</p>
                    {dossier.date_expiration_token && (
                      <p><strong>Expiration du lien :</strong> {formatDate(dossier.date_expiration_token)}</p>
                    )}
                  </div>
                </div>

                <div className="card mt-3">
                  <div className="card-header">
                    <h5>
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                      Statistiques
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Documents soumis :</span>
                      <span className="badge bg-primary">{documents.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Commentaires :</span>
                      <span className="badge bg-info">{commentaires.length}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Notifications :</span>
                      <span className="badge bg-warning">{notifications.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5>
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                      Documents soumis
                    </h5>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <FontAwesomeIcon icon={faUpload} className="me-2" />
                      Ajouter un document
                    </button>
                  </div>
                  <div className="card-body">
                    {documents.length === 0 ? (
                      <p className="text-muted">Aucun document soumis pour le moment.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Document</th>
                              <th>Description</th>
                              <th>Date de soumission</th>
                              <th>Statut</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.map((doc) => (
                              <tr key={doc.id}>
                                <td>
                                  <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                                  {doc.nom_fichier}
                                </td>
                                <td>{doc.description_document}</td>
                                <td>{formatDate(doc.date_soumission)}</td>
                                <td>
                                  <span className={`badge bg-${
                                    doc.statut === 'approuve' ? 'success' : 
                                    doc.statut === 'rejete' ? 'danger' : 'warning'
                                  }`}>
                                    {doc.statut === 'approuve' ? 'Approuvé' :
                                     doc.statut === 'rejete' ? 'Rejeté' : 'En attente'}
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <FontAwesomeIcon icon={faDownload} />
                                  </button>
                                  <button className="btn btn-sm btn-outline-info">
                                    <FontAwesomeIcon icon={faEye} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commentaires */}
          {activeTab === 'comments' && (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5>
                      <FontAwesomeIcon icon={faComment} className="me-2" />
                      Commentaires et notes
                    </h5>
                  </div>
                  <div className="card-body">
                    {commentaires.length === 0 ? (
                      <p className="text-muted">Aucun commentaire pour le moment.</p>
                    ) : (
                      <div className="comment-list">
                        {commentaires.map((comment) => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-type badge bg-secondary me-2">
                                {comment.type}
                              </span>
                              <span className="comment-date text-muted">
                                {formatDate(comment.date_creation)}
                              </span>
                            </div>
                            <div className="comment-content">
                              {comment.commentaire}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5>
                      <FontAwesomeIcon icon={faBell} className="me-2" />
                      Notifications reçues
                    </h5>
                  </div>
                  <div className="card-body">
                    {notifications.length === 0 ? (
                      <p className="text-muted">Aucune notification pour le moment.</p>
                    ) : (
                      <div className="notification-list">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="notification-item">
                            <div className="notification-header">
                              <span className="notification-type badge bg-primary me-2">
                                {notif.type}
                              </span>
                              <span className="notification-date text-muted">
                                {formatDate(notif.date_envoi)}
                              </span>
                            </div>
                            <div className="notification-subject">
                              <strong>{notif.sujet}</strong>
                            </div>
                            <div className="notification-content">
                              {notif.contenu}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'upload de document */}
      {showUploadModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faUpload} className="me-2" />
                  Ajouter un document
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <Formik
                initialValues={{ commentaire: '' }}
                validationSchema={uploadSchema}
                onSubmit={handleDocumentUpload}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label">Sélectionner un document :</label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setSelectedDocument(file);
                            }
                          }}
                          required
                        />
                        <small className="text-muted">
                          Formats acceptés : PDF, DOC, DOCX, JPG, PNG (max 10MB)
                        </small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Commentaire (optionnel) :</label>
                        <Field
                          as="textarea"
                          name="commentaire"
                          className="form-control"
                          rows="3"
                          placeholder="Ajouter un commentaire sur ce document..."
                        />
                        <ErrorMessage name="commentaire" component="div" className="text-danger" />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setShowUploadModal(false)}
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting || !selectedDocument}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUpload} className="me-2" />
                            Uploader
                          </>
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalAccess;
