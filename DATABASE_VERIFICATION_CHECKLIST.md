# Database Verification & Testing Checklist

## =Ë Purpose
This document helps you verify that your Supabase database has all the required tables, columns, and constraints that match your application code.

---

## <¯ Quick Start

Run these verification steps in **Supabase SQL Editor** (Dashboard ’ SQL Editor ’ New Query):

### Step 1: Check All Tables Exist
```sql
-- Should return 10 tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected Output (10 tables):**
- `activity_log`
- `app_settings`
- `goals`
- `notifications`
- `performance_metrics`
- `task_comments`
- `task_dependencies`
- `task_progress_notes`
- `tasks`
- `users`

---

## =Ê Table-by-Table Verification

## 1. USERS Table

### Required Columns (15 total)
```sql
-- Verify users table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required | Default |
|------------|------|----------|---------|
| `id` | UUID | YES | `uuid_generate_v4()` |
| `email` | VARCHAR(255) | YES | - |
| `password_hash` | VARCHAR(255) | YES | - |
| `name` | VARCHAR(255) | YES | - |
| `role` | VARCHAR(50) | YES | - |
| `avatar_url` | TEXT | NO | NULL |
| `department` | VARCHAR(100) | NO | NULL |
| `position` | VARCHAR(100) | NO | NULL |
| `phone` | VARCHAR(50) | NO | NULL |
| `address` | TEXT | NO | NULL |
| `date_joined` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` |
| `last_login` | TIMESTAMP | NO | NULL |
| `is_active` | BOOLEAN | NO | `true` |
| `created_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` |
| `updated_at` | TIMESTAMP | NO | `CURRENT_TIMESTAMP` |

**Code Mapping (from databaseService.js):**
- Uses all columns as-is (snake_case in DB, camelCase in code)
- `createUser()` expects: email, password, name, role, department, position, phone, address

**Test Query:**
```sql
-- Test: Fetch all active users
SELECT id, email, name, role, department, is_active
FROM users
WHERE is_active = true
ORDER BY name
LIMIT 5;
```

---

## 2. TASKS Table (with 27 Extended Columns)

### Base Columns (17 from schema.sql)
```sql
-- Verify tasks base columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN (
    'id', 'title', 'description', 'assigned_to', 'assigned_by',
    'project', 'vertical', 'priority', 'status', 'start_date', 'due_date',
    'completed_date', 'estimated_hours', 'actual_hours', 'tags',
    'attachments', 'created_at', 'updated_at'
)
ORDER BY column_name;
```

### Extended Columns (27 from complete-migration.sql)
```sql
-- Verify ALL extended task columns (from complete-migration.sql)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN (
    -- Manager Feedback & Progress (5)
    'manager_feedback', 'feedback_history', 'progress_percentage',
    'progress_notes', 'progress_history',

    -- Activity & Timeline (2)
    'activity_timeline', 'blocker_history',

    -- Blocking & Dependencies (4)
    'is_blocked', 'blocked_reason', 'dependency_tasks', 'dependency_status',

    -- Review & Quality (8)
    'submitted_for_review_at', 'reviewed_at', 'reviewed_by', 'reviewed_by_name',
    'quality_rating', 'accepted_date', 'rework_count', 'rework_history',

    -- Assignment & Dates (4)
    'date_of_assignment', 'assigned_date', 'assignment_date_time', 'assigned_by_name',

    -- Timeline & Scheduling (2)
    'timeline', 'timeline_history',

    -- Comments & Reactions (2)
    'comments', 'reactions'
)
ORDER BY column_name;

