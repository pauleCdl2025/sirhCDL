-- Table structure for request_files
-- Cette table stocke les fichiers associés aux demandes d'employés
CREATE TABLE IF NOT EXISTS request_files (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER NOT NULL, -- ID de l'employé qui a uploadé le fichier
  description TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approval_date TIMESTAMP DEFAULT NULL,
  approved_by INTEGER DEFAULT NULL,
  approval_comments TEXT,
  
  -- Contraintes
  CONSTRAINT fk_request_files_request_id FOREIGN KEY (request_id) REFERENCES employee_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_request_files_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_request_files_approved_by FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Index pour améliorer les performances
CREATE INDEX idx_request_files_request_id ON request_files(request_id);
CREATE INDEX idx_request_files_uploaded_by ON request_files(uploaded_by);
CREATE INDEX idx_request_files_upload_date ON request_files(upload_date);
CREATE INDEX idx_request_files_is_approved ON request_files(is_approved);

-- Table pour les commentaires sur les fichiers
CREATE TABLE IF NOT EXISTS file_comments (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL,
  commenter_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_internal BOOLEAN DEFAULT FALSE, -- Si le commentaire est visible uniquement par le RH
  
  -- Contraintes
  CONSTRAINT fk_file_comments_file_id FOREIGN KEY (file_id) REFERENCES request_files(id) ON DELETE CASCADE,
  CONSTRAINT fk_file_comments_commenter_id FOREIGN KEY (commenter_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Index pour les commentaires
CREATE INDEX idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX idx_file_comments_commenter_id ON file_comments(commenter_id);
CREATE INDEX idx_file_comments_comment_date ON file_comments(comment_date);

-- Table pour l'historique des actions sur les fichiers
CREATE TABLE IF NOT EXISTS file_action_history (
  id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- upload, download, approve, reject, delete
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  action_by INTEGER NOT NULL,
  action_details TEXT,
  ip_address VARCHAR(45),
  
  -- Contraintes
  CONSTRAINT fk_file_action_history_file_id FOREIGN KEY (file_id) REFERENCES request_files(id) ON DELETE CASCADE,
  CONSTRAINT fk_file_action_history_action_by FOREIGN KEY (action_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Index pour l'historique
CREATE INDEX idx_file_action_history_file_id ON file_action_history(file_id);
CREATE INDEX idx_file_action_history_action_type ON file_action_history(action_type);
CREATE INDEX idx_file_action_history_action_date ON file_action_history(action_date);











