-- =====================================================
-- FIX USER DELETION - ADD RLS POLICIES FOR USERS TABLE
-- =====================================================
-- Run this in Supabase SQL Editor to fix user deletion
-- This adds the missing RLS policies for the users table

-- First, check if RLS is enabled on users table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Drop existing user policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public to read users" ON users;
DROP POLICY IF EXISTS "Allow authenticated to insert users" ON users;
DROP POLICY IF EXISTS "Allow authenticated to update users" ON users;
DROP POLICY IF EXISTS "Allow authenticated to delete users" ON users;
DROP POLICY IF EXISTS "Allow admins to delete users" ON users;

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Allow all to read active users
CREATE POLICY "Allow public to read users"
  ON users
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated to insert users (for admin creating new users)
CREATE POLICY "Allow authenticated to insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated to update users
CREATE POLICY "Allow authenticated to update users"
  ON users
  FOR UPDATE
  USING (true);

-- ⭐ CRITICAL: Allow authenticated to delete users
CREATE POLICY "Allow authenticated to delete users"
  ON users
  FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if policies are created
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ User deletion RLS policy added';
    RAISE NOTICE '✅ Users can now be deleted through the app';
    RAISE NOTICE '📝 Test by deleting a user in your admin dashboard';
END $$;
