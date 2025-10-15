import { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Users as UsersIcon, Target, BarChart3, TrendingUp, Calendar, Download, Award, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis } from 'recharts';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { storage } from '../../utils/storage';
import { calculateAdvancedMetrics, calculateTeamMetrics, getPerformanceGrade, getDateRangePresets } from '../../utils/performanceMetrics';

const TeamAnalytics = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks(currentUser?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [dateRange, setDateRange] = useState('last30Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const navigation = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/manager/tasks', icon: ListTodo },
    { name: 'Employees', path: '/manager/employees', icon: UsersIcon },
    { name: 'Analytics', path: '/manager/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    try {
      const allUsers = storage.getUsers() || [];
      const employeeList = allUsers.filter(u => u.role === 'employee');
      setEmployees(employeeList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Failed to load employee data');
      setLoading(false);
    }
  }, []);

  // Get date range
  const getActiveDateRange = () => {
    if (dateRange === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) };
    }
    const presets = getDateRangePresets();
    return presets[dateRange] || presets.last30Days;
  };

  const activeDates = getActiveDateRange();

  // Filter tasks by date
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt || task.assignedDate);
    return taskDate >= activeDates.start && taskDate <= activeDates.end;
  });

  // Calculate team metrics
  const teamMetrics = calculateTeamMetrics(employees, filteredTasks);
  const overallMetrics = calculateAdvancedMetrics(filteredTasks);

  // Get selected employee data
  const selectedEmpData = selectedEmployee === 'all'
    ? null
    : teamMetrics.find(e => e.id === selectedEmployee);

  // Performance distribution data for scatter plot
  const performanceScatter = teamMetrics.map(emp => ({
    name: emp.name,
    productivity: emp.productivityScore,
    completion: emp.completionRate,
    tasks: emp.totalTasks
  }));

  // Top and bottom performers
  const topPerformers = teamMetrics.slice(0, 5);
  const needsAttention = teamMetrics.filter(emp =>
    emp.productivityScore < 60 || emp.blockedTasks > 2 || emp.overdueTasks > 3
  );

  // Team average comparison
  const teamAverage = {
    completionRate: teamMetrics.length > 0
      ? Math.round(teamMetrics.reduce((sum, e) => sum + e.completionRate, 0) / teamMetrics.length)
      : 0,
    onTimeRate: teamMetrics.length > 0
      ? Math.round(teamMetrics.reduce((sum, e) => sum + e.onTimeRate, 0) / teamMetrics.length)
      : 0,
    productivityScore: teamMetrics.length > 0
      ? Math.round(teamMetrics.reduce((sum, e) => sum + e.productivityScore, 0) / teamMetrics.length)
      : 0,
    averageCompletionTime: teamMetrics.length > 0
      ? Math.round(teamMetrics.reduce((sum, e) => sum + e.averageCompletionTime, 0) / teamMetrics.length)
      : 0
  };

  // Workload distribution
  const workloadData = teamMetrics.map(emp => ({
    name: emp.name,
    total: emp.totalTasks,
    completed: emp.completedTasks,
    inProgress: emp.inProgressTasks,
    blocked: emp.blockedTasks
  }));

  const handleExport = () => {
    const reportData = {
      manager: currentUser.name,
      dateRange: `${activeDates.start.toLocaleDateString()} - ${activeDates.end.toLocaleDateString()}`,
      teamMetrics,
      overallMetrics,
      teamAverage,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Team Analytics" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="w-10 h-10 mr-3 text-indigo-600" />
              Team Performance Analytics
            </h1>
            <p className="mt-2 text-gray-600">Comprehensive insights into your team's performance</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
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
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <UsersIcon className="w-4 h-4 inline mr-2" />
                Filter by Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Team Members</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Team Size</p>
            <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{teamAverage.completionRate}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Productivity</p>
            <p className="text-3xl font-bold text-gray-900">{teamAverage.productivityScore}/100</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Need Attention</p>
            <p className="text-3xl font-bold text-gray-900">{needsAttention.length}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team Performance Comparison */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Team Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamMetrics.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="productivityScore" fill="#8b5cf6" name="Productivity" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completionRate" fill="#10b981" name="Completion %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workload Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Workload Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                <Bar dataKey="blocked" stackId="a" fill="#f59e0b" name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Scatter Plot */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="completion" name="Completion Rate" unit="%" domain={[0, 100]} />
              <YAxis type="number" dataKey="productivity" name="Productivity Score" domain={[0, 100]} />
              <ZAxis type="number" dataKey="tasks" range={[100, 1000]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Team Members" data={performanceScatter} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-600 text-center mt-4">
            Bubble size represents total tasks assigned. Top-right quadrant = High performers
          </p>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="w-6 h-6 mr-2 text-yellow-500" />
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPerformers.map((emp, index) => {
              const grade = getPerformanceGrade(emp.productivityScore);
              return (
                <div key={emp.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: grade.color }}>{grade.grade}</p>
                      <p className="text-xs text-gray-500">{grade.label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-green-600 font-medium">Completion</p>
                      <p className="text-lg font-bold text-green-900">{emp.completionRate}%</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-600 font-medium">On-Time</p>
                      <p className="text-lg font-bold text-blue-900">{emp.onTimeRate}%</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <p className="text-xs text-purple-600 font-medium">Tasks</p>
                      <p className="text-lg font-bold text-purple-900">{emp.completedTasks}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employees Needing Attention */}
        {needsAttention.length > 0 && (
          <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
            <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <AlertCircle className="w-6 h-6 mr-2" />
              Team Members Needing Attention
            </h3>
            <div className="space-y-3">
              {needsAttention.map(emp => (
                <div key={emp.id} className="bg-white p-4 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{emp.name}</p>
                      <div className="flex gap-3 mt-2 text-sm">
                        {emp.productivityScore < 60 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg">
                            Low Productivity: {emp.productivityScore}
                          </span>
                        )}
                        {emp.blockedTasks > 2 && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-lg">
                            {emp.blockedTasks} Blocked Tasks
                          </span>
                        )}
                        {emp.overdueTasks > 3 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-lg">
                            {emp.overdueTasks} Overdue Tasks
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                      Schedule 1:1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamAnalytics;
