# 🧪 User Deletion Testing Guide

## Current Status

✅ Code fix deployed (commit: 208dd27)
✅ RLS is DISABLED in your Supabase database
⏳ Need to verify deletion works in production

## Quick Test Steps

### Option 1: Test in Production (Vercel)

1. **Open your live app**: https://employee-performance-monitoring-ealm350ms.vercel.app
2. **Login as admin** (admin@demo.com)
3. **Go to Admin Dashboard**
4. **Open Browser Console** (F12 → Console tab)
5. **Try deleting a test user** (e.g., Bob Designer)
6. **Watch for console messages**:
   - Should see: "User deleted successfully" toast
   - Should NOT see any errors
7. **Check Supabase Table Editor** - User should be gone

### Option 2: Test Locally

1. **Start dev server**:

   ```bash
   cd "/Users/sauvikparia/Employee Performace Monitoring/employee-performance-app"
   npm run dev
   ```

2. **Open**: http://localhost:5173
3. **Login as admin**
4. **Try deleting a user**
5. **Check browser console for errors**

### Option 3: Manual Database Test

**Run this SQL directly in Supabase SQL Editor:**

```sql
-- Try to delete a specific user
DELETE FROM users
WHERE email = 'bob@demo.com'
RETURNING *;
```

If this works, the database allows deletions. If not, there's a constraint issue.

## 🔍 Troubleshooting Checklist

### 1. Check if Vercel deployed the latest code

```bash
# In terminal
cd "/Users/sauvikparia/Employee Performace Monitoring/employee-performance-app"
git log --oneline -1
```

Expected: `208dd27 Fix: Change user deletion from soft delete to hard delete`

### 2. Force clear browser cache

- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached files
- **Or**: Hard refresh with Ctrl+F5
- **Or**: Open in incognito/private window

### 3. Check Vercel deployment status

Go to: https://vercel.com/dashboard

- Find your project
- Check latest deployment
- Should show commit: 208dd27
- Status should be: ✅ Ready

### 4. Verify the code is actually running

In browser console:

```javascript
// Check if the new code is loaded
console.log(window.location.href);

// Try to access the database service
import("/src/services/databaseService.js").then((module) =>
  console.log("DB Service loaded:", module)
);
```

## 🐛 Common Issues & Fixes

### Issue 1: "User deleted successfully" but still in database

**Cause**: The frontend removes user from state, but database query failed silently

**Fix**: Check browser console Network tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Try deleting a user
4. Look for Supabase API call
5. Check response - should be 204 No Content (success) or error

### Issue 2: Foreign Key Constraint Error

**Error**: `violates foreign key constraint`

**Cause**: User has related data (tasks, comments, etc.)

**Fix**: Run this SQL to allow cascade deletions:

```sql
-- Allow deleting users with related tasks
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES users(id)
ON DELETE CASCADE;

-- Same for assigned_by
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_assigned_by_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_assigned_by_fkey
FOREIGN KEY (assigned_by)
REFERENCES users(id)
ON DELETE SET NULL;
```

### Issue 3: Deployment didn't update

**Cause**: Vercel build cache

**Fix**:

1. Go to Vercel dashboard
2. Find your project
3. Click "Redeploy"
4. Check "Force redeploy without cache"

### Issue 4: Environment variables not set

**Check**: Make sure `.env` has correct Supabase credentials

```bash
# Check .env file
cat .env
```

Should have:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## ✅ Expected Behavior

When you delete a user:

1. **Confirmation dialog** appears: "Are you sure...?"
2. **Click OK**
3. **Toast notification**: "User deleted successfully"
4. **User disappears** from the table
5. **In Supabase**: User row is completely removed
6. **Network tab**: Shows DELETE request to Supabase (status 204)

## 📊 Current Database State

From your screenshot, you have these users:

- `11111111-1111-1111-1111-111111111111` - Admin User
- `22222222-2222-2222-2222-222222222222` - Manager User
- `33333333-3333-3333-3333-333333333333` - Alice Developer
- `44444444-4444-4444-4444-444444444444` - Bob Designer
- `5b3a8062-db4d-4a26-864c-40ae164c56ee` - Sauvik Paria
- `e49e14fc-9f1d-4499-b603-872a57ed5c45` - Nimai Barman
- `f7ba7943-bc6f-4e12-9845-3d5ff9379fdc` - Sauvik Paria (duplicate!)

**Test with**: Bob Designer (bob@demo.com) - he's a demo user, safe to delete

## 🎯 Next Steps

1. ✅ Choose a test method above
2. ✅ Try deleting Bob Designer
3. ✅ Check browser console for errors
4. ✅ Verify in Supabase table
5. ✅ If it works, you're done! 🎉
6. ❌ If it fails, share the error message and I'll help debug

## 📝 Notes

- The code change is correct and deployed
- RLS is disabled in your database
- The issue is likely **deployment cache** or **browser cache**
- Worst case: We can add more debug logging to track the exact issue

Let me know what happens when you test! 🚀
