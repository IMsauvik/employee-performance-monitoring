-- =====================================================
-- Verify Dependency Tasks Setup
-- Run this to check if dependency tasks are properly configured
-- =====================================================

-- 1. Check if dependency_tasks table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '=== CHECKING DEPENDENCY_TASKS TABLE ===';

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'dependency_tasks'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ dependency_tasks table exists';

        -- Count columns
        SELECT COUNT(*) INTO column_count
        FROM information_schema.columns
        WHERE table_name = 'dependency_tasks';

        RAISE NOTICE '   Table has % columns', column_count;
    ELSE
        RAISE NOTICE '❌ dependency_tasks table is MISSING!';
        RAISE NOTICE '   You need to create it. Run the CREATE TABLE script.';
    END IF;
END $$;

-- 2. Show table structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dependency_tasks'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'dependency_tasks';

-- 4. Count existing dependency tasks
DO $$
DECLARE
    dep_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dependency_tasks') THEN
        EXECUTE 'SELECT COUNT(*) FROM dependency_tasks' INTO dep_count;
        RAISE NOTICE '';
        RAISE NOTICE '=== DEPENDENCY TASKS DATA ===';
        RAISE NOTICE 'Total dependency tasks: %', dep_count;
    END IF;
END $$;
