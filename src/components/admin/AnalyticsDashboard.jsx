import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Shield, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { db } from '../../services/databaseService';
import { calculatePerformanceMetrics } from '../../utils/helpers';

const AnalyticsDashboard = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const [users, setUsers] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days

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

  // Performance Trend Data (Last 6 months)
  const performanceTrendData = [
    { month: 'May', engagement: 82, productivity: 78, goalAchievement: 75 },
    { month: 'Jun', engagement: 85, productivity: 82, goalAchievement: 78 },
    { month: 'Jul', engagement: 83, productivity: 85, goalAchievement: 80 },
    { month: 'Aug', engagement: 86, productivity: 88, goalAchievement: 82 },
    { month: 'Sep', engagement: 84, productivity: 90, goalAchievement: 85 },
    { month: 'Oct', engagement: 87, productivity: 94, goalAchievement: 78 }
  ];

  // Department Performance Data
  const departmentData = [
    { department: 'Engineering', performance: 85, change: 3 },
    { department: 'Sales', performance: 81, change: 7 },
    { department: 'Marketing', performance: 79, change: 0 },
    { department: 'HR', performance: 88, change: 2 },
    { department: 'Operations', performance: 76, change: -2 }
  ];

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

  // KPI Radar Chart Data
  const kpiRadarData = [
    { metric: 'Task Completion', value: 94 },
    { metric: 'On-Time Delivery', value: 89 },
    { metric: 'Quality Score', value: 85 },
    { metric: 'Team Collaboration', value: 91 },
    { metric: 'Goal Achievement', value: 78 },
    { metric: 'Employee Satisfaction', value: 87 }
  ];

  // Weekly Activity Data
  const weeklyActivityData = [
    { day: 'Mon', tasksCreated: 12, tasksCompleted: 8, hoursLogged: 45 },
    { day: 'Tue', tasksCreated: 15, tasksCompleted: 10, hoursLogged: 52 },
    { day: 'Wed', tasksCreated: 10, tasksCompleted: 14, hoursLogged: 48 },
    { day: 'Thu', tasksCreated: 18, tasksCompleted: 12, hoursLogged: 50 },
    { day: 'Fri', tasksCreated: 14, tasksCompleted: 16, hoursLogged: 46 },
    { day: 'Sat', tasksCreated: 5, tasksCompleted: 8, hoursLogged: 20 },
    { day: 'Sun', tasksCreated: 3, tasksCompleted: 5, hoursLogged: 15 }
  ];

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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">+5%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Employee Engagement</p>
            <p className="text-3xl font-bold text-gray-900">87%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">+3%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Task Completion</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-800 rounded-full">-2%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Goal Achievement</p>
            <p className="text-3xl font-bold text-gray-900">78%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">+8%</span>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Productivity Score</p>
            <p className="text-3xl font-bold text-gray-900">94</p>
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
