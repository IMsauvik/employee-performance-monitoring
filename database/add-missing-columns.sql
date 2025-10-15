-- Add missing columns to tasks table for manager feedback and tracking features
-- Run this in Supabase SQL Editor

-- Manager feedback and progress columns
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS manager_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]'::jsonb;

-- Activity tracking columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS blocker_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dependency_tasks JSONB DEFAULT '[]'::jsonb;

-- Additional tracking columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_is_blocked ON tasks(is_blocked);
CREATE INDEX IF NOT EXISTS idx_tasks_progress_percentage ON tasks(progress_percentage);

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN (
    'manager_feedback', 
    'feedback_history', 
    'progress_percentage',
    'progress_notes',
    'activity_timeline',
    'blocker_history',
    'dependency_tasks',
    'comments',
    'reactions',
    'is_blocked',
    'blocked_reason'
  )
ORDER BY column_name;
