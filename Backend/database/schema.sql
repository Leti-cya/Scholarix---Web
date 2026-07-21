-- Scholarix PostgreSQL Database Schema

-- Users table (Handles both Student and Provider roles)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'provider')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Student Profile fields
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    level VARCHAR(100),
    field VARCHAR(100),
    institution VARCHAR(255),
    gpa VARCHAR(50),
    
    -- Provider Profile fields
    org_name VARCHAR(255),
    org_type VARCHAR(100),
    website VARCHAR(255),
    contact_name VARCHAR(255),
    contact_title VARCHAR(100),
    reg_number VARCHAR(100),
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scholarships Table (Provider CRUD)
CREATE TABLE IF NOT EXISTS scholarships (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    amount VARCHAR(100) NOT NULL,
    deadline DATE NOT NULL,
    level VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table (Student applying to scholarships)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    scholarship_id INT REFERENCES scholarships(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'approved', 'rejected')),
    essay TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scholarship_id, student_id)
);

-- Saved Scholarships Table (Student bookmarking scholarships)
CREATE TABLE IF NOT EXISTS saved_scholarships (
    id SERIAL PRIMARY KEY,
    scholarship_id INT REFERENCES scholarships(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(scholarship_id, student_id)
);

-- Create index for performance on matching queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scholarships_eligibility ON scholarships(level, field, country);
