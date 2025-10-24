// Metrics Storage Service
// Handles storing and retrieving historical performance metrics for audit trails

import { db } from './databaseService';

/**
 * Stores performance metrics in the database for historical tracking
 * @param {string} userId - User ID
 * @param {Object} metrics - Calculated metrics
 * @param {Object} options - Additional options (period_start, period_end, metadata)
 * @returns {Promise<Object>} Storage result
 */
export const storePerformanceMetrics = async (userId, metrics, options = {}) => {
  try {
    const {
      period_start = null,
      period_end = null,
      metadata = {}
    } = options;

    // Store multiple metric types
    const metricTypes = [
      { type: 'completion_rate', value: metrics.completionRate },
      { type: 'on_time_rate', value: metrics.onTimeRate },
      { type: 'productivity_score', value: metrics.productivityScore },
      { type: 'quality_score', value: metrics.qualityScore },
      { type: 'average_completion_time', value: metrics.averageCompletionTime },
      { type: 'total_tasks', value: metrics.totalTasks },
      { type: 'completed_tasks', value: metrics.completedTasks },
      { type: 'blocked_tasks', value: metrics.blockedTasks },
      { type: 'overdue_tasks', value: metrics.overdueTasks }
    ];

    const results = [];

    for (const metric of metricTypes) {
      const result = await db.supabase
        .from('performance_metrics')
        .insert({
          user_id: userId,
          metric_type: metric.type,
          metric_value: metric.value,
          period_start: period_start || new Date().toISOString(),
          period_end: period_end || new Date().toISOString(),
          metadata: {
            ...metadata,
            calculated_at: new Date().toISOString(),
            version: '1.0.0'
          }
        });

      if (result.error) {
        console.error(`Error storing ${metric.type}:`, result.error);
      } else {
        results.push({ type: metric.type, success: true });
      }
    }

    return {
      success: true,
      stored: results.length,
      results
    };
  } catch (error) {
    console.error('Error in storePerformanceMetrics:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Retrieves historical metrics for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options (metricType, startDate, endDate, limit)
 * @returns {Promise<Array>} Historical metrics
 */
export const getHistoricalMetrics = async (userId, options = {}) => {
  try {
    const {
      metricType = null,
      startDate = null,
      endDate = null,
      limit = 100
    } = options;

    let query = db.supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (startDate) {
      query = query.gte('period_start', startDate);
    }

    if (endDate) {
      query = query.lte('period_end', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching historical metrics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getHistoricalMetrics:', error);
    return [];
  }
};

/**
 * Gets the latest metrics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Latest metrics
 */
export const getLatestMetrics = async (userId) => {
  try {
    const { data, error } = await db.supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(9); // Get latest of each metric type

    if (error) {
      console.error('Error fetching latest metrics:', error);
      return null;
    }

    // Group by metric type and get the most recent
    const latestMetrics = {};
    (data || []).forEach(metric => {
      if (!latestMetrics[metric.metric_type] ||
          new Date(metric.created_at) > new Date(latestMetrics[metric.metric_type].created_at)) {
        latestMetrics[metric.metric_type] = metric;
      }
    });

    return latestMetrics;
  } catch (error) {
    console.error('Error in getLatestMetrics:', error);
    return null;
  }
};

/**
 * Calculates metric trends over time
 * @param {string} userId - User ID
 * @param {string} metricType - Type of metric to analyze
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Trend analysis
 */
export const calculateMetricTrend = async (userId, metricType, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await getHistoricalMetrics(userId, {
      metricType,
      startDate: startDate.toISOString(),
      limit: 1000
    });

    if (metrics.length < 2) {
      return {
        trend: 'insufficient_data',
        change: 0,
        percentChange: 0,
        dataPoints: metrics.length
      };
    }

    // Sort by date
    const sorted = metrics.sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );

    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];

    const change = newest.metric_value - oldest.metric_value;
    const percentChange = oldest.metric_value !== 0
      ? ((change / oldest.metric_value) * 100).toFixed(2)
      : 0;

    return {
      trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      change: parseFloat(change.toFixed(2)),
      percentChange: parseFloat(percentChange),
      dataPoints: metrics.length,
      oldest: {
        value: oldest.metric_value,
        date: oldest.created_at
      },
      newest: {
        value: newest.metric_value,
        date: newest.created_at
      },
      average: metrics.reduce((sum, m) => sum + m.metric_value, 0) / metrics.length
    };
  } catch (error) {
    console.error('Error in calculateMetricTrend:', error);
    return {
      trend: 'error',
      change: 0,
      percentChange: 0,
      error: error.message
    };
  }
};

/**
 * Stores a complete metrics snapshot with validation data
 * @param {string} userId - User ID
 * @param {Object} metrics - Calculated metrics
 * @param {Object} validation - Validation results
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Storage result
 */
export const storeMetricsSnapshot = async (userId, metrics, validation, options = {}) => {
  try {
    const metadata = {
      ...options.metadata,
      dataQualityScore: validation.stats?.dataQualityScore || 0,
      warnings: validation.warnings,
      errors: validation.errors,
      decisionReady: validation.stats?.dataQualityScore >= 70 && validation.errors.length === 0,
      calculatedAt: new Date().toISOString()
    };

    const result = await storePerformanceMetrics(userId, metrics, {
      ...options,
      metadata
    });

    // Also log to activity log
    try {
      await db.supabase
        .from('activity_log')
        .insert({
          user_id: userId,
          action_type: 'metrics_calculated',
          entity_type: 'performance_metrics',
          description: `Performance metrics calculated with data quality score: ${validation.stats?.dataQualityScore || 0}/100`,
          metadata: {
            metrics: {
              completionRate: metrics.completionRate,
              productivityScore: metrics.productivityScore,
              qualityScore: metrics.qualityScore
            },
            dataQuality: validation.stats?.dataQualityScore || 0,
            warnings: validation.warnings.length,
            errors: validation.errors.length
          }
        });
    } catch (logError) {
      console.warn('Failed to create activity log entry:', logError);
    }

    return result;
  } catch (error) {
    console.error('Error in storeMetricsSnapshot:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Compares current metrics with historical average
 * @param {string} userId - User ID
 * @param {Object} currentMetrics - Current calculated metrics
 * @param {number} days - Days to look back for comparison
 * @returns {Promise<Object>} Comparison result
 */
export const compareWithHistorical = async (userId, currentMetrics, days = 30) => {
  try {
    const comparisons = {};
    const metricTypes = [
      'completion_rate',
      'productivity_score',
      'quality_score',
      'on_time_rate'
    ];

    for (const metricType of metricTypes) {
      const trend = await calculateMetricTrend(userId, metricType, days);
      const currentValue = currentMetrics[metricType.replace('_', '')] || 0;

      comparisons[metricType] = {
        current: currentValue,
        historical: trend.average || 0,
        trend: trend.trend,
        change: trend.change,
        percentChange: trend.percentChange
      };
    }

    return {
      success: true,
      comparisons,
      period: `last ${days} days`
    };
  } catch (error) {
    console.error('Error in compareWithHistorical:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  storePerformanceMetrics,
  getHistoricalMetrics,
  getLatestMetrics,
  calculateMetricTrend,
  storeMetricsSnapshot,
  compareWithHistorical
};
