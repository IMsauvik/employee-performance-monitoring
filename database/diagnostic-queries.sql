-- =====================================================
-- DIAGNOSTIC QUERIES FOR DEPENDENCY TASKS
-- Run these to check if the system is working
-- =====================================================

-- 1. Check if dependency_tasks table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'dependency_tasks'
);
-- Expected: true

-- 2. Check if there are any dependency tasks
SELECT COUNT(*) as total_dependencies FROM dependency_tasks;
-- Expected: Number of created dependencies

-- 3. View all dependency tasks with details
SELECT 
    id,
    title,
    status,
    assigned_to,
    assigned_to_name,
    parent_task_id,
    parent_task_name,
    created_at
FROM dependency_tasks
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check RLS policies are enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'dependency_tasks';
-- Expected: rowsecurity = true

-- 5. Check what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'dependency_tasks';

-- 6. Check if your user can see dependencies (replace USER_UUID)
SELECT 
    id,
    title,
    assigned_to,
    assigned_to_name,
    status
FROM dependency_tasks
WHERE assigned_to = 'YOUR_USER_UUID_HERE';
-- Replace YOUR_USER_UUID_HERE with actual user ID

-- 7. Check blocked tasks that should have dependencies
SELECT 
    t.id,
    t.title,
    t.is_blocked,
    t.blocker_history::text,
    (
        SELECT COUNT(*) 
        FROM dependency_tasks dt 
        WHERE dt.parent_task_id = t.id
    ) as dependency_count
FROM tasks t
WHERE t.is_blocked = true;

-- 8. Test if you can insert a dependency task manually (for testing)
-- UNCOMMENT AND RUN IF NEEDED:
/*
INSERT INTO dependency_tasks (
    title,
    description,
    status,
    parent_task_id,
    parent_task_name,
    assigned_to,
    assigned_to_name,
    assigned_by,
    assigned_by_name,
    due_date
) VALUES (
    'Test Dependency Task',
    'This is a test dependency',
    'not_started',
    (SELECT id FROM tasks LIMIT 1),
    'Test Parent Task',
    (SELECT id FROM users WHERE role = 'employee' LIMIT 1),
    (SELECT name FROM users WHERE role = 'employee' LIMIT 1),
    (SELECT id FROM users WHERE role = 'manager' LIMIT 1),
    (SELECT name FROM users WHERE role = 'manager' LIMIT 1),
    CURRENT_DATE + INTERVAL '7 days'
);
*/

-- 9. Check if RLS is blocking reads (run as admin)
SET ROLE postgres;
SELECT COUNT(*) FROM dependency_tasks;
RESET ROLE;

-- 10. Check for any recent errors in logs
-- (View in Supabase Dashboard → Logs → API)