-- Should return exactly 27 rows
```

**Complete Tasks Table (44 columns total):**

| # | Column Name | Type | Required | Code Field (camelCase) |
|---|------------|------|----------|----------------------|
| **BASE COLUMNS (17)** |
| 1 | `id` | UUID | YES | `id` |
| 2 | `title` | VARCHAR(500) | YES | `title` |
| 3 | `description` | TEXT | NO | `description` |
| 4 | `assigned_to` | UUID | NO | `assignedTo` |
| 5 | `assigned_by` | UUID | NO | `assignedBy` |
| 6 | `project` | VARCHAR(200) | NO | `project` |
| 7 | `vertical` | VARCHAR(200) | NO | `vertical` |
| 8 | `priority` | VARCHAR(50) | NO | `priority` |
| 9 | `status` | VARCHAR(50) | NO | `status` |
| 10 | `start_date` | DATE | NO | `startDate` |
| 11 | `due_date` | DATE | NO | `dueDate` / `deadline` |
| 12 | `completed_date` | TIMESTAMP | NO | `completedDate` |
| 13 | `estimated_hours` | DECIMAL(10,2) | NO | `estimatedHours` |
| 14 | `actual_hours` | DECIMAL(10,2) | NO | `actualHours` |
| 15 | `tags` | TEXT[] | NO | `tags` |
| 16 | `attachments` | JSONB | NO | `attachments` |
| 17 | `created_at` | TIMESTAMP | NO | `createdAt` |
| 18 | `updated_at` | TIMESTAMP | NO | `updatedAt` |
| **EXTENDED COLUMNS (27)** |
| 19 | `manager_feedback` | TEXT | NO | `managerFeedback` |
| 20 | `feedback_history` | JSONB | NO | `feedbackHistory` |
| 21 | `progress_percentage` | INTEGER | NO | `progressPercentage` |
| 22 | `progress_notes` | JSONB | NO | `progressNotes` |
| 23 | `progress_history` | JSONB | NO | `progressHistory` |
| 24 | `activity_timeline` | JSONB | NO | `activityTimeline` |
| 25 | `blocker_history` | JSONB | NO | `blockerHistory` |
| 26 | `is_blocked` | BOOLEAN | NO | `isBlocked` |
| 27 | `blocked_reason` | TEXT | NO | `blockedReason` |
| 28 | `dependency_tasks` | JSONB | NO | `dependencyTasks` |
| 29 | `dependency_status` | VARCHAR(50) | NO | `dependencyStatus` |
| 30 | `submitted_for_review_at` | TIMESTAMP | NO | `submittedForReviewAt` |
| 31 | `reviewed_at` | TIMESTAMP | NO | `reviewedAt` |
| 32 | `reviewed_by` | UUID | NO | `reviewedBy` |
| 33 | `reviewed_by_name` | VARCHAR(255) | NO | `reviewedByName` |
| 34 | `quality_rating` | INTEGER | NO | `qualityRating` |
| 35 | `accepted_date` | TIMESTAMP | NO | `acceptedDate` |
| 36 | `rework_count` | INTEGER | NO | `reworkCount` |
| 37 | `rework_history` | JSONB | NO | `reworkHistory` |
| 38 | `date_of_assignment` | DATE | NO | `dateOfAssignment` |
| 39 | `assigned_date` | DATE | NO | `assignedDate` |
| 40 | `assignment_date_time` | TIMESTAMP | NO | `assignmentDateTime` |
| 41 | `assigned_by_name` | VARCHAR(255) | NO | `assignedByName` |
| 42 | `timeline` | VARCHAR(100) | NO | `timeline` |
| 43 | `timeline_history` | JSONB | NO | `timelineHistory` |
| 44 | `comments` | JSONB | NO | `comments` |
| 45 | `reactions` | JSONB | NO | `reactions` |

**Test Query:**
```sql
-- Test: Verify extended columns exist and can be queried
SELECT
    id,
    title,
    status,
    progress_percentage,
    is_blocked,
    manager_feedback,
    JSONB_ARRAY_LENGTH(COALESCE(feedback_history, '[]'::jsonb)) as feedback_count,
    JSONB_ARRAY_LENGTH(COALESCE(activity_timeline, '[]'::jsonb)) as activity_count
FROM tasks
LIMIT 5;
```

---

## 3. TASK_COMMENTS Table

### Required Columns (10 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_comments'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required | Code Field |
|------------|------|----------|-----------|
| `id` | UUID | YES | `id` |
| `task_id` | UUID | NO | `taskId` |
| `user_id` | UUID | NO | `userId` |
| `comment` | TEXT | YES | `comment` |
| `parent_comment_id` | UUID | NO | `parentCommentId` |
| `mentions` | UUID[] | NO | `mentions` |
| `attachments` | JSONB | NO | `attachments` |
| `reactions` | JSONB | NO | `reactions` |
| `is_edited` | BOOLEAN | NO | `isEdited` |
| `edited_at` | TIMESTAMP | NO | `editedAt` |
| `created_at` | TIMESTAMP | NO | `createdAt` |

**Test Query:**
```sql
-- Test: Get comments with user info
SELECT
    tc.id,
    tc.task_id,
    tc.comment,
    tc.created_at,
    u.name as user_name
