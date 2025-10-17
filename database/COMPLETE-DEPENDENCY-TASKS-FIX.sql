-- =====================================================
-- COMPLETE DEPENDENCY TASKS FIX
-- Run this entire script in Supabase SQL Editor
-- This will set up everything needed for dependency tasks
-- =====================================================

-- Step 1: Create dependency_tasks table (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS dependency_tasks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Task Details
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'accepted', 'rejected')),

    -- Parent Task Reference
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    parent_task_name VARCHAR(500),
    blocker_id TEXT, -- ID of blocker in parent task's blocker_history

    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_to_name VARCHAR(255),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_name VARCHAR(255),

    -- Dates & Timeline
    due_date DATE,
    completed_at TIMESTAMP,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_by_name VARCHAR(255),

    -- Review Workflow
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_by_name VARCHAR(255),
    accepted_at TIMESTAMP,
    rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejected_by_name VARCHAR(255),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    submitted_for_review BOOLEAN DEFAULT FALSE,

    -- Progress Tracking
    progress_notes JSONB DEFAULT '[]'::jsonb,
    activity_timeline JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create indexes (if not exist)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_dependency_tasks_parent_task_id ON dependency_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_assigned_to ON dependency_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_assigned_by ON dependency_tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_status ON dependency_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_blocker_id ON dependency_tasks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_created_at ON dependency_tasks(created_at);

-- JSONB indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_progress_notes_gin ON dependency_tasks USING GIN (progress_notes);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_activity_timeline_gin ON dependency_tasks USING GIN (activity_timeline);

-- Step 3: DISABLE RLS (Critical for custom auth)
-- =====================================================

ALTER TABLE dependency_tasks DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop all RLS policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view their dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Managers and task owners can create dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Assignees can update dependency tasks" ON dependency_tasks;
DROP POLICY IF EXISTS "Admins and managers can delete dependency tasks" ON dependency_tasks;

-- Step 5: Create trigger for auto-updating updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_dependency_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_dependency_tasks_updated_at ON dependency_tasks;

CREATE TRIGGER trigger_update_dependency_tasks_updated_at
    BEFORE UPDATE ON dependency_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_dependency_tasks_updated_at();

-- Step 6: Verification query
-- =====================================================

-- Check if table exists and RLS is disabled
DO $$
DECLARE
    table_exists boolean;
    rls_enabled boolean;
    row_count integer;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'dependency_tasks'
    ) INTO table_exists;

    -- Check RLS status
    IF table_exists THEN
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        WHERE relname = 'dependency_tasks';

        -- Check row count
        SELECT COUNT(*) INTO row_count FROM dependency_tasks;
    END IF;

    -- Display results
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ DEPENDENCY TASKS SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table Status:';
    IF table_exists THEN
        RAISE NOTICE '   ✅ dependency_tasks table exists';
    ELSE
        RAISE NOTICE '   ❌ dependency_tasks table NOT found';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '🔐 Security Status:';
    IF NOT rls_enabled THEN
        RAISE NOTICE '   ✅ RLS is DISABLED (correct for custom auth)';
    ELSE
        RAISE NOTICE '   ⚠️  RLS is ENABLED (may cause issues)';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '📊 Data Status:';
    RAISE NOTICE '   Current row count: %', row_count;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 Next Steps:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. Create a task and mark it as BLOCKED';
    RAISE NOTICE '2. Add a blocker reason';
    RAISE NOTICE '3. Click "Create Dependencies" button';
    RAISE NOTICE '4. Assign dependency tasks to employees';
    RAISE NOTICE '5. Employee logs in and sees dependency tasks';
    RAISE NOTICE '6. Employee updates status and adds notes';
    RAISE NOTICE '';

END $$;
