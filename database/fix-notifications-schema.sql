-- =====================================================
-- FIX NOTIFICATIONS TYPE CHECK CONSTRAINT
-- =====================================================
-- The app is trying to use notification types that aren't in the CHECK constraint
-- This fixes the schema to accept all the types your app uses

-- First, check what types are currently allowed
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%notifications%type%';

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
  'comment_added',
  'comment_mention',
  'feedback_added',
  'goal_updated',
  'dependency_added'
));

-- Verify the fix
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public' 
AND constraint_name = 'notifications_type_check';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Notifications type constraint updated';
    RAISE NOTICE '✅ App can now create notifications with all types';
END $$;
