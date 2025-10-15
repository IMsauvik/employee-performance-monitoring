# 📸 Visual Guide - Add Database Columns (Step-by-Step)

## 🎯 Goal

Add 11 missing columns to your Supabase `tasks` table to fix the PGRST204 error.

---

## Method 1: SQL Editor (RECOMMENDED - Fast & Easy)

### Step 1: Access Supabase Dashboard

```
1. Open browser
2. Go to: https://supabase.com/dashboard
3. Login if needed
4. Click on your project (should see "uhirxcymsllamaomjnox")
```

### Step 2: Open SQL Editor

```
Look at left sidebar:
- Home
- Table Editor
- Authentication
- Storage
- Edge Functions
- Database
- ⭐ SQL Editor  ← CLICK THIS
```

### Step 3: Create New Query

```
Top right corner:
[+ New query] ← CLICK THIS
```

### Step 4: Paste SQL Code

Copy this EXACT code and paste into the editor:

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

### Step 5: Run the Query

```
Bottom right corner:
[RUN] ← CLICK THIS
or press: Ctrl+Enter (Windows) / Cmd+Enter (Mac)
```

### Step 6: Check Results

You should see:

```
✅ Success
📊 Results tab shows 11 rows:
   - activity_timeline
   - blocked_reason
   - blocker_history
   - comments
   - dependency_tasks
   - feedback_history
   - is_blocked
   - manager_feedback
   - progress_notes
   - progress_percentage
   - reactions
```

### Step 7: Verify in Table Editor

```
1. Left sidebar → Table Editor
2. Select "tasks" table
3. Scroll horizontally to the right
4. You should see new columns at the end:
   ✅ manager_feedback
   ✅ feedback_history
   ✅ progress_percentage
   ... and 8 more
```

---

## Method 2: Table Editor (Manual - Slower but Visual)

### If SQL Editor doesn't work, add columns manually:

### Step 1: Go to Table Editor

```
Left sidebar → Table Editor → tasks table
```

### Step 2: Add Each Column

Click the **[+]** button or **"Add column"** button 11 times:

#### Column 1:

```
Name: manager_feedback
Type: text
Default value: [leave empty]
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 2:

```
Name: feedback_history
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 3:

```
Name: progress_percentage
Type: int4
Default value: 0
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 4:

```
Name: progress_notes
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 5:

```
Name: activity_timeline
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 6:

```
Name: blocker_history
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 7:

```
Name: dependency_tasks
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 8:

```
Name: comments
Type: jsonb
Default value: []
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 9:

```
Name: reactions
Type: jsonb
Default value: {}
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 10:

```
Name: is_blocked
Type: bool
Default value: false
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

#### Column 11:

```
Name: blocked_reason
Type: text
Default value: [leave empty]
☐ Is Primary Key
☐ Is Unique
☑ Is Nullable
[Save]
```

---

## 🧪 Testing After Adding Columns

### Test 1: Create a Task

```
1. Go to your app
2. Login as Manager
3. Click "Assign Task"
4. Fill form and submit
5. Expected: ✅ Success message, task appears
6. Check console: ❌ No errors
```

### Test 2: Add Manager Feedback

```
1. Open an employee's task
2. Scroll to "Manager Feedback" section
3. Enter feedback text
4. Set progress percentage (e.g., 50%)
5. Click "Add Feedback"
6. Expected: ✅ Success toast, feedback appears
7. Refresh page: ✅ Feedback still there
```

### Test 3: Check Browser Console

```
1. Press F12 (DevTools)
2. Go to Console tab
3. Should see:
   ❌ NO "PGRST204" errors
   ❌ NO "Could not find column" errors
   ✅ "Task updated successfully" (or similar)
```

### Test 4: Check Network Tab

```
1. F12 → Network tab
2. Filter: "tasks"
3. Perform an action (add feedback)
4. Look for PATCH request
5. Status should be: 200 OK (not 400 or 406)
```

---

## 🚨 Troubleshooting

### Issue: "Column already exists"

**Solution:** No problem! The `IF NOT EXISTS` prevents errors. Already done ✅

### Issue: Still getting PGRST204 error

**Solutions:**

1. **Hard refresh browser:** Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Time range: Last hour
3. **Reset Supabase API cache:**
   - Supabase Dashboard → Settings → API
   - Click "Restart API" or wait 5 minutes

### Issue: Can't find SQL Editor

**Solution:**

- Use Method 2 (Table Editor) instead
- Or check if you have "Owner" or "Admin" permissions

### Issue: Permission denied in SQL Editor

**Solution:**

- Check your role in Project Settings
- You need "Owner" or "Admin" access
- Ask project owner to run the SQL

---

## ✅ Success Checklist

After running the SQL:

- [ ] SQL query ran without errors
- [ ] Verification query shows 11 columns
- [ ] Table Editor shows new columns
- [ ] App refreshed (hard refresh)
- [ ] Can create task without error
- [ ] Can add manager feedback without error
- [ ] Browser console shows no PGRST204 errors
- [ ] Network tab shows 200 OK responses

---

## 📞 Still Having Issues?

If you've followed all steps and still see errors:

1. **Screenshot the error** in browser console
2. **Check which exact column** is mentioned in error
3. **Verify in Supabase Table Editor** that column exists
4. **Check column name spelling** (snake_case vs camelCase)

The SQL file is also saved at:
`/database/add-missing-columns.sql`

---

**Run the SQL now and your app will work! 🎉**
