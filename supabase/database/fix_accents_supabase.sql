-- Script pour corriger les problèmes d'accents dans la base Supabase
-- Caractères corrigés : ‚→é, Š→è, ˆ→ê
-- À exécuter dans Supabase SQL Editor (Dashboard > SQL Editor)

-- Table: absence
UPDATE public.absence SET
  nom_employe = REPLACE(REPLACE(REPLACE(nom_employe, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  service = REPLACE(REPLACE(REPLACE(service, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(poste, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  type_absence = REPLACE(REPLACE(REPLACE(type_absence, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  motif = REPLACE(REPLACE(REPLACE(motif, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  statut = REPLACE(REPLACE(REPLACE(statut, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%ˆ%'
   OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR type_absence LIKE '%‚%' OR type_absence LIKE '%Š%' OR type_absence LIKE '%ˆ%'
   OR motif LIKE '%‚%' OR motif LIKE '%Š%' OR motif LIKE '%ˆ%'
   OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%ˆ%';

-- Table: conges
UPDATE public.conges SET
  nom_employe = REPLACE(REPLACE(REPLACE(nom_employe, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  service = REPLACE(REPLACE(REPLACE(service, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(poste, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  type_conge = REPLACE(REPLACE(REPLACE(type_conge, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  motif = REPLACE(REPLACE(REPLACE(motif, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  statut = REPLACE(REPLACE(REPLACE(statut, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%ˆ%'
   OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR type_conge LIKE '%‚%' OR type_conge LIKE '%Š%' OR type_conge LIKE '%ˆ%'
   OR motif LIKE '%‚%' OR motif LIKE '%Š%' OR motif LIKE '%ˆ%'
   OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%ˆ%';

-- Table: employees
UPDATE public.employees SET
  nom_prenom = REPLACE(REPLACE(REPLACE(nom_prenom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste_actuel = REPLACE(REPLACE(REPLACE(poste_actuel, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  functional_area = REPLACE(REPLACE(REPLACE(functional_area, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  entity = REPLACE(REPLACE(REPLACE(entity, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  type_contrat = REPLACE(REPLACE(REPLACE(type_contrat, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  responsable = REPLACE(REPLACE(REPLACE(responsable, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  statut_employe = REPLACE(REPLACE(REPLACE(statut_employe, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  specialisation = REPLACE(REPLACE(REPLACE(specialisation, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  niveau_etude = REPLACE(REPLACE(REPLACE(niveau_etude, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom_prenom LIKE '%‚%' OR nom_prenom LIKE '%Š%' OR nom_prenom LIKE '%ˆ%'
   OR poste_actuel LIKE '%‚%' OR poste_actuel LIKE '%Š%' OR poste_actuel LIKE '%ˆ%'
   OR functional_area LIKE '%‚%' OR functional_area LIKE '%Š%' OR functional_area LIKE '%ˆ%'
   OR entity LIKE '%‚%' OR entity LIKE '%Š%' OR entity LIKE '%ˆ%'
   OR type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%ˆ%'
   OR responsable LIKE '%‚%' OR responsable LIKE '%Š%' OR responsable LIKE '%ˆ%'
   OR statut_employe LIKE '%‚%' OR statut_employe LIKE '%Š%' OR statut_employe LIKE '%ˆ%'
   OR specialisation LIKE '%‚%' OR specialisation LIKE '%Š%' OR specialisation LIKE '%ˆ%'
   OR niveau_etude LIKE '%‚%' OR niveau_etude LIKE '%Š%' OR niveau_etude LIKE '%ˆ%';

-- Table: contrats (pas de nom_employe, utilise employee_id)
UPDATE public.contrats SET
  type_contrat = REPLACE(REPLACE(REPLACE(COALESCE(type_contrat, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(COALESCE(poste, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  service = REPLACE(REPLACE(REPLACE(COALESCE(service, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  titre_poste = REPLACE(REPLACE(REPLACE(COALESCE(titre_poste, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  motif_contrat = REPLACE(REPLACE(REPLACE(COALESCE(motif_contrat, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  notes = REPLACE(REPLACE(REPLACE(COALESCE(notes, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  departement = REPLACE(REPLACE(REPLACE(COALESCE(departement, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  superieur_hierarchique = REPLACE(REPLACE(REPLACE(COALESCE(superieur_hierarchique, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR service LIKE '%‚%' OR service LIKE '%Š%' OR service LIKE '%ˆ%'
   OR titre_poste LIKE '%‚%' OR titre_poste LIKE '%Š%' OR titre_poste LIKE '%ˆ%'
   OR motif_contrat LIKE '%‚%' OR motif_contrat LIKE '%Š%' OR motif_contrat LIKE '%ˆ%'
   OR notes LIKE '%‚%' OR notes LIKE '%Š%' OR notes LIKE '%ˆ%'
   OR departement LIKE '%‚%' OR departement LIKE '%Š%' OR departement LIKE '%ˆ%'
   OR superieur_hierarchique LIKE '%‚%' OR superieur_hierarchique LIKE '%Š%' OR superieur_hierarchique LIKE '%ˆ%';

-- Table: sanctions_table
UPDATE public.sanctions_table SET
  nom_employe = REPLACE(REPLACE(REPLACE(nom_employe, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  type_sanction = REPLACE(REPLACE(REPLACE(type_sanction, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  contenu_sanction = REPLACE(REPLACE(REPLACE(contenu_sanction, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  statut = REPLACE(REPLACE(REPLACE(statut, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom_employe LIKE '%‚%' OR nom_employe LIKE '%Š%' OR nom_employe LIKE '%ˆ%'
   OR type_sanction LIKE '%‚%' OR type_sanction LIKE '%Š%' OR type_sanction LIKE '%ˆ%'
   OR contenu_sanction LIKE '%‚%' OR contenu_sanction LIKE '%Š%' OR contenu_sanction LIKE '%ˆ%'
   OR statut LIKE '%‚%' OR statut LIKE '%Š%' OR statut LIKE '%ˆ%';

-- Table: notes
UPDATE public.notes SET
  title = REPLACE(REPLACE(REPLACE(title, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  content = REPLACE(REPLACE(REPLACE(content, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  category = REPLACE(REPLACE(REPLACE(category, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  created_by = REPLACE(REPLACE(REPLACE(created_by, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE title LIKE '%‚%' OR title LIKE '%Š%' OR title LIKE '%ˆ%'
   OR content LIKE '%‚%' OR content LIKE '%Š%' OR content LIKE '%ˆ%'
   OR category LIKE '%‚%' OR category LIKE '%Š%' OR category LIKE '%ˆ%'
   OR created_by LIKE '%‚%' OR created_by LIKE '%Š%' OR created_by LIKE '%ˆ%';

-- Table: historique_recrutement
UPDATE public.historique_recrutement SET
  nom = REPLACE(REPLACE(REPLACE(nom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  prenom = REPLACE(REPLACE(REPLACE(prenom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  departement = REPLACE(REPLACE(REPLACE(departement, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  motif_recrutement = REPLACE(REPLACE(REPLACE(motif_recrutement, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  type_contrat = REPLACE(REPLACE(REPLACE(type_contrat, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(poste, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  superieur_hierarchique = REPLACE(REPLACE(REPLACE(superieur_hierarchique, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom LIKE '%‚%' OR nom LIKE '%Š%' OR nom LIKE '%ˆ%'
   OR prenom LIKE '%‚%' OR prenom LIKE '%Š%' OR prenom LIKE '%ˆ%'
   OR departement LIKE '%‚%' OR departement LIKE '%Š%' OR departement LIKE '%ˆ%'
   OR motif_recrutement LIKE '%‚%' OR motif_recrutement LIKE '%Š%' OR motif_recrutement LIKE '%ˆ%'
   OR type_contrat LIKE '%‚%' OR type_contrat LIKE '%Š%' OR type_contrat LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR superieur_hierarchique LIKE '%‚%' OR superieur_hierarchique LIKE '%Š%' OR superieur_hierarchique LIKE '%ˆ%';

-- Table: recrutement_history
UPDATE public.recrutement_history SET
  source_recrutement = REPLACE(REPLACE(REPLACE(COALESCE(source_recrutement, ''), '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE source_recrutement LIKE '%‚%' OR source_recrutement LIKE '%Š%' OR source_recrutement LIKE '%ˆ%';

-- Table: historique_departs
UPDATE public.historique_departs SET
  nom = REPLACE(REPLACE(REPLACE(nom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  prenom = REPLACE(REPLACE(REPLACE(prenom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  departement = REPLACE(REPLACE(REPLACE(departement, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(poste, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  motif_depart = REPLACE(REPLACE(REPLACE(motif_depart, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  commentaire = REPLACE(REPLACE(REPLACE(commentaire, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom LIKE '%‚%' OR nom LIKE '%Š%' OR nom LIKE '%ˆ%'
   OR prenom LIKE '%‚%' OR prenom LIKE '%Š%' OR prenom LIKE '%ˆ%'
   OR departement LIKE '%‚%' OR departement LIKE '%Š%' OR departement LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR motif_depart LIKE '%‚%' OR motif_depart LIKE '%Š%' OR motif_depart LIKE '%ˆ%'
   OR commentaire LIKE '%‚%' OR commentaire LIKE '%Š%' OR commentaire LIKE '%ˆ%';

-- Table: visites_medicales
UPDATE public.visites_medicales SET
  nom = REPLACE(REPLACE(REPLACE(nom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  prenom = REPLACE(REPLACE(REPLACE(prenom, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  poste = REPLACE(REPLACE(REPLACE(poste, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê'),
  notes = REPLACE(REPLACE(REPLACE(notes, '‚', 'é'), 'Š', 'è'), 'ˆ', 'ê')
WHERE nom LIKE '%‚%' OR nom LIKE '%Š%' OR nom LIKE '%ˆ%'
   OR prenom LIKE '%‚%' OR prenom LIKE '%Š%' OR prenom LIKE '%ˆ%'
   OR poste LIKE '%‚%' OR poste LIKE '%Š%' OR poste LIKE '%ˆ%'
   OR notes LIKE '%‚%' OR notes LIKE '%Š%' OR notes LIKE '%ˆ%';

-- Corrections spécifiques
UPDATE public.conges SET type_conge = 'Congé payé'
WHERE type_conge IN ('Cong‚ pay‚', 'Cong‚ payé', 'Congé pay‚');

UPDATE public.absence SET type_absence = 'Arrêt maladie'
WHERE type_absence IN ('Arr^t maladie', 'Arrˆt maladie');

UPDATE public.historique_recrutement SET motif_recrutement = 'Création de poste'
WHERE motif_recrutement = 'Cration de poste';

UPDATE public.recrutement_history SET source_recrutement = 'Création de poste'
WHERE source_recrutement = 'Cration de poste';

SELECT 'Correction des accents terminée !' AS message;
