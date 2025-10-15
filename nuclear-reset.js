/**
 * NUCLEAR OPTION - Complete Data Reset & Reinitialization
 * 
 * This will completely reset your localStorage and reinitialize with fresh demo data.
 * Use this if the emergency fix didn't work.
 * 
 * COPY THIS ENTIRE SCRIPT AND PASTE IN BROWSER CONSOLE (F12 → Console)
 */

console.log('💥 NUCLEAR OPTION - Complete Reset Starting...\n');

// Step 1: Clear everything
console.log('1️⃣ Clearing all localStorage...');
localStorage.clear();
console.log('✅ Cleared');

// Step 2: Initialize demo users
console.log('\n2️⃣ Creating demo users...');
const demoUsers = [
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

localStorage.setItem('users', JSON.stringify(demoUsers));
console.log(`✅ Created ${demoUsers.length} users`);

// Step 3: Initialize demo tasks
console.log('\n3️⃣ Creating demo tasks...');
const demoTasks = [
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
    progressNotes: [],
    attachments: [],
    completedDate: null,
    managerFeedback: [],
    progressHistory: [],
    blockerHistory: [],
    activityTimeline: [],
    dependencies: [],
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-05T10:30:00Z'
  },
  {
    id: 'task-2',
    vertical: 'Marketing',
    project: 'Landing Page Optimization',
    taskName: 'Hero Section Redesign',
    taskDescription: 'Redesign the hero section with compelling copy and call-to-action buttons.',
    assignedTo: '3',
    assignedBy: '1',
    poc: 'John Manager',
    dateOfAssignment: '2025-10-02',
    assignedDate: '2025-10-02',
    deadline: '2025-10-20',
    dueDate: '2025-10-20',
    timeline: '18 days',
    status: 'not_started',
    priority: 'medium',
    progressNotes: [],
    attachments: [],
    completedDate: null,
    managerFeedback: [],
    progressHistory: [],
    blockerHistory: [],
    activityTimeline: [],
    dependencies: [],
    createdAt: '2025-10-02T00:00:00Z',
    updatedAt: '2025-10-02T00:00:00Z'
  }
];

localStorage.setItem('tasks', JSON.stringify(demoTasks));
console.log(`✅ Created ${demoTasks.length} tasks`);

// Step 4: Initialize empty arrays for other data
console.log('\n4️⃣ Initializing empty collections...');
localStorage.setItem('taskComments', JSON.stringify([]));
localStorage.setItem('dependencyTasks', JSON.stringify([]));
localStorage.setItem('notifications', JSON.stringify([]));
console.log('✅ Initialized empty collections');

// Step 5: Verify
console.log('\n5️⃣ Verifying data...');
const verification = {
  users: JSON.parse(localStorage.getItem('users') || '[]').length,
  tasks: JSON.parse(localStorage.getItem('tasks') || '[]').length,
  taskComments: JSON.parse(localStorage.getItem('taskComments') || '[]').length,
  dependencyTasks: JSON.parse(localStorage.getItem('dependencyTasks') || '[]').length,
  notifications: JSON.parse(localStorage.getItem('notifications') || '[]').length
};

console.log('\n📊 Verification Results:');
console.table(verification);

console.log('\n✨ COMPLETE RESET SUCCESSFUL!');
console.log('📝 Demo Accounts:');
console.log('   Admin: admin@demo.com / admin123');
console.log('   Manager: manager@demo.com / manager123');
console.log('   Employee: alice@demo.com / employee123');
console.log('\n🔄 Refreshing page in 2 seconds...');

setTimeout(() => {
  console.log('🔄 Refreshing now...');
  location.reload();
}, 2000);