FROM task_comments tc
LEFT JOIN users u ON tc.user_id = u.id
ORDER BY tc.created_at DESC
LIMIT 10;
```

---

## 4. TASK_DEPENDENCIES Table

### Required Columns (5 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_dependencies'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required | Code Field |
|------------|------|----------|-----------|
| `id` | UUID | YES | `id` |
| `task_id` | UUID | NO | `taskId` |
| `depends_on_task_id` | UUID | NO | `dependsOnTaskId` |
| `dependency_type` | VARCHAR(50) | NO | `dependencyType` |
| `created_at` | TIMESTAMP | NO | `createdAt` |

**Test Query:**
```sql
-- Test: Get task dependencies with task names
SELECT
    td.id,
    t1.title as task_title,
    t2.title as depends_on_title,
    td.dependency_type
FROM task_dependencies td
LEFT JOIN tasks t1 ON td.task_id = t1.id
LEFT JOIN tasks t2 ON td.depends_on_task_id = t2.id
LIMIT 10;
```

---

## 5. TASK_PROGRESS_NOTES Table

### Required Columns (5 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'task_progress_notes'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required |
|------------|------|----------|
| `id` | UUID | YES |
| `task_id` | UUID | NO |
| `user_id` | UUID | NO |
| `note` | TEXT | YES |
| `progress_percentage` | INTEGER | NO |
| `created_at` | TIMESTAMP | NO |

**Test Query:**
```sql
-- Test: Get progress notes with user info
SELECT
    tpn.id,
    t.title as task_title,
    u.name as user_name,
    tpn.note,
    tpn.progress_percentage,
    tpn.created_at
FROM task_progress_notes tpn
LEFT JOIN tasks t ON tpn.task_id = t.id
LEFT JOIN users u ON tpn.user_id = u.id
ORDER BY tpn.created_at DESC
LIMIT 10;
```

---

## 6. GOALS Table

### Required Columns (14 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'goals'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required | Code Field |
|------------|------|----------|-----------|
| `id` | UUID | YES | `id` |
| `user_id` | UUID | NO | `userId` |
| `title` | VARCHAR(500) | YES | `title` |
| `description` | TEXT | NO | `description` |
| `category` | VARCHAR(100) | NO | `category` |
| `target_value` | DECIMAL(10,2) | NO | `targetValue` |
| `current_value` | DECIMAL(10,2) | NO | `currentValue` |
| `unit` | VARCHAR(50) | NO | `unit` |
| `start_date` | DATE | NO | `startDate` |
| `end_date` | DATE | NO | `endDate` |
| `status` | VARCHAR(50) | NO | `status` |
| `priority` | VARCHAR(50) | NO | `priority` |
| `created_by` | UUID | NO | `createdBy` |
| `created_at` | TIMESTAMP | NO | `createdAt` |
| `updated_at` | TIMESTAMP | NO | `updatedAt` |

**Test Query:**
```sql
-- Test: Get goals with user info
SELECT
    g.id,
    g.title,
    g.status,
    g.priority,
    g.current_value,
    g.target_value,
    g.unit,
    u.name as owner_name
FROM goals g
LEFT JOIN users u ON g.user_id = u.id
ORDER BY g.created_at DESC
LIMIT 10;
```

---

## 7. ACTIVITY_LOG Table

### Required Columns (10 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required |
|------------|------|----------|
| `id` | UUID | YES |
| `user_id` | UUID | NO |
| `action_type` | VARCHAR(100) | YES |
| `entity_type` | VARCHAR(100) | NO |
| `entity_id` | UUID | NO |
| `description` | TEXT | NO |
| `metadata` | JSONB | NO |
| `ip_address` | VARCHAR(45) | NO |
| `user_agent` | TEXT | NO |
| `created_at` | TIMESTAMP | NO |

**Test Query:**
```sql
-- Test: Get recent activity logs
SELECT
    al.id,
    u.name as user_name,
    al.action_type,
    al.entity_type,
    al.description,
    al.created_at
FROM activity_log al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 20;
```

---

## 8. NOTIFICATIONS Table

### Required Columns (9 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required | Code Field |
|------------|------|----------|-----------|
| `id` | UUID | YES | `id` |
| `user_id` | UUID | NO | `userId` |
| `title` | VARCHAR(500) | YES | `title` |
| `message` | TEXT | NO | `message` |
| `type` | VARCHAR(50) | NO | `type` |
| `link` | TEXT | NO | `link` |
| `is_read` | BOOLEAN | NO | `isRead` / `read` |
| `read_at` | TIMESTAMP | NO | `readAt` |
| `metadata` | JSONB | NO | `metadata` |
| `created_at` | TIMESTAMP | NO | `createdAt` |

**Test Query:**
```sql
-- Test: Get unread notifications for users
SELECT
    n.id,
    u.name as user_name,
    n.title,
    n.type,
    n.is_read,
    n.created_at
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.is_read = false
ORDER BY n.created_at DESC
LIMIT 20;
```

---

## 9. APP_SETTINGS Table

### Required Columns (5 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'app_settings'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required |
|------------|------|----------|
| `id` | UUID | YES |
| `user_id` | UUID | NO |
| `settings` | JSONB | YES |
| `created_at` | TIMESTAMP | NO |
| `updated_at` | TIMESTAMP | NO |

**Test Query:**
```sql
-- Test: Get user settings
SELECT
    aps.id,
    u.name as user_name,
    aps.settings,
    aps.updated_at
