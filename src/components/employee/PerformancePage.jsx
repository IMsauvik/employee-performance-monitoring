import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, Calendar, Award, Target, Clock, BarChart3 } from 'lucide-react';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { calculatePerformanceMetrics, formatDate } from '../../utils/helpers';

const PerformancePage = () => {
  const { currentUser } = useAuth();
  const { tasks } = useTasks(currentUser.id, 'employee');
  const [period, setPeriod] = useState('all');
  const [metrics, setMetrics] = useState(null);

  const navigation = [
    { name: 'My Tasks', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Performance', path: '/employee/performance', icon: TrendingUp },
    { name: 'Analytics', path: '/employee/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    const calculatedMetrics = calculatePerformanceMetrics(tasks);
    setMetrics(calculatedMetrics);
  }, [tasks]);

  const completedTasks = tasks.filter(t => t.status === 'completed').sort((a, b) =>
    new Date(b.completedDate) - new Date(a.completedDate)
  );

  const getAchievements = () => {
    const achievements = [];
    if (metrics) {
      if (metrics.completedTasks >= 10) achievements.push({ icon: Award, title: '10 Tasks Completed', color: 'bg-yellow-500' });
      if (metrics.completionRate >= 80) achievements.push({ icon: Target, title: '80% Completion Rate', color: 'bg-green-500' });
      if (metrics.completedTasks > 0 && metrics.overdueTasks === 0) achievements.push({ icon: Clock, title: 'On-Time Delivery', color: 'bg-blue-500' });
    }
    return achievements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="Performance" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Performance
          </h1>
          <p className="mt-2 text-gray-600">Track your progress and achievements</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="7">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{metrics.totalTasks}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{metrics.completedTasks}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</span>
                </div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{metrics.averageCompletionTime}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">Avg. Days</p>
              </div>
            </div>

            {/* Achievements */}
            {getAchievements().length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Award className="w-6 h-6 mr-2 text-yellow-500" />
                  Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getAchievements().map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className={`w-12 h-12 ${achievement.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <achievement.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{achievement.title}</p>
                        <p className="text-xs text-gray-600">Unlocked!</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Completed Tasks */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Completed Tasks</h2>
              {completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.taskName}</h3>
                        <p className="text-sm text-gray-600">{task.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Completed</p>
                        <p className="text-xs text-gray-500">{formatDate(task.completedDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No completed tasks yet</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PerformancePage;
