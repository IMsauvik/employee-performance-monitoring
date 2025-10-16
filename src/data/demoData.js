// Demo users
export const demoUsers = [
  {
    id: '0',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    department: 'Administration',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '1',
    name: 'John Manager',
    username: 'john.manager',
    email: 'manager@demo.com',
    password: 'manager123',
    role: 'manager',
    department: 'Management',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Alice Developer',
    username: 'alice.dev',
    email: 'alice@demo.com',
    password: 'employee123',
    role: 'employee',
    department: 'Engineering',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bob Designer',
    username: 'bob.designer',
    email: 'bob@demo.com',
    password: 'employee123',
    role: 'employee',
    department: 'Design',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Carol QA',
    username: 'carol.qa',
    email: 'carol@demo.com',
    password: 'employee123',
    role: 'employee',
    department: 'Quality Assurance',
    avatar: null,
    createdAt: '2025-01-01T00:00:00Z'
  }
];

// Demo tasks
export const demoTasks = [
  {
    id: 'task-1',
    vertical: 'E-commerce',
    project: 'Shopify Store Redesign',
    taskName: 'Custom Product Section',
    taskDescription: 'Build a custom product showcase section with filtering capabilities and responsive design.',
    assignedTo: '2',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-10-01',
    assignedDate: '2025-10-01',
    deadline: '2025-10-15',
    dueDate: '2025-10-15',
    timeline: '14 days',
    status: 'in_progress',
    priority: 'high',
    progressNotes: [
      {
        id: 'note-1',
        note: 'Started development phase',
        addedBy: '2',
        addedByName: 'Alice Developer',
        timestamp: '2025-10-05T10:30:00Z'
      },
      {
        id: 'note-2',
        note: 'Design mockups completed',
        addedBy: '2',
        addedByName: 'Alice Developer',
        timestamp: '2025-10-03T14:20:00Z'
      }
    ],
    attachments: [],
    completedDate: null,
    managerFeedback: [{
      id: 'feedback-1',
      text: 'Great progress! Focus on mobile responsiveness',
      timestamp: '2025-10-05T10:30:00Z',
      authorId: '1'
    }],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-05T10:30:00Z'
  },
  {
    id: 'task-2',
    vertical: 'Mobile',
    project: 'App V2',
    taskName: 'Payment Flow Integration',
    taskDescription: 'Integrate payment gateway with the mobile app and handle all edge cases.',
    assignedTo: '2',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-09-25',
    assignedDate: '2025-09-25',
    deadline: '2025-10-05',
    dueDate: '2025-10-05',
    timeline: '10 days',
    status: 'completed',
    priority: 'high',
    progressNotes: [
      {
        id: 'note-3',
        note: 'Payment integration completed and tested',
        addedBy: '2',
        addedByName: 'Alice Developer',
        timestamp: '2025-10-04T16:00:00Z'
      }
    ],
    attachments: [],
    completedDate: '2025-10-04',
    managerFeedback: [{
      id: 'feedback-2',
      text: 'Excellent work! Delivered ahead of schedule.',
      timestamp: '2025-10-04T16:00:00Z',
      authorId: '1'
    }],
    createdAt: '2025-09-25T00:00:00Z',
    updatedAt: '2025-10-04T16:00:00Z'
  },
  {
    id: 'task-3',
    vertical: 'B2B',
    project: 'Portal Dashboard',
    taskName: 'Dashboard UI',
    taskDescription: 'Create responsive dashboard with data visualization components.',
    assignedTo: '3',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-10-03',
    assignedDate: '2025-10-03',
    deadline: '2025-10-18',
    dueDate: '2025-10-18',
    timeline: '15 days',
    status: 'in_progress',
    priority: 'medium',
    progressNotes: [
      {
        id: 'note-4',
        note: 'Working on chart components',
        addedBy: '3',
        addedByName: 'Bob Designer',
        timestamp: '2025-10-07T11:00:00Z'
      }
    ],
    attachments: [],
    completedDate: null,
  managerFeedback: [],
    createdAt: '2025-10-03T00:00:00Z',
    updatedAt: '2025-10-07T11:00:00Z'
  },
  {
    id: 'task-4',
    vertical: 'E-commerce',
    project: 'Store XYZ',
    taskName: 'Checkout Flow Optimization',
    taskDescription: 'Optimize the checkout process to reduce cart abandonment.',
    assignedTo: '4',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-10-01',
    assignedDate: '2025-10-01',
    deadline: '2025-10-12',
    dueDate: '2025-10-12',
    timeline: '11 days',
    status: 'overdue',
    priority: 'high',
    progressNotes: [
      {
        id: 'note-5',
        note: 'Found issues with payment validation',
        addedBy: '4',
        addedByName: 'Carol QA',
        timestamp: '2025-10-10T09:00:00Z'
      }
    ],
    attachments: [],
    completedDate: null,
    managerFeedback: [{
      id: 'feedback-3',
      text: 'Please provide an update on the blockers',
      timestamp: '2025-10-10T09:00:00Z',
      authorId: '1'
    }],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-10T09:00:00Z'
  },
  {
    id: 'task-5',
    vertical: 'Mobile',
    project: 'App V2',
    taskName: 'User Profile Screen',
    taskDescription: 'Design and implement user profile screen with edit capabilities.',
    assignedTo: '3',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-10-08',
    assignedDate: '2025-10-08',
    deadline: '2025-10-20',
    dueDate: '2025-10-20',
    timeline: '12 days',
    status: 'not_started',
    priority: 'low',
    progressNotes: [],
    attachments: [],
    completedDate: null,
  managerFeedback: [],
    createdAt: '2025-10-08T00:00:00Z',
    updatedAt: '2025-10-08T00:00:00Z'
  }
];

// Initialize demo data in database if not exists
export const initializeDemoData = async () => {
  try {
    // Note: This function is now a no-op for database-backed apps
    // The database should be seeded using SQL scripts in /database folder
    // Specifically, use database/schema.sql which already includes demo users

    // For local development, ensure you have:
    // 1. Created a Supabase project
    // 2. Run the database/schema.sql script
    // 3. Run the database/complete-migration.sql script (for additional columns)

    console.log('Demo data initialization skipped - using database seeding instead');

    // If you need to manually seed the database, use the database/schema.sql file
    // which contains INSERT statements for demo users
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};
