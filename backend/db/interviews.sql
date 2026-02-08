CREATE TABLE IF NOT EXISTS interviews (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    interviewer VARCHAR(255) NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    interview_type VARCHAR(50) DEFAULT 'face_to_face',
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    location VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_date ON interviews(interview_date);
CREATE INDEX idx_interviews_department ON interviews(department);







