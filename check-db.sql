SELECT email, name, role, 
       SUBSTRING(password_hash, 1, 20) as hash_preview 
FROM users 
WHERE email IN ('admin@demo.com', 'manager@demo.com', 'alice@demo.com', 'bob@demo.com')
ORDER BY email;
