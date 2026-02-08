
DROP TABLE IF EXISTS sanctions_table;

-- Create the table
CREATE TABLE IF NOT EXISTS sanctions_table (
  id SERIAL PRIMARY KEY,
  nom_employe VARCHAR(100) NOT NULL,
  type_sanction VARCHAR(50) NOT NULL,
  contenu_sanction TEXT NOT NULL,
  date DATE NOT NULL,
  statut VARCHAR(20) NOT NULL DEFAULT 'En cours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on nom_employe for faster lookups
CREATE INDEX idx_sanctions_nom_employe ON sanctions_table(nom_employe);

-- Create an index on date for faster searching and sorting
CREATE INDEX idx_sanctions_date ON sanctions_table(date);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_sanctions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sanctions_timestamp
BEFORE UPDATE ON sanctions_table
FOR EACH ROW
EXECUTE PROCEDURE update_sanctions_updated_at();


-- Display information about the created table
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM 
  information_schema.columns 
WHERE 
  table_name = 'sanctions_table';