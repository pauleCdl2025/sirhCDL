import React, { useState } from 'react';

const GUIDES = {
    'authentification': {
        title: 'Guide d\'Authentification des Diplômes',
        content: `
            <div class="mb-4">
                <h6 class="text-primary"><i class="fas fa-map-marker-alt me-2"></i>Étapes d'authentification :</h6>
                <ol class="mb-3">
                    <li><strong>Ambassades :</strong> Présentation des diplômes originaux pour vérification et certification.</li>
                    <li><strong>Université Omar Bongo (UOB) :</strong> Légalisation au service correspondant (1er étage, bâtiment du Secrétariat Général).</li>
                    <li><strong>Ministère des Affaires Étrangères :</strong> Légalisation finale (1er étage, quartier Bat IV, près du Collège René Descartes).</li>
                </ol>
            </div>
            
            <div class="mb-4">
                <h6 class="text-success"><i class="fas fa-file-alt me-2"></i>Documents requis :</h6>
                <ul>
                    <li>Diplômes originaux</li>
                    <li>Copies certifiées conformes</li>
                    <li>Relevés de notes originaux</li>
                    <li>Pièce d'identité</li>
                </ul>
            </div>
            
            <div class="alert alert-warning">
                <i class="fas fa-clock me-2"></i>
                <strong>Délai :</strong> Cette étape peut prendre 2-4 semaines selon les délais des administrations.
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Important :</strong> Les diplômes français sont exempts d'authentification ambassade.
            </div>
        `
    },
    'homologation': {
        title: 'Guide d\'Homologation des Diplômes',
        content: `
            <div class="mb-4">
                <h6 class="text-primary"><i class="fas fa-building me-2"></i>Direction Générale des Examens et Concours (DGEC) :</h6>
                <address class="mb-3">
                    <strong>Localisation :</strong><br>
                    Quartier Montagne Sainte<br>
                    Immeuble SATCON<br>
                    Service Homologation des Diplômes
                </address>
            </div>
            
            <div class="mb-4">
                <h6 class="text-success"><i class="fas fa-tasks me-2"></i>Procédure :</h6>
                <ol>
                    <li>Déposer le dossier complet au service homologation</li>
                    <li>Attendre la validation des autorités compétentes</li>
                    <li>Récupérer l'attestation d'homologation</li>
                </ol>
            </div>
            
            <div class="mb-4">
                <h6 class="text-info"><i class="fas fa-file-check me-2"></i>Documents à fournir :</h6>
                <ul>
                    <li>Diplômes légalisés par l'UOB</li>
                    <li>Diplômes légalisés par le MAE</li>
                    <li>Dossier de demande d'homologation complet</li>
                    <li>Relevés de notes légalisés</li>
                </ul>
            </div>
            
            <div class="alert alert-warning">
                <i class="fas fa-hourglass-half me-2"></i>
                <strong>Délai :</strong> Variable selon la validation des autorités compétentes (généralement 3-6 semaines).
            </div>
        `
    },
    'autorisation': {
        title: 'Guide d\'Autorisation d\'Exercer',
        content: `
            <div class="mb-4">
                <h6 class="text-primary"><i class="fas fa-hospital me-2"></i>Ministère de la Santé :</h6>
                <p>Demande d'autorisation d'exercer auprès des services compétents du Ministère de la Santé.</p>
            </div>
            
            <div class="mb-4">
                <h6 class="text-success"><i class="fas fa-id-card me-2"></i>Conseil National de l'Ordre des Médecins (CNOM) :</h6>
                <p>Procédure d'enregistrement pour obtenir votre numéro d'identification médical officiel.</p>
                <ul>
                    <li>Reconnaissance officielle en tant que praticien</li>
                    <li>Autorisation légale d'exercer au Gabon</li>
                    <li>Numéro d'identification unique</li>
                </ul>
            </div>
            
            <div class="mb-4">
                <h6 class="text-info"><i class="fas fa-clipboard-list me-2"></i>Documents requis :</h6>
                <ul>
                    <li>Attestation d'homologation</li>
                    <li>Numéro d'enregistrement CNOM</li>
                    <li>Certificat médical de moins de 3 mois</li>
                    <li>Extrait de casier judiciaire</li>
                    <li>Photos d'identité récentes</li>
                </ul>
            </div>
            
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Objectif :</strong> Cette étape vous permet d'obtenir l'autorisation officielle d'exercer la médecine au Gabon.
            </div>
            
            <div class="alert alert-info">
                <i class="fas fa-briefcase me-2"></i>
                <strong>Étape finale :</strong> Après cette autorisation, il ne reste plus que la demande d'autorisation de travail auprès du Ministère du Travail.
            </div>
        `
    }
};

const ProcedureGuideModal = ({ guide = 'authentification', onClose }) => {
    const selectedGuide = GUIDES[guide] || GUIDES['authentification'];

    return (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-info text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-book me-2"></i>
                            {selectedGuide.title}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div dangerouslySetInnerHTML={{ __html: selectedGuide.content }} />
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcedureGuideModal;