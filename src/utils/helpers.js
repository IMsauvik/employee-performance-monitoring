import { format, differenceInDays, isPast, parseISO, differenceInHours } from 'date-fns';
import { TASK_STATUS, STATUS_INFO, QUALITY_RATING } from './taskConstants';

// Date formatting
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

// Calculate timeline
export const calculateTimeline = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = differenceInDays(end, start);
  return `${days} days`;
};

// Check if task is overdue
export const isTaskOverdue = (deadline, status) => {
  const completedStatuses = [TASK_STATUS.COMPLETED, TASK_STATUS.ACCEPTED];
  if (completedStatuses.includes(status)) return false;
  return isPast(parseISO(deadline));
};

// Get days remaining
export const getDaysRemaining = (deadline) => {
  const days = differenceInDays(parseISO(deadline), new Date());
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `${days} days left`;
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get status color (using new status constants)
export const getStatusColor = (status) => {
  return STATUS_INFO[status]?.color || 'text-gray-600 bg-gray-100 border-gray-200';
};

// Get status text (using new status constants)
export const getStatusText = (status) => {
  return STATUS_INFO[status]?.label || status;
};

// Get priority color
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-green-600 bg-green-100 border-green-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

// Get quality rating label and color
export const getQualityRatingInfo = (rating) => {
  const ratingKey = Object.keys(QUALITY_RATING).find(
    key => QUALITY_RATING[key].value === rating
  );
  return QUALITY_RATING[ratingKey] || { label: 'Not Rated', color: 'text-gray-600' };
};

// Calculate performance metrics with enhanced analytics
export const calculatePerformanceMetrics = (tasks) => {
  const totalTasks = tasks.length;

  // Status-based counts
  const completedTasks = tasks.filter(t =>
    t.status === TASK_STATUS.COMPLETED || t.status === TASK_STATUS.ACCEPTED
  ).length;
  const inProgressTasks = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  const submittedTasks = tasks.filter(t => t.status === TASK_STATUS.SUBMITTED).length;
  const underReviewTasks = tasks.filter(t => t.status === TASK_STATUS.UNDER_REVIEW).length;
  const reworkTasks = tasks.filter(t => t.status === TASK_STATUS.REWORK_REQUIRED).length;
  const blockedTasks = tasks.filter(t => t.status === TASK_STATUS.BLOCKED).length;
  const overdueTasks = tasks.filter(t =>
    t.status === TASK_STATUS.OVERDUE || isTaskOverdue(t.deadline, t.status)
  ).length;

  // Completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Average completion time
  const completedWithDates = tasks.filter(t =>
    (t.status === TASK_STATUS.COMPLETED || t.status === TASK_STATUS.ACCEPTED) &&
    t.acceptedDate &&
    t.dateOfAssignment &&
    typeof t.acceptedDate === 'string' &&
    typeof t.dateOfAssignment === 'string'
  );
  let averageCompletionTime = 0;
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((sum, task) => {
      try {
        const completionDate = task.acceptedDate || task.completedDate;
        if (!completionDate || !task.dateOfAssignment) return sum;
        return sum + differenceInDays(parseISO(completionDate), parseISO(task.dateOfAssignment));
      } catch (err) {
        console.warn('Invalid date in task:', task.id, err);
        return sum;
      }
    }, 0);
    averageCompletionTime = Math.round(totalDays / completedWithDates.length * 10) / 10;
  }

  // Quality metrics
  const tasksWithQuality = tasks.filter(t => t.qualityRating && t.qualityRating > 0);
  const averageQualityRating = tasksWithQuality.length > 0
    ? Math.round((tasksWithQuality.reduce((sum, t) => sum + t.qualityRating, 0) / tasksWithQuality.length) * 10) / 10
    : 0;

  // First-time acceptance rate (no rework)
  const acceptedTasks = tasks.filter(t => t.status === TASK_STATUS.ACCEPTED || t.status === TASK_STATUS.COMPLETED);
  const firstTimeAccepted = acceptedTasks.filter(t => !t.reworkCount || t.reworkCount === 0).length;
  const firstTimeAcceptanceRate = acceptedTasks.length > 0
    ? Math.round((firstTimeAccepted / acceptedTasks.length) * 100)
    : 0;

  // Average rework cycles
  const tasksWithRework = tasks.filter(t => t.reworkCount && t.reworkCount > 0);
  const averageReworkCycles = tasksWithRework.length > 0
    ? Math.round((tasksWithRework.reduce((sum, t) => sum + t.reworkCount, 0) / tasksWithRework.length) * 10) / 10
    : 0;

  // Average review time (from submitted to accepted/rejected)
  const reviewedTasks = tasks.filter(t => t.submittedForReviewAt && t.reviewedAt);
  let averageReviewTime = 0;
  if (reviewedTasks.length > 0) {
    const totalHours = reviewedTasks.reduce((sum, task) => {
      return sum + differenceInHours(parseISO(task.reviewedAt), parseISO(task.submittedForReviewAt));
    }, 0);
    averageReviewTime = Math.round(totalHours / reviewedTasks.length * 10) / 10;
  }

  // Average blocked time
  const tasksWithBlockers = tasks.filter(t => t.blockerHistory && t.blockerHistory.length > 0);
  let averageBlockedTime = 0;
  if (tasksWithBlockers.length > 0) {
    const totalBlockedDays = tasksWithBlockers.reduce((sum, task) => {
      const blockTime = task.blockerHistory.reduce((blockSum, blocker) => {
        try {
          if (blocker && blocker.resolvedAt && blocker.createdAt && 
              typeof blocker.resolvedAt === 'string' && typeof blocker.createdAt === 'string') {
            return blockSum + differenceInDays(parseISO(blocker.resolvedAt), parseISO(blocker.createdAt));
          }
          return blockSum;
        } catch (err) {
          console.warn('Invalid blocker dates in task:', task.id, err);
          return blockSum;
        }
      }, 0);
      return sum + blockTime;
    }, 0);
    averageBlockedTime = Math.round(totalBlockedDays / tasksWithBlockers.length * 10) / 10;
  }

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    submittedTasks,
    underReviewTasks,
    reworkTasks,
    blockedTasks,
    overdueTasks,
    completionRate,
    averageCompletionTime,
    averageQualityRating,
    firstTimeAcceptanceRate,
    averageReworkCycles,
    averageReviewTime,
    averageBlockedTime
  };
};
