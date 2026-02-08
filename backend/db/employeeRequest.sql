-- Table structure for employee_requests
CREATE TABLE IF NOT EXISTS employee_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  request_type VARCHAR(50) NOT NULL, -- Type: leave, absence, document
  request_details TEXT, -- Détails de la demande
  start_date DATE DEFAULT NULL, -- Date de début (pour congés et absences)
  end_date DATE DEFAULT NULL, -- Date de fin (pour congés et absences)
  reason TEXT, -- Motif de la demande
  status VARCHAR(20) DEFAULT 'pending', -- Status: pending, approved, rejected
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_date TIMESTAMP DEFAULT NULL, -- Date de réponse du RH
  response_comments TEXT, -- Commentaires du RH
  start_time TIME DEFAULT NULL,
  end_time TIME DEFAULT NULL
);

-- Create index on employee_id
CREATE INDEX idx_employee_requests_employee_id ON employee_requests(employee_id);

-- Create index on status
CREATE INDEX idx_employee_requests_status ON employee_requests(status);

-- Create index on request_type
CREATE INDEX idx_employee_requests_type ON employee_requests(request_type);

