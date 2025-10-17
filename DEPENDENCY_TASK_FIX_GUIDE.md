# 🔧 DEPENDENCY TASK FLOW - FIX GUIDE

## 🚨 Problem Identified

The dependency task feature was working with **local storage** but **stopped working** after connecting to the **real database** because:

1. ❌ The `dependency_tasks` table was **never created** in the database
2. ❌ Code was calling `db.createFullDependencyTask()` which tries to INSERT into non-existent table
3. ❌ `DependencyTaskDetailModal.jsx` was using wrong field name (`task.taskId` instead of `task.parentTaskId`)

## ✅ Fixes Applied

### 1. Created Database Table (`create-dependency-tasks-table-FIXED.sql`)

```sql
CREATE TABLE dependency_tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    parent_task_id UUID REFERENCES tasks(id),
    parent_task_name VARCHAR(500),
    blocker_id TEXT,
    assigned_to UUID REFERENCES users(id),
    assigned_to_name VARCHAR(255),
    assigned_by UUID REFERENCES users(id),
    assigned_by_name VARCHAR(255),
    due_date DATE,
    completed_at TIMESTAMP,
    accepted_by UUID,
    accepted_at TIMESTAMP,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    submitted_for_review BOOLEAN,
    progress_notes JSONB,
    activity_timeline JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Features:**

- ✅ Full task tracking with status workflow
- ✅ Parent task reference and blocker linking
- ✅ Assignment tracking (who created, who assigned to)
- ✅ Review workflow (accept/reject)
- ✅ Progress notes and activity timeline
- ✅ Proper indexes for performance
- ✅ RLS policies for security
- ✅ Auto-update trigger for updated_at

### 2. Fixed DependencyTaskDetailModal.jsx

**Before:**

```javascript
const parent = await db.getTaskById(task.taskId); // ❌ Wrong field
```

**After:**

```javascript
const parent = await db.getTaskById(task.parentTaskId); // ✅ Correct field
```

## 🚀 Deployment Steps

### Step 1: Run Database Migration

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy contents of `database/create-dependency-tasks-table-FIXED.sql`
4. Paste and click **Run**
5. Verify success messages appear

**Option B: Using Command Line**

```bash
# If you have psql installed and DATABASE_URL configured
cd database
psql $DATABASE_URL -f create-dependency-tasks-table-FIXED.sql
```

### Step 2: Verify Table Creation

Run this query in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'dependency_tasks'
);

-- Should return: true

-- Check table structure
\d dependency_tasks

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'dependency_tasks';

-- Should show: rowsecurity = true
```

### Step 3: Test the Flow

#### 1. **Block a Task** (Employee Dashboard)

- Open any task
- Click "Mark as Blocked"
- Enter reason and mention users
- Submit

#### 2. **Create Dependency Tasks** (Manager/Task Owner)

- Open the blocked task
- Click "Create Dependencies" button
- Fill in dependency details:
  - Title
  - Description
  - Assign to user
  - Set due date
- Click "Create"

#### 3. **Check Employee Dashboard** (Assigned Employee)

- Login as the assigned employee
- Should see "Dependency Tasks Assigned to You" section
- Click on a dependency task to open modal

#### 4. **Work on Dependency** (Assigned Employee)

- Update status (Not Started → In Progress → Completed)
- Add progress notes
- Submit for review

#### 5. **Review & Accept** (Manager/Task Owner)

- Open parent task
- See dependency in "Dependency Tasks" section
- Click "Accept" or "Reject"

#### 6. **Auto-Unblock** (System)

- When all dependencies are accepted
- Parent task automatically unblocks
- Status changes to "In Progress"

## 🔍 Testing Checklist

- [ ] Database table created successfully
- [ ] RLS policies working (users can only see their dependencies)
- [ ] Can create dependency tasks from blocked task
- [ ] Dependencies appear in employee dashboard
- [ ] Can open dependency detail modal
- [ ] Can update dependency status
- [ ] Can add progress notes
- [ ] Notifications sent to assignees
- [ ] Manager can accept/reject dependencies
- [ ] Parent task auto-unblocks when all dependencies accepted
- [ ] Activity timeline updates correctly

