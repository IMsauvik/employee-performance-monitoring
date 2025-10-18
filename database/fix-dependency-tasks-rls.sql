-- =====================================================
-- Fix Dependency Tasks RLS Policies
-- This makes RLS policies more permissive so users can see their dependency tasks
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can create dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can update their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can delete dependency tasks" ON dependency_tasks;

-- Create new, more permissive policies

-- 1. ALLOW READING dependency tasks
-- Users can see dependency tasks if they are:
--   - Assigned to them (assigned_to = their ID)
--   - Created by them (assigned_by = their ID)
--   - They are admin or manager
--   - They own the parent task
CREATE POLICY "Users can view their dependency tasks" ON dependency_tasks
FOR SELECT
USING (
    -- Allow if assigned to current user
    assigned_to::text = auth.uid()::text OR
    -- Allow if assigned by current user
    assigned_by::text = auth.uid()::text OR
    -- Allow if they own the parent task
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = dependency_tasks.parent_task_id
        AND tasks.assigned_to::text = auth.uid()::text
    ) OR
    -- Allow if user is admin/manager
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('admin', 'manager')
    )
);

-- 2. ALLOW CREATING dependency tasks
-- Anyone can create dependency tasks (will be restricted by app logic)
CREATE POLICY "Users can create dependency tasks" ON dependency_tasks
FOR INSERT
WITH CHECK (true);  -- Allow all inserts, app will control this

-- 3. ALLOW UPDATING dependency tasks
-- Users can update if:
--   - They are assigned to it
--   - They created it
--   - They own the parent task (for accept/reject)
--   - They are admin/manager
CREATE POLICY "Users can update their dependency tasks" ON dependency_tasks
FOR UPDATE
USING (
    assigned_to::text = auth.uid()::text OR
    assigned_by::text = auth.uid()::text OR
    EXISTS (
        SELECT 1 FROM tasks
        WHERE tasks.id = dependency_tasks.parent_task_id
        AND tasks.assigned_to::text = auth.uid()::text
    ) OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('admin', 'manager')
    )
);

-- 4. ALLOW DELETING dependency tasks
-- Only admin, manager, or creator can delete
CREATE POLICY "Users can delete dependency tasks" ON dependency_tasks
FOR DELETE
USING (
    assigned_by::text = auth.uid()::text OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id::text = auth.uid()::text
        AND users.role IN ('admin', 'manager')
    )
);

-- Verify policies were created
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'dependency_tasks';

DO $$
BEGIN
    RAISE NOTICE '✅ RLS policies updated for dependency_tasks';
    RAISE NOTICE '✅ Users should now be able to see their dependency tasks';
END $$;
