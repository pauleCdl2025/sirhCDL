import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { changePassword } from '../../services/api';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

// Schéma de validation Yup
const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Le mot de passe actuel est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  newPassword: Yup.string()
    .required('Le nouveau mot de passe est requis')
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: Yup.string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
});

const ChangePasswordModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Initialisation des valeurs du formulaire
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Appel à l'API pour changer le mot de passe
      await changePassword({
        employeeId: user.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      // Succès
      onSuccess('Votre mot de passe a été modifié avec succès. Vous devrez vous reconnecter.');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Le mot de passe actuel est incorrect ou le nouveau mot de passe ne respecte pas les critères.';
        setError(message);
      } else if (error.response?.status === 401) {
        setError(error.response?.data?.message || 'L\'ancien mot de passe est incorrect.');
      } else if (error.response?.status === 404) {
        setError(error.response?.data?.message || 'Employé non trouvé.');
      } else if (error.response?.status === 422) {
        setError('Le nouveau mot de passe ne respecte pas les critères de sécurité.');
      } else {
        const message = error.response?.data?.message || error.message || 'Une erreur est survenue lors du changement de mot de passe. Veuillez réessayer.';
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fermer la modal
  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content change-password-modal">
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="fas fa-key me-2"></i>
            Changer le mot de passe
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          ></button>
        </div>

        <div className="modal-body">
          {/* Message d'information */}
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Critères de sécurité :</strong> Votre nouveau mot de passe doit contenir au moins 8 caractères, 
            incluant une minuscule, une majuscule, un chiffre et un caractère spécial.
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={ChangePasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, values }) => (
              <Form>
                {/* Mot de passe actuel */}
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Mot de passe actuel <span className="text-danger">*</span>
                  </label>
                  <div className="password-input-group">
                    <Field
                      name="currentPassword"
                      type={showPassword.current ? 'text' : 'password'}
                      className={`form-control ${errors.currentPassword && touched.currentPassword ? 'is-invalid' : ''}`}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('current')}
                      title={showPassword.current ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas ${showPassword.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <ErrorMessage name="currentPassword" component="div" className="invalid-feedback" />
                </div>

                {/* Nouveau mot de passe */}
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    Nouveau mot de passe <span className="text-danger">*</span>
                  </label>
                  <div className="password-input-group">
                    <Field
                      name="newPassword"
                      type={showPassword.new ? 'text' : 'password'}
                      className={`form-control ${errors.newPassword && touched.newPassword ? 'is-invalid' : ''}`}
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('new')}
                      title={showPassword.new ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <ErrorMessage name="newPassword" component="div" className="invalid-feedback" />
                  
                  {/* Indicateur de force du mot de passe amélioré */}
                  {values.newPassword && (
                    <PasswordStrengthIndicator password={values.newPassword} />
                  )}
                </div>

                {/* Confirmation du nouveau mot de passe */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le nouveau mot de passe <span className="text-danger">*</span>
                  </label>
                  <div className="password-input-group">
                    <Field
                      name="confirmPassword"
                      type={showPassword.confirm ? 'text' : 'password'}
                      className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => togglePasswordVisibility('confirm')}
                      title={showPassword.confirm ? 'Masquer' : 'Afficher'}
                    >
                      <i className={`fas ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                </div>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Modification...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Modifier le mot de passe
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
  );
};

export default ChangePasswordModal;
