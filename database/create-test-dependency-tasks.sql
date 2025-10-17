-- =====================================================
-- CREATE TEST DEPENDENCY TASKS
-- This will create sample dependency tasks so you can see the section
-- =====================================================

-- First, let's get Alice Developer's ID and a manager's ID
-- Replace these with actual IDs from your database

-- Insert test dependency tasks
-- You need to replace the UUIDs with actual IDs from your database

-- Step 1: Find Alice Developer's user ID
DO $$
DECLARE
    alice_id UUID;
    manager_id UUID;
    task_id UUID;
    new_dep_id UUID;
BEGIN
    -- Get Alice's ID
    SELECT id INTO alice_id FROM users WHERE name = 'Alice Developer' LIMIT 1;

    -- Get a manager ID
    SELECT id INTO manager_id FROM users WHERE role IN ('manager', 'admin') LIMIT 1;

    -- Get any task ID for the parent task reference
    SELECT id INTO task_id FROM tasks LIMIT 1;

    IF alice_id IS NULL THEN
        RAISE EXCEPTION 'Alice Developer not found in users table';
    END IF;

    IF manager_id IS NULL THEN
        RAISE EXCEPTION 'No manager found in users table';
    END IF;

    IF task_id IS NULL THEN
        RAISE EXCEPTION 'No tasks found in tasks table';
    END IF;

    -- Create test dependency task 1
    INSERT INTO dependency_tasks (
        title,
        description,
        status,
        parent_task_id,
        parent_task_name,
        blocker_id,
        assigned_to,
        assigned_to_name,
        assigned_by,
        assigned_by_name,
        due_date,
        progress_notes,
        activity_timeline
    ) VALUES (
        'Setup Development Environment',
        'Install and configure all necessary development tools and dependencies for the project.',
        'not_started',
        task_id,
        'Build the PDP Page',
        'blocker-' || gen_random_uuid()::text,
        alice_id,
        'Alice Developer',
        manager_id,
        (SELECT name FROM users WHERE id = manager_id),
        CURRENT_DATE + INTERVAL '7 days',
        '[]'::jsonb,
        jsonb_build_array(
            jsonb_build_object(
                'id', 'activity-' || gen_random_uuid()::text,
                'type', 'CREATED',
                'title', 'Dependency Task Created',
                'description', 'Task assigned to help resolve blocker',
                'timestamp', CURRENT_TIMESTAMP,
                'userName', (SELECT name FROM users WHERE id = manager_id),
                'userId', manager_id
            )
        )
    ) RETURNING id INTO new_dep_id;

    RAISE NOTICE '✅ Created dependency task 1: %', new_dep_id;

    -- Create test dependency task 2
    INSERT INTO dependency_tasks (
        title,
        description,
        status,
        parent_task_id,
        parent_task_name,
        blocker_id,
        assigned_to,
        assigned_to_name,
        assigned_by,
        assigned_by_name,
        due_date,
        progress_notes,
        activity_timeline
    ) VALUES (
        'Review API Documentation',
        'Review and understand the API documentation to implement the required features.',
        'in_progress',
        task_id,
        'wfwdw',
        'blocker-' || gen_random_uuid()::text,
        alice_id,
        'Alice Developer',
        manager_id,
        (SELECT name FROM users WHERE id = manager_id),
        CURRENT_DATE + INTERVAL '5 days',
        jsonb_build_array(
            jsonb_build_object(
                'id', 'note-' || gen_random_uuid()::text,
                'text', 'Started reviewing the API endpoints',
                'authorId', alice_id,
                'authorName', 'Alice Developer',
                'timestamp', CURRENT_TIMESTAMP - INTERVAL '2 hours'
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'id', 'activity-' || gen_random_uuid()::text,
                'type', 'CREATED',
                'title', 'Dependency Task Created',
                'description', 'Task assigned to help resolve blocker',
                'timestamp', CURRENT_TIMESTAMP - INTERVAL '1 day',
                'userName', (SELECT name FROM users WHERE id = manager_id),
                'userId', manager_id
            ),
            jsonb_build_object(
                'id', 'activity-' || gen_random_uuid()::text,
                'type', 'STATUS_CHANGE',
                'title', 'Status changed to in_progress',
                'description', 'Alice Developer updated the status',
                'timestamp', CURRENT_TIMESTAMP - INTERVAL '2 hours',
                'userName', 'Alice Developer',
                'userId', alice_id
            )
        )
    ) RETURNING id INTO new_dep_id;

    RAISE NOTICE '✅ Created dependency task 2: %', new_dep_id;

    -- Create test dependency task 3
    INSERT INTO dependency_tasks (
        title,
        description,
        status,
        parent_task_id,
        parent_task_name,
        blocker_id,
        assigned_to,
        assigned_to_name,
        assigned_by,
        assigned_by_name,
        due_date,
        progress_notes,
        activity_timeline
    ) VALUES (
        'Provide Database Credentials',
        'Get production database access credentials from DevOps team.',
        'not_started',
        task_id,
        'dendkfemd',
        'blocker-' || gen_random_uuid()::text,
        alice_id,
        'Alice Developer',
        manager_id,
        (SELECT name FROM users WHERE id = manager_id),
        CURRENT_DATE + INTERVAL '3 days',
        '[]'::jsonb,
        jsonb_build_array(
            jsonb_build_object(
                'id', 'activity-' || gen_random_uuid()::text,
                'type', 'CREATED',
                'title', 'Dependency Task Created',
                'description', 'Task assigned to help resolve blocker',
                'timestamp', CURRENT_TIMESTAMP,
                'userName', (SELECT name FROM users WHERE id = manager_id),
                'userId', manager_id
            )
        )
    ) RETURNING id INTO new_dep_id;

    RAISE NOTICE '✅ Created dependency task 3: %', new_dep_id;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TEST DEPENDENCY TASKS CREATED!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Assigned to: Alice Developer';
    RAISE NOTICE 'Total tasks: 3';
    RAISE NOTICE '  - 1 In Progress';
    RAISE NOTICE '  - 2 Not Started';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 REFRESH YOUR DASHBOARD to see them!';
    RAISE NOTICE '';

END $$;

-- Verify the tasks were created
SELECT
    title,
    status,
    assigned_to_name,
    due_date::text as due_date,
    parent_task_name
FROM dependency_tasks
WHERE assigned_to_name = 'Alice Developer'
ORDER BY created_at DESC;
