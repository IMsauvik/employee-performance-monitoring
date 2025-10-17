# 🚀 QUICK START - Fix Dependency Task Flow

## Problem

Dependency tasks worked with local storage but stopped working after connecting to real database.

## Solution

Run this ONE command to deploy the fix:

```bash
./deploy-dependency-fix.sh
```

Then manually run the SQL file in Supabase (instructions in the script).

---

## 📦 What's Included

1. **Database Migration** - `database/create-dependency-tasks-table-FIXED.sql`
2. **Code Fixes** - `src/components/common/DependencyTaskDetailModal.jsx`
3. **Documentation** - Full guides and troubleshooting

---

## ⚡ TL;DR - 3 Steps

### 1. Run SQL in Supabase

```sql
-- Open Supabase SQL Editor and run:
-- Copy from: database/create-dependency-tasks-table-FIXED.sql
```

### 2. Verify Table Created

```sql
SELECT COUNT(*) FROM dependency_tasks;
-- Should return 0 (empty table, but exists)
```

### 3. Test the Flow

- Block a task → Create dependencies → View in dashboard → Complete → Accept ✅

---

## 🆘 Quick Troubleshooting

| Error                    | Fix                    |
| ------------------------ | ---------------------- |
| Table doesn't exist      | Run SQL migration      |
| Permission denied        | Check you're logged in |
| Dependencies not showing | Check browser console  |

---

## 📚 Full Documentation

- **Complete Guide:** `DEPENDENCY_TASK_FIX_GUIDE.md`
- **Summary:** `DEPENDENCY_FIX_SUMMARY.md`
- **Original Docs:** `DEPENDENCY_FLOW_COMPLETE.md`

---

**Ready?** Run `./deploy-dependency-fix.sh` to get started! 🚀
