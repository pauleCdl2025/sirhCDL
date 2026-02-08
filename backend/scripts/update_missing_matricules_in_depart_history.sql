-- Script pour mettre à jour les matricules manquants dans depart_history
-- Ce script récupère les matricules depuis la table employees pour tous les enregistrements
-- qui ont un employee_id valide mais pas de matricule sauvegardé

-- Mettre à jour les enregistrements de depart_history qui n'ont pas de matricule
-- mais ont un employee_id valide
UPDATE depart_history dh
SET 
    matricule = e.matricule,
    nom_prenom = COALESCE(dh.nom_prenom, e.nom_prenom),
    poste_actuel = COALESCE(dh.poste_actuel, e.poste_actuel),
    departement = COALESCE(dh.departement, e.departement, e.functional_area),
    statut = COALESCE(dh.statut, e.type_contrat),
    email = COALESCE(dh.email, e.email),
    telephone = COALESCE(dh.telephone, e.telephone)
FROM employees e
WHERE dh.employee_id = e.id
  AND (dh.matricule IS NULL OR dh.matricule = '' OR dh.matricule = 'N/A')
  AND e.matricule IS NOT NULL
  AND e.matricule != '';

-- Afficher un résumé des mises à jour
SELECT 
    COUNT(*) as total_updated,
    'Matricules mis à jour dans depart_history' as message
FROM depart_history dh
INNER JOIN employees e ON dh.employee_id = e.id
WHERE dh.matricule IS NOT NULL 
  AND dh.matricule != ''
  AND dh.matricule != 'N/A';

-- Afficher les enregistrements qui n'ont toujours pas de matricule
SELECT 
    dh.id,
    dh.employee_id,
    dh.nom_prenom,
    dh.date_depart,
    'Matricule manquant - employee_id: ' || COALESCE(dh.employee_id::text, 'NULL') as status
FROM depart_history dh
WHERE (dh.matricule IS NULL OR dh.matricule = '' OR dh.matricule = 'N/A')
  AND dh.employee_id IS NOT NULL;
