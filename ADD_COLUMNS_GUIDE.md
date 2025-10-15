# 🔧 URGENT FIX REQUIRED - Missing Database Columns

## ⚠️ Problem

Error: `PGRST204 - Could not find the 'manager_feedback' column of 'tasks' in the schema cache`

**Root Cause:** The code references columns that don't exist in your Supabase database.

## ✅ Solution - Add Missing Columns to Database

### Step 1: Go to Supabase SQL Editor

1. Open your browser and go to: https://supabase.com/dashboard
2. Select your project: **uhirxcymsllamaomjnox**
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Copy and Paste This SQL

```sql
-- Add missing columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS manager_feedback TEXT,
ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS blocker_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dependency_tasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add indexes for performance
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
```

### Step 3: Run the Query

1. Click the **RUN** button (or press Ctrl/Cmd + Enter)
2. Wait for "Success. No rows returned"
3. Scroll down to see the verification results showing all columns

### Step 4: Expected Result

You should see output like this:

```
column_name          | data_type | column_default
---------------------|-----------|----------------
activity_timeline    | jsonb     | '[]'::jsonb
blocked_reason       | text      | NULL
blocker_history      | jsonb     | '[]'::jsonb
comments             | jsonb     | '[]'::jsonb
dependency_tasks     | jsonb     | '[]'::jsonb
feedback_history     | jsonb     | '[]'::jsonb
is_blocked           | boolean   | false
manager_feedback     | text      | NULL
progress_notes       | jsonb     | '[]'::jsonb
progress_percentage  | integer   | 0
reactions            | jsonb     | '{}'::jsonb
```

### Step 5: Test in Your App

1. **Refresh your app** (hard refresh: Ctrl/Cmd + Shift + R)
2. **Try adding manager feedback** - Should work now!
3. **Try creating a task** - Error should be gone!

## 📋 What These Columns Do

| Column                | Type    | Purpose                                     |
| --------------------- | ------- | ------------------------------------------- |
| `manager_feedback`    | TEXT    | Current feedback from manager               |
| `feedback_history`    | JSONB   | Array of all feedback entries               |
| `progress_percentage` | INTEGER | Task completion % (0-100)                   |
| `progress_notes`      | JSONB   | Array of progress updates                   |
| `activity_timeline`   | JSONB   | All task activities/events                  |
| `blocker_history`     | JSONB   | Record of blockers                          |
| `dependency_tasks`    | JSONB   | Related dependency tasks                    |
| `comments`            | JSONB   | Task comments (if not using separate table) |
| `reactions`           | JSONB   | Emoji reactions to task                     |
| `is_blocked`          | BOOLEAN | Whether task is currently blocked           |
| `blocked_reason`      | TEXT    | Reason for blocking                         |

## 🔍 Why This Happened

1. The code was updated to use these fields
2. The database schema wasn't updated to match
3. PostgreSQL couldn't find the columns
4. Result: PGRST204 error

## ⚡ Quick Alternative (If SQL Editor Not Available)

If you can't access SQL Editor, use the **Table Editor**:

1. Go to **Table Editor** → **tasks** table
2. Click **Add column** 11 times for each column:
   - Name: `manager_feedback`, Type: `text`
   - Name: `feedback_history`, Type: `jsonb`, Default: `[]`
   - Name: `progress_percentage`, Type: `int4`, Default: `0`
   - Name: `progress_notes`, Type: `jsonb`, Default: `[]`
   - Name: `activity_timeline`, Type: `jsonb`, Default: `[]`
   - Name: `blocker_history`, Type: `jsonb`, Default: `[]`
   - Name: `dependency_tasks`, Type: `jsonb`, Default: `[]`
   - Name: `comments`, Type: `jsonb`, Default: `[]`
   - Name: `reactions`, Type: `jsonb`, Default: `{}`
   - Name: `is_blocked`, Type: `bool`, Default: `false`
   - Name: `blocked_reason`, Type: `text`

## ✅ Verification

After running the SQL, verify by:

1. **Check Supabase Table Editor:**

   - Go to Table Editor → tasks
   - Scroll right to see new columns

2. **Check Your App:**

   - Open browser console (F12)
   - Try adding manager feedback
   - Should see success message, no errors

3. **Check Network Tab:**
   - Open DevTools → Network
   - Filter by "tasks"
   - PATCH request should return 200 OK (not 400)

## 🚨 Important Notes

- **Safe to Run:** Uses `IF NOT EXISTS` - won't break existing data
- **Existing Tasks:** Will have default values for new columns
- **No Downtime:** Can run while app is live
- **Reversible:** Can drop columns if needed (but don't!)

## 📞 If Issues Persist

After adding columns, if you still see errors:

1. **Clear Supabase Cache:**

   - In Supabase Dashboard → Settings → API
   - Click "Reset API" (this clears schema cache)

2. **Hard Refresh App:**

   - Ctrl/Cmd + Shift + R
   - Or clear browser cache

3. **Check Browser Console:**
   - Look for new error messages
   - Share exact error code

---

**Run the SQL script now, then test your app! 🚀**
