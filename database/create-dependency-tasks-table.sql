-- Create dependency_tasks table to store full dependency task information
-- This is different from task_dependencies which only stores relationships

CREATE TABLE IF NOT EXISTS dependency_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Task Information
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'not_started' NOT NULL,
  
  -- Relationships
  parent_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  parent_task_name VARCHAR(500),
  blocker_id VARCHAR(255), -- Reference to blocker entry ID in parent task's blocker_history
  
  -- Assignment
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to_name VARCHAR(255),
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_by_name VARCHAR(255),
  
  -- Progress Tracking
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Review & Acceptance
  accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  accepted_by_name VARCHAR(255),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_by_name VARCHAR(255),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Tracking
  progress_notes JSONB DEFAULT '[]', -- Array of progress note objects
  activity_timeline JSONB DEFAULT '[]', -- Array of activity objects
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_parent ON dependency_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_assignee ON dependency_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_status ON dependency_tasks(status);
CREATE INDEX IF NOT EXISTS idx_dependency_tasks_blocker ON dependency_tasks(blocker_id);

-- Add status constraint to ensure valid values
ALTER TABLE dependency_tasks
DROP CONSTRAINT IF EXISTS dependency_tasks_status_check;

ALTER TABLE dependency_tasks
ADD CONSTRAINT dependency_tasks_status_check
CHECK (status IN (
  'not_started',
  'in_progress',
  'completed',
  'cancelled',
  'pending_review',
  'accepted',
  'rejected'
));

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_dependency_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dependency_tasks_updated_at_trigger ON dependency_tasks;

CREATE TRIGGER dependency_tasks_updated_at_trigger
BEFORE UPDATE ON dependency_tasks
FOR EACH ROW
EXECUTE FUNCTION update_dependency_tasks_updated_at();

-- Enable RLS (if needed, currently disabled but adding for future)
ALTER TABLE dependency_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (currently permissive since RLS is disabled globally)
CREATE POLICY "Allow all operations on dependency_tasks"
ON dependency_tasks
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE dependency_tasks IS 'Stores full dependency task objects created to resolve blockers in parent tasks';
COMMENT ON COLUMN dependency_tasks.parent_task_id IS 'The main task that is blocked and needs these dependencies resolved';
COMMENT ON COLUMN dependency_tasks.blocker_id IS 'Reference to the specific blocker entry in parent task blocker_history array';
COMMENT ON COLUMN dependency_tasks.status IS 'Current status: not_started, in_progress, completed, pending_review, accepted, rejected, cancelled';
COMMENT ON COLUMN dependency_tasks.progress_notes IS 'Array of progress updates added by assignee';
COMMENT ON COLUMN dependency_tasks.activity_timeline IS 'Array of activity events for audit trail';
