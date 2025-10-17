# 🔧 Fix User Deletion Issue

## Problem

Users are being deleted from the frontend but remain in the database. This is because **Row Level Security (RLS)** is blocking the DELETE operation on the `users` table.

## Root Cause

The `users` table has RLS enabled but **no DELETE policy**, so Supabase blocks all deletion attempts.

## Solution Options

### ✅ Option 1: Add RLS Policy (Recommended for Production)

This adds a proper DELETE policy while keeping RLS security enabled.

**Steps:**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run this script: `database/fix-user-deletion-rls.sql`

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated to delete users
CREATE POLICY "Allow authenticated to delete users"
  ON users
  FOR DELETE
  USING (true);
```

### ⚡ Option 2: Disable RLS Completely (Quick Fix for Development)

This removes all RLS restrictions - faster but less secure.

**Steps:**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Run this command:

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

Or run the full script: `database/disable-rls.sql`

## Verification

After applying either fix, test user deletion:

1. Go to Admin Dashboard
2. Try deleting a test user
3. Check Supabase database - user should be gone
4. Check browser console for any errors

## What Changed in Code

The `deleteUser()` function was updated from:

```javascript
// OLD: Soft delete
const { error } = await supabase
  .from("users")
  .update({ is_active: false })
  .eq("id", id);
```

To:

```javascript
// NEW: Hard delete
const { error } = await supabase.from("users").delete().eq("id", id);
```

## Troubleshooting

### Still not working?

1. **Check browser console** for exact error message
2. **Verify RLS status**: Run this in Supabase SQL Editor:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';
```

3. **Check policies**: Run this:

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users';
```

### Error: "new row violates row-level security policy"

- Your RLS policies are too restrictive
- Use **Option 2** (disable RLS) or adjust policies

### Error: "permission denied"

- Your Supabase API key lacks permissions
- Check you're using the correct `SUPABASE_ANON_KEY` in `.env`

## Database Cascade Rules

If you have foreign keys referencing users, you may need to add CASCADE:

```sql
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES users(id)
ON DELETE CASCADE;
```

This ensures when a user is deleted, their related data is also cleaned up.

## Next Steps

1. ✅ Apply one of the SQL fixes above
2. ✅ Test user deletion in your app
3. ✅ Verify in Supabase database
4. ✅ Consider adding CASCADE rules for related data
5. ✅ Add a confirmation dialog for deletions (already implemented)

## Files Modified

- ✅ `src/services/databaseService.js` - Changed to hard delete
- ✅ `database/fix-user-deletion-rls.sql` - NEW: RLS fix script
- ✅ Committed and pushed to GitHub (commit: 208dd27)

## Live Deployment

Changes are already deployed to:

- **GitHub**: https://github.com/IMsauvik/employee-performance-monitoring
- **Vercel**: https://employee-performance-monitoring-ealm350ms.vercel.app

**Just need to apply the SQL fix in Supabase!** 🚀
