-- =====================================================
-- DISABLE ROW LEVEL SECURITY
-- =====================================================
-- This is needed because we're using custom authentication
-- instead of Supabase Auth. Our app handles authorization
-- at the application layer.

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies (clean up)
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can do everything with users" ON users;

DROP POLICY IF EXISTS "Users can view their tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can create tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can update tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can delete tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view comments" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments" ON task_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON task_comments;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS disabled on all tables';
    RAISE NOTICE '✅ RLS policies dropped';
    RAISE NOTICE '📝 Authorization is now handled at application layer';
END $$;
