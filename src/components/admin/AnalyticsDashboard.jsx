import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, TrendingUp, BarChart3, PieChart, Activity, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { db } from '../../services/databaseService';
import { calculatePerformanceMetrics } from '../../utils/helpers';
import { validateAnalyticsData, generateDataIntegrityReport } from '../../utils/analyticsValidation';

const AnalyticsDashboard = () => {
  useAuth();
  const { tasks } = useTasks();
  const [users, setUsers] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [dataIntegrityReport, setDataIntegrityReport] = useState(null);

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Performance', path: '/admin/performance', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Shield }
  ];

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await db.getUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      }
    };
    loadUsers();
  }, []);

  // Validate analytics data
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const validation = validateAnalyticsData(tasks, users);
      const integrityReport = generateDataIntegrityReport(validation);
      setDataIntegrityReport(integrityReport);
    }
  }, [tasks, users]);

  // Performance Trend Data (Last 6 months) - CALCULATED FROM ACTUAL DATA
  const performanceTrendData = (() => {
    const monthlyData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt || t.assignedDate);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      const completedTasks = monthTasks.filter(t => t.status === 'completed').length;
      const totalTasks = monthTasks.length;
      const onTimeTasks = monthTasks.filter(t => {
        if (t.status !== 'completed' || !t.completedDate || !t.dueDate) return false;
        return new Date(t.completedDate) <= new Date(t.dueDate);
      }).length;

      monthlyData.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        engagement: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        goalAchievement: completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0
      });
    }

    return monthlyData;
  })();

  // Department Performance Data - CALCULATED FROM ACTUAL DATA
  const departmentData = (() => {
    const deptMap = {};

    users.forEach(user => {
      if (!user.department) return;

      const userTasks = tasks.filter(t => t.assignedTo === user.id);
      const completedTasks = userTasks.filter(t => t.status === 'completed').length;
      const totalTasks = userTasks.length;

      if (!deptMap[user.department]) {
        deptMap[user.department] = { totalTasks: 0, completedTasks: 0 };
      }

      deptMap[user.department].totalTasks += totalTasks;
      deptMap[user.department].completedTasks += completedTasks;
    });

    return Object.keys(deptMap).map(dept => ({
      department: dept,
      performance: deptMap[dept].totalTasks > 0
        ? Math.round((deptMap[dept].completedTasks / deptMap[dept].totalTasks) * 100)
        : 0,
      change: 0 // TODO: Implement historical comparison when metrics storage is added
    }));
  })();

  // Task Status Distribution
  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Not Started', value: tasks.filter(t => t.status === 'not_started').length, color: '#6b7280' },
    { name: 'Overdue', value: tasks.filter(t => t.status === 'overdue').length, color: '#ef4444' },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#f59e0b' }
  ];

  // Employee Performance Distribution
  const employeePerformanceData = users
    .filter(u => u && u.role === 'employee' && u.name)
    .map(emp => {
      const empTasks = tasks.filter(t => t.assignedTo === emp.id);
      const metrics = calculatePerformanceMetrics(empTasks);
      return {
        name: (emp.name || 'Unknown').split(' ')[0],
        completionRate: metrics.completionRate,
        tasksCompleted: metrics.completedTasks,
        onTimeRate: empTasks.length > 0 ? Math.round((empTasks.filter(t => {
          if (t.status !== 'completed') return false;
          return new Date(t.completedDate) <= new Date(t.dueDate);
        }).length / empTasks.length) * 100) : 0
      };
    })
    .slice(0, 8); // Top 8 employees

  // KPI Radar Chart Data - CALCULATED FROM ACTUAL DATA
  const kpiRadarData = (() => {
    const allTasks = tasks;
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const totalTasks = allTasks.length;

    const taskCompletion = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const onTimeTasks = allTasks.filter(t => {
      if (t.status !== 'completed' || !t.completedDate || !t.dueDate) return false;
      return new Date(t.completedDate) <= new Date(t.dueDate);
    }).length;
    const onTimeDelivery = completedTasks.length > 0 ? Math.round((onTimeTasks / completedTasks.length) * 100) : 0;

    const tasksWithRatings = allTasks.filter(t => t.rating && t.rating > 0);
    const qualityScore = tasksWithRatings.length > 0
      ? Math.round((tasksWithRatings.reduce((sum, t) => sum + t.rating, 0) / tasksWithRatings.length) * 20)
      : 0;

    return [
      { metric: 'Task Completion', value: taskCompletion },
      { metric: 'On-Time Delivery', value: onTimeDelivery },
      { metric: 'Quality Score', value: qualityScore },
      { metric: 'Team Collaboration', value: 0 }, // TODO: Add collaboration tracking
      { metric: 'Goal Achievement', value: onTimeDelivery },
      { metric: 'Employee Satisfaction', value: 0 } // TODO: Add satisfaction surveys
    ];
  })();

  // Weekly Activity Data - CALCULATED FROM ACTUAL DATA
  const weeklyActivityData = (() => {
    const weekData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.createdAt || t.assignedDate);
        return taskDate.toISOString().split('T')[0] === dateStr;
      });

      const completedToday = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completedDate) return false;
        const compDate = new Date(t.completedDate);
        return compDate.toISOString().split('T')[0] === dateStr;
      }).length;

      const hoursLogged = dayTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

      weekData.push({
        day: dayNames[date.getDay()],
        tasksCreated: dayTasks.length,
        tasksCompleted: completedToday,
        hoursLogged: Math.round(hoursLogged)
      });
    }

    return weekData;
  })();

  const metrics = calculatePerformanceMetrics(tasks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Analytics Dashboard" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Performance Analytics
            </h1>
            <p className="mt-2 text-gray-600">Comprehensive insights into organizational performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
          </select>
        </div>

        {/* Data Integrity Warning Banner */}
        {dataIntegrityReport && (dataIntegrityReport.status === 'critical' || dataIntegrityReport.status === 'poor' || dataIntegrityReport.warnings.length > 3) && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Analytics Data Quality Alert
                </h3>
                <p className="text-amber-800 mb-3">
                  Some analytics may be inaccurate due to incomplete or missing data.
                  Data Quality Score: {dataIntegrityReport.dataQualityScore}/100
                </p>
                {dataIntegrityReport.warnings.length > 0 && (
                  <div className="bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">Issues Detected:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {dataIntegrityReport.warnings.slice(0, 5).map((warning, idx) => (
                        <li key={idx} className="text-gray-700">{warning}</li>
                      ))}
                      {dataIntegrityReport.warnings.length > 5 && (
                        <li className="text-gray-600 italic">...and {dataIntegrityReport.warnings.length - 5} more issues</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2 text-sm text-amber-800">
                  <Info className="w-4 h-4" />
                  <span className="font-semibold">Important:</span>
                  <span>Do not use this data for employment decisions until data quality improves</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards - CALCULATED FROM ACTUAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">N/A</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Employees</p>
            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'employee' && u.is_active).length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Actual</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Task Completion</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Actual</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">On-Time Delivery</p>
            <p className="text-3xl font-bold text-gray-900">
              {(() => {
                const completedTasks = tasks.filter(t => t.status === 'completed');
                const onTimeTasks = tasks.filter(t => {
                  if (t.status !== 'completed' || !t.completedDate || !t.dueDate) return false;
                  return new Date(t.completedDate) <= new Date(t.dueDate);
                }).length;
                return completedTasks.length > 0 ? Math.round((onTimeTasks / completedTasks.length) * 100) : 0;
              })()}%
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Actual</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Quality Rating</p>
            <p className="text-3xl font-bold text-gray-900">
              {(() => {
                const tasksWithRatings = tasks.filter(t => t.rating && t.rating > 0);
                if (tasksWithRatings.length === 0) return 'N/A';
                const avg = tasksWithRatings.reduce((sum, t) => sum + t.rating, 0) / tasksWithRatings.length;
                return avg.toFixed(1) + '/5';
              })()}
            </p>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Trends (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="engagement" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Engagement %" />
              <Area type="monotone" dataKey="productivity" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Productivity %" />
              <Area type="monotone" dataKey="goalAchievement" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Goal Achievement %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Department Performance */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Department Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="performance" fill="#6366f1" name="Performance %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Task Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Employee Performance Comparison */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Employee Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" radius={[8, 8, 0, 0]} />
                <Bar dataKey="onTimeRate" fill="#3b82f6" name="On-Time Rate %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KPI Radar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overall KPI Health</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={kpiRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Activity Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tasksCreated" stroke="#f59e0b" strokeWidth={2} name="Tasks Created" />
              <Line type="monotone" dataKey="tasksCompleted" stroke="#10b981" strokeWidth={2} name="Tasks Completed" />
              <Line type="monotone" dataKey="hoursLogged" stroke="#3b82f6" strokeWidth={2} name="Hours Logged" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
