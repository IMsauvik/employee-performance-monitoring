/**
 * DEPENDENCY TASK CORRUPTION FIX
 * 
 * This script fixes the issue where creating dependency tasks corrupts localStorage
 * causing admin/manager panels to crash with split() errors.
 * 
 * INSTRUCTIONS:
 * 1. Open http://localhost:5173/ in your browser
 * 2. Press F12 to open DevTools Console
 * 3. Copy and paste this ENTIRE script
 * 4. Press Enter
 * 5. Page will reload automatically
 * 
 * This will:
 * - Clean up corrupted dependency tasks
 * - Remove users with missing name/email
 * - Remove tasks with missing taskName
 * - Remove invalid comments
 * - Keep all your valid data intact
 */

(function() {
  console.log('🔧 Starting Dependency Task Corruption Fix...');
  
  let fixedCount = 0;
  let removedCount = 0;
  
  // Fix 1: Clean up corrupted users
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const validUsers = users.filter(u => {
      const isValid = u && u.id && u.name && u.email && typeof u.name === 'string' && typeof u.email === 'string';
      if (!isValid) {
        console.warn('❌ Removing corrupted user:', u);
        removedCount++;
      }
      return isValid;
    });
    
    if (validUsers.length !== users.length) {
      localStorage.setItem('users', JSON.stringify(validUsers));
      fixedCount++;
      console.log(`✅ Cleaned ${users.length - validUsers.length} corrupted users`);
    }
  } catch (err) {
    console.error('Error cleaning users:', err);
  }
  
  // Fix 2: Clean up corrupted tasks
  try {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const validTasks = tasks.filter(t => {
      const isValid = t && t.id && t.taskName && typeof t.taskName === 'string';
      if (!isValid) {
        console.warn('❌ Removing corrupted task:', t);
        removedCount++;
        return false;
      }
      
      // Clean up blocker history with invalid dates
      if (t.blockerHistory && Array.isArray(t.blockerHistory)) {
        const originalLength = t.blockerHistory.length;
        t.blockerHistory = t.blockerHistory.filter(b => {
          if (!b || !b.id) return false;
          // Remove blockers with invalid date types
          if (b.createdAt && typeof b.createdAt !== 'string') {
            console.warn('❌ Removing blocker with invalid createdAt:', b);
            return false;
          }
          if (b.resolvedAt && typeof b.resolvedAt !== 'string') {
            console.warn('❌ Removing blocker with invalid resolvedAt:', b);
            return false;
          }
          return true;
        });
        if (t.blockerHistory.length < originalLength) {
          console.log(`✅ Cleaned ${originalLength - t.blockerHistory.length} invalid blockers from task ${t.id}`);
        }
      }
      
      return true;
    });
    
    if (validTasks.length !== tasks.length) {
      localStorage.setItem('tasks', JSON.stringify(validTasks));
      fixedCount++;
      console.log(`✅ Cleaned ${tasks.length - validTasks.length} corrupted tasks`);
    }
  } catch (err) {
    console.error('Error cleaning tasks:', err);
  }
  
  // Fix 3: Clean up corrupted dependency tasks (THIS IS THE MAIN ISSUE)
  try {
    const depTasks = JSON.parse(localStorage.getItem('dependencyTasks') || '[]');
    const validDepTasks = depTasks.filter(t => {
      const isValid = t && 
        t.id && 
        t.title && 
        typeof t.title === 'string' &&
        t.assignedTo &&
        t.parentTaskId &&
        t.assignedToName && // Must have stored name
        typeof t.assignedToName === 'string';
      
      if (!isValid) {
        console.warn('❌ Removing corrupted dependency task:', t);
        removedCount++;
      }
      return isValid;
    });
    
    if (validDepTasks.length !== depTasks.length) {
      localStorage.setItem('dependencyTasks', JSON.stringify(validDepTasks));
      fixedCount++;
      console.log(`✅ Cleaned ${depTasks.length - validDepTasks.length} corrupted dependency tasks`);
    }
  } catch (err) {
    console.error('Error cleaning dependency tasks:', err);
  }
  
  // Fix 4: Clean up corrupted comments
  try {
    const comments = JSON.parse(localStorage.getItem('taskComments') || '[]');
    const validComments = comments.filter(c => {
      const isValid = c && 
        c.id && 
        (c.text || c.content) &&
        c.userId &&
        c.userName &&
        typeof c.userName === 'string';
      
      if (!isValid) {
        console.warn('❌ Removing corrupted comment:', c);
        removedCount++;
      }
      return isValid;
    });
    
    if (validComments.length !== comments.length) {
      localStorage.setItem('taskComments', JSON.stringify(validComments));
      fixedCount++;
      console.log(`✅ Cleaned ${comments.length - validComments.length} corrupted comments`);
    }
  } catch (err) {
    console.error('Error cleaning comments:', err);
  }
  
  // Fix 5: Validate currentUser
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && (!currentUser.name || !currentUser.email || !currentUser.id)) {
      console.warn('❌ Current user data is corrupted, clearing session');
      localStorage.removeItem('currentUser');
      fixedCount++;
    }
  } catch (err) {
    console.error('Error validating current user:', err);
  }
  
  // Fix 6: Clean up corrupted notifications
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const validNotifications = notifications.filter(n => {
      const isValid = n && 
        n.id && 
        n.userId &&
        n.message && 
        typeof n.message === 'string';
      
      if (!isValid) {
        console.warn('❌ Removing corrupted notification:', n);
        removedCount++;
      }
      return isValid;
    });
    
    if (validNotifications.length !== notifications.length) {
      localStorage.setItem('notifications', JSON.stringify(validNotifications));
      fixedCount++;
      console.log(`✅ Cleaned ${notifications.length - validNotifications.length} corrupted notifications`);
    }
  } catch (err) {
    console.error('Error cleaning notifications:', err);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEPENDENCY FIX COMPLETE!');
  console.log('='.repeat(60));
  console.log(`✅ Fixed ${fixedCount} data categories`);
  console.log(`🗑️  Removed ${removedCount} corrupted items`);
  console.log('\n💡 The code has been updated to prevent this from happening again.');
  console.log('📋 You can now create dependency tasks without issues!');
  console.log('\n🔄 Reloading page in 2 seconds...\n');
  
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})();
