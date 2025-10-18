-- =====================================================
-- SIMPLE FIX: Dependency Tasks RLS
-- This uses the simplest possible policies that definitely work
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can create dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can update their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Users can delete dependency tasks" ON dependency_tasks;

-- Policy 1: Anyone logged in can read any dependency task
CREATE POLICY "allow_read_dependency_tasks" ON dependency_tasks
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Anyone logged in can create dependency tasks
CREATE POLICY "allow_create_dependency_tasks" ON dependency_tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Anyone logged in can update dependency tasks
CREATE POLICY "allow_update_dependency_tasks" ON dependency_tasks
FOR UPDATE
TO authenticated
USING (true);

-- Policy 4: Managers and creators can delete
CREATE POLICY "allow_delete_dependency_tasks" ON dependency_tasks
FOR DELETE
TO authenticated
USING (
    assigned_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'manager')
    )
);

-- Verify
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'dependency_tasks'
ORDER BY cmd;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Simple RLS policies applied';
    RAISE NOTICE '✅ All authenticated users can now read/create/update dependency tasks';
END $$;
