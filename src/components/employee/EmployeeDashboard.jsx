import { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, BarChart3, Send, Link, XCircle, User } from 'lucide-react';
import Header from '../common/Header';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { calculatePerformanceMetrics } from '../../utils/helpers';
import { TASK_STATUS, DEPENDENCY_STATUS } from '../../utils/taskConstants';
import EmployeeTasksTable from './EmployeeTasksTable';
import { db } from '../../services/databaseService';
import DependencyTaskDetailModal from '../common/DependencyTaskDetailModal';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { currentUser } = useAuth();
  const { tasks, updateTask } = useTasks(currentUser.id, 'employee');
  const [filters, setFilters] = useState({
    status: 'all',
    project: 'all'
  });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    submittedForReview: 0
  });
  const [dependencyTasks, setDependencyTasks] = useState([]);
  const [selectedDependencyId, setSelectedDependencyId] = useState(null);
  const [dependencyTab, setDependencyTab] = useState('all'); // 'all', 'active', 'in-progress', 'completed'
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dependencyToReject, setDependencyToReject] = useState(null);

  const navigation = [
    { name: 'My Tasks', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Performance', path: '/employee/performance', icon: TrendingUp },
    { name: 'Analytics', path: '/employee/analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    const metrics = calculatePerformanceMetrics(tasks);
    const submittedForReview = tasks.filter(t =>
      t.status === TASK_STATUS.SUBMITTED || t.status === TASK_STATUS.UNDER_REVIEW
    ).length;
    setStats({
      ...metrics,
      submittedForReview
    });

    // Load dependency tasks - both assigned to me AND needing my review
    const loadDependencies = async () => {
      try {
        console.log('🔵 Loading dependency tasks for user:', currentUser.id);
        
        // Load tasks assigned TO me (I'm the helper)
        const assignedToMe = await db.getFullDependencyTasksByAssignee(currentUser.id);
        console.log('📝 Dependency tasks assigned to me:', assignedToMe?.length || 0);
        
        // Load tasks that need MY review (I'm the parent task owner)
        const needingMyReview = await db.getDependencyTasksForReview(currentUser.id);
        console.log('👀 Dependency tasks needing my review:', needingMyReview?.length || 0);
        
        // Combine both lists and remove duplicates
        const allDeps = [...(assignedToMe || []), ...(needingMyReview || [])];
        const uniqueDeps = allDeps.filter((dep, index, self) => 
          index === self.findIndex(d => d.id === dep.id)
        );
        
        console.log('✅ Total unique dependency tasks:', uniqueDeps.length);
        console.log('📋 Dependency tasks:', uniqueDeps);
        setDependencyTasks(uniqueDeps);
      } catch (error) {
        console.error('❌ Error loading dependency tasks:', error);
        setDependencyTasks([]);
      }
    };

    // Initial load
    loadDependencies();

    // Set up auto-refresh every 10 seconds to catch new dependency tasks
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing dependency tasks...');
      loadDependencies();
    }, 10000); // Refresh every 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [tasks, currentUser.id]);

  const handleAcceptDependency = async (e, depId) => {
    e.stopPropagation();
    try {
      const dep = await db.getFullDependencyTask(depId);
      if (!dep) return;

      const now = new Date().toISOString();
      await db.updateFullDependencyTask(depId, {
        acceptedBy: currentUser.id,
        acceptedByName: currentUser.name,
        acceptedAt: now,
        status: 'accepted',
        activityTimeline: [...(dep.activityTimeline || []), {
          id: `activity-${Date.now()}`,
          type: 'ACCEPTED',
          title: 'Dependency Accepted',
          description: `${currentUser.name} accepted this dependency task`,
          timestamp: now,
          userName: currentUser.name,
          userId: currentUser.id
        }]
      });

      toast.success('Dependency accepted!');
      // Reload dependencies to reflect changes
      const assignedToMe = await db.getFullDependencyTasksByAssignee(currentUser.id);
      const needingMyReview = await db.getDependencyTasksForReview(currentUser.id);
      const allDeps = [...(assignedToMe || []), ...(needingMyReview || [])];
      const uniqueDeps = allDeps.filter((d, index, self) => 
        index === self.findIndex(dep => dep.id === d.id)
      );
      setDependencyTasks(uniqueDeps);
    } catch (error) {
      console.error('Error accepting dependency:', error);
      toast.error('Failed to accept dependency');
    }
  };

  const handleRejectDependency = (e, depId) => {
    e.stopPropagation();
    setDependencyToReject(depId);
    setShowRejectionModal(true);
  };

  const confirmRejectDependency = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const dep = await db.getFullDependencyTask(dependencyToReject);
      if (!dep) return;

      const now = new Date().toISOString();
      await db.updateFullDependencyTask(dependencyToReject, {
        rejectedBy: currentUser.id,
        rejectedByName: currentUser.name,
        rejectedAt: now,
        rejectionReason,
        status: DEPENDENCY_STATUS.IN_PROGRESS,
        submittedForReview: false,
        activityTimeline: [...(dep.activityTimeline || []), {
          id: `activity-${Date.now()}`,
          type: 'REJECTED',
          title: 'Dependency Rejected',
          description: `${currentUser.name} rejected and sent for rework: "${rejectionReason}"`,
          timestamp: now,
          userName: currentUser.name,
          userId: currentUser.id
        }]
      });

      toast.success('Dependency rejected. Assignee has been notified.');
      setShowRejectionModal(false);
      setRejectionReason('');
      setDependencyToReject(null);

      // Reload dependencies
      const assignedToMe = await db.getFullDependencyTasksByAssignee(currentUser.id);
      const needingMyReview = await db.getDependencyTasksForReview(currentUser.id);
      const allDeps = [...(assignedToMe || []), ...(needingMyReview || [])];
      const uniqueDeps = allDeps.filter((d, index, self) => 
        index === self.findIndex(dep => dep.id === d.id)
      );
      setDependencyTasks(uniqueDeps);
    } catch (error) {
      console.error('Error rejecting dependency:', error);
      toast.error('Failed to reject dependency');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.project !== 'all' && task.project !== filters.project) return false;
    return true;
  });

  const uniqueProjects = [...new Set(tasks.map(t => t.project))];

  const upcomingDeadlines = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const daysLeft = Math.ceil((new Date(t.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header title="My Tasks" navigation={navigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-800 transform hover:scale-105 transition-transform duration-300">
            Welcome back, {currentUser?.name}!
          </h1>
          <p className="mt-2 text-gray-600 animate-slideIn">Track and manage your assigned tasks</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-blue-100" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center animate-float">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-blue-600 animate-number">{stats.totalTasks}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Tasks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-green-100" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center animate-float">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-green-600 animate-number">{stats.completedTasks}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-yellow-100" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center animate-float">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-yellow-600 animate-number">{stats.inProgressTasks}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">In Progress</p>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-purple-100" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center animate-float">
                <Send className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-600 animate-number">{stats.submittedForReview}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Submitted for Review</p>
            {stats.submittedForReview > 0 && (
              <p className="text-xs text-purple-600 mt-1">Awaiting manager feedback</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6 hover-lift animate-fadeIn transform transition-all duration-300 hover:scale-105 border border-red-100" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center animate-float">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-red-600 animate-number">{stats.overdueTasks}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Overdue</p>
          </div>
        </div>

        {/* Upcoming Deadlines Alert */}
        {upcomingDeadlines > 0 && (
          <div className="bg-warning-50 border-l-4 border-warning-500 p-6 mb-6 rounded-xl animate-fadeIn hover-lift">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-warning-600 mr-3 animate-pulse" />
              <div>
                <h3 className="font-semibold text-warning-900">Upcoming Deadlines</h3>
                <p className="text-sm text-warning-800">
                  You have {upcomingDeadlines} task{upcomingDeadlines !== 1 ? 's' : ''} due in the next 7 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="blocked">Blocked</option>
            </select>

            <select
              value={filters.project}
              onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dependency Tasks Section */}
        {dependencyTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fadeIn border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Link className="w-6 h-6 text-blue-600" />
                Dependency Tasks Assigned to You
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                {dependencyTasks.filter(d => d.status !== DEPENDENCY_STATUS.COMPLETED).length} Active
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              These tasks help resolve blockers in other tasks. Complete them to help your teammates continue their work.
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setDependencyTab('all')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({dependencyTasks.length})
              </button>
              <button
                onClick={() => setDependencyTab('pending-review')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'pending-review'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                ⏳ Needs Review ({dependencyTasks.filter(d => 
                  d.status === DEPENDENCY_STATUS.COMPLETED && 
                  d.submittedForReview && 
                  !d.acceptedBy && 
                  !d.rejectedBy &&
                  d.assignedTo !== currentUser.id // Not assigned to me (I'm the reviewer)
                ).length})
              </button>
              <button
                onClick={() => setDependencyTab('my-tasks')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'my-tasks'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 My Tasks ({dependencyTasks.filter(d => d.assignedTo === currentUser.id).length})
              </button>
              <button
                onClick={() => setDependencyTab('active')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'active'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Not Started ({dependencyTasks.filter(d => d.status === DEPENDENCY_STATUS.NOT_STARTED).length})
              </button>
              <button
                onClick={() => setDependencyTab('in-progress')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'in-progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                In Progress ({dependencyTasks.filter(d => d.status === DEPENDENCY_STATUS.IN_PROGRESS).length})
              </button>
              <button
                onClick={() => setDependencyTab('completed')}
                className={`px-4 py-2 font-medium transition border-b-2 whitespace-nowrap ${
                  dependencyTab === 'completed'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed ({dependencyTasks.filter(d => d.status === DEPENDENCY_STATUS.COMPLETED).length})
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dependencyTasks
                .filter(dep => {
                  if (dependencyTab === 'all') return true;
                  if (dependencyTab === 'pending-review') {
                    return dep.status === DEPENDENCY_STATUS.COMPLETED && 
                           dep.submittedForReview && 
                           !dep.acceptedBy && 
                           !dep.rejectedBy &&
                           dep.assignedTo !== currentUser.id;
                  }
                  if (dependencyTab === 'my-tasks') return dep.assignedTo === currentUser.id;
                  if (dependencyTab === 'active') return dep.status === DEPENDENCY_STATUS.NOT_STARTED;
                  if (dependencyTab === 'in-progress') return dep.status === DEPENDENCY_STATUS.IN_PROGRESS;
                  if (dependencyTab === 'completed') return dep.status === DEPENDENCY_STATUS.COMPLETED;
                  return true;
                })
                .map(dep => {
                const parentTask = tasks.find(t => t.id === dep.parentTaskId);
                const isCompleted = dep.status === DEPENDENCY_STATUS.COMPLETED;
                const isInProgress = dep.status === DEPENDENCY_STATUS.IN_PROGRESS;
                const isPendingReview = dep.status === DEPENDENCY_STATUS.COMPLETED && 
                                        dep.submittedForReview && 
                                        !dep.acceptedBy && 
                                        !dep.rejectedBy &&
                                        dep.assignedTo !== currentUser.id;
                const isAssignedToMe = dep.assignedTo === currentUser.id;

                return (
                  <div
                    key={dep.id}
                    className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                      isPendingReview
                        ? 'bg-yellow-50 border-yellow-400 animate-pulse'
                        : isCompleted
                        ? 'bg-green-50 border-green-300'
                        : isInProgress
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 flex-1 line-clamp-2">{dep.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ml-2 flex-shrink-0 ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isInProgress
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {dep.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {dep.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dep.description}</p>
                    )}

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        <span>For: {parentTask?.title || 'Unknown task'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {new Date(dep.dueDate).toLocaleDateString()}</span>
                      </div>
                      {!isAssignedToMe && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Assigned to: {dep.assignedToName || 'Unknown'}</span>
                        </div>
                      )}
                    </div>

                    {/* Pending Review Badge */}
                    {isPendingReview && (
                      <div className="mb-3 px-3 py-2 bg-yellow-100 border border-yellow-400 rounded-lg">
                        <p className="text-xs font-bold text-yellow-800 text-center">
                          ⏳ AWAITING YOUR REVIEW
                        </p>
                      </div>
                    )}

                    {/* Accept/Reject Buttons for Pending Review */}
                    {isPendingReview && (
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={(e) => handleAcceptDependency(e, dep.id)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleRejectDependency(e, dep.id)}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button 
                      onClick={() => setSelectedDependencyId(dep.id)}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      {isPendingReview ? 'View Details' : 'View & Update Progress'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <EmployeeTasksTable
          tasks={filteredTasks}
          onUpdate={updateTask}
        />
      </main>

      {/* Dependency Task Modal */}
      {selectedDependencyId && (
        <DependencyTaskDetailModal
          dependencyTaskId={selectedDependencyId}
          onClose={async () => {
            setSelectedDependencyId(null);
            // Reload dependency tasks
            try {
              const assignedToMe = await db.getFullDependencyTasksByAssignee(currentUser.id);
              const needingMyReview = await db.getDependencyTasksForReview(currentUser.id);
              const allDeps = [...(assignedToMe || []), ...(needingMyReview || [])];
              const uniqueDeps = allDeps.filter((d, index, self) => 
                index === self.findIndex(dep => dep.id === d.id)
              );
              setDependencyTasks(uniqueDeps);
            } catch (error) {
              console.error('Error reloading dependency tasks:', error);
            }
          }}
          currentUser={currentUser}
        />
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
              <h3 className="text-xl font-bold text-gray-900">Reject Dependency Task</h3>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setDependencyToReject(null);
                }}
                className="p-2 hover:bg-white rounded-lg transition"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Please provide a reason for rejecting this dependency task. The assignee will be notified and asked to rework it.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Explain what needs to be improved or corrected..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setDependencyToReject(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectDependency}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Reject & Request Rework
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
