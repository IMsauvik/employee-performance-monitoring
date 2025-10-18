-- =====================================================
-- Complete Setup Verification
-- Run this to check EVERYTHING is properly configured
-- =====================================================

-- 1. Check all required columns in tasks table
DO $$
DECLARE
    col_count INTEGER;
    missing_cols TEXT;
BEGIN
    RAISE NOTICE '=== CHECKING TASKS TABLE COLUMNS ===';

    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'tasks'
    AND column_name IN (
      'poc', 'manager_feedback', 'feedback_history', 'progress_percentage',
      'progress_notes', 'rework_history', 'rework_count', 'quality_rating',
      'reviewed_at', 'reviewed_by', 'reviewed_by_name', 'accepted_date',
      'submitted_for_review_at', 'under_review_at', 'activity_timeline',
      'blocker_history', 'dependency_tasks', 'comments', 'reactions',
      'is_blocked', 'blocked_reason'
    );

    IF col_count = 21 THEN
        RAISE NOTICE '✅ All 21 required columns exist in tasks table';
    ELSE
        RAISE NOTICE '⚠️ Only % out of 21 columns exist in tasks table', col_count;

        -- Show which columns are missing
        SELECT string_agg(col, ', ') INTO missing_cols
        FROM (
            SELECT unnest(ARRAY[
              'poc', 'manager_feedback', 'feedback_history', 'progress_percentage',
              'progress_notes', 'rework_history', 'rework_count', 'quality_rating',
              'reviewed_at', 'reviewed_by', 'reviewed_by_name', 'accepted_date',
              'submitted_for_review_at', 'under_review_at', 'activity_timeline',
              'blocker_history', 'dependency_tasks', 'comments', 'reactions',
              'is_blocked', 'blocked_reason'
            ]) AS col
            EXCEPT
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'tasks'
        ) missing;

        RAISE NOTICE '❌ Missing columns: %', COALESCE(missing_cols, 'None');
    END IF;
END $$;

-- 2. Check if dependency_tasks table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING DEPENDENCY_TASKS TABLE ===';

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'dependency_tasks'
    ) INTO table_exists;

    IF table_exists THEN
        RAISE NOTICE '✅ dependency_tasks table exists';
    ELSE
        RAISE NOTICE '❌ dependency_tasks table is MISSING';
        RAISE NOTICE 'Run the migration script to create it';
    END IF;
END $$;

-- 3. Check task status constraint
DO $$
DECLARE
    constraint_def TEXT;
    has_all_statuses BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING TASK STATUS CONSTRAINT ===';

    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conname = 'tasks_status_check'
    AND conrelid = 'tasks'::regclass;

    IF constraint_def IS NOT NULL THEN
        -- Check if all required statuses are in the constraint
        has_all_statuses := (
            constraint_def LIKE '%submitted%' AND
            constraint_def LIKE '%under_review%' AND
            constraint_def LIKE '%rework_required%' AND
            constraint_def LIKE '%accepted%' AND
            constraint_def LIKE '%overdue%'
        );

        IF has_all_statuses THEN
            RAISE NOTICE '✅ Status constraint includes all workflow statuses';
        ELSE
            RAISE NOTICE '⚠️ Status constraint is missing some workflow statuses';
            RAISE NOTICE 'Constraint: %', constraint_def;
        END IF;
    ELSE
        RAISE NOTICE '❌ tasks_status_check constraint not found';
    END IF;
END $$;

-- 4. Check RLS policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CHECKING RLS POLICIES ===';

    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'tasks';

    RAISE NOTICE 'Found % RLS policies on tasks table', policy_count;

    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ RLS policies configured';
    ELSE
        RAISE NOTICE '⚠️ Some RLS policies may be missing';
    END IF;
END $$;

-- 5. Show current tasks table structure (useful for debugging)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN (
  'status', 'poc', 'manager_feedback', 'rework_history', 'quality_rating',
  'reviewed_at', 'submitted_for_review_at', 'under_review_at'
)
ORDER BY column_name;

-- 6. Final summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== VERIFICATION COMPLETE ===';
    RAISE NOTICE 'Review the messages above to see what needs to be fixed';
END $$;
