// Analytics Validation and Data Integrity Utilities
// This module ensures accuracy and transparency in performance analytics

/**
 * Validates analytics input data and returns validation result
 * @param {Array} tasks - Array of task objects
 * @param {Array} users - Array of user objects (optional)
 * @returns {Object} Validation result with warnings
 */
export const validateAnalyticsData = (tasks, users = []) => {
  const warnings = [];
  const errors = [];

  // Validate tasks array
  if (!Array.isArray(tasks)) {
    errors.push('Tasks data is not an array');
    return { isValid: false, warnings, errors, stats: null };
  }

  // Count data quality issues
  let missingDueDates = 0;
  let missingCompletedDates = 0;
  let missingAssignedDates = 0;
  let invalidDates = 0;
  let tasksWithoutRatings = 0;
  let futureCompletedDates = 0;
  const now = new Date();

  tasks.forEach((task, index) => {
    // Check for missing critical dates
    if (!task.dueDate) missingDueDates++;
    if (task.status === 'completed' && !task.completedDate) missingCompletedDates++;
    if (!task.assignedDate && !task.createdAt) missingAssignedDates++;

    // Check for invalid dates
    if (task.completedDate) {
      const completedDate = new Date(task.completedDate);
      if (isNaN(completedDate.getTime())) {
        invalidDates++;
      } else if (completedDate > now) {
        futureCompletedDates++;
        warnings.push(`Task ${task.id || index} has completion date in the future`);
      }
    }

    // Check for missing ratings on completed tasks
    if (task.status === 'completed' && (!task.rating || task.rating === 0)) {
      tasksWithoutRatings++;
    }
  });

  // Generate warnings based on data quality
  const totalTasks = tasks.length;

  if (totalTasks === 0) {
    warnings.push('No tasks found - analytics will show zero values');
  }

  if (missingDueDates > 0) {
    const percentage = Math.round((missingDueDates / totalTasks) * 100);
    warnings.push(
      `${missingDueDates} tasks (${percentage}%) missing due dates - affects on-time metrics`
    );
  }

  if (missingCompletedDates > 0) {
    warnings.push(
      `${missingCompletedDates} completed tasks missing completion dates - affects timing metrics`
    );
  }

  if (missingAssignedDates > 0) {
    warnings.push(
      `${missingAssignedDates} tasks missing assignment dates - affects duration calculations`
    );
  }

  if (invalidDates > 0) {
    warnings.push(`${invalidDates} tasks have invalid date formats`);
  }

  if (futureCompletedDates > 0) {
    errors.push(`${futureCompletedDates} tasks have completion dates in the future - data integrity issue`);
  }

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  if (tasksWithoutRatings > 0 && completedTasks > 0) {
    const percentage = Math.round((tasksWithoutRatings / completedTasks) * 100);
    warnings.push(
      `${tasksWithoutRatings} completed tasks (${percentage}%) have no quality ratings - quality score may be inaccurate`
    );
  }

  // Calculate data quality score (0-100)
  const qualityScore = Math.round(
    ((totalTasks - missingDueDates - missingCompletedDates - missingAssignedDates - invalidDates - futureCompletedDates) /
    Math.max(totalTasks * 5, 1)) * 100
  );

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    stats: {
      totalTasks,
      missingDueDates,
      missingCompletedDates,
      missingAssignedDates,
      invalidDates,
      futureCompletedDates,
      tasksWithoutRatings,
      completedTasks,
      dataQualityScore: qualityScore
    }
  };
};

/**
 * Generates a data integrity report for display
 * @param {Object} validation - Validation result from validateAnalyticsData
 * @returns {Object} Report object with summary and recommendations
 */
