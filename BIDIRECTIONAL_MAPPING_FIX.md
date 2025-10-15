# Bidirectional Field Mapping Fix

## 🎉 Critical Issue Resolved!

### Problem

**Error**: `Cannot read properties of undefined (reading 'split')`

Tasks were being created successfully in the database, but when reading them back, the code crashed because:

- Database returns **snake_case** fields: `due_date`, `assigned_to`, `created_at`
- Application expects **camelCase** fields: `dueDate`, `assignedTo`, `createdAt`
- The `isTaskOverdue()` function tried to call `deadline.split()` but `deadline` was `undefined`

### Root Cause

We had **one-way mapping** (JavaScript → Database) but no **reverse mapping** (Database → JavaScript):

```javascript
// ✅ Writing to database (had mapping)
const dbData = {
  due_date: taskData.dueDate, // camelCase → snake_case
  assigned_to: taskData.assignedTo,
};

// ❌ Reading from database (NO mapping)
const tasks = await supabase.from("tasks").select("*");
// Returns: { due_date: "2025-10-20", assigned_to: "uuid..." }
// App expects: { dueDate: "2025-10-20", assignedTo: "uuid..." }
// Result: task.dueDate is undefined → CRASH!
```

## ✅ Solution: Bidirectional Mapping

Added a `dbToTask()` converter function that transforms database objects back to camelCase:

### Converter Function:

```javascript
const dbToTask = (dbTask) => {
  if (!dbTask) return null;
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    assignedTo: dbTask.assigned_to, // snake_case → camelCase
    assignedBy: dbTask.assigned_by, // snake_case → camelCase
    project: dbTask.project,
    vertical: dbTask.vertical,
    priority: dbTask.priority,
    status: dbTask.status,
    startDate: dbTask.start_date, // snake_case → camelCase
    dueDate: dbTask.due_date, // snake_case → camelCase
    deadline: dbTask.due_date, // Alias for compatibility
    completedDate: dbTask.completed_date, // snake_case → camelCase
    estimatedHours: dbTask.estimated_hours, // snake_case → camelCase
    actualHours: dbTask.actual_hours, // snake_case → camelCase
    tags: dbTask.tags,
    attachments: dbTask.attachments || [],
    createdAt: dbTask.created_at, // snake_case → camelCase
    updatedAt: dbTask.updated_at, // snake_case → camelCase
  };
};
```

### Updated Methods:

#### 1. getTasks() - List all tasks

```javascript
async getTasks(userId, role) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    // ... filters ...

  if (error) throw error;
  // ✅ Convert each task from snake_case to camelCase
  return (data || []).map(dbToTask);
}
```

#### 2. getTaskById() - Get single task

```javascript
async getTaskById(id) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  // ✅ Convert from snake_case to camelCase
  return dbToTask(data);
}
```

#### 3. createTask() - Returns created task

```javascript
async createTask(taskData) {
  // Map camelCase → snake_case for insert
  const dbData = { /* ... */ };

  const { data, error } = await supabase
    .from('tasks')
    .insert([dbData])
    .select()
    .single();

  if (error) throw error;
  // ✅ Convert returned task from snake_case to camelCase
  return dbToTask(data);
}
```

#### 4. updateTask() - Returns updated task

```javascript
async updateTask(id, updates) {
  // Map camelCase → snake_case for update
  const dbUpdates = { /* ... */ };

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  // ✅ Convert returned task from snake_case to camelCase
  return dbToTask(data);
}
```

## 🔄 Complete Data Flow

### Writing (Create/Update):

```
Component
  ↓ (camelCase)
  dueDate: "2025-10-20"
  assignedTo: "uuid..."

Database Service
  ↓ (converts to snake_case)
  due_date: "2025-10-20"
  assigned_to: "uuid..."

PostgreSQL
  ✅ Stores in snake_case columns
```

### Reading (Get/List):

```
PostgreSQL
  ↓ (returns snake_case)
  due_date: "2025-10-20"
  assigned_to: "uuid..."

Database Service
  ↓ (converts to camelCase via dbToTask)
  dueDate: "2025-10-20"
  assignedTo: "uuid..."
  deadline: "2025-10-20"  (alias)

Component
  ✅ Receives expected camelCase fields
```

## 🎯 Why Both `dueDate` AND `deadline`?

Some components use `dueDate`, others use `deadline`. To avoid breaking changes:

```javascript
dueDate: dbTask.due_date,    // Primary field
deadline: dbTask.due_date,   // Alias for backward compatibility
```

This ensures both work:

```javascript
// Both work now:
task.dueDate; // ✅ Works
task.deadline; // ✅ Also works (alias)
```

## 🐛 Bugs Fixed

### Before (Broken):

