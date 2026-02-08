-- Ajout de colonnes manquantes à la table contrats
-- Ces colonnes sont nécessaires pour les nouvelles fonctionnalités

-- Ajouter la colonne last_sent (dernière date d'envoi)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS last_sent TIMESTAMP WITH TIME ZONE;

-- Ajouter la colonne sent_to_employee (ID de l'employé à qui le contrat a été envoyé)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS sent_to_employee INTEGER;

-- Ajouter la colonne send_message (message accompagnant l'envoi)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS send_message TEXT;

-- Ajouter la colonne created_at (date de création)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Ajouter la colonne updated_at (date de dernière modification)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Ajouter la colonne employee_id (ID de l'employé - si elle n'existe pas)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS employee_id INTEGER;

-- Ajouter la colonne salaire (salaire du contrat)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS salaire DECIMAL(10,2);

-- Ajouter la colonne periode_essai (période d'essai en mois)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS periode_essai INTEGER DEFAULT 3;

-- Ajouter la colonne contrat_file (chemin vers le fichier du contrat)
ALTER TABLE contrats 
ADD COLUMN IF NOT EXISTS contrat_file VARCHAR(500);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN contrats.last_sent IS 'Date et heure du dernier envoi du contrat à l''employé';
COMMENT ON COLUMN contrats.sent_to_employee IS 'ID de l''employé à qui le contrat a été envoyé';
COMMENT ON COLUMN contrats.send_message IS 'Message accompagnant l''envoi du contrat';
COMMENT ON COLUMN contrats.created_at IS 'Date et heure de création du contrat';
COMMENT ON COLUMN contrats.updated_at IS 'Date et heure de dernière modification du contrat';
COMMENT ON COLUMN contrats.employee_id IS 'ID de l''employé associé au contrat';
COMMENT ON COLUMN contrats.salaire IS 'Salaire du contrat en FCFA';
COMMENT ON COLUMN contrats.periode_essai IS 'Période d''essai en mois';
COMMENT ON COLUMN contrats.contrat_file IS 'Chemin vers le fichier du contrat';

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS update_contrats_updated_at ON contrats;
CREATE TRIGGER update_contrats_updated_at
    BEFORE UPDATE ON contrats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mettre à jour les contrats existants avec des valeurs par défaut
UPDATE contrats 
SET 
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
    periode_essai = COALESCE(periode_essai, 3)
WHERE created_at IS NULL OR updated_at IS NULL OR periode_essai IS NULL;











