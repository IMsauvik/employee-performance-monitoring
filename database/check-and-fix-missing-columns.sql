-- =====================================================
-- Check and Fix Missing Columns
-- Run this if the previous migration didn't complete fully
-- =====================================================

-- First, let's see what columns currently exist
DO $$
DECLARE
    col_count INTEGER;
BEGIN
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

    RAISE NOTICE 'Found % out of 21 required columns', col_count;
END $$;

-- Add missing columns one by one (safer than bulk add)

-- Basic fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS poc VARCHAR(255);

-- Manager feedback and progress fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS manager_feedback JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]';

-- Review workflow fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rework_history JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rework_count INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_by_name VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS accepted_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS under_review_at TIMESTAMP;

-- Activity and timeline fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS activity_timeline JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_history JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependency_tasks JSONB DEFAULT '[]';

-- Additional fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Update status constraint
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check CHECK (status IN (
    'not_started', 'in_progress', 'blocked', 'submitted', 'under_review',
    'rework_required', 'accepted', 'completed', 'overdue', 'cancelled'
));

-- Verify all columns were added
DO $$
DECLARE
    col_count INTEGER;
BEGIN
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
        RAISE NOTICE '✅ SUCCESS: All 21 columns now exist!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: Only % out of 21 columns exist. Check for errors above.', col_count;
    END IF;
END $$;
