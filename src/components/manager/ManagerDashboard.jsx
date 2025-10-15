import { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Users as UsersIcon, TrendingUp, Clock, AlertCircle, CheckCircle, Target, BarChart3, Send, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { storage } from '../../utils/storage';
import { calculatePerformanceMetrics, formatDate } from '../../utils/helpers';
import { TASK_STATUS } from '../../utils/taskConstants';

const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    submittedForReview: 0,
    underReview: 0
  });
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', path: '/manager/tasks', icon: ListTodo },
    { name: 'Employees', path: '/manager/employees', icon: UsersIcon },
    { name: 'Analytics', path: '/manager/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    const allUsers = storage.getUsers();
    const employeeList = allUsers.filter(u => u && u.role === 'employee' && u.id && u.name);
    setEmployees(employeeList);
  }, []);

  useEffect(() => {
    const metrics = calculatePerformanceMetrics(tasks);
    const submittedForReview = tasks.filter(t => t.status === TASK_STATUS.SUBMITTED).length;
    const underReview = tasks.filter(t => t.status === TASK_STATUS.UNDER_REVIEW).length;
    setStats({
      ...metrics,
      submittedForReview,
      underReview
    });
  }, [tasks]);

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getEmployeeMetrics = (employeeId) => {
    const employeeTasks = tasks.filter(t => t.assignedTo === employeeId);
    return calculatePerformanceMetrics(employeeTasks);
  };

  const topPerformers = employees
    .map(emp => ({
      ...emp,
      metrics: getEmployeeMetrics(emp.id)
    }))
    .sort((a, b) => b.metrics.completionRate - a.metrics.completionRate)
    .slice(0, 3);

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      not_started: 'bg-gray-100 text-gray-800 border-gray-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      blocked: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || colors.not_started;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Dashboard" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 hover-lift">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="mt-2 text-gray-600 animate-slideIn">Here's an overview of your team's performance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-400/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{stats.totalTasks}</span>
            </div>
            <p className="text-sm font-medium text-white/90">Total Tasks</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-400/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{stats.completedTasks}</span>
            </div>
            <p className="text-sm font-medium text-white/90">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-400/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{stats.inProgressTasks}</span>
            </div>
            <p className="text-sm font-medium text-white font-semibold">In Progress</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 cursor-pointer" style={{ animationDelay: '0.4s' }} onClick={() => navigate('/manager/tasks')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-400/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <Send className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{stats.submittedForReview}</span>
            </div>
            <p className="text-sm font-medium text-white/90">Submitted for Review</p>
            {stats.submittedForReview > 0 && (
              <div className="mt-2 flex items-center text-xs text-white/80">
                <AlertCircle className="w-3 h-3 mr-1 animate-pulse" />
                <span>Needs attention</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 cursor-pointer" style={{ animationDelay: '0.5s' }} onClick={() => navigate('/manager/tasks')}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-400/30 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{stats.underReview}</span>
            </div>
            <p className="text-sm font-medium text-white/90">Under Review</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center animate-float">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white animate-number">{employees.length}</span>
            </div>
            <p className="text-sm font-medium text-cyan-100">Team Members</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideInLeft hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-success-500" />
                Top Performers
              </h2>
              <button
                onClick={() => navigate('/manager/employees')}
                className="text-sm text-accent-600 hover:text-accent-700 font-semibold transition-colors"
              >
                View All
              </button>
            </div>
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-200 hover-lift transition-all">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg animate-float">
                        {employee.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent-600 animate-number">{employee.metrics.completionRate}%</p>
                      <p className="text-xs text-gray-500">{employee.metrics.completedTasks}/{employee.metrics.totalTasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No employee data available</p>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideInRight hover-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <ListTodo className="w-6 h-6 mr-2 text-accent-500" />
                Recent Tasks
              </h2>
              <button
                onClick={() => navigate('/manager/tasks')}
                className="text-sm text-accent-600 hover:text-accent-700 font-semibold transition-colors"
              >
                View All
              </button>
            </div>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const employee = employees.find(e => e.id === task.assignedTo);
                  return (
                    <div key={task.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all hover-lift">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{task.taskName}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{task.project}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{employee?.name || 'Unassigned'}</span>
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No tasks available</p>
            )}
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        {stats.overdueTasks > 0 && (
          <div className="mt-6 bg-danger-50 border-l-4 border-danger-500 p-6 rounded-xl animate-fadeIn hover-lift">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-danger-500 mr-3 animate-pulse" />
              <div>
                <h3 className="font-semibold text-danger-900">Attention Required</h3>
                <p className="text-sm text-danger-700">
                  You have {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? 's' : ''} that need immediate attention.
                </p>
              </div>
              <button
                onClick={() => navigate('/manager/tasks')}
                className="ml-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all transform hover:scale-105 shadow-sm"
              >
                Review Tasks
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
