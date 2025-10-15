// LocalStorage utility functions

export const storage = {
  // Users
  getUsers: () => {
    const users = localStorage.getItem('users');
    const allUsers = users ? JSON.parse(users) : [];
    // CRITICAL: Filter out corrupted users
    return allUsers.filter(u => u && u.id && u.name && u.email && typeof u.name === 'string');
  },

  setUsers: (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  },

  getUserById: (id) => {
    const users = storage.getUsers();
    return users.find(user => user.id === id);
  },

  // Tasks
  getTasks: () => {
    const tasks = localStorage.getItem('tasks');
    const allTasks = tasks ? JSON.parse(tasks) : [];
    // CRITICAL: Filter out corrupted tasks
    return allTasks.filter(t => {
      if (!t || !t.id || !t.taskName || typeof t.taskName !== 'string') {
        return false;
      }
      // Validate blocker history dates if present
      if (t.blockerHistory && Array.isArray(t.blockerHistory)) {
        t.blockerHistory = t.blockerHistory.filter(b => {
          if (!b || !b.id) return false;
          // If has dates, validate them
          if (b.createdAt && typeof b.createdAt !== 'string') return false;
          if (b.resolvedAt && typeof b.resolvedAt !== 'string') return false;
          return true;
        });
      }
      return true;
    });
  },

  setTasks: (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },

  getTaskById: (id) => {
    const tasks = storage.getTasks();
    return tasks.find(task => task.id === id);
  },

  getTask: (id) => {
    const tasks = storage.getTasks();
    return tasks.find(task => task.id === id);
  },

  addTask: (task) => {
    const tasks = storage.getTasks();
    tasks.push(task);
    storage.setTasks(tasks);
  },

  updateTask: (taskId, updates) => {
    const tasks = storage.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
      storage.setTasks(tasks);
      return tasks[taskIndex];
    }
    return null;
  },

  deleteTask: (taskId) => {
    const tasks = storage.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    storage.setTasks(filteredTasks);
  },

  // Auth
  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  // Task Comments
  getTaskComments: (taskId) => {
    const comments = localStorage.getItem('taskComments');
    const allComments = comments ? JSON.parse(comments) : [];
    return allComments.filter(c => c.taskId === taskId).sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );
  },

  getAllComments: () => {
    const comments = localStorage.getItem('taskComments');
    return comments ? JSON.parse(comments) : [];
  },

  setAllComments: (comments) => {
    localStorage.setItem('taskComments', JSON.stringify(comments));
  },

  addTaskComment: (comment) => {
    const comments = storage.getAllComments();
    comments.push(comment);
    storage.setAllComments(comments);
  },

  updateTaskComment: (commentId, updates) => {
    const comments = storage.getAllComments();
    const index = comments.findIndex(c => c.id === commentId);
    if (index !== -1) {
      comments[index] = { ...comments[index], ...updates };
      storage.setAllComments(comments);
      return comments[index];
    }
    return null;
  },

  deleteTaskComment: (commentId) => {
    const comments = storage.getAllComments();
    const filtered = comments.filter(c => c.id !== commentId);
    storage.setAllComments(filtered);
  },

  // Notifications
  getNotifications: (userId) => {
    const notifications = localStorage.getItem('notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    // CRITICAL: Filter out corrupted notifications
    return allNotifications
      .filter(n => 
        n && 
        n.id && 
        n.userId === userId && 
        n.message && 
        typeof n.message === 'string'
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllNotifications: () => {
    const notifications = localStorage.getItem('notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    // CRITICAL: Filter out corrupted notifications
    return allNotifications.filter(n => 
      n && 
      n.id && 
      n.userId && 
      n.message && 
      typeof n.message === 'string'
    );
  },

  setAllNotifications: (notifications) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  },

  addNotification: (notification) => {
    // CRITICAL: Validate notification data before adding
    if (!notification || !notification.id) {
      console.error('Cannot add notification: Invalid notification data', notification);
      return false;
    }
    
    if (!notification.userId) {
      console.error('Cannot add notification: Missing userId', notification);
      return false;
    }
    
    if (!notification.message || typeof notification.message !== 'string') {
      console.error('Cannot add notification: Invalid message', notification);
      return false;
    }
    
    if (!notification.taskId) {
      console.warn('Notification has no taskId:', notification);
      // Don't block, but warn - some notifications might not need taskId
    }
    
    const notifications = storage.getAllNotifications();
    notifications.push(notification);
    storage.setAllNotifications(notifications);
    return true;
  },

  markNotificationAsRead: (notificationId) => {
    const notifications = storage.getAllNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      storage.setAllNotifications(notifications);
      return notifications[index];
    }
    return null;
  },

  deleteNotification: (notificationId) => {
    const notifications = storage.getAllNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    storage.setAllNotifications(filtered);
  },

  // Dependency Tasks
  getDependencyTasks: () => {
    const tasks = localStorage.getItem('dependencyTasks');
    const allTasks = tasks ? JSON.parse(tasks) : [];
    // CRITICAL: Filter out corrupted dependency tasks
    return allTasks.filter(t => 
      t && 
      t.id && 
      t.title && 
      typeof t.title === 'string' &&
      t.assignedTo &&
      t.parentTaskId
    );
  },

  setDependencyTasks: (tasks) => {
    localStorage.setItem('dependencyTasks', JSON.stringify(tasks));
  },

  getDependencyTask: (id) => {
    const tasks = storage.getDependencyTasks();
    return tasks.find(task => task.id === id);
  },

  getDependencyTasksByParent: (parentTaskId) => {
    const tasks = storage.getDependencyTasks();
    return tasks.filter(task => task.parentTaskId === parentTaskId);
  },

  getDependencyTasksByAssignee: (userId) => {
    const tasks = storage.getDependencyTasks();
    return tasks.filter(task => task.assignedTo === userId);
  },

  addDependencyTask: (task) => {
    // CRITICAL: Validate task data before adding
    if (!task || !task.id) {
      console.error('Cannot add dependency task: Invalid task data', task);
      return false;
    }
    
    if (!task.title || typeof task.title !== 'string') {
      console.error('Cannot add dependency task: Invalid title', task);
      return false;
    }
    
    if (!task.assignedTo) {
      console.error('Cannot add dependency task: Missing assignedTo', task);
      return false;
    }
    
    // Validate assigned user exists
    const assignedUser = storage.getUserById(task.assignedTo);
    if (!assignedUser || !assignedUser.name) {
      console.error('Cannot add dependency task: Invalid assigned user', task.assignedTo);
      return false;
    }
    
    const tasks = storage.getDependencyTasks();
    tasks.push(task);
    storage.setDependencyTasks(tasks);
    return true;
  },

  updateDependencyTask: (taskId, updates) => {
    const tasks = storage.getDependencyTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
      storage.setDependencyTasks(tasks);
      return tasks[taskIndex];
    }
    return null;
  },

  deleteDependencyTask: (taskId) => {
    const tasks = storage.getDependencyTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    storage.setDependencyTasks(filtered);
  },

  // Migration utility to fix task data formats
  migrateTaskData: () => {
    try {
      const tasks = storage.getTasks();
      let migrated = false;

      const updatedTasks = tasks.map(task => {
        let taskUpdated = false;
        const updates = { ...task };

        // Migrate managerFeedback to array format
        if (updates.managerFeedback !== undefined && updates.managerFeedback !== null) {
          if (!Array.isArray(updates.managerFeedback)) {
            if (typeof updates.managerFeedback === 'string') {
              updates.managerFeedback = [{
                id: `feedback-legacy-${Date.now()}-${Math.random()}`,
                text: updates.managerFeedback,
                timestamp: updates.updatedAt || new Date().toISOString(),
                authorId: updates.assignedBy || 'unknown',
                authorName: 'Manager'
              }];
              taskUpdated = true;
            } else if (typeof updates.managerFeedback === 'object') {
              updates.managerFeedback = [updates.managerFeedback];
              taskUpdated = true;
            }
          }
        } else {
          updates.managerFeedback = [];
          taskUpdated = true;
        }

        // Ensure progressHistory exists
        if (!Array.isArray(updates.progressHistory)) {
          updates.progressHistory = [];
          taskUpdated = true;
        }

        // Ensure blockerHistory exists
        if (!Array.isArray(updates.blockerHistory)) {
          updates.blockerHistory = [];
          taskUpdated = true;
        }

        // Ensure activityTimeline exists
        if (!Array.isArray(updates.activityTimeline)) {
          updates.activityTimeline = [];
          taskUpdated = true;
        }

        // Ensure progressNotes exists
        if (!Array.isArray(updates.progressNotes)) {
          updates.progressNotes = [];
          taskUpdated = true;
        }

        if (taskUpdated) {
          migrated = true;
        }

        return updates;
      });

      if (migrated) {
        storage.setTasks(updatedTasks);
        console.log('Task data migration completed successfully');
        return { success: true, migratedCount: updatedTasks.length };
      }

      return { success: true, migratedCount: 0 };
    } catch (error) {
      console.error('Error during task data migration:', error);
      return { success: false, error: error.message };
    }
  }
};
