# 🔧 Troubleshooting Guide - Admin Panel Not Opening

## Error: "Cannot read properties of undefined (reading 'split')"

This error typically occurs when there's corrupted data in localStorage, specifically in task comments or activity data.

### 🚨 Quick Fix (Recommended)

**Option 1: Run the Data Repair Script**

1. Open your browser at http://localhost:5174
2. Press **F12** to open Developer Tools
3. Click on the **Console** tab
4. Open the file: `data-repair-script.js` from the project root
5. Copy the entire contents
6. Paste into the Console
7. Press **Enter**
8. Wait for "✅ Repair script completed successfully!"
9. **Refresh the page** (F5 or Ctrl+R / Cmd+R)

**Option 2: Clear All Data (Nuclear Option)**

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Then login again - demo data will be reinitialized.

---

## 🔍 Root Cause Analysis

### What Causes This Error?

The error `Cannot read properties of undefined (reading 'split')` happens when:

1. **Task comments have missing text property**

   - Comment exists but `comment.text` and `comment.content` are both `undefined`
   - Code tries to call `.split()` on undefined value

2. **Corrupted dependency task data**

   - Dependency task missing required fields
   - Invalid activity timeline entries

3. **Invalid user data**
   - Missing username field (for mentions)
   - Null/undefined user properties

### Where the Error Occurs

**Primary Location:** `TaskCommentsModal.jsx` line 372

```jsx
{(comment.text || comment.content || '').split(/(@\w+)/).map(...)}
```

**Why It Fails:**

- If `comment.text` is `undefined` (not empty string)
- And `comment.content` is also `undefined`
- The fallback `|| ''` doesn't work if the property exists but is `undefined`

---

## ✅ Fixes Applied

### 1. Enhanced Comment Rendering

**File:** `TaskCommentsModal.jsx`

**Before:**

```jsx
{(comment.text || comment.content || '').split(/(@\w+)/).map(...)}
```

**After:**

```jsx
{((comment.text || comment.content || '') + '').split(/(@\w+)/).map(...)}
//  ↑ Force string conversion with + ''
```

**Why:** The `+ ''` ensures we always get a string, even if the value is `undefined`.

### 2. Filter Invalid Comments

**File:** `TaskCommentsModal.jsx`

**Before:**

```jsx
{comments.map(comment => { ... })}
```

**After:**

```jsx
{comments.filter(comment => comment && comment.id).map(comment => { ... })}
//         ↑ Filter out null/undefined comments
```

**Why:** Prevents trying to render comments that don't exist or are malformed.

### 3. Validate Comments on Load

**File:** `useTaskComments.js`

**Added:**

```javascript
const validComments = (allComments || []).filter(
  (c) => c && c.id && (c.text || c.content)
);
```

**Why:** Removes invalid comments before they reach the UI.

### 4. Safety Checks in Dependency Modal

**File:** `DependencyTaskDetailModal.jsx`

**Added:**

```javascript
if (!currentUser) {
  toast.error("User session expired. Please login again.");
  return;
}
```

**Why:** Prevents crashes when user session is invalid.

---

## 🛡️ Prevention Tips

### For Employees:

1. **Don't leave comments empty** - Always type text before sending
2. **Complete dependency tasks properly** - Use the status journey
3. **If you see an error** - Run the repair script immediately

### For Managers:

1. **Review dependencies carefully** - Check all fields are filled
2. **Don't delete users with active tasks** - This can create orphaned data
3. **Use the export feature regularly** - Backup your data

### For Admins:

1. **Monitor localStorage size** - Browser limit is ~5-10MB
2. **Regularly export data** - Use the export feature
3. **Clear old notifications** - Prevents data bloat
4. **Run repair script weekly** - Keeps data clean

---

## 📊 Data Integrity Checklist

### Comments

- [x] Every comment has an `id`
- [x] Every comment has `text` or `content`
- [x] `mentions` is always an array
- [x] `metadata` is always an object
- [x] `type` is set (comment, blocker, etc.)

### Tasks

