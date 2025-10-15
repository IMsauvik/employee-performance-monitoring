import { useState } from 'react';
import { LayoutDashboard, TrendingUp, Target, Award, Calendar, CheckCircle, Clock } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useGoals } from '../../hooks/useGoals';
import { goalCategories } from '../../data/goalsData';

const EmployeeGoalsPage = () => {
  const { currentUser } = useAuth();
  const { goals, getObjectives, getKeyResults } = useGoals(currentUser.id, 'employee');
  const [selectedCycle, setSelectedCycle] = useState('Q4-2025');

  const navigation = [
    { name: 'My Tasks', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Performance', path: '/employee/performance', icon: TrendingUp },
    { name: 'Goals', path: '/employee/goals', icon: Target },
    { name: 'Analytics', path: '/employee/analytics', icon: TrendingUp }
  ];

  const filteredGoals = goals.filter(goal => goal.cycle === selectedCycle);
  const myObjectives = filteredGoals.filter(g => g.type === 'objective');

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    const colors = {
      on_track: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      at_risk: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      off_track: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || colors.in_progress;
  };

  const getCategoryColor = (categoryValue) => {
    const category = goalCategories.find(c => c.value === categoryValue);
    return category ? category.color : '#6b7280';
  };

  // Calculate stats
  const totalGoals = filteredGoals.length;
  const completedGoals = filteredGoals.filter(g => g.status === 'completed').length;
  const onTrackGoals = filteredGoals.filter(g => g.status === 'on_track').length;
  const averageProgress = filteredGoals.length > 0
    ? Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="My Goals" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
            <Target className="w-10 h-10 mr-3 text-indigo-600" />
            My Goals & Objectives
          </h1>
          <p className="mt-2 text-gray-600">Track your personal and professional development goals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{totalGoals}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">My Goals</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{completedGoals}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{onTrackGoals}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">On Track</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{averageProgress}%</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Avg Progress</p>
          </div>
        </div>

        {/* Cycle Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-semibold text-gray-700">Goal Cycle:</label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Q4-2025">Q4 2025 (Oct-Dec 2025)</option>
              <option value="Q1-2026">Q1 2026 (Jan-Mar 2026)</option>
              <option value="Annual-2025">Annual 2025</option>
            </select>
          </div>
        </div>

        {/* My Objectives */}
        <div className="space-y-6">
          {myObjectives.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600">Your goals will appear here once assigned or created</p>
            </div>
          ) : (
            myObjectives.map(objective => {
              const keyResults = getKeyResults(objective.id);
              const categoryColor = getCategoryColor(objective.specificCategory);

              return (
                <div key={objective.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition">
                  {/* Objective Header */}
                  <div className="p-6 border-b border-gray-100" style={{ borderLeftWidth: '4px', borderLeftColor: categoryColor }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor(objective.status)}`}>
                            {objective.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                            {objective.level.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{objective.title}</h3>
                        <p className="text-gray-600 mb-3">{objective.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {new Date(objective.dueDate).toLocaleDateString()}
                          </span>
                          {objective.tags && (
                            <div className="flex gap-2">
                              {objective.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Circle */}
                      <div className="w-24 h-24">
                        <CircularProgressbar
                          value={objective.progress}
                          text={`${objective.progress}%`}
                          styles={buildStyles({
                            pathColor: getProgressColor(objective.progress),
                            textColor: '#1f2937',
                            trailColor: '#e5e7eb',
                            textSize: '24px',
                            pathTransitionDuration: 0.5
                          })}
                        />
                      </div>
                    </div>

                    {/* Metrics */}
                    {objective.metrics && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Baseline</p>
                            <p className="text-xl font-bold text-gray-900">{objective.metrics.baseline} {objective.metrics.unit}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-400 border-b-[6px] border-b-transparent"></div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Current</p>
                            <p className="text-xl font-bold text-indigo-600">{objective.metrics.current} {objective.metrics.unit}</p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-400 border-b-[6px] border-b-transparent"></div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Target</p>
                            <p className="text-xl font-bold text-green-600">{objective.metrics.target} {objective.metrics.unit}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Results */}
                  {keyResults.length > 0 && (
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-indigo-600" />
                        Key Results ({keyResults.length})
                      </h4>
                      <div className="space-y-3">
                        {keyResults.map(kr => (
                          <div key={kr.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(kr.status)}`}>
                                    {kr.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-gray-900">{kr.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{kr.description}</p>
                              </div>
                              <div className="w-16 h-16 ml-4">
                                <CircularProgressbar
                                  value={kr.progress}
                                  text={`${kr.progress}%`}
                                  styles={buildStyles({
                                    pathColor: getProgressColor(kr.progress),
                                    textColor: '#1f2937',
                                    trailColor: '#e5e7eb',
                                    textSize: '20px'
                                  })}
                                />
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{kr.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all duration-500"
                                  style={{
                                    width: `${kr.progress}%`,
                                    backgroundColor: getProgressColor(kr.progress)
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* KR Metrics */}
                            {kr.metrics && (
                              <div className="mt-3 flex items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                  Baseline: <span className="font-semibold">{kr.metrics.baseline}{kr.metrics.unit}</span>
                                </span>
                                <span className="text-indigo-600">
                                  Current: <span className="font-semibold">{kr.metrics.current}{kr.metrics.unit}</span>
                                </span>
                                <span className="text-green-600">
                                  Target: <span className="font-semibold">{kr.metrics.target}{kr.metrics.unit}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Check-ins */}
                  {objective.checkIns && objective.checkIns.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                        Recent Check-ins
                      </h4>
                      <div className="space-y-3">
                        {objective.checkIns.slice(-3).reverse().map(checkin => (
                          <div key={checkin.id} className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {new Date(checkin.date).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-semibold text-indigo-600">{checkin.progress}%</span>
                            </div>
                            <p className="text-sm text-gray-600">{checkin.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeGoalsPage;
