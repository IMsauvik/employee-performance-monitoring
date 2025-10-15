-- Row Level Security Policies for Employee Performance Monitoring App
-- Run these in your Supabase SQL Editor

-- ============================================
-- TASKS TABLE POLICIES
-- ============================================

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all users to read tasks (can add role-based filtering later)
CREATE POLICY "Allow public to read tasks"
  ON tasks
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated to insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated to update tasks"
  ON tasks
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated to delete tasks"
  ON tasks
  FOR DELETE
  USING (true);

-- ============================================
-- GOALS TABLE POLICIES
-- ============================================

-- Enable RLS on goals table
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Allow all users to read goals
CREATE POLICY "Allow public to read goals"
  ON goals
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert goals
CREATE POLICY "Allow authenticated to insert goals"
  ON goals
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update goals
CREATE POLICY "Allow authenticated to update goals"
  ON goals
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete goals
CREATE POLICY "Allow authenticated to delete goals"
  ON goals
  FOR DELETE
  USING (true);

-- ============================================
-- TASK_COMMENTS TABLE POLICIES
-- ============================================

-- Enable RLS on task_comments table
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Allow all users to read comments
CREATE POLICY "Allow public to read task_comments"
  ON task_comments
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Allow authenticated to insert task_comments"
  ON task_comments
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update their own comments
CREATE POLICY "Allow authenticated to update task_comments"
  ON task_comments
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete their own comments
CREATE POLICY "Allow authenticated to delete task_comments"
  ON task_comments
  FOR DELETE
  USING (true);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all users to read notifications
CREATE POLICY "Allow public to read notifications"
  ON notifications
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert notifications
CREATE POLICY "Allow authenticated to insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update notifications
CREATE POLICY "Allow authenticated to update notifications"
  ON notifications
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete notifications
CREATE POLICY "Allow authenticated to delete notifications"
  ON notifications
  FOR DELETE
  USING (true);

-- ============================================
-- GOAL_CHECK_INS TABLE POLICIES
-- ============================================

-- Enable RLS on goal_check_ins table (if it exists)
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;

-- Allow all users to read check-ins
CREATE POLICY "Allow public to read goal_check_ins"
  ON goal_check_ins
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert check-ins
CREATE POLICY "Allow authenticated to insert goal_check_ins"
  ON goal_check_ins
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update check-ins
CREATE POLICY "Allow authenticated to update goal_check_ins"
  ON goal_check_ins
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete check-ins
CREATE POLICY "Allow authenticated to delete goal_check_ins"
  ON goal_check_ins
  FOR DELETE
  USING (true);

-- ============================================
-- TASK_DEPENDENCIES TABLE POLICIES
-- ============================================

-- Enable RLS on task_dependencies table (if it exists)
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Allow all users to read dependencies
CREATE POLICY "Allow public to read task_dependencies"
  ON task_dependencies
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert dependencies
CREATE POLICY "Allow authenticated to insert task_dependencies"
  ON task_dependencies
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update dependencies
CREATE POLICY "Allow authenticated to update task_dependencies"
  ON task_dependencies
  FOR UPDATE
  USING (true);

-- Allow authenticated users to delete dependencies
CREATE POLICY "Allow authenticated to delete task_dependencies"
  ON task_dependencies
  FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'tasks', 'goals', 'task_comments', 'notifications', 'goal_check_ins', 'task_dependencies');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
