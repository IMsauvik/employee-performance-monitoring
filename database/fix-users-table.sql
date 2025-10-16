-- =====================================================
-- FIX CORRUPTED PUBLIC.USERS TABLE
-- =====================================================
-- This script drops and recreates the corrupted public.users table
-- WARNING: This will delete all existing user data in public.users
-- Make sure you have a backup if needed!
-- =====================================================

-- Step 1: Drop all dependencies and policies first
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can do everything with users" ON users;

-- Step 2: Drop the corrupted users table completely
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Recreate the users table with correct structure
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    avatar_url TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Step 5: Add trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate RLS policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do everything with users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Step 8: Insert demo users for testing
-- Password for all: 'demo123' (already hashed with bcrypt)
INSERT INTO users (id, email, password_hash, name, role, department, position, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@demo.com', '$2b$10$rGHrv8TqwXDfHF.vY2nCh.p5bXEKvQzJQXJr5YZwZKGvLZwH5YQC.', 'Admin User', 'admin', 'Management', 'System Administrator', true),
    ('22222222-2222-2222-2222-222222222222', 'manager@demo.com', '$2b$10$rGHrv8TqwXDfHF.vY2nCh.p5bXEKvQzJQXJr5YZwZKGvLZwH5YQC.', 'Manager User', 'manager', 'Operations', 'Team Manager', true),
    ('33333333-3333-3333-3333-333333333333', 'alice@demo.com', '$2b$10$rGHrv8TqwXDfHF.vY2nCh.p5bXEKvQzJQXJr5YZwZKGvLZwH5YQC.', 'Alice Developer', 'employee', 'Engineering', 'Senior Developer', true),
    ('44444444-4444-4444-4444-444444444444', 'bob@demo.com', '$2b$10$rGHrv8TqwXDfHF.vY2nCh.p5bXEKvQzJQXJr5YZwZKGvLZwH5YQC.', 'Bob Designer', 'employee', 'Design', 'UI/UX Designer', true)
ON CONFLICT (email) DO NOTHING;

-- Step 9: Verify the fix
SELECT
    'Users table fixed!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users';

-- Show the new clean structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Show demo users
SELECT id, email, name, role, department, is_active
FROM users
ORDER BY role, name;
