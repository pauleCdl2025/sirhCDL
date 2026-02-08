-- Script pour supprimer toutes les données de la table employee_requests
-- ATTENTION: Cette opération est irréversible !

-- Supprimer toutes les demandes des employés
DELETE FROM employee_requests;

-- Réinitialiser la séquence pour que les prochains IDs commencent à 1
ALTER SEQUENCE employee_requests_id_seq RESTART WITH 1;

-- Afficher le nombre de lignes supprimées (optionnel, pour vérification)
SELECT COUNT(*) as remaining_requests FROM employee_requests;