FROM app_settings aps
LEFT JOIN users u ON aps.user_id = u.id
LIMIT 10;
```

---

## 10. PERFORMANCE_METRICS Table

### Required Columns (7 total)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'performance_metrics'
ORDER BY ordinal_position;
```

**Expected Columns:**
| Column Name | Type | Required |
|------------|------|----------|
| `id` | UUID | YES |
| `user_id` | UUID | NO |
| `metric_type` | VARCHAR(100) | YES |
| `metric_value` | DECIMAL(10,2) | NO |
| `period_start` | DATE | NO |
| `period_end` | DATE | NO |
| `metadata` | JSONB | NO |
| `created_at` | TIMESTAMP | NO |

**Test Query:**
```sql
-- Test: Get performance metrics
SELECT
    pm.id,
    u.name as user_name,
    pm.metric_type,
    pm.metric_value,
    pm.period_start,
    pm.period_end
FROM performance_metrics pm
LEFT JOIN users u ON pm.user_id = u.id
ORDER BY pm.created_at DESC
LIMIT 10;
```

---

## = Comprehensive Verification Queries

### Query 1: Count All Tables and Columns
```sql
-- Should show 10 tables with their column counts
SELECT
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'tasks', 'task_comments', 'task_dependencies',
    'task_progress_notes', 'goals', 'activity_log',
    'notifications', 'app_settings', 'performance_metrics'
)
GROUP BY table_name
ORDER BY table_name;
```

**Expected Output:**
| Table Name | Column Count |
|-----------|-------------|
| `activity_log` | 10 |
| `app_settings` | 5 |
| `goals` | 14 |
| `notifications` | 9 |
| `performance_metrics` | 7 |
| `task_comments` | 10 |
| `task_dependencies` | 5 |
| `task_progress_notes` | 5 |
| `tasks` | **45** (17 base + 27 extended + 1 auto) |
| `users` | 15 |

### Query 2: Verify All Indexes
```sql
-- Check all indexes exist
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'users', 'tasks', 'task_comments', 'task_dependencies',
    'goals', 'activity_log', 'notifications', 'performance_metrics'
)
ORDER BY tablename, indexname;
```

**Expected Indexes:**
- **users**: 4 indexes (PK + email + role + is_active)
- **tasks**: 21+ indexes (PK + 6 base + 9 extended + GIN indexes)
- **task_comments**: 4 indexes (PK + task_id + user_id + created_at)
- **task_dependencies**: 3 indexes (PK + task_id + depends_on)
- **goals**: 3 indexes (PK + user_id + status)
- **activity_log**: 3 indexes (PK + user_id + created_at)
- **notifications**: 3 indexes (PK + user_id + is_read)
- **performance_metrics**: 3 indexes (PK + user_id + period)

### Query 3: Verify Foreign Key Relationships
```sql
-- Check all foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

### Query 4: Test Data Retrieval (Full Stack Test)
```sql
-- Comprehensive test: Get tasks with all relationships
SELECT
    t.id,
    t.title,
    t.status,
    t.priority,
    t.progress_percentage,
    t.is_blocked,
    u_assigned.name as assigned_to_name,
    u_assigned_by.name as assigned_by_name,
    COUNT(DISTINCT tc.id) as comment_count,
    COUNT(DISTINCT td.id) as dependency_count
FROM tasks t
LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
LEFT JOIN users u_assigned_by ON t.assigned_by = u_assigned_by.id
LEFT JOIN task_comments tc ON t.id = tc.task_id
LEFT JOIN task_dependencies td ON t.id = td.task_id
GROUP BY t.id, t.title, t.status, t.priority, t.progress_percentage,
         t.is_blocked, u_assigned.name, u_assigned_by.name
