-- =====================================================
-- FIX DEPENDENCY_TASKS TABLE RLS POLICIES
-- Disable RLS for custom authentication
-- Run this in Supabase SQL Editor
-- =====================================================

-- Disable RLS on dependency_tasks table
-- Since you're using custom auth (not Supabase Auth), auth.uid() returns NULL
-- and blocks all queries. Disabling RLS allows your custom auth to work.
ALTER TABLE dependency_tasks DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (they won't work with custom auth anyway)
DROP POLICY IF EXISTS "Users can view their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Managers and task owners can create dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Assignees can update dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Admins and managers can delete dependency tasks" ON dependency_tasks;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS disabled on dependency_tasks table';
    RAISE NOTICE '✅ Old RLS policies removed';
    RAISE NOTICE '📊 Your custom authentication will now work properly';
    RAISE NOTICE '';
    RAISE NOTICE '🔔 Note: Access control is now handled by your application logic';
END $$;