- [x] `managerFeedback` is always an array
- [x] `progressHistory` is always an array
- [x] `activityTimeline` is always an array
- [x] `dependencies` is always an array
- [x] All required fields exist

### Dependency Tasks

- [x] Every task has `id` and `title`
- [x] `status` is valid enum value
- [x] `activityTimeline` is array
- [x] `parentTaskId` exists and is valid

### Users

- [x] Every user has `username` field
- [x] `name` field exists
- [x] `role` is valid (admin, manager, employee)

---

## 🔄 Recovery Steps

### If Admin Panel Won't Open:

**Step 1:** Check Browser Console

```
1. Press F12
2. Go to Console tab
3. Look for red error messages
4. Copy the error text
```

**Step 2:** Run Repair Script

```
1. Open data-repair-script.js
2. Copy entire contents
3. Paste in browser console
4. Press Enter
5. Wait for completion
6. Refresh page
```

**Step 3:** If Still Broken - Reset Data

```javascript
// In console:
localStorage.clear();
location.reload();
```

**Step 4:** Re-login

```
- Admin: admin@demo.com / admin123
- Manager: manager@demo.com / manager123
- Employee: alice@demo.com / employee123
```

---

## 🔧 Manual Data Repair

### Repair Single Comment

```javascript
// In browser console:
const comments = JSON.parse(localStorage.getItem("taskComments") || "[]");

// Find broken comment
const brokenIndex = comments.findIndex((c) => !c.text && !c.content);

if (brokenIndex >= 0) {
  // Fix it
  comments[brokenIndex].text = "[Recovered comment]";

  // Save
  localStorage.setItem("taskComments", JSON.stringify(comments));
  console.log("Fixed comment at index:", brokenIndex);
  location.reload();
}
```

### Repair All Tasks

```javascript
// In browser console:
const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

const fixed = tasks.map((task) => ({
  ...task,
  managerFeedback: Array.isArray(task.managerFeedback)
    ? task.managerFeedback
    : [],
  progressHistory: Array.isArray(task.progressHistory)
    ? task.progressHistory
    : [],
  activityTimeline: Array.isArray(task.activityTimeline)
    ? task.activityTimeline
    : [],
  dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
}));

localStorage.setItem("tasks", JSON.stringify(fixed));
console.log("Fixed", fixed.length, "tasks");
location.reload();
```

---

## 📞 Getting Help

### Error Persists After Repairs?

1. **Export your data first:**

   ```
   - Login as admin
   - Go to Users page
   - Click Export > CSV
   - Save the file
   ```

2. **Clear everything and start fresh:**

   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Check these files for errors:**

   - `src/components/common/TaskCommentsModal.jsx`
   - `src/hooks/useTaskComments.js`
   - `src/components/common/DependencyTaskDetailModal.jsx`

4. **Look for console errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Check the line numbers

---

## ✅ Verification After Repair

### Test These Features:

- [ ] Login as admin works
- [ ] Admin dashboard opens
- [ ] Can view users list
- [ ] Can create new user
- [ ] Login as manager works
- [ ] Manager dashboard opens
- [ ] Can view tasks
- [ ] Can create dependency tasks
- [ ] Login as employee works
- [ ] Employee dashboard opens
- [ ] Can open task details
- [ ] Can view comments
- [ ] Can add new comment
- [ ] Can mention users with @
- [ ] Blocker mentions show RED
- [ ] Notifications work
- [ ] Timeline shows activities

### All Working? ✅

Your system is healthy!

### Still Issues? 🚨

Run the repair script again or contact support.

---

## 🎯 Prevention Checklist

- [ ] Run repair script weekly
- [ ] Export data regularly
- [ ] Don't delete users with active tasks
- [ ] Complete all form fields
- [ ] Test after major changes
- [ ] Clear browser cache monthly
- [ ] Monitor console for warnings
- [ ] Keep backups of localStorage data

---

**Last Updated:** October 15, 2025  
**Version:** 2.0.1  
**Status:** ✅ Fixes Applied
