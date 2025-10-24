// Advanced Performance Metrics Calculator

// Helper function to validate and parse dates safely
const safeParseDate = (dateValue) => {
  if (!dateValue) return null;
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Invalid date value:', dateValue);
    return null;
  }
};

// Helper function to validate task data
const validateTask = (task) => {
  if (!task || typeof task !== 'object') return false;
  return true;
};

// Default metrics structure for error cases
const getDefaultMetrics = () => ({
  totalTasks: 0,
  completedTasks: 0,
  inProgressTasks: 0,
  notStartedTasks: 0,
  overdueTasks: 0,
  blockedTasks: 0,
  completionRate: 0,
  onTimeRate: 0,
  averageCompletionTime: 0,
  productivityScore: 0,
  qualityScore: 0,
  workloadScore: 0,
  onTimeCompletions: 0,
  tasksWithRatings: 0
});

export const calculateAdvancedMetrics = (tasks, startDate = null, endDate = null) => {
  // Validate input
  if (!Array.isArray(tasks)) {
    console.error('calculateAdvancedMetrics: tasks must be an array');
    return getDefaultMetrics();
  }

  // Filter out invalid tasks
  const validTasks = tasks.filter(validateTask);

  // Filter tasks by date range if provided
  let filteredTasks = validTasks;
  if (startDate && endDate) {
    const start = safeParseDate(startDate);
    const end = safeParseDate(endDate);

    if (start && end) {
      filteredTasks = validTasks.filter(task => {
        const taskDate = safeParseDate(task.createdAt || task.assignedDate);
        if (!taskDate) return false;
        return taskDate >= start && taskDate <= end;
      });
    }
  }

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const notStartedTasks = filteredTasks.filter(t => t.status === 'not_started').length;
  const overdueTasks = filteredTasks.filter(t => t.status === 'overdue').length;
  const blockedTasks = filteredTasks.filter(t => t.status === 'blocked').length;

  // Completion Rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // On-Time Delivery Rate
  const onTimeCompletions = filteredTasks.filter(t => {
    if (t.status !== 'completed') return false;
    const completedDate = safeParseDate(t.completedDate);
    const dueDate = safeParseDate(t.dueDate);
    if (!completedDate || !dueDate) return false;
    return completedDate <= dueDate;
  }).length;
  const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompletions / completedTasks) * 100) : 0;

  // Average Completion Time (in days)
  const tasksWithCompletionTime = filteredTasks.filter(t => {
    if (t.status !== 'completed') return false;
    const assignedDate = safeParseDate(t.assignedDate);
    const completedDate = safeParseDate(t.completedDate);
    return assignedDate && completedDate && completedDate >= assignedDate;
  });

  const totalCompletionTime = tasksWithCompletionTime.reduce((sum, task) => {
    const start = safeParseDate(task.assignedDate);
    const end = safeParseDate(task.completedDate);
    if (!start || !end) return sum;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    // Ignore negative or unreasonably large values
    if (days < 0 || days > 365) return sum;
    return sum + days;
  }, 0);

  const averageCompletionTime = tasksWithCompletionTime.length > 0
    ? Math.round(totalCompletionTime / tasksWithCompletionTime.length)
    : 0;

  // Productivity Score (0-100)
  const productivityScore = Math.round(
    (completionRate * 0.4) +
    (onTimeRate * 0.3) +
    (Math.max(0, 100 - averageCompletionTime * 2) * 0.2) +
    (Math.max(0, 100 - (blockedTasks / Math.max(totalTasks, 1)) * 100) * 0.1)
  );

  // Quality Score (based on feedback ratings if available)
  const tasksWithRatings = filteredTasks.filter(t => {
    const rating = Number(t.rating);
    return !isNaN(rating) && rating > 0 && rating <= 5;
  });

  const averageRating = tasksWithRatings.length > 0
    ? tasksWithRatings.reduce((sum, t) => sum + Number(t.rating), 0) / tasksWithRatings.length
    : 0;

  const qualityScore = averageRating > 0 ? Math.round((averageRating / 5) * 100) : 0;

  // Workload Balance
  const workloadScore = totalTasks > 0 ? Math.min(100, Math.max(0, 100 - (totalTasks - 10) * 5)) : 100;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    notStartedTasks,
    overdueTasks,
    blockedTasks,
    completionRate,
    onTimeRate,
    averageCompletionTime,
    productivityScore,
    qualityScore,
    workloadScore,
    onTimeCompletions,
    tasksWithRatings: tasksWithRatings.length
  };
};

export const calculateTrendData = (tasks, days = 30) => {
  const trends = [];
  const endDate = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.completedDate || task.updatedAt || task.createdAt);
      return taskDate.toISOString().split('T')[0] === dateStr;
    });

    const completed = dayTasks.filter(t => t.status === 'completed').length;
    const created = dayTasks.filter(t => {
      const createdDate = new Date(t.createdAt);
      return createdDate.toISOString().split('T')[0] === dateStr;
    }).length;

    trends.push({
      date: dateStr,
      completed,
      created,
      inProgress: dayTasks.filter(t => t.status === 'in_progress').length
    });
  }

  return trends;
};

export const calculateProjectMetrics = (tasks) => {
  const projects = {};

  tasks.forEach(task => {
    if (!projects[task.project]) {
      projects[task.project] = {
        name: task.project,
        total: 0,
        completed: 0,
        inProgress: 0,
        blocked: 0,
        overdue: 0
      };
    }

    projects[task.project].total++;
    if (task.status === 'completed') projects[task.project].completed++;
    if (task.status === 'in_progress') projects[task.project].inProgress++;
    if (task.status === 'blocked') projects[task.project].blocked++;
    if (task.status === 'overdue') projects[task.project].overdue++;
  });

  return Object.values(projects).map(proj => ({
    ...proj,
    completionRate: proj.total > 0 ? Math.round((proj.completed / proj.total) * 100) : 0
  }));
};

export const calculateVerticalMetrics = (tasks) => {
  const verticals = {};

  tasks.forEach(task => {
    if (!verticals[task.vertical]) {
      verticals[task.vertical] = {
        name: task.vertical,
        total: 0,
        completed: 0,
        completionRate: 0
      };
    }

    verticals[task.vertical].total++;
    if (task.status === 'completed') verticals[task.vertical].completed++;
  });

  return Object.values(verticals).map(vert => ({
    ...vert,
    completionRate: vert.total > 0 ? Math.round((vert.completed / vert.total) * 100) : 0
  }));
};

export const calculateTeamMetrics = (employees, tasks) => {
  return employees.map(emp => {
    const empTasks = tasks.filter(t => t.assignedTo === emp.id);
    const metrics = calculateAdvancedMetrics(empTasks);

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      department: emp.department,
      ...metrics
    };
  }).sort((a, b) => b.productivityScore - a.productivityScore);
};

export const getPerformanceGrade = (score) => {
  if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#3b82f6', label: 'Great' };
  if (score >= 70) return { grade: 'B', color: '#8b5cf6', label: 'Good' };
  if (score >= 60) return { grade: 'C', color: '#f59e0b', label: 'Average' };
  if (score >= 50) return { grade: 'D', color: '#f97316', label: 'Below Average' };
  return { grade: 'F', color: '#ef4444', label: 'Needs Improvement' };
};

export const getDateRangePresets = () => {
  const now = new Date();

  return {
    today: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    },
    last7Days: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    },
    last30Days: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    },
    last90Days: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    },
    lastMonth: {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
    },
    thisQuarter: {
      start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0, 23, 59, 59, 999)
    },
    thisYear: {
      start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    }
  };
};
