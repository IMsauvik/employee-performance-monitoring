-- =====================================================
-- VERIFY DEPENDENCY TASKS SETUP
-- Run this to check if everything is configured correctly
-- =====================================================

SELECT
    'Table Exists' as check_type,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'dependency_tasks'
        ) THEN '✅ YES'
        ELSE '❌ NO'
    END as status,
    'dependency_tasks table is created' as description

UNION ALL

SELECT
    'RLS Status' as check_type,
    CASE
        WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'dependency_tasks')
        THEN '⚠️ ENABLED (BAD)'
        ELSE '✅ DISABLED (GOOD)'
    END as status,
    'RLS must be disabled for custom auth' as description

UNION ALL

SELECT
    'Indexes Count' as check_type,
    COUNT(*)::text || ' indexes' as status,
    'Performance indexes created' as description
FROM pg_indexes
WHERE tablename = 'dependency_tasks'

UNION ALL

SELECT
    'Current Rows' as check_type,
    COUNT(*)::text || ' dependency tasks' as status,
    'Number of existing dependency tasks' as description
FROM dependency_tasks

UNION ALL

SELECT
    'Ready to Use' as check_type,
    '✅ YES - Ready!' as status,
    'You can now create and assign dependency tasks' as description
WHERE EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'dependency_tasks'
)
AND NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'dependency_tasks');
