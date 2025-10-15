/**
 * EMERGENCY FIX - Admin & Manager Panel Crash
 * 
 * Copy this ENTIRE script and paste it in your browser console (F12 → Console)
 * This will fix all corrupted data causing the crashes
 */

console.log('🚨 EMERGENCY FIX - Starting...\n');

// Step 1: Fix Users (ensure all have name, email, username)
console.log('1️⃣ Fixing users...');
try {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const fixedUsers = users
    .filter(u => u && u.id) // Remove invalid users
    .map(u => ({
      ...u,
      name: u.name || 'Unknown User',
      email: u.email || `user${u.id}@demo.com`,
      username: u.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, '.') : `user${u.id}`),
      role: u.role || 'employee',
      department: u.department || 'General'
    }));
  
  localStorage.setItem('users', JSON.stringify(fixedUsers));
  console.log(`✅ Fixed ${fixedUsers.length} users`);
} catch (err) {
  console.error('❌ Error fixing users:', err);
}

// Step 2: Fix Tasks
console.log('\n2️⃣ Fixing tasks...');
try {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const fixedTasks = tasks
    .filter(t => t && t.id)
    .map(t => ({
      ...t,
      taskName: t.taskName || t.title || 'Untitled Task',
      managerFeedback: Array.isArray(t.managerFeedback) ? t.managerFeedback : [],
      progressHistory: Array.isArray(t.progressHistory) ? t.progressHistory : [],
      activityTimeline: Array.isArray(t.activityTimeline) ? t.activityTimeline : [],
      progressNotes: Array.isArray(t.progressNotes) ? t.progressNotes : [],
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      blockerHistory: Array.isArray(t.blockerHistory) ? t.blockerHistory : []
    }));
  
  localStorage.setItem('tasks', JSON.stringify(fixedTasks));
  console.log(`✅ Fixed ${fixedTasks.length} tasks`);
} catch (err) {
  console.error('❌ Error fixing tasks:', err);
}

// Step 3: Fix Task Comments
console.log('\n3️⃣ Fixing task comments...');
try {
  const comments = JSON.parse(localStorage.getItem('taskComments') || '[]');
  const fixedComments = comments
    .filter(c => c && c.id)
    .map(c => ({
      ...c,
      text: c.text || c.content || '[No content]',
      content: c.content || c.text || '[No content]',
      authorName: c.authorName || 'Unknown User',
      authorId: c.authorId || 'unknown',
      taskId: c.taskId || 'unknown',
      mentions: Array.isArray(c.mentions) ? c.mentions : [],
      metadata: c.metadata || {},
      type: c.type || 'comment',
      createdAt: c.createdAt || new Date().toISOString()
    }));
  
  localStorage.setItem('taskComments', JSON.stringify(fixedComments));
  console.log(`✅ Fixed ${fixedComments.length} comments`);
} catch (err) {
  console.error('❌ Error fixing comments:', err);
}

// Step 4: Fix Dependency Tasks
console.log('\n4️⃣ Fixing dependency tasks...');
try {
  const depTasks = JSON.parse(localStorage.getItem('dependencyTasks') || '[]');
  const fixedDepTasks = depTasks
    .filter(t => t && t.id)
    .map(t => ({
      ...t,
      title: t.title || 'Untitled Dependency',
      description: t.description || '',
      status: t.status || 'not_started',
      activityTimeline: Array.isArray(t.activityTimeline) ? t.activityTimeline : [],
      progressNotes: Array.isArray(t.progressNotes) ? t.progressNotes : []
    }));
  
  localStorage.setItem('dependencyTasks', JSON.stringify(fixedDepTasks));
  console.log(`✅ Fixed ${fixedDepTasks.length} dependency tasks`);
} catch (err) {
  console.error('❌ Error fixing dependency tasks:', err);
}

// Step 5: Fix Notifications
console.log('\n5️⃣ Fixing notifications...');
try {
  const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
  const fixedNotifs = notifs
    .filter(n => n && n.id && n.userId)
    .map(n => ({
      ...n,
      message: n.message || 'Notification',
      type: n.type || 'info',
      read: typeof n.read === 'boolean' ? n.read : false,
      createdAt: n.createdAt || new Date().toISOString()
    }));
  
  localStorage.setItem('notifications', JSON.stringify(fixedNotifs));
  console.log(`✅ Fixed ${fixedNotifs.length} notifications`);
} catch (err) {
  console.error('❌ Error fixing notifications:', err);
}

// Step 6: Verify Data
console.log('\n6️⃣ Verifying data integrity...');
const summary = {
  users: JSON.parse(localStorage.getItem('users') || '[]').length,
  tasks: JSON.parse(localStorage.getItem('tasks') || '[]').length,
  dependencyTasks: JSON.parse(localStorage.getItem('dependencyTasks') || '[]').length,
  taskComments: JSON.parse(localStorage.getItem('taskComments') || '[]').length,
  notifications: JSON.parse(localStorage.getItem('notifications') || '[]').length
};

console.log('\n📊 Data Summary:');
console.table(summary);

console.log('\n✨ EMERGENCY FIX COMPLETE!');
console.log('🔄 Refreshing page in 2 seconds...\n');

// Auto-refresh after 2 seconds
setTimeout(() => {
  console.log('🔄 Refreshing now...');
  location.reload();
}, 2000);
