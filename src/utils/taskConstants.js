// Enhanced Task Status Flow
export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  SUBMITTED: 'submitted', // Employee marks as complete, awaiting review
  UNDER_REVIEW: 'under_review', // Manager is reviewing
  REWORK_REQUIRED: 'rework_required', // Rejected by manager
  ACCEPTED: 'accepted', // Approved by manager
  COMPLETED: 'completed', // Final completed state
  OVERDUE: 'overdue'
};

// Status flow configuration
export const STATUS_FLOW = {
  employee_can_set: [
    TASK_STATUS.NOT_STARTED,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.BLOCKED,
    TASK_STATUS.SUBMITTED
  ],
  manager_can_set: [
    TASK_STATUS.NOT_STARTED,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.BLOCKED,
    TASK_STATUS.UNDER_REVIEW,
    TASK_STATUS.REWORK_REQUIRED,
    TASK_STATUS.ACCEPTED,
    TASK_STATUS.COMPLETED
  ]
};

// Status labels and descriptions
export const STATUS_INFO = {
  [TASK_STATUS.NOT_STARTED]: {
    label: 'Not Started',
    color: 'text-gray-600 bg-gray-100 border-gray-200',
    description: 'Task has not been started yet'
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'text-blue-600 bg-blue-100 border-blue-200',
    description: 'Task is currently being worked on'
  },
  [TASK_STATUS.BLOCKED]: {
    label: 'Blocked',
    color: 'text-orange-600 bg-orange-100 border-orange-200',
    description: 'Task is blocked by dependencies or issues'
  },
  [TASK_STATUS.SUBMITTED]: {
    label: 'Submitted for Review',
    color: 'text-purple-600 bg-purple-100 border-purple-200',
    description: 'Employee has submitted work for manager review'
  },
  [TASK_STATUS.UNDER_REVIEW]: {
    label: 'Under Review',
    color: 'text-indigo-600 bg-indigo-100 border-indigo-200',
    description: 'Manager is reviewing the submitted work'
  },
  [TASK_STATUS.REWORK_REQUIRED]: {
    label: 'Rework Required',
    color: 'text-red-600 bg-red-100 border-red-200',
    description: 'Work needs improvement, sent back for rework'
  },
  [TASK_STATUS.ACCEPTED]: {
    label: 'Accepted',
    color: 'text-green-600 bg-green-100 border-green-200',
    description: 'Work has been approved by manager'
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'text-green-700 bg-green-200 border-green-300',
    description: 'Task is fully completed and closed'
  },
  [TASK_STATUS.OVERDUE]: {
    label: 'Overdue',
    color: 'text-red-700 bg-red-100 border-red-200',
    description: 'Task has passed its deadline'
  }
};

// Quality rating levels
export const QUALITY_RATING = {
  EXCELLENT: { value: 5, label: 'Excellent', color: 'text-green-600' },
  GOOD: { value: 4, label: 'Good', color: 'text-green-500' },
  SATISFACTORY: { value: 3, label: 'Satisfactory', color: 'text-yellow-600' },
  NEEDS_IMPROVEMENT: { value: 2, label: 'Needs Improvement', color: 'text-orange-600' },
  POOR: { value: 1, label: 'Poor', color: 'text-red-600' }
};

// Activity types for timeline
export const ACTIVITY_TYPE = {
  STATUS_CHANGE: 'status_change',
  COMMENT: 'comment',
  ASSIGNMENT: 'assignment',
  DEADLINE_CHANGE: 'deadline_change',
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_COMPLETED: 'review_completed',
  REWORK_REQUESTED: 'rework_requested',
  BLOCKER_ADDED: 'blocker_added',
  BLOCKER_RESOLVED: 'blocker_resolved',
  PROGRESS_NOTE: 'progress_note'
};

// Blocker types
export const BLOCKER_TYPE = {
  DEPENDENCY: 'dependency',
  TECHNICAL: 'technical',
  RESOURCE: 'resource',
  CLARIFICATION: 'clarification',
  EXTERNAL: 'external',
  OTHER: 'other'
};

export const BLOCKER_INFO = {
  [BLOCKER_TYPE.DEPENDENCY]: {
    label: 'Waiting on Dependency',
    icon: 'link',
    color: 'text-blue-600'
  },
  [BLOCKER_TYPE.TECHNICAL]: {
    label: 'Technical Issue',
    icon: 'alert-circle',
    color: 'text-red-600'
  },
  [BLOCKER_TYPE.RESOURCE]: {
    label: 'Resource/Access Needed',
    icon: 'key',
    color: 'text-orange-600'
  },
  [BLOCKER_TYPE.CLARIFICATION]: {
    label: 'Need Clarification',
    icon: 'help-circle',
    color: 'text-purple-600'
  },
  [BLOCKER_TYPE.EXTERNAL]: {
    label: 'External Blocker',
    icon: 'external-link',
    color: 'text-yellow-600'
  },
  [BLOCKER_TYPE.OTHER]: {
    label: 'Other',
    icon: 'alert-triangle',
    color: 'text-gray-600'
  }
};

// Dependency Task Status
export const DEPENDENCY_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const DEPENDENCY_INFO = {
  [DEPENDENCY_STATUS.NOT_STARTED]: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-700',
    description: 'Dependency task not yet started'
  },
  [DEPENDENCY_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    description: 'Currently working on dependency'
  },
  [DEPENDENCY_STATUS.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    description: 'Dependency task completed'
  },
  [DEPENDENCY_STATUS.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    description: 'Dependency task cancelled'
  }
};
