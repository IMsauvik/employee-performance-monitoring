// Advanced Performance Metrics Calculator

export const calculateAdvancedMetrics = (tasks, startDate = null, endDate = null) => {
  // Filter tasks by date range if provided
  let filteredTasks = tasks;
  if (startDate && endDate) {
    filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.assignedDate);
      return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
    });
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
    if (t.status !== 'completed' || !t.completedDate || !t.dueDate) return false;
    return new Date(t.completedDate) <= new Date(t.dueDate);
  }).length;
  const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompletions / completedTasks) * 100) : 0;

  // Average Completion Time (in days)
  const tasksWithCompletionTime = filteredTasks.filter(t =>
    t.status === 'completed' && t.assignedDate && t.completedDate
  );
  const totalCompletionTime = tasksWithCompletionTime.reduce((sum, task) => {
    const start = new Date(task.assignedDate);
    const end = new Date(task.completedDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
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
  const tasksWithRatings = filteredTasks.filter(t => t.rating);
  const averageRating = tasksWithRatings.length > 0
    ? tasksWithRatings.reduce((sum, t) => sum + t.rating, 0) / tasksWithRatings.length
    : 0;
  const qualityScore = Math.round((averageRating / 5) * 100);

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
  const today = new Date();

  return {
    today: {
      start: new Date(today.setHours(0, 0, 0, 0)),
      end: new Date(today.setHours(23, 59, 59, 999))
    },
    last7Days: {
      start: new Date(new Date().setDate(today.getDate() - 7)),
      end: new Date()
    },
    last30Days: {
      start: new Date(new Date().setDate(today.getDate() - 30)),
      end: new Date()
    },
    last90Days: {
      start: new Date(new Date().setDate(today.getDate() - 90)),
      end: new Date()
    },
    thisMonth: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
    },
    lastMonth: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    },
    thisQuarter: {
      start: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1),
      end: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0)
    },
    thisYear: {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear(), 11, 31)
    }
  };
};
