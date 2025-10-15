/**
 * Data Export Utilities
 * Provides functions to export data in various formats (CSV, JSON, PDF-ready)
 */

// Export data as CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Export data as JSON
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    console.error('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Export data as formatted text table
export const exportToText = (data, filename = 'export.txt') => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const maxLengths = headers.map(header =>
    Math.max(
      header.length,
      ...data.map(row => String(row[header] ?? '').length)
    )
  );

  // Create formatted text table
  const separator = maxLengths.map(len => '-'.repeat(len + 2)).join('+');
  const headerRow = headers.map((header, i) =>
    header.padEnd(maxLengths[i])
  ).join(' | ');

  const textContent = [
    separator,
    headerRow,
    separator,
    ...data.map(row =>
      headers.map((header, i) =>
        String(row[header] ?? '').padEnd(maxLengths[i])
      ).join(' | ')
    ),
    separator
  ].join('\n');

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  downloadFile(blob, filename);
};

// Export tasks data with formatted fields
export const exportTasks = (tasks, format = 'csv') => {
  const formattedTasks = tasks.map(task => ({
    'Task ID': task.id,
    'Task Name': task.taskName,
    'Project': task.project,
    'Vertical': task.vertical,
    'Status': task.status.replace('_', ' ').toUpperCase(),
    'Priority': task.priority || 'Normal',
    'Assigned To': task.assignedToName || task.assignedTo,
    'Assigned By': task.assignedByName || task.assignedBy,
    'Due Date': new Date(task.dueDate).toLocaleDateString(),
    'Created At': new Date(task.createdAt).toLocaleDateString(),
    'Description': task.description || ''
  }));

  const timestamp = new Date().toISOString().split('T')[0];

  switch (format.toLowerCase()) {
    case 'json':
      exportToJSON(formattedTasks, `tasks-export-${timestamp}.json`);
      break;
    case 'txt':
      exportToText(formattedTasks, `tasks-export-${timestamp}.txt`);
      break;
    case 'csv':
    default:
      exportToCSV(formattedTasks, `tasks-export-${timestamp}.csv`);
  }
};

// Export users data
export const exportUsers = (users, format = 'csv') => {
  const formattedUsers = users.map(user => ({
    'User ID': user.id,
    'Name': user.name,
    'Email': user.email,
    'Role': user.role.toUpperCase(),
    'Department': user.department,
    'Phone': user.phone || 'N/A',
    'Location': user.location || 'N/A',
    'Created At': new Date(user.createdAt).toLocaleDateString()
  }));

  const timestamp = new Date().toISOString().split('T')[0];

  switch (format.toLowerCase()) {
    case 'json':
      exportToJSON(formattedUsers, `users-export-${timestamp}.json`);
      break;
    case 'txt':
      exportToText(formattedUsers, `users-export-${timestamp}.txt`);
      break;
    case 'csv':
    default:
      exportToCSV(formattedUsers, `users-export-${timestamp}.csv`);
  }
};

// Export performance report
export const exportPerformanceReport = (data, format = 'csv') => {
  const formattedData = Array.isArray(data) ? data : [data];

  const report = formattedData.map(item => ({
    'Employee Name': item.name || item.employeeName,
    'Total Tasks': item.totalTasks || 0,
    'Completed Tasks': item.completedTasks || 0,
    'In Progress': item.inProgressTasks || 0,
    'Overdue Tasks': item.overdueTasks || 0,
    'Completion Rate': `${item.completionRate || 0}%`,
    'Average Time': item.averageCompletionTime || 'N/A',
    'Department': item.department || 'N/A'
  }));

  const timestamp = new Date().toISOString().split('T')[0];

  switch (format.toLowerCase()) {
    case 'json':
      exportToJSON(report, `performance-report-${timestamp}.json`);
      break;
    case 'txt':
      exportToText(report, `performance-report-${timestamp}.txt`);
      break;
    case 'csv':
    default:
      exportToCSV(report, `performance-report-${timestamp}.csv`);
  }
};

// Export analytics data
export const exportAnalytics = (analyticsData, format = 'json') => {
  const timestamp = new Date().toISOString().split('T')[0];

  const formattedAnalytics = {
    exportDate: new Date().toISOString(),
    summary: analyticsData.summary || {},
    metrics: analyticsData.metrics || {},
    trends: analyticsData.trends || {},
    details: analyticsData.details || []
  };

  switch (format.toLowerCase()) {
    case 'csv':
      // For CSV, export the details array if available
      if (Array.isArray(analyticsData.details)) {
        exportToCSV(analyticsData.details, `analytics-export-${timestamp}.csv`);
      } else {
        exportToJSON(formattedAnalytics, `analytics-export-${timestamp}.json`);
      }
      break;
    case 'txt':
      exportToText(
        Array.isArray(analyticsData.details) ? analyticsData.details : [formattedAnalytics],
        `analytics-export-${timestamp}.txt`
      );
      break;
    case 'json':
    default:
      exportToJSON(formattedAnalytics, `analytics-export-${timestamp}.json`);
  }
};

// Helper function to download file
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Print current page
export const printPage = () => {
  window.print();
};

// Export as PDF (uses browser's print to PDF)
export const exportToPDF = () => {
  window.print();
};
