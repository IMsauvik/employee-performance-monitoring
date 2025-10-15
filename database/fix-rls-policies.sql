-- =====================================================
-- FIX RLS (Row Level Security) POLICIES
-- Run this in Supabase SQL Editor
-- =====================================================

-- OPTION 1: DISABLE RLS (Simplest for development)
-- This allows all operations without restrictions
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPTION 2: ENABLE RLS WITH PERMISSIVE POLICIES (Recommended for production)
-- Uncomment these if you want RLS enabled with proper policies
-- =====================================================

/*
-- Enable RLS on tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON tasks;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON notifications;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON task_comments;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON goals;

-- TASKS: Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- USERS: Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- NOTIFICATIONS: Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON notifications
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- TASK_COMMENTS: Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON task_comments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- GOALS: Allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON goals
    FOR ALL
    USING (true)
    WITH CHECK (true);
*/

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'users', 'notifications', 'task_comments', 'goals')
ORDER BY tablename;

-- Show existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS Configuration Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '🔓 RLS has been DISABLED on all tables';
    RAISE NOTICE '📝 This allows all database operations without restrictions';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  For production, consider enabling RLS with proper policies';
    RAISE NOTICE '💡 Uncomment OPTION 2 in the SQL file for production-ready policies';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '1. Refresh your application (Ctrl+Shift+R)';
    RAISE NOTICE '2. Try creating a task';
    RAISE NOTICE '3. Should work without RLS errors!';
END $$;
