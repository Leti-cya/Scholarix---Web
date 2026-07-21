-- Scholarix Database Seeding Script

-- 1. Insert a default Provider account (password: password123, hashed using bcrypt)
INSERT INTO users (
    role,
    email,
    password,
    org_name,
    org_type,
    website,
    contact_name,
    contact_title,
    reg_number,
    description
) VALUES (
    'provider',
    'provider@scholarix.com',
    '$2b$10$gH69p4XpEqB/UoUqI83K7.f5/d.Jj.2uR0x2k9oY4bF5T9z2WvQ2m', -- password123
    'Aga Khan Foundation International',
    'Non-profit Foundation',
    'https://www.akdn.org/our-agencies/aga-khan-foundation',
    'Dr. James Osei',
    'Head of Programmes',
    'AKF-998877',
    'An international non-governmental organisation dedicated to improving quality of life in resource-poor areas.'
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert a default Student account (password: password123, hashed using bcrypt)
INSERT INTO users (
    role,
    email,
    password,
    first_name,
    last_name,
    country,
    phone,
    level,
    field,
    institution,
    gpa
) VALUES (
    'student',
    'student@scholarix.com',
    '$2b$10$gH69p4XpEqB/UoUqI83K7.f5/d.Jj.2uR0x2k9oY4bF5T9z2WvQ2m', -- password123
    'Alice',
    'Kamara',
    'Sierra Leone',
    '+232-76-123456',
    'Postgraduate (Master''s)',
    'Business & Management',
    'London School of Economics',
    '3.96 / 4.0'
) ON CONFLICT (email) DO NOTHING;

-- 3. Seed initial scholarships (associated with the default provider)
-- Let's fetch the provider's ID dynamically
INSERT INTO scholarships (
    provider_id,
    name,
    provider_name,
    description,
    amount,
    deadline,
    level,
    field,
    country,
    requirements
) 
SELECT 
    id,
    'Gates Cambridge Scholarship',
    'University of Cambridge',
    'The Gates Cambridge Scholarships are prestigious, highly competitive full-cost scholarships. They are awarded to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree in any subject available at the University of Cambridge.',
    '$60,000 / year',
    '2026-12-12',
    'Postgraduate (Master''s)',
    'Business & Management',
    'United Kingdom',
    'Outstanding academic record, strong leadership potential, and commitment to improving the lives of others.'
FROM users WHERE email = 'provider@scholarix.com'
LIMIT 1;

INSERT INTO scholarships (
    provider_id,
    name,
    provider_name,
    description,
    amount,
    deadline,
    level,
    field,
    country,
    requirements
)
SELECT 
    id,
    'Chevening Scholarship',
    'UK Foreign, Commonwealth & Development Office',
    'Chevening is the UK government''s international awards programme aimed at developing global leaders. Funded by the Foreign, Commonwealth and Development Office and partner organisations, it offers full funding for master''s degrees in the UK.',
    '$45,000 / year',
    '2026-11-05',
    'Postgraduate (Master''s)',
    'Arts & Humanities',
    'United Kingdom',
    'At least two years of work experience, undergraduate degree equivalent to an upper second-class honours, and return to home country for 2 years after study.'
FROM users WHERE email = 'provider@scholarix.com'
LIMIT 1;

INSERT INTO scholarships (
    provider_id,
    name,
    provider_name,
    description,
    amount,
    deadline,
    level,
    field,
    country,
    requirements
)
SELECT 
    id,
    'AAUW Selected Professions Fellowship',
    'American Association of University Women',
    'Selected Professions Fellowships are awarded to women who intend to pursue a full-time course of study in designated degree programs where women''s participation has historically been low.',
    '$20,000',
    '2026-08-01',
    'Postgraduate (Master''s)',
    'Engineering & Technology',
    'United States',
    'Must be a US citizen or permanent resident, identifying as a woman, enrolled in a specified postgraduate field.'
FROM users WHERE email = 'provider@scholarix.com'
LIMIT 1;

INSERT INTO scholarships (
    provider_id,
    name,
    provider_name,
    description,
    amount,
    deadline,
    level,
    field,
    country,
    requirements
)
SELECT 
    id,
    'EY Foundation Scholarship',
    'Ernst & Young Foundation',
    'Awarded to undergraduate and master''s students studying Business, Management, Economics, Finance, or Accounting who demonstrate academic excellence and a desire to make a difference in local and global businesses.',
    '$15,000',
    '2026-09-15',
    'Postgraduate (Master''s)',
    'Business & Management',
    'United Kingdom',
    'GPA equivalent of 3.5 or above, majoring in Accounting, Finance, Economics or Business Administration.'
FROM users WHERE email = 'provider@scholarix.com'
LIMIT 1;
