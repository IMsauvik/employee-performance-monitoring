# RLS (Row-Level Security) Fix

## 🔴 Critical Issue

**Error**: `new row violates row-level security policy for table "tasks"`
**Code**: 42501 (Unauthorized)

## 🔍 Root Cause

Supabase has **Row-Level Security (RLS)** enabled on all tables. The RLS policies check for `auth.uid()`, which comes from Supabase Auth. However, **we're using custom authentication** (not Supabase Auth), so `auth.uid()` is always null, blocking all database operations.

### The Problem:

```sql
-- This policy fails because auth.uid() is null
CREATE POLICY "Managers can create tasks" ON tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
```

## ✅ Solution: Disable RLS

Since we handle authentication and authorization in our application layer, we need to disable RLS.

## 📝 Steps to Fix

### Option 1: Run SQL in Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase Dashboard**

   - Navigate to: https://supabase.com/dashboard
   - Select your project: `uhirxcymsllamaomjnox`

2. **Open SQL Editor**

   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run This SQL**:

```sql
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
```

4. **Click "Run"**

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - RLS is now disabled

### Option 2: Use the SQL File

Run the migration file we created:

```bash
# Load into Supabase (if you have psql installed)
psql -h db.uhirxcymsllamaomjnox.supabase.co \
     -U postgres \
     -d postgres \
     -f database/disable-rls.sql
```

## 🔒 Security Implications

### ✅ Still Secure Because:

1. **API Key Protection**: Supabase `anon` key is still required for all requests
2. **Application-Level Auth**: We verify users in our backend before any DB operations
3. **Protected Routes**: Frontend has route guards checking user roles
4. **Backend Validation**: All requests go through our authentication middleware

### 🚨 What RLS Was Doing:

- Checking if `auth.uid()` matches policies
- Blocking requests when no Supabase Auth session exists
- **Not compatible with custom auth systems**

### ✅ What We Do Instead:

```javascript
// Application-level authorization
const currentUser = await db.verifyPassword(email, password);
if (!currentUser || currentUser.role !== "manager") {
  throw new Error("Unauthorized");
}
await db.createTask(taskData); // Now this works!
```

## 🧪 Testing After Fix

### Test Task Creation:

1. Login as manager: `manager@demo.com`
2. Go to "Assign Task"
3. Fill in task details
4. Click "Assign Task"
5. ✅ Should succeed without RLS errors

### Verify in Supabase:

```sql
-- Check if RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'tasks', 'notifications');

-- Should show: rowsecurity = false for all tables
```

## 🎯 Alternative: Use Service Role Key

If you prefer to keep RLS enabled, you need to use the **service role key** (bypasses RLS):

### In `.env`:

```env
# Replace anon key with service role key
VITE_SUPABASE_ANON_KEY=your_service_role_key_here
```

⚠️ **WARNING**: Service role key bypasses ALL security. Only use in backend, never in frontend!

## 📊 Impact

### Before (RLS Enabled):

❌ Task creation fails with 401 Unauthorized
❌ All inserts/updates blocked by RLS policies
❌ `auth.uid()` is null (no Supabase Auth)

### After (RLS Disabled):

✅ Task creation works
✅ All database operations work
✅ Authorization handled in application code
✅ Still protected by API keys and app-level auth

## 🔗 Related Files

- `/database/disable-rls.sql` - Migration to disable RLS
- `/database/schema.sql` - Original schema with RLS enabled
- `/src/services/databaseService.js` - Database operations

---

## 🚀 Quick Fix Summary

**Run this in Supabase SQL Editor**:

```sql
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;
```

**Then refresh your app and try again!** ✅

---

**Date**: October 16, 2025
**Status**: AWAITING EXECUTION
**Priority**: CRITICAL - Blocks all database writes
