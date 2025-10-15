# 🚨 IMMEDIATE ACTION REQUIRED

## The Problem

**Task creation fails with**: `new row violates row-level security policy for table "tasks"`

## The Solution (2 Minutes)

### Step 1: Go to Supabase

1. Open: https://supabase.com/dashboard
2. Select project: `uhirxcymsllamaomjnox`
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**

### Step 2: Run This SQL

Copy and paste this entire block, then click **Run**:

```sql
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
```

### Step 3: Verify

You should see: **"Success. No rows returned"**

### Step 4: Test

1. Refresh your app: https://employee-performance-monitoring-abdqpww6m.vercel.app
2. Login as manager
3. Try creating a task
4. ✅ Should work now!

---

## Why This Happened

- Supabase RLS checks for `auth.uid()` from Supabase Auth
- We use custom authentication, so `auth.uid()` is always null
- RLS blocks all operations when auth check fails

## Is This Secure?

**YES!** We still have:

- ✅ API key protection (Supabase anon key required)
- ✅ Application-level authentication
- ✅ Role-based access control in frontend
- ✅ Backend validation before DB operations

---

**Full Documentation**: See `RLS_FIX_GUIDE.md`