```javascript
// Database returned:
{
  id: "uuid...",
  title: "Fix bugs",
  due_date: "2025-10-20",  // snake_case
  assigned_to: "uuid..."    // snake_case
}

// Component tried to use:
isTaskOverdue(task.deadline, task.status)
//             ^^^^^^^^^^^^
//             undefined! → .split() crashes
```

### After (Fixed):

```javascript
// Database returns:
{
  id: "uuid...",
  title: "Fix bugs",
  due_date: "2025-10-20",
  assigned_to: "uuid..."
}

// dbToTask() converts to:
{
  id: "uuid...",
  title: "Fix bugs",
  dueDate: "2025-10-20",     // ✅ camelCase
  deadline: "2025-10-20",    // ✅ Alias
  assignedTo: "uuid..."       // ✅ camelCase
}

// Component uses:
isTaskOverdue(task.deadline, task.status)
//             ^^^^^^^^^^^^
//             "2025-10-20" ✅ Works!
```

## 📊 Impact

### What Now Works:

✅ Task creation with database-generated UUID  
✅ Task list loads without crashes  
✅ Individual task details display correctly  
✅ Date calculations work (`isTaskOverdue`, `getDaysRemaining`)  
✅ Task updates return properly formatted data  
✅ All camelCase fields accessible in components

### Functions That Previously Crashed:

✅ `isTaskOverdue(deadline, status)` - Now has `deadline`  
✅ `getDaysRemaining(deadline)` - Now has `deadline`  
✅ Date parsing with `.split('T')` - Now has valid dates  
✅ Task filtering by date - Now has `dueDate`  
✅ Task sorting by date - Now has `createdAt`

## 🧪 Testing

### Verify Complete Flow:

1. ✅ **Create Task** (Manager assigns task)

   - Task created in database with snake_case
   - Returned task converted to camelCase
   - Success message shown

2. ✅ **View Tasks** (Manager/Employee lists)

   - Tasks fetched from database
   - Each converted to camelCase
   - Display correctly with dates

3. ✅ **Task Details** (Click on task)

   - Single task fetched by ID
   - Converted to camelCase
   - All fields display correctly

4. ✅ **Update Task** (Change status/priority)
   - Updates sent in snake_case
   - Updated task returned and converted
   - UI reflects changes

### Database Check:

```sql
-- Database still stores snake_case (correct)
SELECT
  id,
  title,
  due_date,      -- snake_case in database ✅
  assigned_to,   -- snake_case in database ✅
  created_at     -- snake_case in database ✅
FROM tasks;
```

### Application Check:

```javascript
// Application receives camelCase (correct)
const tasks = await db.getTasks();
console.log(tasks[0]);
/*
{
  id: "uuid...",
  title: "Fix bugs",
  dueDate: "2025-10-20",      // camelCase in app ✅
  deadline: "2025-10-20",     // alias ✅
  assignedTo: "uuid...",      // camelCase in app ✅
  createdAt: "2025-10-15..."  // camelCase in app ✅
}
*/
```

## 🚀 Deployment

- ✅ **Build**: Successful
- ✅ **Deployed**: Production
- 🔗 **URL**: https://employee-performance-monitoring-919oolfrz.vercel.app
- 📅 **Date**: October 16, 2025

## 🔗 Related Fixes

This completes the full migration chain:

1. ✅ **RLS Disabled** - Custom auth works
2. ✅ **UUID Auto-Generation** - Let database generate IDs
3. ✅ **Schema Mapping** - camelCase → snake_case on write
4. ✅ **Field Mapping** - taskName → title in component
5. ✅ **Bidirectional Mapping** - snake_case → camelCase on read ← **THIS FIX**

## 📝 Future Considerations

### For Goals:

Need similar `dbToGoal()` converter:

```javascript
const dbToGoal = (dbGoal) => ({
  id: dbGoal.id,
  userId: dbGoal.user_id,
  targetValue: dbGoal.target_value,
  currentValue: dbGoal.current_value,
  startDate: dbGoal.start_date,
  endDate: dbGoal.end_date,
  createdAt: dbGoal.created_at,
  // ...
});
```

### For Comments:

Need `dbToComment()` converter:

```javascript
const dbToComment = (dbComment) => ({
  id: dbComment.id,
  taskId: dbComment.task_id,
  userId: dbComment.user_id,
  parentCommentId: dbComment.parent_comment_id,
  isEdited: dbComment.is_edited,
  editedAt: dbComment.edited_at,
  createdAt: dbComment.created_at,
  // ...
});
```

## 🎓 Key Takeaways

1. **Always map bidirectionally** when database uses different naming conventions
2. **Convert at service layer** (not in components)
3. **Provide aliases** for backward compatibility
4. **Test the full round-trip** (write → read)
5. **Apply consistently** to all database tables

---

**Status**: ✅ RESOLVED  
**Priority**: CRITICAL (was blocking all task operations)  
**Impact**: Task management now fully functional end-to-end
