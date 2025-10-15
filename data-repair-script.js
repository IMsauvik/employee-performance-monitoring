/**
 * Data Repair Script for Employee Performance Monitoring System
 * 
 * This script fixes corrupted or invalid data in localStorage that might cause
 * errors like "Cannot read properties of undefined (reading 'split')"
 * 
 * HOW TO USE:
 * 1. Open your browser (Chrome, Firefox, Safari, etc.)
 * 2. Go to the application (http://localhost:5174)
 * 3. Press F12 to open Developer Tools
 * 4. Go to the "Console" tab
 * 5. Copy and paste this entire script
 * 6. Press Enter to run
 * 7. Refresh the page (F5 or Ctrl+R / Cmd+R)
 */

console.log('🔧 Starting Data Repair...');

// Function to repair task comments
function repairTaskComments() {
  console.log('📝 Repairing task comments...');
  
  try {
    const commentsData = localStorage.getItem('taskComments');
    if (!commentsData) {
      console.log('✅ No task comments to repair');
      return;
    }

    const comments = JSON.parse(commentsData);
    
    // Filter out invalid comments and fix missing properties
    const repairedComments = comments
      .filter(comment => {
        // Must have an ID
        if (!comment || !comment.id) {
          console.warn('⚠️ Removing comment without ID:', comment);
          return false;
        }
        return true;
      })
      .map(comment => {
        // Ensure text or content exists
        if (!comment.text && !comment.content) {
          console.warn('⚠️ Fixing comment without text:', comment.id);
          comment.text = '[No content]';
        }
        
        // Ensure other required fields exist
        if (!comment.taskId) comment.taskId = 'unknown';
        if (!comment.authorId) comment.authorId = 'unknown';
        if (!comment.authorName) comment.authorName = 'Unknown User';
        if (!comment.createdAt) comment.createdAt = new Date().toISOString();
        if (!comment.type) comment.type = 'comment';
        if (!Array.isArray(comment.mentions)) comment.mentions = [];
        if (!comment.metadata) comment.metadata = {};
        
        return comment;
      });

    localStorage.setItem('taskComments', JSON.stringify(repairedComments));
    console.log(`✅ Repaired ${repairedComments.length} task comments`);
  } catch (error) {
    console.error('❌ Error repairing task comments:', error);
  }
}

// Function to repair tasks
function repairTasks() {
  console.log('📋 Repairing tasks...');
  
  try {
    const tasksData = localStorage.getItem('tasks');
    if (!tasksData) {
      console.log('✅ No tasks to repair');
      return;
    }

    const tasks = JSON.parse(tasksData);
    
    const repairedTasks = tasks.map(task => {
      // Ensure array fields are arrays
      if (!Array.isArray(task.managerFeedback)) {
        if (task.managerFeedback) {
          task.managerFeedback = [task.managerFeedback];
        } else {
          task.managerFeedback = [];
        }
      }
      
      if (!Array.isArray(task.progressHistory)) task.progressHistory = [];
      if (!Array.isArray(task.blockerHistory)) task.blockerHistory = [];
      if (!Array.isArray(task.activityTimeline)) task.activityTimeline = [];
      if (!Array.isArray(task.progressNotes)) task.progressNotes = [];
      if (!Array.isArray(task.dependencies)) task.dependencies = [];
      
      return task;
    });

    localStorage.setItem('tasks', JSON.stringify(repairedTasks));
    console.log(`✅ Repaired ${repairedTasks.length} tasks`);
  } catch (error) {
    console.error('❌ Error repairing tasks:', error);
  }
}

// Function to repair dependency tasks
function repairDependencyTasks() {
  console.log('🔗 Repairing dependency tasks...');
  
  try {
    const depTasksData = localStorage.getItem('dependencyTasks');
    if (!depTasksData) {
      console.log('✅ No dependency tasks to repair');
      return;
    }

    const depTasks = JSON.parse(depTasksData);
    
    const repairedDepTasks = depTasks
      .filter(task => {
        if (!task || !task.id) {
          console.warn('⚠️ Removing invalid dependency task:', task);
          return false;
        }
        return true;
      })
      .map(task => {
        // Ensure required fields
        if (!task.title) task.title = 'Untitled Dependency';
        if (!task.description) task.description = '';
        if (!task.status) task.status = 'not_started';
        if (!Array.isArray(task.activityTimeline)) task.activityTimeline = [];
        if (!Array.isArray(task.progressNotes)) task.progressNotes = [];
        
        return task;
      });

    localStorage.setItem('dependencyTasks', JSON.stringify(repairedDepTasks));
    console.log(`✅ Repaired ${repairedDepTasks.length} dependency tasks`);
  } catch (error) {
    console.error('❌ Error repairing dependency tasks:', error);
  }
}

// Function to repair notifications
function repairNotifications() {
  console.log('🔔 Repairing notifications...');
  
  try {
    const notifsData = localStorage.getItem('notifications');
    if (!notifsData) {
      console.log('✅ No notifications to repair');
      return;
    }

    const notifs = JSON.parse(notifsData);
    
    const repairedNotifs = notifs.filter(notif => {
      if (!notif || !notif.id) {
        console.warn('⚠️ Removing invalid notification:', notif);
        return false;
      }
      
      // Ensure required fields
      if (!notif.userId) return false;
      if (!notif.message) notif.message = 'Notification';
      if (!notif.createdAt) notif.createdAt = new Date().toISOString();
      if (typeof notif.read !== 'boolean') notif.read = false;
      
      return true;
    });

    localStorage.setItem('notifications', JSON.stringify(repairedNotifs));
    console.log(`✅ Repaired ${repairedNotifs.length} notifications`);
  } catch (error) {
    console.error('❌ Error repairing notifications:', error);
  }
}

// Function to repair users
function repairUsers() {
  console.log('👥 Repairing users...');
  
  try {
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      console.log('✅ No users to repair');
      return;
    }

    const users = JSON.parse(usersData);
    
    const repairedUsers = users.map(user => {
      // Ensure username exists
      if (!user.username && user.name) {
        user.username = user.name.toLowerCase().replace(/\s+/g, '.');
      }
      
      return user;
    });

    localStorage.setItem('users', JSON.stringify(repairedUsers));
    console.log(`✅ Repaired ${repairedUsers.length} users`);
  } catch (error) {
    console.error('❌ Error repairing users:', error);
  }
}

// Run all repair functions
console.log('🚀 Running all repairs...\n');

repairUsers();
repairTasks();
repairDependencyTasks();
repairTaskComments();
repairNotifications();

console.log('\n✨ Data repair complete!');
console.log('📌 Please refresh the page (F5 or Ctrl+R / Cmd+R) to see changes.');
console.log('📌 If problems persist, run: localStorage.clear() then refresh.');

// Return summary
const summary = {
  users: JSON.parse(localStorage.getItem('users') || '[]').length,
  tasks: JSON.parse(localStorage.getItem('tasks') || '[]').length,
  dependencyTasks: JSON.parse(localStorage.getItem('dependencyTasks') || '[]').length,
  taskComments: JSON.parse(localStorage.getItem('taskComments') || '[]').length,
  notifications: JSON.parse(localStorage.getItem('notifications') || '[]').length
};

console.table(summary);
console.log('\n✅ Repair script completed successfully!');
