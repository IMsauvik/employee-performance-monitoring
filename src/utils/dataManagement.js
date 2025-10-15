const DATA_KEYS = {
  SETTINGS: 'appSettings',
  TASKS: 'tasks',
  USERS: 'users',
  PERFORMANCE: 'performance',
  ANALYTICS: 'analytics',
  COMMENTS: 'taskComments'
};

export const exportAllData = () => {
  try {
    const exportData = {};
    
    // Collect all data from localStorage
    Object.values(DATA_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        exportData[key] = JSON.parse(data);
      }
    });

    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `employee-performance-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting data:', error);
    return false;
  }
};

export const backupData = async () => {
  try {
    const timestamp = new Date().toISOString();
    const backupData = {
      timestamp,
      data: {}
    };

    // Collect all data
    Object.values(DATA_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        backupData.data[key] = JSON.parse(data);
      }
    });

    // Store backup
    const backups = JSON.parse(localStorage.getItem('dataBackups') || '[]');
    backups.push(backupData);
    
    // Keep only last 5 backups
    while (backups.length > 5) {
      backups.shift();
    }
    
    localStorage.setItem('dataBackups', JSON.stringify(backups));
    return true;
  } catch (error) {
    console.error('Error creating backup:', error);
    return false;
  }
};

export const restoreFromBackup = (backupIndex) => {
  try {
    const backups = JSON.parse(localStorage.getItem('dataBackups') || '[]');
    if (!backups[backupIndex]) {
      throw new Error('Backup not found');
    }

    const backup = backups[backupIndex];
    
    // Restore all data
    Object.entries(backup.data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
};

export const getBackupsList = () => {
  try {
    const backups = JSON.parse(localStorage.getItem('dataBackups') || '[]');
    return backups.map(backup => ({
      timestamp: backup.timestamp,
      size: JSON.stringify(backup.data).length
    }));
  } catch (error) {
    console.error('Error getting backups list:', error);
    return [];
  }
};

// Auto-backup mechanism
let backupInterval = null;

export const startAutoBackup = (intervalHours = 24) => {
  if (backupInterval) {
    clearInterval(backupInterval);
  }

  backupInterval = setInterval(() => {
    backupData();
  }, intervalHours * 60 * 60 * 1000);

  // Initial backup
  backupData();
};

export const stopAutoBackup = () => {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
  }
};