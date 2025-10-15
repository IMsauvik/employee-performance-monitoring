const API_BASE_URL = 'http://127.0.0.1:8787/api/notifications';

class NotificationService {
  static async sendTaskUpdate(recipient, taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/task-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient, taskData }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending task update notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendPerformanceReport(recipient, reportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/performance-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient, reportData }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending performance report notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendDeadlineReminder(recipient, taskData) {
    try {
      const response = await fetch(`${API_BASE_URL}/deadline-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient, taskData }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending deadline reminder notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendCommentNotification(recipients, commentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients, commentData }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending comment notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;