## 📊 Database Queries for Debugging

### Check all dependency tasks

```sql
SELECT
    id,
    title,
    status,
    assigned_to_name,
    parent_task_name,
    created_at
FROM dependency_tasks
ORDER BY created_at DESC
LIMIT 10;
```

### Check dependencies for a specific user

```sql
SELECT
    dt.title,
    dt.status,
    dt.parent_task_name,
    t.title as parent_task_title,
    dt.created_at
FROM dependency_tasks dt
LEFT JOIN tasks t ON dt.parent_task_id = t.id
WHERE dt.assigned_to = 'USER_UUID_HERE'
ORDER BY dt.created_at DESC;
```

### Check blocked tasks with dependencies

```sql
SELECT
    t.title,
    t.status,
    t.is_blocked,
    jsonb_array_length(t.blocker_history) as blocker_count,
    (
        SELECT COUNT(*)
        FROM dependency_tasks dt
        WHERE dt.parent_task_id = t.id
    ) as dependency_count
FROM tasks t
WHERE t.is_blocked = true;
```

## 🐛 Troubleshooting

### Issue: "Table dependency_tasks doesn't exist"

**Solution:** Run the migration SQL file in Supabase SQL Editor

### Issue: "Permission denied for table dependency_tasks"

**Solution:** Check RLS policies, ensure user is authenticated

### Issue: "Dependencies not showing in dashboard"

**Solution:**

- Verify `getFullDependencyTasksByAssignee()` is being called
- Check browser console for errors
- Verify user ID matches assigned_to in database

### Issue: "Cannot create dependency tasks"

**Solution:**

- Ensure user has manager/admin role or owns parent task
- Check RLS policies allow INSERT
- Verify parent_task_id is valid UUID

### Issue: "Dependency modal not opening"

**Solution:**

- Check `selectedDependencyId` state
- Verify dependency ID exists in database
- Check browser console for errors

## 📝 Code Flow Reference

### Creating Dependencies

```
BlockerTaskModal.jsx
  → Click "Create Dependencies"
  → Opens CreateDependencyModal.jsx
    → User fills form
    → Calls db.createFullDependencyTask()
      → Inserts into dependency_tasks table
      → Sends notifications
      → Updates parent task blocker_history
```

### Viewing Dependencies

```
EmployeeDashboard.jsx
  → useEffect calls db.getFullDependencyTasksByAssignee()
    → Fetches from dependency_tasks WHERE assigned_to = currentUser.id
    → Renders cards in dashboard
  → Click on card
    → Opens DependencyTaskDetailModal.jsx
      → Shows full details, timeline, actions
```

### Updating Dependencies

```
DependencyTaskDetailModal.jsx
  → User changes status
  → Calls db.updateFullDependencyTask()
    → Updates dependency_tasks table
    → Adds activity to timeline
    → Sends notifications
  → If status = COMPLETED
    → Notifies parent task owner
    → Awaits review/acceptance
```

### Auto-Unblocking

```
EmployeeTaskDetailModal.jsx (or Manager view)
  → Manager accepts dependency
  → Calls checkAndResolveBlocker()
    → Checks if all dependencies accepted
    → If yes:
      → Updates blocker as resolved
      → Changes task status to IN_PROGRESS
      → Adds activity to timeline
```

## 🎯 Success Criteria

After deploying, you should be able to:

1. ✅ Block a task and create dependency tasks
2. ✅ Assigned employees see dependencies in their dashboard
3. ✅ Click on dependency to view and update it
4. ✅ Complete dependencies and submit for review
5. ✅ Managers can accept/reject dependencies
6. ✅ Parent task auto-unblocks when all dependencies accepted
7. ✅ All activity tracked in timeline
8. ✅ Notifications sent at each step

---

**Need Help?** Check the browser console for detailed error messages and verify database connection is working properly.