export const generateDataIntegrityReport = (validation) => {
  if (!validation || !validation.stats) {
    return {
      status: 'error',
      message: 'Unable to generate report - validation data missing',
      recommendations: []
    };
  }

  const { stats, warnings, errors } = validation;
  const recommendations = [];

  // Determine overall status
  let status = 'good';
  if (errors.length > 0) {
    status = 'critical';
  } else if (stats.dataQualityScore < 70) {
    status = 'poor';
  } else if (stats.dataQualityScore < 90 || warnings.length > 0) {
    status = 'warning';
  }

  // Generate recommendations
  if (stats.missingDueDates > 0) {
    recommendations.push({
      priority: 'high',
      message: 'Add due dates to all tasks to improve on-time delivery tracking',
      action: 'Review tasks and set appropriate due dates'
    });
  }

  if (stats.tasksWithoutRatings > stats.completedTasks * 0.5) {
    recommendations.push({
      priority: 'high',
      message: 'More than 50% of completed tasks lack quality ratings',
      action: 'Implement mandatory quality ratings for completed tasks'
    });
  }

  if (stats.missingCompletedDates > 0) {
    recommendations.push({
      priority: 'medium',
      message: 'Some completed tasks are missing completion timestamps',
      action: 'Ensure system automatically records completion dates'
    });
  }

  if (stats.futureCompletedDates > 0) {
    recommendations.push({
      priority: 'critical',
      message: 'Data integrity issue: Tasks marked complete with future dates',
      action: 'Review and correct task completion dates immediately'
    });
  }

  return {
    status,
    dataQualityScore: stats.dataQualityScore,
    message: `Data quality score: ${stats.dataQualityScore}/100`,
    warnings,
    errors,
    recommendations,
    stats
  };
};

/**
 * Checks if metrics are reliable enough for employment decisions
 * @param {Object} validation - Validation result
 * @returns {Object} Decision readiness assessment
 */
export const assessDecisionReadiness = (validation) => {
  if (!validation || !validation.stats) {
    return {
      ready: false,
      reason: 'Insufficient data for assessment',
      confidence: 0
    };
  }

  const { stats, errors } = validation;

  // Critical blockers
  if (errors.length > 0) {
    return {
      ready: false,
      reason: 'Critical data integrity errors detected',
      confidence: 0,
      blockers: errors
    };
  }

  if (stats.totalTasks < 10) {
    return {
      ready: false,
      reason: 'Insufficient task history (minimum 10 tasks required)',
      confidence: stats.totalTasks * 10,
      recommendation: 'Wait for more data before making employment decisions'
    };
  }

  if (stats.dataQualityScore < 70) {
    return {
      ready: false,
      reason: 'Data quality score too low for reliable metrics',
      confidence: stats.dataQualityScore,
      recommendation: 'Improve data quality by adding missing information'
    };
  }

  // Calculate confidence level
  let confidence = stats.dataQualityScore;

  // Adjust confidence based on sample size
  if (stats.totalTasks < 30) {
    confidence *= 0.8;
  } else if (stats.totalTasks < 50) {
    confidence *= 0.9;
  }

  // Adjust confidence based on completed tasks
  const completionRate = stats.completedTasks / stats.totalTasks;
  if (completionRate < 0.3) {
    confidence *= 0.7;
  }

  return {
    ready: confidence >= 75,
    confidence: Math.round(confidence),
    reason: confidence >= 75
      ? 'Metrics are sufficiently reliable for consideration'
      : 'Data quality or sample size insufficient',
    recommendation: confidence >= 75
      ? 'Ensure metrics are reviewed in context with other performance factors'
      : 'Collect more data or improve data quality before making decisions'
  };
};

/**
 * Creates an audit log entry for metrics calculation
 * @param {string} userId - User ID whose metrics were calculated
 * @param {Object} metrics - Calculated metrics
 * @param {Object} validation - Validation results
 * @returns {Object} Audit log entry
 */
export const createMetricsAuditLog = (userId, metrics, validation) => {
  return {
    userId,
    timestamp: new Date().toISOString(),
    metrics: {
      ...metrics,
      calculatedAt: new Date().toISOString()
    },
    dataQuality: {
      score: validation.stats?.dataQualityScore || 0,
      warnings: validation.warnings,
      errors: validation.errors
    },
    decisionReadiness: assessDecisionReadiness(validation),
    version: '1.0.0' // Track calculation methodology version
  };
};
