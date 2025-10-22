-- =====================================================
-- Update POC for existing tasks
-- =====================================================
-- This script updates the POC field for all existing tasks
-- by setting it to the name of the manager who assigned the task

UPDATE tasks
SET poc = users.name
FROM users
WHERE tasks.assigned_by = users.id
  AND (tasks.poc IS NULL OR tasks.poc = '');

-- Verify the update
SELECT
  t.id,
  t.title,
  t.poc,
  u.name as assigned_by_name
FROM tasks t
LEFT JOIN users u ON t.assigned_by = u.id
ORDER BY t.created_at DESC
LIMIT 10;
