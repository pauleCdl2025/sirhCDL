import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import employeeService from '../../services/employeeService';

const EmployeeEditModal = ({ employee, departments, entities, contractTypes, onClose, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Schéma de validation
  const validationSchema = Yup.object().shape({
    nom_prenom: Yup.string().required('Le nom est requis'),
    email: Yup.string().email('Email invalide'),
    poste_actuel: Yup.string(),
    functional_area: Yup.string(),
    entity: Yup.string(),
    type_contrat: Yup.string(),
    date_entree: Yup.date().nullable(),
    date_fin_contrat: Yup.date().nullable().when('type_contrat', {
      is: val => val && val !== 'CDI',
      then: Yup.date().nullable().min(
        Yup.ref('date_entree'), 
        'La date de fin doit être postérieure à la date d\'embauche'
      )
    })
  });

  // Préparer les valeurs initiales
  const getInitialValues = () => {
    return {
      nom_prenom: employee.nom_prenom || '',
      email: employee.email || '',
      telephone: employee.telephone || '',
      poste_actuel: employee.poste_actuel || '',
      functional_area: employee.functional_area || '',
      entity: employee.entity || '',
      type_contrat: employee.type_contrat || '',
      date_entree: employee.date_entree && employee.date_entree !== '0000-00-00' 
        ? new Date(employee.date_entree).toISOString().split('T')[0] 
        : '',
      date_fin_contrat: employee.date_fin_contrat && employee.date_fin_contrat !== '0000-00-00' 
        ? new Date(employee.date_fin_contrat).toISOString().split('T')[0] 
        : ''
    };
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSaving(true);
      setError(null);
      
      console.log("Soumission du formulaire avec les valeurs:", values);
      
      // Mise à jour de l'employé via l'API
      const updatedEmployee = await employeeService.update(employee.id, values);
      
      // Informer le parent du succès
      if (onUpdate) {
        onUpdate(updatedEmployee);
      }
      
      // Fermer le modal
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError('Une erreur est survenue lors de la mise à jour de l\'employé.');
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 text-white flex justify-between items-center" style={{background: 'var(--gradient-primary)'}}>
          <h3 className="text-xl font-bold">Modifier l'employé</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting, handleSubmit }) => (
            <>
              <div className="flex-grow overflow-y-auto p-6">
                <Form id="employee-edit-form" className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 102 0v-5a1 1 0 10-2 0v5z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom_prenom" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="nom_prenom"
                        id="nom_prenom"
                        className={`block w-full rounded-md shadow-sm ${errors.nom_prenom && touched.nom_prenom ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                      />
                      <ErrorMessage name="nom_prenom" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={`block w-full rounded-md shadow-sm ${errors.email && touched.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <Field
                        type="tel"
                        name="telephone"
                        id="telephone"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="poste_actuel" className="block text-sm font-medium text-gray-700 mb-1">
                        Poste
                      </label>
                      <Field
                        type="text"
                        name="poste_actuel"
                        id="poste_actuel"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="functional_area" className="block text-sm font-medium text-gray-700 mb-1">
                        Département
                      </label>
                      <Field
                        as="select"
                        name="functional_area"
                        id="functional_area"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sélectionnez un département</option>
                        {departments && departments.map((dept, index) => (
                          <option key={index} value={dept}>{dept}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div>
                      <label htmlFor="entity" className="block text-sm font-medium text-gray-700 mb-1">
                        Entité
                      </label>
                      <Field
                        as="select"
                        name="entity"
                        id="entity"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sélectionnez une entité</option>
                        {entities && entities.map((entity, index) => (
                          <option key={index} value={entity}>{entity}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div>
                      <label htmlFor="type_contrat" className="block text-sm font-medium text-gray-700 mb-1">
                        Type de contrat
                      </label>
                      <Field
                        as="select"
                        name="type_contrat"
                        id="type_contrat"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Sélectionnez un type</option>
                        {contractTypes && contractTypes.map((type, index) => (
                          <option key={index} value={type}>{type}</option>
                        ))}
                      </Field>
                    </div>
                    
                    <div>
                      <label htmlFor="date_entree" className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'embauche
                      </label>
                      <Field
                        type="date"
                        name="date_entree"
                        id="date_entree"
                        className={`block w-full rounded-md shadow-sm ${errors.date_entree && touched.date_entree ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} sm:text-sm`}
                      />
                      <ErrorMessage name="date_entree" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="date_fin_contrat" className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fin de contrat
                        {values.type_contrat && values.type_contrat !== 'CDI' && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <Field
                        type="date"
                        name="date_fin_contrat"
                        id="date_fin_contrat"
                        className={`block w-full rounded-md shadow-sm ${
                          errors.date_fin_contrat && touched.date_fin_contrat ? 
                          'border-red-300 focus:ring-red-500 focus:border-red-500' : 
                          'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } ${values.type_contrat === 'CDI' ? 'bg-gray-100' : ''} sm:text-sm`}
                        disabled={values.type_contrat === 'CDI'}
                      />
                      <ErrorMessage name="date_fin_contrat" component="div" className="mt-1 text-sm text-red-600" />
                      {values.type_contrat === 'CDI' && (
                        <p className="mt-1 text-sm text-gray-500">Non applicable pour un CDI</p>
                      )}
                    </div>
                  </div>
                </Form>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    // Déclencher manuellement la soumission du formulaire
                    const form = document.getElementById('employee-edit-form');
                    if (form) {
                      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  style={{background: 'var(--gradient-primary)'}}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </button>
              </div>
            </>
          )}
        </Formik>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default EmployeeEditModal;