import { useState, useEffect } from "react";
import { X, Calendar, Clock, Info } from "lucide-react";

const RenewalModal = ({ employee, onClose, onConfirm }) => {
  const [renewalData, setRenewalData] = useState({
    contractType: employee?.type_contrat || "",
    contractDuration: "",
    durationUnit: "mois",
    startDate: "",
    endDate: "",
    comments: ""
  });
  
  const [showSummary, setShowSummary] = useState(false);

  // Initialize start date as the day after contract end date
  useEffect(() => {
    if (employee?.date_fin_contrat) {
      const endDate = new Date(employee.date_fin_contrat);
      const nextDay = new Date(endDate);
      nextDay.setDate(endDate.getDate() + 1);
      
      setRenewalData(prev => ({
        ...prev,
        startDate: nextDay.toISOString().split("T")[0]
      }));
    } else {
      // If no end date, use tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setRenewalData(prev => ({
        ...prev,
        startDate: tomorrow.toISOString().split("T")[0]
      }));
    }
  }, [employee]);

  // Calculate end date when duration changes
  useEffect(() => {
    if (renewalData.contractType !== "CDI" && 
        renewalData.contractDuration && 
        renewalData.startDate) {
      
      const startDate = new Date(renewalData.startDate);
      const endDate = new Date(startDate);
      
      if (renewalData.durationUnit === "mois") {
        endDate.setMonth(startDate.getMonth() + parseInt(renewalData.contractDuration));
      } else {
        endDate.setFullYear(startDate.getFullYear() + parseInt(renewalData.contractDuration));
      }
      
      setRenewalData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0]
      }));
    }
  }, [renewalData.contractDuration, renewalData.durationUnit, renewalData.startDate, renewalData.contractType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRenewalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Show summary before final confirmation
    if (!showSummary) {
      setShowSummary(true);
      return;
    }
    
    onConfirm(renewalData);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-bold">
              Renouvellement de contrat
            </h5>
            <button 
              className="text-white hover:text-gray-200"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="p-4">
          {employee && (
            <div className="mb-4 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <h6 className="text-blue-600 font-semibold mb-1">Informations de l'employé</h6>
              <p className="mb-1 text-sm"><strong>Nom :</strong> {employee.noms}</p>
              <p className="mb-1 text-sm"><strong>Poste :</strong> {employee.poste_actuel}</p>
              <p className="mb-1 text-sm">
                <strong>Contrat actuel :</strong> {employee.type_contrat}
                {employee.date_fin_contrat && 
                  <span className="ml-2">
                    (fin le {formatDate(employee.date_fin_contrat)})
                  </span>
                }
              </p>
            </div>
          )}
          
          {showSummary ? (
            <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500 mb-4 animate-fadeIn">
              <h6 className="text-blue-500 font-semibold mb-2">Résumé du renouvellement</h6>
              <p className="mb-1 text-sm"><strong>Type de contrat :</strong> {renewalData.contractType}</p>
              
              {renewalData.contractType !== "CDI" && (
                <>
                  <p className="mb-1 text-sm">
                    <strong>Durée :</strong> {renewalData.contractDuration} {renewalData.durationUnit}
                  </p>
                </>
              )}
              
              <p className="mb-1 text-sm">
                <strong>Date de début :</strong> {formatDate(renewalData.startDate)}
              </p>
              
              {renewalData.contractType !== "CDI" && (
                <p className="mb-1 text-sm">
                  <strong>Date de fin :</strong> {formatDate(renewalData.endDate)}
                </p>
              )}
              
              {renewalData.comments && (
                <p className="mb-1 text-sm">
                  <strong>Commentaires :</strong> {renewalData.comments}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                <select 
                  id="contractType"
                  name="contractType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={renewalData.contractType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Prestataire">Prestataire</option>
                  <option value="Stage">Stage</option>
                  <option value="stage PNPE">Stage PNPE</option>
                  <option value="Intérim">Intérim</option>
                </select>
              </div>
              
              {renewalData.contractType !== "CDI" && renewalData.contractType && (
                <div className="mb-3">
                  <label htmlFor="contractDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Durée du contrat
                  </label>
                  <div className="flex">
                    <input 
                      type="number"
                      id="contractDuration"
                      name="contractDuration"
                      className="w-2/3 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={renewalData.contractDuration}
                      onChange={handleInputChange}
                      min="1"
                      max="60"
                      required={renewalData.contractType !== "CDI"}
                    />
                    <select
                      id="durationUnit"
                      name="durationUnit"
                      className="w-1/3 px-3 py-2 border border-gray-300 border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={renewalData.durationUnit}
                      onChange={handleInputChange}
                    >
                      <option value="mois">Mois</option>
                      <option value="annees">Années</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input 
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={renewalData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {renewalData.contractType !== "CDI" && renewalData.contractType && (
                <div className="mb-3">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input 
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={renewalData.endDate}
                    onChange={handleInputChange}
                    readOnly={renewalData.contractDuration !== ""}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <Info className="inline h-3 w-3 mr-1" /> 
                    {renewalData.contractDuration 
                      ? "Calculée automatiquement selon la durée" 
                      : "Définissez une durée ou choisissez une date de fin directement"}
                  </p>
                </div>
              )}
              
              <div className="mb-3">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Commentaires
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Commentaires ou instructions spécifiques..."
                  value={renewalData.comments}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </form>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 rounded-b-lg">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded flex items-center"
            onClick={handleSubmit}
          >
            {showSummary ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" /> Confirmer le renouvellement
              </>
            ) : (
              "Continuer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewalModal;