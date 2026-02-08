# 📚 MANUEL D'UTILISATION COMPLET
## Système d'Information des Ressources Humaines (SIRH) - Centre Diagnostic

---

## 📋 TABLE DES MATIÈRES

1. [Introduction et Vue d'ensemble](#introduction-et-vue-densemble)
2. [Accès et Authentification](#accès-et-authentification)
3. [Tableau de Bord Principal](#tableau-de-bord-principal)
4. [Gestion des Employés](#gestion-des-employés)
5. [Gestion des Congés et Absences](#gestion-des-congés-et-absences)
6. [Gestion des Contrats](#gestion-des-contrats)
7. [Gestion des Événements](#gestion-des-événements)
8. [Recrutement et Onboarding](#recrutement-et-onboarding)
9. [Suivi Médical](#suivi-médical)
10. [Portail Employé](#portail-employé)
11. [Agent Vocal](#agent-vocal)
12. [Gestion RH](#gestion-rh)
13. [Notes de Service](#notes-de-service)
14. [Demandes Employés](#demandes-employés)
15. [Documents et Rapports](#documents-et-rapports)
16. [Dépannage et Support](#dépannage-et-support)

---

## 🎯 INTRODUCTION ET VUE D'ENSEMBLE

### Qu'est-ce que le SIRH Centre Diagnostic ?
Le SIRH (Système d'Information des Ressources Humaines) est une plateforme complète de gestion des ressources humaines développée pour le Centre Diagnostic. Elle permet de gérer l'ensemble du cycle de vie des employés, des processus RH et de l'administration du personnel.

### Architecture technique
- **Frontend** : Application React.js moderne avec interface responsive
- **Backend** : API Node.js avec base de données SQL
- **Authentification** : Système multi-niveaux (Admin, Employé, Médecin)
- **Fonctionnalités avancées** : Agent vocal, gestion documentaire, tableaux de bord

### Fonctionnalités principales
- ✅ Gestion complète des employés (CRUD)
- ✅ Gestion des congés et absences
- ✅ Suivi des contrats avec alertes
- ✅ Recrutement et onboarding/offboarding
- ✅ Suivi médical et visites
- ✅ Gestion des événements
- ✅ Portail employé autonome
- ✅ Agent vocal intelligent
- ✅ Notes de service
- ✅ Gestion des demandes employés
- ✅ Rapports et statistiques avancés
- ✅ Interface responsive et moderne

---

## 🔐 ACCÈS ET AUTHENTIFICATION

### Types d'utilisateurs et permissions

#### 1. Administrateur RH (Admin)
- **Accès** : Interface complète d'administration
- **Permissions** : Toutes les fonctionnalités
- **URL** : `/login`
- **Fonctionnalités** : Gestion complète des employés, contrats, congés, événements

#### 2. Employé
- **Accès** : Portail employé limité
- **Permissions** : Consultation personnelle, demandes de congés
- **URL** : `/employee-login`
- **Fonctionnalités** : Fiche personnelle, demandes, historique

#### 3. Médecin
- **Accès** : Suivi des dossiers médicaux
- **Permissions** : Gestion des procédures médicales
- **URL** : `/medical-login`
- **Fonctionnalités** : Suivi des dossiers, validation des procédures

### Procédure de connexion

#### Connexion Administrateur
1. **Ouvrir le navigateur** et aller à l'URL de l'application
2. **Aller sur la page de connexion** (`/login`)
3. **Saisir les identifiants** :
   - Nom d'utilisateur ou email
   - Mot de passe
4. **Cliquer sur "Se connecter"**
5. **Redirection automatique** vers le tableau de bord

#### Connexion Employé
1. **Accéder à** `/employee-login`
2. **Saisir le matricule** et mot de passe
3. **Première connexion** : Changement de mot de passe obligatoire
4. **Accès au portail employé**

#### Connexion Médecin
1. **Accéder à** `/medical-login`
2. **Authentification** avec identifiants médicaux
3. **Accès au suivi des dossiers**

### Récupération de mot de passe
- Cliquer sur "Mot de passe oublié ?"
- Saisir l'email associé au compte
- Suivre les instructions reçues par email
- **Important** : Vérifier le dossier spam

### Sécurité et bonnes pratiques
- **Déconnexion obligatoire** après utilisation
- **Mot de passe fort** : 8 caractères minimum, majuscules, chiffres
- **Ne pas partager** ses identifiants
- **Changement régulier** du mot de passe

---

## 📊 TABLEAU DE BORD PRINCIPAL

### Vue d'ensemble
Le tableau de bord (`/dashboard`) offre une vision complète de l'état de l'organisation avec des indicateurs clés et des actions rapides.

### Widgets et statistiques

#### 1. Cartes statistiques principales
- **Collaborateurs** : Effectif total actif
- **Congés en attente** : Demandes à traiter
- **Entreprises** : Nombre d'entités gérées
- **Événements cette semaine** : Activités planifiées

#### 2. Outils d'action rapide
- **Notes de service** : Accès direct aux notes publiques
- **Gestion des employés** : Ajout, modification, consultation
- **Gestion des congés** : Traitement des demandes
- **Événements** : Planification et gestion
- **Contrats** : Suivi et alertes
- **Recrutement** : Processus et historique

#### 3. Section événements
- **Événements à venir** : Liste des activités planifiées
- **Actions** : Créer, modifier, supprimer des événements
- **Filtres** : Par date, type, département

#### 4. Notes de service publiques
- **Notes récentes** : Dernières communications
- **Catégories** : Information, Organisation, Sécurité
- **Actions** : Consultation, téléchargement

### Navigation rapide
- **Bouton "Ajouter un Employé"** : Accès direct au formulaire
- **Menu latéral** : Navigation vers tous les modules
- **Breadcrumbs** : Localisation dans l'application

---

## 👥 GESTION DES EMPLOYÉS

### Module principal : `/employees`

#### 1. Ajouter un nouvel employé

##### Accès au formulaire
- **Menu** : Gestion des Employés → Ajouter un Employé
- **URL directe** : `/new-employee`
- **Bouton rapide** : Tableau de bord

##### Informations personnelles obligatoires
- **Nom et prénom** : Nom complet de l'employé
- **Date de naissance** : Format DD/MM/YYYY
- **Genre** : Sélection dans la liste déroulante
- **Nationalité** : Pays d'origine
- **Statut marital** : Situation familiale
- **Adresse complète** : Adresse résidentielle
- **Téléphone** : Numéro de contact principal
- **Email** : Adresse email professionnelle

##### Informations professionnelles
- **Matricule** : Numéro d'identification unique (généré automatiquement)
- **Poste actuel** : Fonction dans l'entreprise
- **Département** : Service d'affectation
- **Entité** : Structure organisationnelle
- **Responsable hiérarchique** : Supérieur direct
- **Date d'embauche** : Date de début de contrat
- **Type de contrat** : CDI, CDD, Stage, Intérim

##### Informations académiques
- **Niveau d'étude** : Diplôme le plus élevé obtenu
- **Spécialisation** : Domaine d'expertise
- **Université/École** : Établissement de formation
- **Année d'obtention** : Date du diplôme

##### Informations financières
- **Salaire de base** : Rémunération contractuelle
- **Salaire net** : Salaire après déductions
- **Type de rémunération** : Mensuel, horaire, commission
- **Mode de paiement** : Virement bancaire, chèque

##### Documents requis
- **CV** : Curriculum vitae (PDF recommandé)
- **Lettre de motivation** : Motivation du candidat
- **Pièce d'identité** : Carte nationale, passeport
- **Diplômes** : Copies des diplômes obtenus
- **Contrat de travail** : Document contractuel signé
- **Photo d'identité** : Photo récente

#### 2. Gérer les employés existants

##### Consultation de la liste
- **Menu** : Gestion des Employés → Effectif
- **URL** : `/employees`
- **Filtres disponibles** :
  - Par nom/prénom
  - Par département
  - Par date d'embauche
  - Par statut (actif/inactif)
  - Par type de contrat

##### Consultation des détails
- **Action** : Cliquer sur l'icône "œil" (👁️)
- **Modal détaillé** avec onglets :
  - Informations personnelles
  - Informations professionnelles
  - Historique des contrats
  - Congés et absences
  - Documents
  - Notes et évaluations

##### Modification d'un employé
- **Action** : Cliquer sur l'icône "crayon" (✏️)
- **URL** : `/edit-employee/:id`
- **Fonctionnalités** :
  - Modification des informations
  - Mise à jour des documents
  - Changement de statut
  - Historisation des modifications

##### Suppression/Archivage d'un employé
- **Action** : Cliquer sur l'icône "poubelle" (🗑️)
- **Confirmation** : Modal de confirmation
- **Résultat** : Archivage dans l'historique des départs
- **Conservation** : Toutes les données sont conservées

#### 3. Historique et suivi

##### Historique de recrutement
- **Menu** : Recrutement → Historique
- **URL** : `/recruitment-history`
- **Informations** :
  - Candidatures reçues
  - Statut des processus
  - Notes et évaluations
  - Décisions finales

##### Historique de départ
- **Menu** : Employés → Historique des Départs
- **URL** : `/departure-history`
- **Informations** :
  - Raisons de départ
  - Procédures de sortie
  - Documents de fin de contrat
  - Entretiens de sortie

---

## 📅 GESTION DES CONGÉS ET ABSENCES

### Module principal : `/leave-management`

#### 1. Gestion des congés

##### Créer une demande de congé
- **Menu** : Gestion des Congés → Congés
- **URL** : `/leave-management`
- **Bouton** : "Nouvelle demande de congé"

##### Formulaire de demande
- **Employé** : Sélection dans la liste déroulante
- **Type de congé** :
  - Congé annuel
  - Congé de maladie
  - Congé de maternité
  - Congé de paternité
  - Congé sans solde
  - Autres types

##### Période et justification
- **Date de début** : Date de début du congé
- **Date de fin** : Date de fin du congé
- **Nombre de jours** : Calculé automatiquement
- **Motif** : Raison détaillée du congé
- **Document justificatif** : Si nécessaire (PDF)

##### Traitement des demandes
- **Statuts disponibles** :
  - "En attente" : Demande soumise
  - "Approuvé" : Congé validé par le responsable
  - "Refusé" : Congé rejeté avec motif
  - "En cours" : Congé en cours d'exécution
  - "Terminé" : Congé terminé

##### Calcul automatique
- **Jours pris** : Calculé selon la politique de l'entreprise
- **Jours restants** : Mise à jour automatique du solde
- **Date de prochaine attribution** : Calculée selon la politique

#### 2. Gestion des absences

##### Module principal : `/absences`

##### Déclarer une absence
- **Menu** : Gestion des Congés → Absences
- **URL** : `/absences`
- **Bouton** : "Nouvelle absence"

##### Types d'absences
- **Maladie** : Avec justificatif médical
- **Accident de travail** : Déclaration obligatoire
- **Grève** : Selon la réglementation
- **Formation** : Absence justifiée
- **Autres** : Motifs divers

##### Formulaire d'absence
- **Employé** : Sélection de l'employé concerné
- **Type d'absence** : Sélection dans la liste
- **Date de début** : Date de début de l'absence
- **Date de fin** : Date de fin de l'absence
- **Motif détaillé** : Raison de l'absence
- **Impact salarial** : Rémunération maintenue ou non
- **Justificatif** : Document de justification

##### Suivi des absences
- **Statuts** :
  - "En attente" : Absence déclarée
  - "Validée" : Absence justifiée
  - "Refusée" : Absence non justifiée
  - "En cours" : Absence en cours

##### Actions disponibles
- **Validation** : Par le responsable RH
- **Modification** : Changement des dates si possible
- **Suppression** : En cas d'erreur
- **Export** : Liste des absences

---

## 📋 GESTION DES CONTRATS

### Module principal : `/contrats`

#### 1. Créer un nouveau contrat

##### Accès au formulaire
- **Menu** : Gestion des Employés → Contrats
- **URL** : `/contrats`
- **Bouton** : "Nouveau Contrat"

##### Informations du contrat
- **Employé** : Sélection dans la liste
- **Type de contrat** :
  - CDI (Contrat à Durée Indéterminée)
  - CDD (Contrat à Durée Déterminée)
  - Stage
  - Intérim
  - Apprentissage
  - Autres types

##### Durée et conditions
- **Date de début** : Date d'effet du contrat
- **Date de fin** : Pour les contrats à durée déterminée
- **Période d'essai** : Durée de la période d'essai
- **Poste** : Fonction attribuée
- **Département** : Service d'affectation

##### Rémunération
- **Salaire brut** : Rémunération contractuelle
- **Salaire net** : Salaire après déductions
- **Avantages** : Primes, indemnités
- **Mode de paiement** : Fréquence de versement

##### Documents du contrat
- **Contrat signé** : Document contractuel original
- **Avenants** : Modifications du contrat
- **Renouvellements** : Extensions de contrat
- **Annexes** : Documents complémentaires

#### 2. Suivi des contrats

##### Alertes de renouvellement
- **Système d'alertes automatiques** :
  - **30 jours avant expiration** : Première alerte
  - **15 jours avant expiration** : Alerte urgente
  - **7 jours avant expiration** : Alerte critique

##### Actions à effectuer
- **Renouvellement** : Prolonger le contrat
- **Modification** : Changer les termes
- **Résiliation** : Mettre fin au contrat
- **Transfert** : Changer de poste/département

##### Module des alertes
- **Menu** : Employés → Alertes Contrats
- **URL** : `/contract-alerts`
- **Fonctionnalités** :
  - Liste des contrats à renouveler
  - Tri par urgence
  - Actions rapides
  - Historique des actions

---

## 🎉 GESTION DES ÉVÉNEMENTS

### Module principal : `/events`

#### 1. Créer un nouvel événement

##### Accès au formulaire
- **Menu** : Événements → Ajouter événement
- **URL** : `/events`
- **Bouton** : "Nouvel Événement" (tableau de bord)

##### Informations de l'événement
- **Nom de l'événement** : Titre descriptif
- **Date et heure** : Date et heure de l'événement
- **Lieu** : Localisation de l'événement
- **Description** : Détails et informations
- **Type d'événement** : Réunion, formation, événement social
- **Participants** : Employés concernés

##### Gestion des événements
- **Modification** : Mettre à jour les informations
- **Suppression** : Annuler l'événement
- **Consultation** : Voir les détails
- **Export** : Liste des événements

#### 2. Affichage des événements
- **Tableau de bord** : Événements de la semaine
- **Calendrier** : Vue mensuelle
- **Liste** : Tous les événements
- **Filtres** : Par date, type, département

---

## 🚀 RECRUTEMENT ET ONBOARDING

### Module principal : `/onboarding`

#### 1. Processus de recrutement

##### Suivi des candidatures
- **Menu** : Recrutement → Historique
- **URL** : `/recruitment-history`
- **Fonctionnalités** :
  - Enregistrer une nouvelle candidature
  - Suivre le statut des candidatures
  - Gérer les entretiens
  - Prendre des notes d'évaluation

##### Statuts des candidatures
- **En attente** : Candidature reçue
- **En cours** : Processus en cours
- **Entretien** : Entretien programmé
- **Acceptée** : Candidature retenue
- **Refusée** : Candidature non retenue

#### 2. Onboarding

##### Accueil du nouvel employé
- **Menu** : Onboarding → Onboarding
- **URL** : `/onboarding`
- **Étapes** :
  - Présentation de l'entreprise
  - Formation aux procédures
  - Intégration dans l'équipe
  - Remise des équipements

##### Checklist d'onboarding
- **Documents administratifs** : Contrat, fiche de paie
- **Accès système** : Identifiants, badges
- **Équipement** : Bureau, ordinateur, téléphone
- **Formation** : Procédures, outils, systèmes

#### 3. Offboarding

##### Procédure de départ
- **Menu** : Onboarding → Offboarding
- **URL** : `/offboarding`
- **Étapes** :
  - Entretien de sortie
  - Récupération des biens
  - Documents de fin de contrat
  - Transfert des connaissances

---

## 🏥 SUIVI MÉDICAL

### Module principal : `/medical-visits`

#### 1. Gestion des dossiers médicaux

##### Création du dossier
- **Menu** : Suivi Médical → Dossiers
- **URL** : `/medical-file-tracking`
- **Informations** :
  - Nom, prénom, nationalité
  - Diplômes médicaux
  - Documents requis

##### Étapes de la procédure

###### Étape 1 : Dossier créé
- **Documents requis** :
  - Diplôme de médecine (original et copie)
  - Pièce d'identité (passeport)
  - Relevés de notes
  - Acte de naissance
- **Instructions** : Rassembler tous les diplômes originaux

###### Étape 2 : Authentification des diplômes
- **Ambassades** : Présentation des diplômes originaux
- **Université Omar Bongo (UOB)** : Légalisation au service correspondant
- **Ministère des Affaires Étrangères** : Légalisation finale
- **Délai** : 2-4 semaines selon les administrations

###### Étape 3 : Demande d'homologation
- **Ministère de la Santé** : Demande d'autorisation d'exercer
- **Conseil National de l'Ordre des Médecins (CNOM)** : Enregistrement
- **Documents requis** : Attestation, numéro CNOM, certificat médical

###### Étape 4 : Autorisation d'exercer
- **Ministère de la Santé** : Autorisation officielle
- **Documents requis** : Extrait de casier judiciaire, photos d'identité

###### Étape 5 : Autorisation de travail
- **Ministère du Travail** : Autorisation finale
- **Objectif** : Exercer la médecine au Gabon

#### 2. Visites médicales

##### Planification des visites
- **Menu** : Suivi Médical → Visites
- **URL** : `/medical-visits`
- **Types** :
  - Embauchage
  - Périodique
  - Reprise après arrêt
  - Fin de contrat

##### Suivi des résultats
- **Aptitude** :
  - Apte
  - Inapte temporaire
  - Inapte définitive
- **Restrictions** : Limitations d'aptitude
- **Recommandations** : Conseils médicaux

---

## 👤 PORTAL EMPLOYÉ

### Module principal : `/EmployeePortal`

#### 1. Accès et authentification

##### Connexion
- **URL** : `/employee-login`
- **Identifiants** : Matricule et mot de passe
- **Première connexion** : Changement de mot de passe obligatoire

##### Interface employé
- **Tableau de bord personnel** : Informations individuelles
- **Demandes** : Congés, absences, documents
- **Documents** : Consultation des documents personnels

#### 2. Fonctionnalités disponibles

##### Gestion des demandes
- **Nouvelle demande de congé** : Formulaire de demande
- **Suivi des demandes** : Statut et historique
- **Modification** : Changement des dates si possible
- **Annulation** : Annuler une demande en attente

##### Consultation des informations
- **Fiche personnelle** : Données personnelles et professionnelles
- **Bulletins de paie** : Historique des salaires
- **Congés** : Solde et historique des congés
- **Contrat** : Conditions contractuelles

##### Communication
- **Messages** : Communication avec les RH
- **Notifications** : Alertes et informations importantes
- **Notes de service** : Consultation des communications

---

## 🎤 AGENT VOCAL

### Module principal : Configuration vocale

#### 1. Configuration et utilisation

##### Accès à l'agent vocal
- **Menu** : Agent Vocal → Configuration
- **Interface** : Bouton d'activation vocal
- **Composants disponibles** :
  - `VoiceAssistant.jsx`
  - `ModernVoiceAssistant.jsx`
  - `ControlledVoiceAssistant.jsx`

##### Fonctionnalités
- **Recherche vocale** : Rechercher des informations
- **Navigation vocale** : Se déplacer dans l'application
- **Commandes vocales** : Actions rapides
- **Reconnaissance multilingue** : Français, anglais

##### Configuration
- **Langue** : Français, anglais
- **Vitesse** : Vitesse de reconnaissance
- **Sensibilité** : Sensibilité du microphone
- **Tests** : Composants de test disponibles

---

## 💼 GESTION RH

### Module principal : `/hr-tasks`

#### 1. Entretiens

##### Planification
- **Menu** : Gestion RH → Entretiens
- **URL** : `/interviews`
- **Fonctionnalités** :
  - Date et heure : Créneaux disponibles
  - Participants : RH, manager, employé
  - Objectif : Évaluation, suivi, formation

##### Conduite de l'entretien
- **Grille d'évaluation** : Critères d'évaluation
- **Notes** : Observations et commentaires
- **Actions** : Décisions et plan d'action
- **Suivi** : Planification des actions

#### 2. Démarches RH

##### Gestion des procédures
- **Menu** : Gestion RH → Tâches RH
- **URL** : `/hr-tasks`
- **Processus** :
  - Recrutement : Processus complet
  - Formation : Plan de formation
  - Évaluation : Processus d'évaluation
  - Gestion des carrières

##### Suivi des actions
- **Statut** : En cours, terminé, en attente
- **Responsable** : Personne en charge
- **Échéance** : Date limite
- **Priorité** : Niveau d'urgence

#### 3. Sanctions

##### Gestion des sanctions
- **Menu** : Gestion RH → Sanctions
- **URL** : `/sanctions`
- **Types** :
  - Avertissement
  - Blâme
  - Mise à pied
  - Licenciement
- **Procédure** : Respect de la réglementation

---

## 📝 NOTES DE SERVICE

### Module principal : `/service-notes`

#### 1. Gestion des notes

##### Création d'une note
- **Menu** : Notes de Service
- **URL** : `/service-notes`
- **Bouton** : "Nouvelle Note de Service"

##### Informations de la note
- **Numéro** : Généré automatiquement (NS-YYYY-XXX)
- **Catégorie** :
  - Information
  - Organisation
  - Sécurité
  - Formation
  - Autres
- **Titre** : Sujet de la note
- **Contenu** : Détails et instructions
- **Destinataires** : Employés concernés

##### Gestion des notes
- **Statuts** :
  - Brouillon
  - Publiée
  - Archivée
- **Actions** :
  - Modification
  - Suppression
  - Publication
  - Archivage

#### 2. Consultation des notes
- **Notes publiques** : Accessibles à tous
- **Notes privées** : Selon les permissions
- **Recherche** : Par mot-clé, catégorie, date
- **Filtres** : Par période, auteur, statut

---

## 📋 DEMANDES EMPLOYÉS

### Module principal : `/employee-requests`

#### 1. Gestion des demandes

##### Types de demandes
- **Congés** : Demandes de congés
- **Absences** : Justifications d'absences
- **Documents** : Demandes de documents
- **Formation** : Demandes de formation
- **Autres** : Demandes diverses

##### Traitement des demandes
- **Statuts** :
  - En attente
  - En cours de traitement
  - Approuvée
  - Refusée
- **Actions** :
  - Validation
  - Rejet avec motif
  - Demande de complément
  - Transfert vers un autre service

#### 2. Suivi des demandes
- **Historique** : Toutes les demandes
- **Statistiques** : Par type, par statut
- **Alertes** : Demandes en attente
- **Export** : Rapports de suivi

---

## 📄 DOCUMENTS ET RAPPORTS

### Gestion documentaire

#### 1. Types de documents
- **Code du travail** : Réglementation en vigueur
- **Règlement intérieur** : Règles de l'entreprise
- **Procédures** : Processus et méthodes
- **Formulaires** : Documents types
- **Modèles** : Contrats, lettres types

#### 2. Accès aux documents
- **Consultation** : Lecture des documents
- **Téléchargement** : Sauvegarde locale
- **Recherche** : Recherche dans le contenu
- **Versioning** : Historique des versions

### Rapports et statistiques

#### 1. Rapports automatiques
- **Effectifs** : Évolution des effectifs
- **Congés** : Statistiques des congés
- **Turnover** : Taux de rotation
- **Absentéisme** : Taux d'absentéisme
- **Formation** : Plan de formation

#### 2. Graphiques et visualisations
- **Menu** : Tableau de Bord → Graphiques
- **URL** : `/charts`
- **Types de graphiques** :
  - Évolution temporelle
  - Répartition par catégorie
  - Comparaisons
  - Tendances

---

## 🛠️ DÉPANNAGE ET SUPPORT

### Problèmes courants

#### 1. Problèmes de connexion
- **Mot de passe oublié** : Utiliser la récupération
- **Compte bloqué** : Contacter l'administrateur
- **Problème de session** : Vider le cache du navigateur
- **Erreur 401/403** : Vérifier les permissions

#### 2. Problèmes de performance
- **Lenteur** : Vérifier la connexion internet
- **Erreurs** : Consulter la console du navigateur
- **Blocage** : Rafraîchir la page
- **Timeout** : Augmenter les délais

#### 3. Problèmes de données
- **Données manquantes** : Vérifier les permissions
- **Erreurs de saisie** : Valider les formats
- **Synchronisation** : Vérifier la connexion à la base
- **Doublons** : Vérifier les contraintes

### Support technique

#### 1. Contact support
- **Email** : support@centrediagnostic.ga
- **Téléphone** : +241 XX XX XX XX
- **Chat** : Support en ligne intégré
- **Ticket** : Système de tickets

#### 2. Escalade
- **Niveau 1** : Support utilisateur (questions générales)
- **Niveau 2** : Support technique (problèmes techniques)
- **Niveau 3** : Développement (bugs, nouvelles fonctionnalités)

### Maintenance

#### 1. Planification
- **Maintenance préventive** : Planifiée à l'avance
- **Maintenance curative** : En cas de problème
- **Mises à jour** : Nouvelles fonctionnalités
- **Sauvegardes** : Régulières et sécurisées

#### 2. Notifications
- **Avis de maintenance** : Communication préalable
- **Statut** : Indicateur de disponibilité
- **Reprise** : Confirmation de reprise
- **Incidents** : Communication en temps réel

---

## 📱 RACCOURCIS CLAVIER

### Navigation
- **Ctrl + H** : Accueil
- **Ctrl + E** : Employés
- **Ctrl + C** : Congés
- **Ctrl + R** : Recrutement
- **Ctrl + M** : Médecins
- **Ctrl + D** : Tableau de bord

### Actions
- **Ctrl + N** : Nouveau
- **Ctrl + S** : Sauvegarder
- **Ctrl + Z** : Annuler
- **Ctrl + F** : Rechercher
- **Ctrl + P** : Imprimer
- **Ctrl + A** : Sélectionner tout

### Interface
- **F5** : Rafraîchir la page
- **F11** : Mode plein écran
- **Echap** : Fermer les modals
- **Entrée** : Valider les formulaires

---

## 🔒 SÉCURITÉ ET CONFIDENTIALITÉ

### Protection des données
- **Authentification** : Connexion sécurisée HTTPS
- **Autorisation** : Gestion des permissions par rôle
- **Chiffrement** : Données chiffrées en transit et au repos
- **Audit** : Traçabilité des actions

### Bonnes pratiques
- **Déconnexion** : Se déconnecter après utilisation
- **Mot de passe** : Utiliser un mot de passe fort
- **Confidentialité** : Ne pas partager ses identifiants
- **Sécurité physique** : Verrouiller l'écran en cas d'absence
- **Mises à jour** : Maintenir le navigateur à jour

### Conformité
- **RGPD** : Respect de la réglementation européenne
- **Loi locale** : Conformité aux lois gabonaises
- **Audit** : Contrôles réguliers de sécurité
- **Formation** : Sensibilisation des utilisateurs

---

## 📞 CONTACTS UTILES

### Support technique
- **Email** : support@centrediagnostic.ga
- **Téléphone** : +241 XX XX XX XX
- **Horaires** : Lundi-Vendredi 8h-18h
- **Urgences** : Support 24h/7j

### Administration
- **Directeur RH** : [Nom] - [Email]
- **Responsable IT** : [Nom] - [Email]
- **Chef de service** : [Nom] - [Email]
- **Administrateur système** : [Nom] - [Email]

### Développement
- **Équipe IT** : it@centrediagnostic.ga
- **Chef de projet** : [Nom] - [Email]
- **Architecte** : [Nom] - [Email]

---

## 📚 GLOSSAIRE

- **SIRH** : Système d'Information des Ressources Humaines
- **Onboarding** : Processus d'intégration d'un nouvel employé
- **Offboarding** : Processus de sortie d'un employé
- **Turnover** : Taux de rotation du personnel
- **CNOM** : Conseil National de l'Ordre des Médecins
- **DGEC** : Direction Générale de l'Économie et de la Concurrence
- **CDI** : Contrat à Durée Indéterminée
- **CDD** : Contrat à Durée Déterminée
- **RH** : Ressources Humaines
- **IT** : Technologies de l'Information
- **API** : Interface de Programmation d'Application
- **CRUD** : Create, Read, Update, Delete (Créer, Lire, Modifier, Supprimer)

---

## 📝 NOTES ET COMMENTAIRES

### Espace pour les notes personnelles
- **Date** : _____________
- **Utilisateur** : _____________
- **Notes** : _____________

---

### Historique des modifications
- **Version 1.0** : Décembre 2024 - Manuel initial
- **Version 1.1** : Décembre 2024 - Ajout des fonctionnalités avancées
- **Version 1.2** : Décembre 2024 - Mise à jour des modules

---

## 🚀 NOUVELLES FONCTIONNALITÉS

### Fonctionnalités récentes
- **Agent vocal** : Reconnaissance vocale et commandes
- **Tableaux de bord avancés** : Graphiques et statistiques
- **Gestion des événements** : Planification et suivi
- **Notes de service** : Communication interne
- **Portail employé** : Interface autonome

### Fonctionnalités à venir
- **Application mobile** : Accès mobile
- **Intégration API** : Connexion avec d'autres systèmes
- **Intelligence artificielle** : Prédictions et recommandations
- **Workflow avancé** : Processus automatisés
- **Reporting avancé** : Rapports personnalisés

---

*Ce manuel d'utilisation est la propriété du Centre Diagnostic. Toute reproduction ou diffusion non autorisée est interdite.*

**Version** : 1.2  
**Date de mise à jour** : Décembre 2024  
**Auteur** : Équipe IT Centre Diagnostic  
**Dernière révision** : Décembre 2024

---

## 📋 CHECKLIST D'UTILISATION

### Première utilisation
- [ ] Lecture du manuel d'utilisation
- [ ] Configuration du compte utilisateur
- [ ] Test des fonctionnalités de base
- [ ] Formation aux modules spécifiques
- [ ] Validation des accès et permissions

### Utilisation quotidienne
- [ ] Connexion sécurisée
- [ ] Consultation du tableau de bord
- [ ] Traitement des tâches prioritaires
- [ ] Mise à jour des informations
- [ ] Déconnexion sécurisée

### Maintenance
- [ ] Sauvegarde des données
- [ ] Mise à jour des informations
- [ ] Vérification des alertes
- [ ] Nettoyage des données obsolètes
- [ ] Rapport d'activité

---

**Merci d'utiliser le SIRH Centre Diagnostic !** 🎉