LIMIT 10;
```

---

##  Final Verification Checklist

### Step 1: Run Schema Scripts
- [ ] Run `database/schema.sql` in Supabase SQL Editor
- [ ] Run `database/complete-migration.sql` in Supabase SQL Editor
- [ ] Verify no errors in SQL execution

### Step 2: Verify Structure
- [ ] All 10 tables exist (use Query 1)
- [ ] Tasks table has 45 columns (17 base + 27 extended + auto fields)
- [ ] All indexes created (use Query 2)
- [ ] All foreign keys exist (use Query 3)

### Step 3: Test Data Operations
- [ ] Insert a test user
- [ ] Insert a test task
- [ ] Insert a test comment
- [ ] Insert a test goal
- [ ] Insert a test notification
- [ ] Verify all inserts successful

### Step 4: Test Application Integration
- [ ] Login works (verifyPassword function)
- [ ] Create task works (createTask function)
- [ ] Update task works (updateTask function)
- [ ] Fetch tasks works (getTasks function)
- [ ] Comments work (addTaskComment function)
- [ ] Notifications work (createNotification function)

### Step 5: Verify Code Mapping
- [ ] All snake_case DB columns map to camelCase in code
- [ ] All JSONB fields default to empty arrays/objects
- [ ] All timestamps use ISO format
- [ ] All UUIDs generated by database

---

## =¨ Common Issues & Fixes

### Issue 1: Missing Extended Columns in Tasks
**Symptom:** Tasks table only has 17-18 columns instead of 45

**Fix:**
```sql
-- Run the complete-migration.sql file
-- Or manually add missing columns from complete-migration.sql
```

### Issue 2: RLS Blocking Queries
**Symptom:** Queries return empty results or "permission denied"

**Fix Option 1 (Development):**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- (Repeat for all tables)
```

**Fix Option 2 (Production):**
```sql
-- Use proper RLS policies from database/create-rls-policies.sql
-- Or use database/disable-rls.sql if you're not using Supabase Auth
```

### Issue 3: Missing Indexes
**Symptom:** Slow queries, especially on large datasets

**Fix:**
```sql
-- Re-run index creation from schema.sql and complete-migration.sql
-- Check Query 2 to see which indexes are missing
```

### Issue 4: Wrong Data Types
**Symptom:** Type errors when inserting/updating data

**Fix:**
```sql
-- Verify data types match schema.sql
-- Common fixes:
ALTER TABLE tasks ALTER COLUMN tags TYPE TEXT[] USING tags::TEXT[];
ALTER TABLE tasks ALTER COLUMN attachments TYPE JSONB USING attachments::JSONB;
```

---

## =Ý Quick Test Script

Run this complete test to verify everything works:

```sql
-- COMPLETE VERIFICATION SCRIPT
-- Copy and paste this entire block into Supabase SQL Editor

DO $$
DECLARE
    v_table_count INTEGER;
    v_tasks_columns INTEGER;
    v_index_count INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'users', 'tasks', 'task_comments', 'task_dependencies',
        'task_progress_notes', 'goals', 'activity_log',
        'notifications', 'app_settings', 'performance_metrics'
    );

    -- Count tasks columns
    SELECT COUNT(*) INTO v_tasks_columns
    FROM information_schema.columns
    WHERE table_name = 'tasks';

    -- Count indexes
    SELECT COUNT(*) INTO v_index_count
    FROM pg_indexes
    WHERE schemaname = 'public';

    -- Output results
    RAISE NOTICE '';
    RAISE NOTICE '=Ê DATABASE VERIFICATION RESULTS';
    RAISE NOTICE '';
    RAISE NOTICE '';
    RAISE NOTICE ' Tables Found: % (Expected: 10)', v_table_count;
    RAISE NOTICE ' Tasks Columns: % (Expected: 45+)', v_tasks_columns;
    RAISE NOTICE ' Total Indexes: % (Expected: 40+)', v_index_count;
    RAISE NOTICE '';

    IF v_table_count = 10 THEN
        RAISE NOTICE ' All tables exist!';
    ELSE
        RAISE NOTICE 'L Missing tables! Run schema.sql';
    END IF;

    IF v_tasks_columns >= 45 THEN
        RAISE NOTICE ' Tasks table has all extended columns!';
    ELSE
        RAISE NOTICE 'L Tasks table missing columns! Run complete-migration.sql';
    END IF;

    IF v_index_count >= 40 THEN
        RAISE NOTICE ' All indexes created!';
    ELSE
        RAISE NOTICE '   Some indexes might be missing';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '';
END $$;
```

---

## =Ú Additional Resources

- **Schema File:** `database/schema.sql`
- **Migration File:** `database/complete-migration.sql`
- **Code Mapping:** `src/services/databaseService.js`
- **RLS Policies:** `database/create-rls-policies.sql` or `database/disable-rls.sql`

---

**Last Updated:** 2025-01-16
**Status:** Ready for verification 
