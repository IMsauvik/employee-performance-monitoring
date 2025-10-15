-- Update demo user passwords with properly hashed versions
-- Password for all users: 'demo123'

UPDATE users 
SET password_hash = '$2b$10$K7D.M91yyZv4W/E/WDaCuOI6xkJE69hOzYbsKnn3cO0rwjb06EGBi'
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'alice@demo.com', 'bob@demo.com');

-- Verify the update
SELECT id, email, name, role, password_hash 
FROM users 
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'alice@demo.com', 'bob@demo.com');
