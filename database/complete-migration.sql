-- =====================================================
-- FINAL COMPLETE DATABASE MIGRATION
-- Employee Performance Monitoring System
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: ADD ALL MISSING COLUMNS TO TASKS TABLE
-- =====================================================

-- Manager Feedback & Progress (5 columns)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS manager_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progress_history JSONB DEFAULT '[]'::jsonb;

-- Activity & Timeline Tracking (2 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS blocker_history JSONB DEFAULT '[]'::jsonb;

-- Blocking & Dependencies (4 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS dependency_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dependency_status VARCHAR(50);

-- Review & Quality (8 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reviewed_by_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
ADD COLUMN IF NOT EXISTS accepted_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS rework_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rework_history JSONB DEFAULT '[]'::jsonb;

-- Assignment & Dates (4 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS date_of_assignment DATE,
ADD COLUMN IF NOT EXISTS assigned_date DATE,
ADD COLUMN IF NOT EXISTS assignment_date_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS assigned_by_name VARCHAR(255);

-- Timeline & Scheduling (2 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
ADD COLUMN IF NOT EXISTS timeline_history JSONB DEFAULT '[]'::jsonb;

-- Comments & Reactions - denormalized for quick access (2 columns)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb;

-- =====================================================
-- PART 2: ADD PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_is_blocked ON tasks(is_blocked);
CREATE INDEX IF NOT EXISTS idx_tasks_progress_percentage ON tasks(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_tasks_submitted_for_review_at ON tasks(submitted_for_review_at);
CREATE INDEX IF NOT EXISTS idx_tasks_reviewed_at ON tasks(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_tasks_reviewed_by ON tasks(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_tasks_quality_rating ON tasks(quality_rating);
CREATE INDEX IF NOT EXISTS idx_tasks_rework_count ON tasks(rework_count);
CREATE INDEX IF NOT EXISTS idx_tasks_date_of_assignment ON tasks(date_of_assignment);
CREATE INDEX IF NOT EXISTS idx_tasks_assignment_date_time ON tasks(assignment_date_time);

-- JSONB indexes for faster queries on arrays/objects
CREATE INDEX IF NOT EXISTS idx_tasks_activity_timeline_gin ON tasks USING GIN (activity_timeline);
CREATE INDEX IF NOT EXISTS idx_tasks_blocker_history_gin ON tasks USING GIN (blocker_history);
CREATE INDEX IF NOT EXISTS idx_tasks_dependency_tasks_gin ON tasks USING GIN (dependency_tasks);

-- =====================================================
-- PART 3: ADD COLUMN COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN tasks.manager_feedback IS 'Current feedback text from manager';
COMMENT ON COLUMN tasks.feedback_history IS 'Array of historical feedback entries with timestamps';
COMMENT ON COLUMN tasks.progress_percentage IS 'Task completion percentage (0-100)';
COMMENT ON COLUMN tasks.progress_notes IS 'Array of progress update notes';
COMMENT ON COLUMN tasks.progress_history IS 'Historical progress tracking data';
COMMENT ON COLUMN tasks.activity_timeline IS 'Complete timeline of all task activities and events';
COMMENT ON COLUMN tasks.blocker_history IS 'History of all blockers encountered';
COMMENT ON COLUMN tasks.is_blocked IS 'Whether task is currently blocked';
COMMENT ON COLUMN tasks.blocked_reason IS 'Reason for current block';
COMMENT ON COLUMN tasks.dependency_tasks IS 'Array of related dependency task IDs';
COMMENT ON COLUMN tasks.dependency_status IS 'Overall status of dependencies';
COMMENT ON COLUMN tasks.submitted_for_review_at IS 'Timestamp when task was submitted for manager review';
COMMENT ON COLUMN tasks.reviewed_at IS 'Timestamp when review was completed';
COMMENT ON COLUMN tasks.reviewed_by IS 'UUID of user who reviewed the task';
COMMENT ON COLUMN tasks.reviewed_by_name IS 'Name of reviewer (denormalized for performance)';
COMMENT ON COLUMN tasks.quality_rating IS 'Quality score given by reviewer (1-5)';
COMMENT ON COLUMN tasks.accepted_date IS 'Timestamp when task was accepted';
COMMENT ON COLUMN tasks.rework_count IS 'Number of times task was sent back for rework';
COMMENT ON COLUMN tasks.rework_history IS 'Detailed history of rework requests';
COMMENT ON COLUMN tasks.date_of_assignment IS 'Date when task was assigned';
COMMENT ON COLUMN tasks.assigned_date IS 'Alias for date_of_assignment (compatibility)';
COMMENT ON COLUMN tasks.assignment_date_time IS 'Exact timestamp of assignment';
COMMENT ON COLUMN tasks.assigned_by_name IS 'Name of manager who assigned (denormalized)';
COMMENT ON COLUMN tasks.timeline IS 'Timeline category (e.g., 1-2 weeks, 2-4 weeks)';
COMMENT ON COLUMN tasks.timeline_history IS 'History of timeline changes';
COMMENT ON COLUMN tasks.comments IS 'Denormalized comments for quick access';
COMMENT ON COLUMN tasks.reactions IS 'Emoji reactions to task';

-- =====================================================
-- PART 4: UPDATE EXISTING DATA WITH SENSIBLE DEFAULTS
-- =====================================================

-- Set assignment dates for existing tasks
UPDATE tasks 
SET 
    date_of_assignment = created_at::date,
    assigned_date = created_at::date,
    assignment_date_time = created_at
WHERE date_of_assignment IS NULL;

-- Initialize progress for in-progress tasks
UPDATE tasks 
SET progress_percentage = CASE 
    WHEN status = 'completed' THEN 100
    WHEN status = 'in_progress' THEN 50
    ELSE 0
END
WHERE progress_percentage = 0;

-- =====================================================
-- PART 5: VERIFICATION
-- =====================================================

-- Verify all columns exist
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN (
    'manager_feedback', 'feedback_history', 'progress_percentage', 'progress_notes', 'progress_history',
    'activity_timeline', 'blocker_history',
    'is_blocked', 'blocked_reason', 'dependency_tasks', 'dependency_status',
    'submitted_for_review_at', 'reviewed_at', 'reviewed_by', 'reviewed_by_name', 
    'quality_rating', 'accepted_date', 'rework_count', 'rework_history',
    'date_of_assignment', 'assigned_date', 'assignment_date_time', 'assigned_by_name',
    'timeline', 'timeline_history',
    'comments', 'reactions'
)
ORDER BY column_name;

-- This should return 27 rows

-- =====================================================
-- PART 6: GET TABLE SUMMARY
-- =====================================================

SELECT 
    COUNT(*) as total_columns,
    COUNT(CASE WHEN is_nullable = 'YES' THEN 1 END) as nullable_columns,
    COUNT(CASE WHEN column_default IS NOT NULL THEN 1 END) as columns_with_defaults
FROM information_schema.columns 
WHERE table_name = 'tasks';

-- Show index summary
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'tasks'
ORDER BY indexname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration Complete!';
    RAISE NOTICE '📊 Added 27 new columns to tasks table';
    RAISE NOTICE '🚀 Added 12 performance indexes';
    RAISE NOTICE '✨ Updated existing tasks with default values';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Next Steps:';
    RAISE NOTICE '1. Refresh your application (Ctrl+Shift+R)';
    RAISE NOTICE '2. Test task creation';
    RAISE NOTICE '3. Test manager feedback';
    RAISE NOTICE '4. Monitor browser console for errors';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your application should now work perfectly!';
END $$;
