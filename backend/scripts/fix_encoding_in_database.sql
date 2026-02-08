-- Script SQL pour corriger les problèmes d'encodage dans toutes les tables
-- Ce script corrige les caractères mal encodés (comme '‚' au lieu de 'é', 'š' au lieu de 'è') dans toutes les tables

-- Table: employees
UPDATE employees 
SET 
    nom_prenom = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom_prenom, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    poste_actuel = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        poste_actuel, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    functional_area = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        functional_area, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    entity = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        entity, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_contrat = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_contrat, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    responsable = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        responsable, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    statut_employe = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        statut_employe, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    specialisation = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        specialisation, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    niveau_etude = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        niveau_etude, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom_prenom LIKE '%š%' OR nom_prenom LIKE '%Š%' OR nom_prenom LIKE '%‚%' OR nom_prenom LIKE '%Š%' OR nom_prenom LIKE '%Ž%'
    OR poste_actuel LIKE '%‚%' OR poste_actuel LIKE '%Š%' OR poste_actuel LIKE '%Ž%'
    OR functional_area LIKE '%‚%' OR functional_area LIKE '%Š%' OR functional_area LIKE '%Ž%'
    OR entity LIKE '%‚%' OR entity LIKE '%Š%' OR entity LIKE '%Ž%'
    OR type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%Ž%'
    OR responsable LIKE '%‚%' OR responsable LIKE '%Š%' OR responsable LIKE '%Ž%'
    OR statut_employe LIKE '%‚%' OR statut_employe LIKE '%Š%' OR statut_employe LIKE '%Ž%'
    OR specialisation LIKE '%‚%' OR specialisation LIKE '%Š%' OR specialisation LIKE '%Ž%'
    OR niveau_etude LIKE '%‚%' OR niveau_etude LIKE '%Š%' OR niveau_etude LIKE '%Ž%';

-- Table: conges
UPDATE conges 
SET 
    nom_employe = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom_employe, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    service = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        service, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    poste = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        poste, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_conge = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_conge, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    motif = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        motif, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    statut = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        statut, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%Ž%'
    OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%Ž%'
    OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%Ž%'
    OR type_conge LIKE '%‚%' OR type_conge LIKE '%Š%' OR type_conge LIKE '%Ž%'
    OR motif LIKE '%‚%' OR motif LIKE '%Š%' OR motif LIKE '%Ž%'
    OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%Ž%';

-- Correction spécifique pour "Cong‚ pay‚" -> "Congé payé"
UPDATE conges 
SET type_conge = 'Congé payé'
WHERE type_conge = 'Cong‚ pay‚' OR type_conge = 'Cong‚ payé' OR type_conge = 'Congé pay‚';

-- Correction spécifique pour "Arr^t maladie" ou "Arrˆt maladie" -> "Arrêt maladie"
UPDATE absence 
SET type_absence = 'Arrêt maladie'
WHERE type_absence = 'Arr^t maladie' OR type_absence = 'Arrˆt maladie';

-- Table: absence
UPDATE absence 
SET 
    nom_employe = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom_employe, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    service = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        service, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    poste = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        poste, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_absence = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_absence, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    motif = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        motif, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    statut = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        statut, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%Ž%'
    OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%Ž%'
    OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%Ž%'
    OR type_absence LIKE '%^%' OR type_absence LIKE '%ˆ%' OR type_absence LIKE '%š%' OR type_absence LIKE '%Š%' OR type_absence LIKE '%‚%' OR type_absence LIKE '%Š%' OR type_absence LIKE '%Ž%'
    OR motif LIKE '%‚%' OR motif LIKE '%Š%' OR motif LIKE '%Ž%'
    OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%Ž%';

-- Table: contrats
UPDATE contrats 
SET 
    nom_employe = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom_employe, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_contrat = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_contrat, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    poste = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        poste, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    service = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        service, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%Ž%'
    OR type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%Ž%'
    OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%Ž%'
    OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%Ž%';

-- Table: sanctions_table
UPDATE sanctions_table 
SET 
    nom_employe = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom_employe, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_sanction = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_sanction, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    contenu_sanction = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        contenu_sanction, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    statut = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        statut, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%Ž%'
    OR type_sanction LIKE '%‚%' OR type_sanction LIKE '%Š%' OR type_sanction LIKE '%Ž%'
    OR contenu_sanction LIKE '%‚%' OR contenu_sanction LIKE '%Š%' OR contenu_sanction LIKE '%Ž%'
    OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%Ž%';

-- Table: notes
UPDATE notes 
SET 
    title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        title, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    content = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        content, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    category = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        category, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    created_by = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        created_by, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    title LIKE '%‚%' OR title LIKE '%Š%' OR title LIKE '%Ž%'
    OR content LIKE '%‚%' OR content LIKE '%Š%' OR content LIKE '%Ž%'
    OR category LIKE '%‚%' OR category LIKE '%Š%' OR category LIKE '%Ž%'
    OR created_by LIKE '%‚%' OR created_by LIKE '%Š%' OR created_by LIKE '%Ž%';

-- Table: historique_recrutement
UPDATE historique_recrutement 
SET 
    nom = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        nom, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    prenom = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        prenom, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    departement = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        departement, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    motif_recrutement = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        motif_recrutement, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    type_contrat = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        type_contrat, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    poste = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        poste, 
        'š', 'è'), 'Š', 'È'), '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç'),
    superieur_hierarchique = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        superieur_hierarchique, 
        '‚', 'é'), 'Š', 'é'), 'Ž', 'É'), 'Š', 'è'), 'Š', 'È'), 'Š', 'ê'), 'Š', 'Ê'), 'Š', 'â'), 'Š', 'Â'), 'Š', 'ç')
WHERE 
    nom LIKE '%‚%' OR nom LIKE '%Š%' OR nom LIKE '%Ž%'
    OR prenom LIKE '%‚%' OR prenom LIKE '%Š%' OR prenom LIKE '%Ž%'
    OR departement LIKE '%‚%' OR departement LIKE '%Š%' OR departement LIKE '%Ž%'
    OR motif_recrutement LIKE '%‚%' OR motif_recrutement LIKE '%Š%' OR motif_recrutement LIKE '%Ž%'
    OR type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%Ž%'
    OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%Ž%'
    OR superieur_hierarchique LIKE '%‚%' OR superieur_hierarchique LIKE '%Š%' OR superieur_hierarchique LIKE '%Ž%';

-- Correction spécifique pour "Cration de poste" -> "Création de poste"
UPDATE historique_recrutement 
SET motif_recrutement = 'Création de poste'
WHERE motif_recrutement = 'Cration de poste';

-- Correction pour la table recrutement_history aussi
UPDATE recrutement_history 
SET source_recrutement = 'Création de poste'
WHERE source_recrutement = 'Cration de poste';

-- Afficher un résumé des corrections effectuées
SELECT 'Correction des accents terminée!' as message;
