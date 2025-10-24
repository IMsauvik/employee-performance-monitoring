import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Award, BarChart3, PieChart, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { calculateAdvancedMetrics, calculateTrendData, calculateProjectMetrics, getPerformanceGrade, getDateRangePresets } from '../../utils/performanceMetrics';
import { validateAnalyticsData, generateDataIntegrityReport } from '../../utils/analyticsValidation';

const MyAnalytics = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks(currentUser.id, 'employee');
  const [dateRange, setDateRange] = useState('last30Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const navigation = [
    { name: 'My Tasks', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Performance', path: '/employee/performance', icon: TrendingUp },
    { name: 'Analytics', path: '/employee/analytics', icon: BarChart3 }
  ];

  // Get date range
  const getActiveDateRange = () => {
    if (dateRange === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    const presets = getDateRangePresets();
    return presets[dateRange] || presets.last30Days;
  };

  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    notStartedTasks: 0,
    overdueTasks: 0,
    blockedTasks: 0,
    completionRate: 0,
    onTimeRate: 0,
    onTimeCompletions: 0,
    averageCompletionTime: 0,
    productivityScore: 0,
    qualityScore: 0,
    workloadScore: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [projectMetrics, setProjectMetrics] = useState([]);
  const [performanceGrade, setPerformanceGrade] = useState({ grade: 'N/A', label: 'Not Available', color: '#6b7280' });
  const [dataIntegrityReport, setDataIntegrityReport] = useState(null);

  useEffect(() => {
    const activeDates = getActiveDateRange();
    const calculateMetrics = () => {
      try {
        if (tasks && Array.isArray(tasks) && tasks.length > 0) {
          // Validate data before calculating metrics
          const validation = validateAnalyticsData(tasks);
          const integrityReport = generateDataIntegrityReport(validation);
          setDataIntegrityReport(integrityReport);

          const newMetrics = calculateAdvancedMetrics(tasks, activeDates.start, activeDates.end);
          const newTrendData = calculateTrendData(tasks, 30);
          const newProjectMetrics = calculateProjectMetrics(tasks);
          const newPerformanceGrade = getPerformanceGrade(newMetrics.productivityScore);

          setMetrics(newMetrics);
          setTrendData(newTrendData);
          setProjectMetrics(newProjectMetrics);
          setPerformanceGrade(newPerformanceGrade);
        } else {
          setMetrics({
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            notStartedTasks: 0,
            overdueTasks: 0,
            blockedTasks: 0,
            completionRate: 0,
            onTimeRate: 0,
            onTimeCompletions: 0,
            averageCompletionTime: 0,
            productivityScore: 0,
            qualityScore: 0,
            workloadScore: 0
          });
          setPerformanceGrade(getPerformanceGrade(0));
        }
      } catch (error) {
        console.error('Error calculating metrics:', error);
        setMetrics({
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          notStartedTasks: 0,
          overdueTasks: 0,
          blockedTasks: 0,
          completionRate: 0,
          onTimeRate: 0,
          onTimeCompletions: 0,
          averageCompletionTime: 0,
          productivityScore: 0,
          qualityScore: 0,
          workloadScore: 0
        });
        setPerformanceGrade(getPerformanceGrade(0));
      }
    };
    
    calculateMetrics();
  }, [tasks, dateRange, customStart, customEnd]);

  // Task Status Distribution
  const statusData = [
    { name: 'Completed', value: metrics.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: metrics.inProgressTasks, color: '#3b82f6' },
    { name: 'Not Started', value: metrics.notStartedTasks, color: '#6b7280' },
    { name: 'Overdue', value: metrics.overdueTasks, color: '#ef4444' },
    { name: 'Blocked', value: metrics.blockedTasks, color: '#f59e0b' }
  ];

  // Performance Radar Data
  const radarData = [
    { metric: 'Completion', value: metrics.completionRate },
    { metric: 'On-Time', value: metrics.onTimeRate },
    { metric: 'Productivity', value: metrics.productivityScore },
    { metric: 'Quality', value: metrics.qualityScore || 0 }, // Show 0 instead of fake data
    { metric: 'Workload', value: metrics.workloadScore }
  ];

  const handleExport = () => {
    const dates = getActiveDateRange();
    // Prepare data for CSV
    const csvRows = [
      // Headers
      [
        'Metric',
        'Value',
        'Date Range',
        'Generated At'
      ],
      // Employee Info
      ['Employee Name', currentUser.name, '', ''],
      ['Date Range', `${dates.start.toLocaleDateString()} - ${dates.end.toLocaleDateString()}`, '', ''],
      ['Report Generated', new Date().toLocaleString(), '', ''],
      ['', '', '', ''], // Empty row for spacing
      // Performance Metrics
      ['Total Tasks', metrics.totalTasks, '', ''],
      ['Completed Tasks', metrics.completedTasks, '', ''],
      ['Completion Rate', `${metrics.completionRate}%`, '', ''],
      ['On-Time Delivery Rate', `${metrics.onTimeRate}%`, '', ''],
      ['Productivity Score', `${metrics.productivityScore}/100`, '', ''],
      ['Quality Score', `${metrics.qualityScore}/100`, '', ''],
      ['Average Completion Time', `${metrics.averageCompletionTime} days`, '', ''],
      ['Workload Score', `${metrics.workloadScore}/100`, '', ''],
      ['Performance Grade', performanceGrade.grade, performanceGrade.label, ''],
      ['', '', '', ''], // Empty row for spacing
      // Project Metrics Header
      ['Project Performance', '', '', ''],
      ['Project Name', 'Completion Rate', 'Tasks', 'Status'],
      // Project Metrics Data
      ...projectMetrics.map(project => [
        project.name,
        `${project.completionRate}%`,
        project.totalTasks,
        project.completedTasks === project.totalTasks ? 'Completed' : 'In Progress'
      ])
    ];

    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${currentUser.name}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="My Analytics" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="w-10 h-10 mr-3 text-indigo-600" />
              My Performance Analytics
            </h1>
            <p className="mt-2 text-gray-600">Comprehensive insights into your work performance</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4 flex-wrap">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="last7Days">Last 7 Days</option>
              <option value="last30Days">Last 30 Days</option>
              <option value="last90Days">Last 90 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Performance Grade Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Overall Performance Grade</h2>
              <p className="text-indigo-100 mb-4">{performanceGrade.label} Performance Level</p>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-indigo-100">Productivity Score</p>
                  <p className="text-4xl font-bold">{metrics.productivityScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Quality Score</p>
                  <p className="text-4xl font-bold">
                    {metrics.qualityScore > 0 ? `${metrics.qualityScore}/100` : 'N/A'}
                  </p>
                  {metrics.qualityScore === 0 && (
                    <p className="text-xs text-indigo-200 mt-1">No ratings yet</p>
                  )}
                </div>
              </div>
            </div>
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl font-bold" style={{ color: performanceGrade.color }}>
                  {performanceGrade.grade}
                </p>
                <p className="text-sm text-gray-600 mt-2">{performanceGrade.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</p>
              <span className="text-xs text-gray-500">({metrics.completedTasks}/{metrics.totalTasks})</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">On-Time Delivery</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{metrics.onTimeRate}%</p>
              <span className="text-xs text-gray-500">({metrics.onTimeCompletions} tasks)</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Completion Time</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{metrics.averageCompletionTime}</p>
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Blocked Tasks</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{metrics.blockedTasks}</p>
              <span className="text-xs text-gray-500">tasks</span>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Trend (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed" />
                <Area type="monotone" dataKey="created" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Created" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Task Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={statusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Project Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Project Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[8, 8, 0, 0]} />
                <Bar dataKey="blocked" fill="#f59e0b" name="Blocked" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Radar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Dimensions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Integrity Report */}
        {dataIntegrityReport && (dataIntegrityReport.status === 'critical' || dataIntegrityReport.status === 'warning' || dataIntegrityReport.status === 'poor') && (
          <div className={`rounded-2xl shadow-lg p-6 border-2 mb-6 ${
            dataIntegrityReport.status === 'critical' ? 'bg-red-50 border-red-300' :
            dataIntegrityReport.status === 'poor' ? 'bg-orange-50 border-orange-300' :
            'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-start gap-4 mb-4">
              {dataIntegrityReport.status === 'critical' ? (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Data Quality Alert</h3>
                <p className="text-gray-700 mb-3">{dataIntegrityReport.message}</p>
                {dataIntegrityReport.warnings.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {dataIntegrityReport.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {dataIntegrityReport.errors.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="font-semibold text-red-900">Errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {dataIntegrityReport.errors.map((error, idx) => (
                        <li key={idx} className="text-sm text-red-700">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {dataIntegrityReport && dataIntegrityReport.status === 'good' && (
          <div className="bg-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-300 mb-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-xl font-bold text-green-900">Data Quality: Excellent</h3>
                <p className="text-green-700">Your performance data is complete and accurate (Score: {dataIntegrityReport.dataQualityScore}/100)</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.completionRate >= 80 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="font-semibold text-green-900">🎉 Excellent Completion Rate!</p>
                <p className="text-sm text-green-700 mt-1">You're completing {metrics.completionRate}% of your tasks. Keep up the great work!</p>
              </div>
            )}
            {metrics.onTimeRate < 70 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="font-semibold text-yellow-900">⚠️ Improve Time Management</p>
                <p className="text-sm text-yellow-700 mt-1">Your on-time rate is {metrics.onTimeRate}%. Consider breaking tasks into smaller chunks.</p>
              </div>
            )}
            {metrics.blockedTasks > 2 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="font-semibold text-red-900">🚫 Blocked Tasks Alert</p>
                <p className="text-sm text-red-700 mt-1">You have {metrics.blockedTasks} blocked tasks. Reach out to your manager for support.</p>
              </div>
            )}
            {metrics.productivityScore >= 85 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="font-semibold text-blue-900">⭐ High Performer!</p>
                <p className="text-sm text-blue-700 mt-1">Your productivity score of {metrics.productivityScore} puts you in the top tier!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyAnalytics;
