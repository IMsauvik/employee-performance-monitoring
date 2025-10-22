import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, BarChart3, TrendingUp, Calendar, Download, Award } from 'lucide-react';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { db } from '../../services/databaseService';
import { calculateAdvancedMetrics, calculateTeamMetrics, getPerformanceGrade, getDateRangePresets } from '../../utils/performanceMetrics';

const AdminPerformanceOverview = () => {
  useAuth();
  const { tasks } = useTasks();
  const [users, setUsers] = useState([]);
  const [dateRange, setDateRange] = useState('last30Days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [viewType, setViewType] = useState('organization'); // organization, managers, departments

  const navigation = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'System Settings', path: '/admin/settings', icon: Shield },
    { name: 'Performance', path: '/admin/performance', icon: BarChart3 }
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

  // Overall organization metrics
  const overallMetrics = calculateAdvancedMetrics(filteredTasks);

  // Get employees and managers
  const employees = users.filter(u => u.role === 'employee');
  const managers = users.filter(u => u.role === 'manager');

  // Calculate team metrics
  const employeeMetrics = calculateTeamMetrics(employees, filteredTasks);

  // Manager performance (based on their team's performance)
  const managerMetrics = managers.map(manager => {
    const teamMembers = employees.filter(emp => emp.managerId === manager.id);
    const teamTasks = filteredTasks.filter(t => teamMembers.some(tm => tm.id === t.assignedTo));
    const teamMetrics = calculateAdvancedMetrics(teamTasks);

    return {
      id: manager.id,
      name: manager.name,
      department: manager.department,
      teamSize: teamMembers.length,
      ...teamMetrics
    };
  });

  // Department metrics
  const departments = [...new Set(users.map(u => u.department))];
  const departmentMetrics = departments.map(dept => {
    const deptUsers = users.filter(u => u.department === dept && u.role === 'employee');
    const deptTasks = filteredTasks.filter(t => deptUsers.some(u => u.id === t.assignedTo));
    const metrics = calculateAdvancedMetrics(deptTasks);

    return {
      name: dept,
      employees: deptUsers.length,
      ...metrics
    };
  });

  // Organization-wide trends (last 30 days)
  const trendData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.completedDate || task.updatedAt || task.createdAt);
      return taskDate.toISOString().split('T')[0] === dateStr;
    });

    trendData.push({
      date: dateStr,
      completed: dayTasks.filter(t => t.status === 'completed').length,
      created: dayTasks.filter(t => {
        const createdDate = new Date(t.createdAt);
        return createdDate.toISOString().split('T')[0] === dateStr;
      }).length,
      productivity: dayTasks.length > 0 ? calculateAdvancedMetrics(dayTasks).productivityScore : 0
    });
  }

  // Top departments
  const topDepartments = [...departmentMetrics].sort((a, b) => b.productivityScore - a.productivityScore);

  // Top managers
  const topManagers = [...managerMetrics].sort((a, b) => b.productivityScore - a.productivityScore);

  // Organization health indicators
  const healthIndicators = [
    {
      name: 'Completion',
      value: overallMetrics.completionRate,
      target: 85,
      status: overallMetrics.completionRate >= 85 ? 'good' : overallMetrics.completionRate >= 70 ? 'warning' : 'critical'
    },
    {
      name: 'On-Time Delivery',
      value: overallMetrics.onTimeRate,
      target: 80,
      status: overallMetrics.onTimeRate >= 80 ? 'good' : overallMetrics.onTimeRate >= 65 ? 'warning' : 'critical'
    },
    {
      name: 'Productivity',
      value: overallMetrics.productivityScore,
      target: 75,
      status: overallMetrics.productivityScore >= 75 ? 'good' : overallMetrics.productivityScore >= 60 ? 'warning' : 'critical'
    },
    {
      name: 'Quality',
      value: overallMetrics.qualityScore || 85,
      target: 80,
      status: (overallMetrics.qualityScore || 85) >= 80 ? 'good' : (overallMetrics.qualityScore || 85) >= 65 ? 'warning' : 'critical'
    }
  ];

  const overallGrade = getPerformanceGrade(overallMetrics.productivityScore);

  const handleExport = () => {
    const reportData = {
      organization: 'Ecoconsious',
      dateRange: `${activeDates.start.toLocaleDateString()} - ${activeDates.end.toLocaleDateString()}`,
      overallMetrics,
      departmentMetrics,
      managerMetrics,
      employeeMetrics,
      healthIndicators,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organization-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Performance Overview" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="w-10 h-10 mr-3 text-indigo-600" />
              Organization Performance Overview
            </h1>
            <p className="mt-2 text-gray-600">Comprehensive analytics across the entire organization</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">View Type</label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="organization">Organization Overview</option>
                <option value="departments">By Department</option>
                <option value="managers">By Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Organization Grade Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Overall Organization Grade</h2>
              <p className="text-indigo-100 mb-4">{overallGrade.label} Performance Level</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-indigo-100">Total Employees</p>
                  <p className="text-3xl font-bold">{employees.length}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Total Tasks</p>
                  <p className="text-3xl font-bold">{overallMetrics.totalTasks}</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Completion Rate</p>
                  <p className="text-3xl font-bold">{overallMetrics.completionRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-indigo-100">Productivity</p>
                  <p className="text-3xl font-bold">{overallMetrics.productivityScore}/100</p>
                </div>
              </div>
            </div>
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center ml-8">
              <div className="text-center">
                <p className="text-6xl font-bold" style={{ color: overallGrade.color }}>
                  {overallGrade.grade}
                </p>
                <p className="text-sm text-gray-600 mt-2">{overallGrade.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {healthIndicators.map(indicator => (
            <div key={indicator.name} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  indicator.status === 'good' ? 'bg-green-500' :
                  indicator.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{indicator.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{indicator.value}</p>
                <span className="text-xs text-gray-500">/ {indicator.target} target</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    indicator.status === 'good' ? 'bg-green-500' :
                    indicator.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (indicator.value / indicator.target) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Organization Trends */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Organization Performance Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Completed Tasks" />
              <Area yAxisId="left" type="monotone" dataKey="created" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Created Tasks" />
              <Line yAxisId="right" type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={3} name="Productivity Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* View-specific content */}
        {viewType === 'departments' && (
          <div className="space-y-6">
            {/* Department Performance Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Department Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topDepartments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionRate" fill="#10b981" name="Completion %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="productivityScore" fill="#8b5cf6" name="Productivity" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="onTimeRate" fill="#3b82f6" name="On-Time %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topDepartments.map(dept => {
                const grade = getPerformanceGrade(dept.productivityScore);
                return (
                  <div key={dept.name} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">{dept.name}</h4>
                      <div className="text-right">
                        <p className="text-3xl font-bold" style={{ color: grade.color }}>{grade.grade}</p>
                        <p className="text-xs text-gray-500">{grade.label}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Employees</p>
                        <p className="text-xl font-bold text-blue-900">{dept.employees}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium">Completed</p>
                        <p className="text-xl font-bold text-green-900">{dept.completedTasks}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-medium">Productivity</p>
                        <p className="text-xl font-bold text-purple-900">{dept.productivityScore}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs text-indigo-600 font-medium">On-Time</p>
                        <p className="text-xl font-bold text-indigo-900">{dept.onTimeRate}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'managers' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-500" />
              Manager Performance Overview
            </h3>
            <div className="space-y-4">
              {topManagers.map((manager) => {
                const grade = getPerformanceGrade(manager.productivityScore);
                return (
                  <div key={manager.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {manager.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">{manager.name}</p>
                          <p className="text-sm text-gray-600">{manager.department} • Team Size: {manager.teamSize}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Completion</p>
                          <p className="text-2xl font-bold text-green-600">{manager.completionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Productivity</p>
                          <p className="text-2xl font-bold text-purple-600">{manager.productivityScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold" style={{ color: grade.color }}>{grade.grade}</p>
                          <p className="text-xs text-gray-500">{grade.label}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPerformanceOverview;
