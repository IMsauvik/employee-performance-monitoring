import { storage } from '../../utils/storage';

// Email service configuration
const emailConfig = {
  // Replace with your SMTP settings
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Send email notification
export const sendEmailNotification = async (to, subject, content) => {
  try {
    // Implementation will depend on your email service provider
    // This is a placeholder that should be replaced with actual email sending logic
    console.log('Sending email:', { to, subject, content });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send push notification
export const sendPushNotification = async (userId, title, message) => {
  try {
    // Implementation will depend on your push notification service
    // This is a placeholder that should be replaced with actual push notification logic
    console.log('Sending push notification:', { userId, title, message });
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

// Get user notification preferences
export const getUserNotificationPreferences = (userId) => {
  const settings = storage.getItem('notification_preferences') || {};
  return settings[userId] || {
    email: true,
    push: true,
    taskUpdates: true,
    performanceReports: true,
    deadlineReminders: true,
    systemAnnouncements: true
  };
};

// Save user notification preferences
export const saveUserNotificationPreferences = (userId, preferences) => {
  const allSettings = storage.getItem('notification_preferences') || {};
  allSettings[userId] = preferences;
  storage.setItem('notification_preferences', allSettings);
  return true;
};

// Send notification based on user preferences
export const notifyUser = async (userId, type, data) => {
  const preferences = getUserNotificationPreferences(userId);
  const user = storage.getUser(userId);

  if (!user) return false;

  let success = false;

  // Prepare notification content
  const content = prepareNotificationContent(type, data);

  // Send notifications based on user preferences
  if (preferences.email && content.email) {
    success = await sendEmailNotification(
      user.email,
      content.email.subject,
      content.email.body
    );
  }

  if (preferences.push && content.push) {
    success = await sendPushNotification(
      userId,
      content.push.title,
      content.push.message
    );
  }

  return success;
};

// Prepare notification content based on type
const prepareNotificationContent = (type, data) => {
  switch (type) {
    case 'task_assigned':
      return {
        email: {
          subject: 'New Task Assigned',
          body: `You have been assigned a new task: ${data.taskName}. Due date: ${data.dueDate}`
        },
        push: {
          title: 'New Task',
          message: `New task assigned: ${data.taskName}`
        }
      };

    case 'task_deadline':
      return {
        email: {
          subject: 'Task Deadline Approaching',
          body: `Task "${data.taskName}" is due in ${data.daysLeft} days.`
        },
        push: {
          title: 'Deadline Reminder',
          message: `${data.taskName} due in ${data.daysLeft} days`
        }
      };

    case 'performance_report':
      return {
        email: {
          subject: 'Performance Report Available',
          body: 'Your latest performance report is now available. Click here to view.'
        },
        push: {
          title: 'Performance Report',
          message: 'New performance report available'
        }
      };

    case 'system_announcement':
      return {
        email: {
          subject: data.subject || 'System Announcement',
          body: data.message
        },
        push: {
          title: 'Announcement',
          message: data.message
        }
      };

    default:
      return {
        email: {
          subject: 'Notification',
          body: data.message
        },
        push: {
          title: 'Notification',
          message: data.message
        }
      };
  }
};