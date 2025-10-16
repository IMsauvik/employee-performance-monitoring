// Activity Logger for tracking user actions
import { supabase } from '../config/supabase';

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

export const logActivity = async (activityType, details, userId, userName) => {
  try {
    const newLog = {
      user_id: userId,
      action_type: activityType,
      entity_type: getEntityType(activityType),
      entity_id: details.id || details.taskId || details.userId || null,
      description: getActivityDescription({ type: activityType, details }),
      metadata: details,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activity_log')
      .insert([newLog])
      .select()
      .single();

    if (error) {
      console.error('Error logging activity to database:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

export const getActivityLogs = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error retrieving activity logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving activity logs:', error);
    return [];
  }
};

export const getUserActivityLogs = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error retrieving user activity logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error retrieving user activity logs:', error);
    return [];
  }
};

export const getRecentActivityLogs = async (limit = 20) => {
  return getActivityLogs(limit);
};

export const clearActivityLogs = async () => {
  try {
    const { error } = await supabase
      .from('activity_log')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible ID

    if (error) {
      console.error('Error clearing activity logs:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return false;
  }
};

// Helper function to determine entity type from activity type
const getEntityType = (activityType) => {
  if (activityType.startsWith('TASK_')) return 'task';
  if (activityType.startsWith('USER_')) return 'user';
  if (activityType.startsWith('GOAL_')) return 'goal';
  return 'other';
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
