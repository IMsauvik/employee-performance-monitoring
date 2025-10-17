-- =====================================================
-- COMPREHENSIVE DATABASE FIXES
-- =====================================================
-- Run this in Supabase SQL Editor to fix all current issues

-- ============================================
-- FIX 1: Update Notifications Type Constraint
-- ============================================

-- Drop the existing type check constraint
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recreate with all the types your app uses
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'info',
  'success', 
  'warning',
  'error',
  'task_assigned',
  'task_updated',
  'task_completed',
  'task_blocked',
  'task_mention',
  'blocker_mention',
  'comment_added',
  'comment_mention',
  'mention',
  'feedback_added',
  'goal_updated',
  'dependency_added'
));

-- ============================================
-- FIX 2: Make task_comments.comment NOT NULL but allow empty
-- ============================================

-- First, update any existing null comments to empty string
UPDATE task_comments 
SET comment = '' 
WHERE comment IS NULL;

-- The column should already be NOT NULL, but let's verify
ALTER TABLE task_comments 
ALTER COLUMN comment SET NOT NULL;

-- ============================================
-- FIX 3: Add getDependencyTasksByAssignee support
-- ============================================

-- No SQL needed - this is a code fix
-- Create index to speed up dependency queries
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id 
ON task_dependencies(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on 
ON task_dependencies(depends_on_task_id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check notifications constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public' 
AND constraint_name = 'notifications_type_check';

-- Check for null comments
SELECT COUNT(*) as null_comments
FROM task_comments
WHERE comment IS NULL;

-- Check task_dependencies indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'task_dependencies';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Notifications type constraint updated';
    RAISE NOTICE '✅ Task comments cleaned';
    RAISE NOTICE '✅ Dependency indexes created';
    RAISE NOTICE '📝 Now fix the code issues (see FIX_ALL_ISSUES.md)';
END $$;
