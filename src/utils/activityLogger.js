// Activity Logger for tracking user actions

const ACTIVITY_LOG_KEY = 'activity_logs';

export const ActivityTypes = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_STATUS_CHANGED: 'task_status_changed',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_CREATED: 'user_created',
  USER_DELETED: 'user_deleted'
};

export const logActivity = (activityType, details, userId, userName) => {
  try {
    const logs = getActivityLogs();

    const newLog = {
      id: generateId(),
      type: activityType,
      details,
      userId,
      userName,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog); // Add to beginning

    // Keep only last 500 logs to avoid storage issues
    const trimmedLogs = logs.slice(0, 500);

    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(trimmedLogs));

    return newLog;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

export const getActivityLogs = () => {
  try {
    const logs = localStorage.getItem(ACTIVITY_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error retrieving activity logs:', error);
    return [];
  }
};

export const getUserActivityLogs = (userId, limit = 50) => {
  const allLogs = getActivityLogs();
  return allLogs.filter(log => log.userId === userId).slice(0, limit);
};

export const getRecentActivityLogs = (limit = 20) => {
  const allLogs = getActivityLogs();
  return allLogs.slice(0, limit);
};

export const clearActivityLogs = () => {
  try {
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getActivityDescription = (activity) => {
  const { type, details } = activity;

  switch (type) {
    case ActivityTypes.TASK_CREATED:
      return `Created task "${details.taskName}"`;
    case ActivityTypes.TASK_UPDATED:
      return `Updated task "${details.taskName}"`;
    case ActivityTypes.TASK_DELETED:
      return `Deleted task "${details.taskName}"`;
    case ActivityTypes.TASK_STATUS_CHANGED:
      return `Changed task "${details.taskName}" status to ${details.newStatus}`;
    case ActivityTypes.USER_LOGIN:
      return `Logged in`;
    case ActivityTypes.USER_LOGOUT:
      return `Logged out`;
    case ActivityTypes.USER_CREATED:
      return `Created user ${details.userName}`;
    case ActivityTypes.USER_DELETED:
      return `Deleted user ${details.userName}`;
    default:
      return 'Unknown activity';
  }
};
