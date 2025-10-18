-- =====================================================
-- Debug Dependency Tasks
-- Run this to see what's in the dependency_tasks table
-- =====================================================

-- 1. Check if table exists
SELECT 'dependency_tasks table exists: ' || EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'dependency_tasks'
)::text as table_status;

-- 2. Count total dependency tasks (bypassing RLS temporarily)
DO $$
DECLARE
    task_count INTEGER;
BEGIN
    -- Disable RLS temporarily to count all records
    ALTER TABLE dependency_tasks DISABLE ROW LEVEL SECURITY;
    
    SELECT COUNT(*) INTO task_count FROM dependency_tasks;
    
    RAISE NOTICE 'Total dependency tasks in database: %', task_count;
    
    -- Re-enable RLS
    ALTER TABLE dependency_tasks ENABLE ROW LEVEL SECURITY;
END $$;

-- 3. Show all dependency tasks (without RLS) - ADMIN VIEW
ALTER TABLE dependency_tasks DISABLE ROW LEVEL SECURITY;
SELECT 
    id,
    title,
    status,
    assigned_to,
    assigned_to_name,
    assigned_by,
    assigned_by_name,
    parent_task_id,
    created_at
FROM dependency_tasks
ORDER BY created_at DESC
LIMIT 10;
ALTER TABLE dependency_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Show current user ID
SELECT 
    auth.uid() as current_user_id,
    'This is your user ID' as note;

-- 5. Try to SELECT with RLS enabled (what user actually sees)
SELECT 
    COUNT(*) as visible_to_current_user,
    'Dependency tasks visible to you with current RLS policies' as note
FROM dependency_tasks;

-- 6. Show RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as policy_condition
FROM pg_policies
WHERE tablename = 'dependency_tasks'
ORDER BY cmd, policyname;
