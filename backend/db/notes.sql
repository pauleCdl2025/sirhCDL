-- Créer la table notes si elle n'existe pas
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    full_note_number VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100) DEFAULT 'Admin RH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Si la table existe déjà mais qu'il manque la colonne is_public, l'ajouter
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notes' 
        AND column_name = 'is_public'
    ) THEN
        ALTER TABLE notes ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Vérifier si la colonne created_by existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'notes' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE notes ADD COLUMN created_by VARCHAR(100) DEFAULT 'Admin RH';
    END IF;
END
$$;