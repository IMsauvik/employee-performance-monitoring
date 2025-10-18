-- =====================================================
-- Migration: Add Review Workflow and Missing Fields
-- Date: 2025-01-18
-- Description: Adds all missing columns needed for task review workflow
-- =====================================================

-- First, drop the existing status constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add new columns to tasks table
ALTER TABLE tasks
  -- Basic fields
  ADD COLUMN IF NOT EXISTS poc VARCHAR(255),

  -- Manager feedback and progress fields
  ADD COLUMN IF NOT EXISTS manager_feedback JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]',

  -- Review workflow fields
  ADD COLUMN IF NOT EXISTS rework_history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS rework_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS accepted_date DATE,
  ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS under_review_at TIMESTAMP,

  -- Activity and timeline fields
  ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS blocker_history JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS dependency_tasks JSONB DEFAULT '[]',

  -- Additional fields
  ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add new status constraint with all required statuses
ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN (
    'not_started',
    'in_progress',
    'blocked',
    'submitted',          -- Employee submits for review
    'under_review',       -- Manager is reviewing
    'rework_required',    -- Manager rejected, needs rework
    'accepted',           -- Manager accepted
    'completed',          -- Final completed state
    'overdue',            -- Auto-set when past deadline
    'cancelled'
  ));

-- =====================================================
-- DEPENDENCY TASKS TABLE
-- =====================================================
-- Create dependency_tasks table for managing blocker dependency tasks
CREATE TABLE IF NOT EXISTS dependency_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN (
        'not_started',
        'in_progress',
        'completed',
        'cancelled',
        'pending_review',
        'accepted',
        'rejected'
    )),
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    parent_task_name VARCHAR(500),
    blocker_id VARCHAR(255),  -- ID of the blocker entry in parent task's blocker_history
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(255),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_name VARCHAR(255),
    due_date DATE,
    completed_at TIMESTAMP,
    submitted_for_review BOOLEAN DEFAULT false,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_by_name VARCHAR(255),
    accepted_at TIMESTAMP,
    rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejected_by_name VARCHAR(255),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    progress_notes JSONB DEFAULT '[]',
    activity_timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for dependency_tasks
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_parent_task_id ON dependency_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_assigned_to ON dependency_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_assigned_by ON dependency_tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_status ON dependency_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_blocker_id ON dependency_tasks(blocker_id);

-- Add updated_at trigger for dependency_tasks
CREATE TRIGGER update_dependency_tasks_updated_at BEFORE UPDATE ON dependency_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for dependency_tasks
ALTER TABLE dependency_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their dependency tasks" ON dependency_tasks FOR SELECT USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')) OR
    EXISTS (SELECT 1 FROM tasks WHERE id = parent_task_id AND (assigned_to = auth.uid() OR assigned_by = auth.uid()))
);

CREATE POLICY "Users can create dependency tasks" ON dependency_tasks FOR INSERT WITH CHECK (
    auth.uid() = assigned_by OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

CREATE POLICY "Users can update their dependency tasks" ON dependency_tasks FOR UPDATE USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')) OR
    EXISTS (SELECT 1 FROM tasks WHERE id = parent_task_id AND assigned_to = auth.uid())
);

CREATE POLICY "Users can delete dependency tasks" ON dependency_tasks FOR DELETE USING (
    assigned_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- =====================================================
-- UPDATE RLS POLICIES FOR TASKS
-- =====================================================
-- Allow employees to update their own tasks (for status changes, progress notes, etc.)
DROP POLICY IF EXISTS "Employees can update own tasks" ON tasks;
CREATE POLICY "Employees can update own tasks" ON tasks FOR UPDATE USING (
    assigned_to = auth.uid() OR assigned_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Review workflow columns added to tasks table';
    RAISE NOTICE '✅ Task status constraint updated with new statuses';
    RAISE NOTICE '✅ dependency_tasks table created';
    RAISE NOTICE '✅ Indexes and RLS policies added';
    RAISE NOTICE '✅ Employees can now update their own tasks';
    RAISE NOTICE '📝 Migration completed successfully!';
END $$;
