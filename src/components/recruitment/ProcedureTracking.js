import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Badge, Table, Modal, Spinner } from 'react-bootstrap';
import procedureService from '../../services/procedureService';
import '../../styles/ProcedureTracking.css';

const ProcedureTracking = () => {
  // États pour les données
  const [dossiers, setDossiers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    nouveau: 0,
    en_cours: 0,
    complete: 0
  });
  const [specialites, setSpecialites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);

  // États pour les filtres
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('');
  const [sort, setSort] = useState('date_creation');
  const [order, setOrder] = useState('DESC');

  // États pour les modales
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResendLinkModal, setShowResendLinkModal] = useState(false);
  
  // États pour les formulaires
  const [commentaire, setCommentaire] = useState('');
  const [newDossierData, setNewDossierData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    nationalite: '',
    specialite: '',
    universite: '',
    diplome_pays: ''
  });
  const [confirmEnvoi, setConfirmEnvoi] = useState(false);

  // États pour les notifications et erreurs
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lienAccesGenere, setLienAccesGenere] = useState('');
  const [nomMedecin, setNomMedecin] = useState('');
  const [emailMedecin, setEmailMedecin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Définition des étapes et leur information
  const etapesInfo = {
    'nouveau': {
      titre: 'Dossier créé',
      couleur: 'primary',
      next_step: 'authentification'
    },
    'authentification': {
      titre: 'Authentification des diplômes',
      couleur: 'warning',
      next_step: 'homologation'
    },
    'homologation': {
      titre: 'Demande d\'homologation', 
      couleur: 'info',
      next_step: 'cnom'
    },
    'cnom': {
      titre: 'Enregistrement CNOM',
      couleur: 'purple',
      next_step: 'autorisation_exercer'
    },
    'autorisation_exercer': {
      titre: 'Autorisation d\'exercer',
      couleur: 'success',
      next_step: 'autorisation_travail'
    },
    'autorisation_travail': {
      titre: 'Autorisation de travail',
      couleur: 'success',
      next_step: null
    }
  };

  // Documents requis par étape (réservé pour usage futur)
  // eslint-disable-next-line no-unused-vars
  const documentsRequis = {
    'nouveau': {
      'diplome': 'Diplôme de médecine (original et copie)',
      'piece_identite': 'Pièce d\'identité (passeport)',
      'releves_notes': 'Relevés de notes',
      'acte_naissance': 'Acte de naissance'
    },
    'authentification': {
      'diplome_authentifie': 'Diplômes authentifiés par l\'ambassade',
      'attestation_ambassade': 'Attestation d\'authentification',
      'engagement_rapatriement': 'Engagement de rapatriement'
    },
    'homologation': {
      'demande_homologation': 'Demande d\'homologation complète',
      'attestation_homologation': 'Attestation d\'homologation',
      'certificat_competence': 'Certificat de compétence'
    },
    'cnom': {
      'inscription_cnom': 'Inscription au CNOM',
      'carte_professionnelle': 'Carte professionnelle',
      'attestation_inscription': 'Attestation d\'inscription'
    },
    'autorisation_exercer': {
      'autorisation_exercer': 'Autorisation d\'exercer',
      'certificat_formation': 'Certificat de formation continue'
    },
    'autorisation_travail': {
      'autorisation_travail': 'Autorisation de travail',
      'carte_sejour': 'Carte de séjour',
      'contrat_travail': 'Contrat de travail'
    }
  };

  // Charger les données depuis la base de données
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer les dossiers avec filtres
        const dossiersResponse = await procedureService.getAllDossiers({
          search,
          status: statusFilter,
          specialite: specialiteFilter,
          sort,
          order,
          page: 1,
          limit: 100
        });
        
        setDossiers(dossiersResponse.dossiers || []);
        
        // Récupérer les statistiques
        const statsResponse = await procedureService.getStatistiques();
        setStats({
          total: statsResponse.total || 0,
          nouveau: statsResponse.nouveaux || 0,
          en_cours: statsResponse.en_cours || 0,
          complete: statsResponse.completes || 0
        });
        
        // Extraire les spécialités uniques
        const specialitesUniques = [...new Set(dossiersResponse.dossiers.map(d => d.specialite).filter(Boolean))];
        setSpecialites(specialitesUniques);
        
        // Compter les nouveaux dossiers (créés aujourd'hui) - réservé pour usage futur
        // const aujourdhui = new Date().toISOString().split('T')[0];
        // const nouveauxAujourdhui = dossiersResponse.dossiers.filter(d => 
        //   d.date_creation && d.date_creation.startsWith(aujourdhui)
        // ).length;
        // setNouveauxDossiers(nouveauxAujourdhui);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setErrorMessage('Erreur lors du chargement des données. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [search, statusFilter, specialiteFilter, sort, order]);

  // Gérer la création d'un nouveau dossier
  const handleCreateDossier = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await procedureService.createDossier(newDossierData);
      
      setSuccessMessage(`Dossier créé avec succès pour ${response.dossier.nom} ${response.dossier.prenom}`);
      setLienAccesGenere(response.dossier.lien_acces);
      setNomMedecin(`${response.dossier.nom} ${response.dossier.prenom}`);
      setEmailMedecin(response.dossier.email);
      
      // Réinitialiser le formulaire
      setNewDossierData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        nationalite: '',
        specialite: '',
        universite: '',
        diplome_pays: ''
      });
      
      // Fermer la modale et recharger les données
      setShowCreateModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      setErrorMessage(error.response?.data?.error || 'Erreur lors de la création du dossier');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer l'ajout d'un commentaire
  const handleAddCommentaire = async () => {
    if (!commentaire.trim() || !selectedDossier) return;

    try {
      await procedureService.addCommentaire(selectedDossier.id, {
        commentaire: commentaire.trim(),
        type: 'note',
        admin_id: 1 // ID de l'admin connecté (à adapter selon votre système d'auth)
      });
      
      setSuccessMessage('Commentaire ajouté avec succès');
      setCommentaire('');
      setShowCommentModal(false);
      
      // Recharger les données
      window.location.reload();
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      setErrorMessage('Erreur lors de l\'ajout du commentaire');
    }
  };

  // Gérer la suppression d'un dossier
  const handleDeleteDossier = async () => {
    if (!selectedDossier) return;

    try {
      await procedureService.deleteDossier(selectedDossier.id);
      
      setSuccessMessage('Dossier supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedDossier(null);
      
      // Recharger les données
      window.location.reload();
      
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error);
      setErrorMessage('Erreur lors de la suppression du dossier');
    }
  };

  // Gérer le renvoi du lien d'accès
  const handleResendLink = async () => {
    if (!selectedDossier) return;

    try {
      const response = await procedureService.renvoyerLien(selectedDossier.id);
      
      setSuccessMessage('Nouveau lien d\'accès généré et envoyé');
      setLienAccesGenere(response.lien);
      setNomMedecin(`${selectedDossier.nom} ${selectedDossier.prenom}`);
      setEmailMedecin(selectedDossier.email);
      setShowResendLinkModal(false);
      
    } catch (error) {
      console.error('Erreur lors du renvoi du lien:', error);
      setErrorMessage('Erreur lors du renvoi du lien d\'accès');
    }
  };

  // Gérer le changement de statut (réservé pour usage futur)
  // eslint-disable-next-line no-unused-vars
  const handleStatusChange = async (dossierId, newStatus) => {
    try {
      await procedureService.updateDossier(dossierId, { statut: newStatus });
      setSuccessMessage('Statut mis à jour avec succès');
      
      // Recharger les données
      window.location.reload();
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setErrorMessage('Erreur lors de la mise à jour du statut');
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeColor = (statut) => {
    return etapesInfo[statut]?.couleur || 'secondary';
  };

  // Obtenir le titre du statut
  const getStatusTitle = (statut) => {
    return etapesInfo[statut]?.titre || statut;
  };

  // Filtrer les dossiers
  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = !search || 
      dossier.nom?.toLowerCase().includes(search.toLowerCase()) ||
      dossier.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      dossier.email?.toLowerCase().includes(search.toLowerCase()) ||
      dossier.specialite?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || dossier.statut === statusFilter;
    const matchesSpecialite = !specialiteFilter || dossier.specialite === specialiteFilter;
    
    return matchesSearch && matchesStatus && matchesSpecialite;
  });

  return (
    <div className="container-fluid">
      {/* Messages de succès et d'erreur */}
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger" dismissible onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* En-tête avec statistiques */}
      <div className="row mb-4">
        <div className="col-12">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-clipboard-list me-2"></i>
                Suivi des Procédures Médicales
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-primary">{stats.total}</h3>
                    <p className="text-muted">Total Dossiers</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-warning">{stats.nouveau}</h3>
                    <p className="text-muted">Nouveaux</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-info">{stats.en_cours}</h3>
                    <p className="text-muted">En Cours</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center">
                    <h3 className="text-success">{stats.complete}</h3>
                    <p className="text-muted">Complétés</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="row mb-4">
        <div className="col-12">
          <Card>
            <Card.Body>
              <div className="row g-3">
                <div className="col-md-3">
                  <Form.Control
                    type="text"
                    placeholder="Rechercher par nom, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous les statuts</option>
                    {Object.keys(etapesInfo).map(statut => (
                      <option key={statut} value={statut}>
                        {etapesInfo[statut].titre}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Select
                    value={specialiteFilter}
                    onChange={(e) => setSpecialiteFilter(e.target.value)}
                  >
                    <option value="">Toutes spécialités</option>
                    {specialites.map(specialite => (
                      <option key={specialite} value={specialite}>
                        {specialite}
                      </option>
                    ))}
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="date_creation">Date création</option>
                    <option value="nom">Nom</option>
                    <option value="statut">Statut</option>
                    <option value="specialite">Spécialité</option>
                  </Form.Select>
                </div>
                <div className="col-md-2">
                  <Form.Select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  >
                    <option value="DESC">Décroissant</option>
                    <option value="ASC">Croissant</option>
                  </Form.Select>
                </div>
                <div className="col-md-1">
                  <Button
                    variant="success"
                    onClick={() => setShowCreateModal(true)}
                    className="w-100"
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tableau des dossiers */}
      <div className="row">
        <div className="col-12">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Liste des Dossiers ({filteredDossiers.length})</h5>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center p-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des dossiers...</p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Spécialité</th>
                      <th>Statut</th>
                      <th>Date Création</th>
                      <th>Dernière Modif.</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDossiers.map((dossier) => (
                      <tr key={dossier.id}>
                        <td>
                          <strong>{dossier.nom} {dossier.prenom}</strong>
                          <br />
                          <small className="text-muted">{dossier.telephone}</small>
                        </td>
                        <td>{dossier.email}</td>
                        <td>{dossier.specialite}</td>
                        <td>
                          <Badge bg={getStatusBadgeColor(dossier.statut)}>
                            {getStatusTitle(dossier.statut)}
                          </Badge>
                        </td>
                        <td>{formatDate(dossier.date_creation)}</td>
                        <td>{formatDate(dossier.derniere_modification)}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                setSelectedDossier(dossier);
                                setShowCommentModal(true);
                              }}
                              title="Ajouter un commentaire"
                            >
                              <i className="fas fa-comment"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-warning"
                              onClick={() => {
                                setSelectedDossier(dossier);
                                setShowResendLinkModal(true);
                              }}
                              title="Renvoi lien d'accès"
                            >
                              <i className="fas fa-link"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setSelectedDossier(dossier);
                                setShowDeleteModal(true);
                              }}
                              title="Supprimer"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal de création de dossier */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nouveau Dossier Médical</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Nom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.nom}
                    onChange={(e) => setNewDossierData({...newDossierData, nom: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Prénom *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.prenom}
                    onChange={(e) => setNewDossierData({...newDossierData, prenom: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={newDossierData.email}
                    onChange={(e) => setNewDossierData({...newDossierData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={newDossierData.telephone}
                    onChange={(e) => setNewDossierData({...newDossierData, telephone: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Nationalité</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.nationalite}
                    onChange={(e) => setNewDossierData({...newDossierData, nationalite: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Spécialité</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.specialite}
                    onChange={(e) => setNewDossierData({...newDossierData, specialite: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Université</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.universite}
                    onChange={(e) => setNewDossierData({...newDossierData, universite: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Pays du diplôme</Form.Label>
                  <Form.Control
                    type="text"
                    value={newDossierData.diplome_pays}
                    onChange={(e) => setNewDossierData({...newDossierData, diplome_pays: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateDossier}
            disabled={isSubmitting || !newDossierData.nom || !newDossierData.prenom || !newDossierData.email}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Création...
              </>
            ) : (
              'Créer le dossier'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'ajout de commentaire */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un commentaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Commentaire</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajoutez un commentaire sur ce dossier..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddCommentaire}
            disabled={!commentaire.trim()}
          >
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer le dossier de {selectedDossier?.nom} {selectedDossier?.prenom} ?
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteDossier}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de renvoi de lien */}
      <Modal show={showResendLinkModal} onHide={() => setShowResendLinkModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renvoi du lien d'accès</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Un nouveau lien d'accès sera généré et envoyé à :</p>
          <p><strong>{selectedDossier?.nom} {selectedDossier?.prenom}</strong></p>
          <p><strong>{selectedDossier?.email}</strong></p>
          <p>Êtes-vous sûr de vouloir procéder ?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResendLinkModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleResendLink}>
            Renvoyer le lien
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation d'envoi */}
      <Modal show={confirmEnvoi} onHide={() => setConfirmEnvoi(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Lien d'accès généré</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Le lien d'accès a été généré pour :</p>
          <p><strong>{nomMedecin}</strong></p>
          <p><strong>{emailMedecin}</strong></p>
          <p>Lien d'accès :</p>
          <div className="alert alert-info">
            <code>{lienAccesGenere}</code>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmEnvoi(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProcedureTracking;