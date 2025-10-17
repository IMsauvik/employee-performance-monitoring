-- =====================================================
-- CREATE DEPENDENCY_TASKS TABLE
-- Employee Performance Monitoring System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS dependency_tasks CASCADE;

-- Create dependency_tasks table
CREATE TABLE dependency_tasks (
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

-- Create indexes for better performance
CREATE INDEX idx_dependency_tasks_parent_task_id ON dependency_tasks(parent_task_id);
CREATE INDEX idx_dependency_tasks_assigned_to ON dependency_tasks(assigned_to);
CREATE INDEX idx_dependency_tasks_assigned_by ON dependency_tasks(assigned_by);
CREATE INDEX idx_dependency_tasks_status ON dependency_tasks(status);
CREATE INDEX idx_dependency_tasks_blocker_id ON dependency_tasks(blocker_id);
CREATE INDEX idx_dependency_tasks_created_at ON dependency_tasks(created_at);

-- JSONB indexes for faster queries
CREATE INDEX idx_dependency_tasks_progress_notes_gin ON dependency_tasks USING GIN (progress_notes);
CREATE INDEX idx_dependency_tasks_activity_timeline_gin ON dependency_tasks USING GIN (activity_timeline);

-- Add comments for documentation
COMMENT ON TABLE dependency_tasks IS 'Dependency tasks created to resolve blockers in parent tasks';
COMMENT ON COLUMN dependency_tasks.title IS 'Title of the dependency task';
COMMENT ON COLUMN dependency_tasks.description IS 'Detailed description of what needs to be done';
COMMENT ON COLUMN dependency_tasks.status IS 'Current status: not_started, in_progress, completed, accepted, rejected';
COMMENT ON COLUMN dependency_tasks.parent_task_id IS 'ID of the parent task that is blocked';
COMMENT ON COLUMN dependency_tasks.parent_task_name IS 'Cached name of parent task for quick display';
COMMENT ON COLUMN dependency_tasks.blocker_id IS 'Reference to blocker entry in parent task blocker_history';
COMMENT ON COLUMN dependency_tasks.assigned_to IS 'User ID this dependency is assigned to';
COMMENT ON COLUMN dependency_tasks.assigned_to_name IS 'Cached assignee name';
COMMENT ON COLUMN dependency_tasks.assigned_by IS 'User ID who created this dependency';
COMMENT ON COLUMN dependency_tasks.assigned_by_name IS 'Cached creator name';
COMMENT ON COLUMN dependency_tasks.progress_notes IS 'Array of progress updates and notes';
COMMENT ON COLUMN dependency_tasks.activity_timeline IS 'Complete timeline of all activities';

-- Create RLS (Row Level Security) policies
ALTER TABLE dependency_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view dependency tasks assigned to them or created by them
CREATE POLICY "Users can view their dependency tasks"
ON dependency_tasks FOR SELECT
USING (
    assigned_to = auth.uid() OR 
    assigned_by = auth.uid() OR
    parent_task_id IN (
        SELECT id FROM tasks WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
    )
);

-- Policy: Users can create dependency tasks if they're manager/admin or own the parent task
CREATE POLICY "Managers and task owners can create dependency tasks"
ON dependency_tasks FOR INSERT
WITH CHECK (
    assigned_by = auth.uid() AND
    (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
        OR
        EXISTS (SELECT 1 FROM tasks WHERE id = parent_task_id AND (assigned_to = auth.uid() OR assigned_by = auth.uid()))
    )
);

-- Policy: Assignees can update their dependency tasks
CREATE POLICY "Assignees can update dependency tasks"
ON dependency_tasks FOR UPDATE
USING (
    assigned_to = auth.uid() OR
    assigned_by = auth.uid() OR
    parent_task_id IN (
        SELECT id FROM tasks WHERE assigned_to = auth.uid() OR assigned_by = auth.uid()
    )
);

-- Policy: Admins and managers can delete dependency tasks
CREATE POLICY "Admins and managers can delete dependency tasks"
ON dependency_tasks FOR DELETE
USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dependency_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dependency_tasks_updated_at
    BEFORE UPDATE ON dependency_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_dependency_tasks_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ dependency_tasks table created successfully!';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ RLS policies enabled and configured';
    RAISE NOTICE '✅ Auto-update trigger configured';
    RAISE NOTICE '';
    RAISE NOTICE '📊 You can now:';
    RAISE NOTICE '   1. Create dependency tasks from blocked tasks';
    RAISE NOTICE '   2. Assign them to team members';
    RAISE NOTICE '   3. Track progress in employee dashboard';
    RAISE NOTICE '   4. Review and accept completed dependencies';
END $$;
