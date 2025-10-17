import { useState, useEffect } from 'react';
import { X, Ban, Calendar, User, Clock, MessageCircle, AlertCircle, CheckCircle, Plus, Link } from 'lucide-react';
import { db } from '../../services/databaseService';
import { formatDateTime } from '../../utils/helpers';
import { TASK_STATUS, DEPENDENCY_STATUS } from '../../utils/taskConstants';
import toast from 'react-hot-toast';
import TaskCommentsModal from './TaskCommentsModal';
import CreateDependencyModal from './CreateDependencyModal';

const BlockerTaskModal = ({ taskId, onClose, currentUser }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showCreateDependency, setShowCreateDependency] = useState(false);
  const [dependencyTasks, setDependencyTasks] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      const taskData = await db.getTaskById(taskId);
      if (taskData) {
        setTask(taskData);
        // Load dependency tasks from dependency_tasks table
        const deps = await db.getDependencyTasksByParent(taskId);
        setDependencyTasks(deps || []);
      }
      // Load all users for display
      const allUsers = await db.getUsers();
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error loading task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      // Add comment to task discussion
      const comment = {
        taskId: task.id,
        userId: currentUser.id,
        comment: responseText,
        createdAt: new Date().toISOString()
      };

      await db.addTaskComment(comment);

      // Add activity to timeline
      const activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'COMMENT',
        title: `${currentUser.name} responded to blocker`,
        description: responseText,
        timestamp: new Date().toISOString(),
        userName: currentUser.name,
        userId: currentUser.id
      };

      const updatedActivityTimeline = [...(task.activityTimeline || []), activity];
      await db.updateTask(task.id, { activityTimeline: updatedActivityTimeline });

      // Notify the task owner and blocker creator
      const notificationIds = new Set([task.assignedTo, task.assignedBy]);

      // Also notify the person who created the blocker
      const blockerHistory = task.blockerHistory || [];
      const latestBlocker = blockerHistory[blockerHistory.length - 1];
      if (latestBlocker && latestBlocker.blockedBy) {
        notificationIds.add(latestBlocker.blockedBy);
      }

      notificationIds.delete(currentUser.id); // Don't notify self

      for (const userId of notificationIds) {
        await db.createNotification({
          userId,
          title: `Blocker Response in "${task.title}"`,
          message: `${currentUser.name} responded to blocker in task "${task.title}"`,
          type: 'blocker_response',
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            respondedBy: currentUser.name
          }
        });
      }

      toast.success('Response added successfully');
      setResponseText('');
      await loadTaskDetails(); // Reload to show updated data
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    }
  };

  const handleMarkAsResolved = async () => {
    try {
      // Update blocker history to mark as resolved
      const blockerHistory = task.blockerHistory || [];
      const updatedBlockerHistory = blockerHistory.map((blocker, index) => {
        if (index === blockerHistory.length - 1 && !blocker.resolved) {
          return {
            ...blocker,
            resolved: true,
            resolvedBy: currentUser.id,
            resolvedByName: currentUser.name,
            resolvedAt: new Date().toISOString()
          };
        }
        return blocker;
      });

      // Update task status back to IN_PROGRESS
      const now = new Date().toISOString();
      const activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'BLOCKER_RESOLVED',
        title: 'Blocker Resolved',
        description: `${currentUser.name} marked the blocker as resolved`,
        timestamp: now,
        userName: currentUser.name,
        userId: currentUser.id
      };

      await db.updateTask(task.id, {
        status: TASK_STATUS.IN_PROGRESS,
        blockerHistory: updatedBlockerHistory,
        activityTimeline: [...(task.activityTimeline || []), activity]
      });

      // Notify relevant users
      const notificationIds = new Set([task.assignedTo, task.assignedBy]);
      notificationIds.delete(currentUser.id);

      for (const userId of notificationIds) {
        await db.createNotification({
          userId,
          title: `Blocker Resolved in "${task.title}"`,
          message: `${currentUser.name} resolved blocker in task "${task.title}"`,
          type: 'blocker_resolved',
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            resolvedBy: currentUser.name
          }
        });
      }

      toast.success('Blocker marked as resolved');
      onClose();
    } catch (error) {
      console.error('Error resolving blocker:', error);
      toast.error('Failed to resolve blocker');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70]">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[70]">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-center">Task not found</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const assignedUser = users.find(u => u.id === task.assignedTo);
  const assignedByUser = users.find(u => u.id === task.assignedBy);
  const blockerHistory = task.blockerHistory || [];
  const latestBlocker = blockerHistory[blockerHistory.length - 1];
  const isBlocked = task.status === TASK_STATUS.BLOCKED;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Blocker Task</h2>
                <p className="text-sm text-gray-600">You've been mentioned in this blocker</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Task Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-bold text-lg text-gray-900 mb-3">{task.taskName}</h3>
              {task.description && (
                <p className="text-gray-700 mb-4">{task.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="font-medium text-gray-900">{assignedUser?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Assigned by:</span>
                  <span className="font-medium text-gray-900">{assignedByUser?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isBlocked ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Blocker Information */}
            {latestBlocker && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-2 border-orange-300">
                <div className="flex items-center gap-2 mb-3">
                  <Ban className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-orange-900">Blocker Details</h4>
                  {latestBlocker.resolved && (
                    <span className="ml-auto px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      RESOLVED
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Blocked by:</span>
                    <span className="ml-2 text-sm text-gray-900">{latestBlocker.blockedByName}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      on {formatDateTime(latestBlocker.blockedAt)}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-700">Reason:</span>
                    <p className="mt-1 text-sm text-gray-900 italic">&ldquo;{latestBlocker.reason}&rdquo;</p>
                  </div>

                  {latestBlocker.mentions && latestBlocker.mentions.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Mentioned:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {latestBlocker.mentions.map(userId => {
                          const user = users.find(u => u.id === userId);
                          return user ? (
                            <span key={userId} className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full font-medium">
                              @{user.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {latestBlocker.resolved && (
                    <div className="pt-2 border-t border-orange-200">
                      <span className="text-sm font-semibold text-green-700">Resolved by:</span>
                      <span className="ml-2 text-sm text-gray-900">{latestBlocker.resolvedByName}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        on {formatDateTime(latestBlocker.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Response Section */}
            {isBlocked && (
              <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-yellow-600" />
                  Add Your Response
                </h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Share your thoughts, solutions, or ask for clarification..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleAddResponse}
                    disabled={!responseText.trim()}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                  >
                    Add Response
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('View Full Discussion clicked, showDiscussion:', showDiscussion);
                      setShowDiscussion(true);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    View Full Discussion
                  </button>
                </div>
              </div>
            )}

            {/* Dependency Tasks Section */}
            {isBlocked && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2">
                    <Link className="w-5 h-5" />
                    Dependency Tasks ({dependencyTasks.length})
                  </h4>
                  {currentUser.role !== 'employee' && (
                    <button
                      onClick={() => setShowCreateDependency(true)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Create Dependencies
                    </button>
                  )}
                </div>

                {dependencyTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">No dependency tasks created yet</p>
                    {currentUser.role !== 'employee' && (
                      <p className="text-xs text-gray-500">Create dependency tasks to break down this blocker</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dependencyTasks.map(dep => {
                      const assignedUser = users.find(u => u.id === dep.assignedTo);
                      const isCompleted = dep.status === DEPENDENCY_STATUS.COMPLETED;
                      return (
                        <div key={dep.id} className={`p-3 rounded-lg border-2 ${
                          isCompleted
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{dep.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {assignedUser?.name || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(dep.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              isCompleted
                                ? 'bg-green-600 text-white'
                                : dep.status === DEPENDENCY_STATUS.IN_PROGRESS
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              {dep.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress Summary */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-blue-900">Progress:</span>
                        <span className="text-blue-700">
                          {dependencyTasks.filter(d => d.status === DEPENDENCY_STATUS.COMPLETED).length} / {dependencyTasks.length} completed
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${(dependencyTasks.filter(d => d.status === DEPENDENCY_STATUS.COMPLETED).length / dependencyTasks.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {isBlocked && currentUser.role !== 'employee' && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-bold text-green-900 mb-2">Mark as Resolved</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {dependencyTasks.length > 0
                    ? 'All dependency tasks must be completed before resolving this blocker'
                    : 'If the blocker has been resolved, click below to move the task back to "In Progress"'
                  }
                </p>
                <button
                  onClick={handleMarkAsResolved}
                  disabled={dependencyTasks.length > 0 && dependencyTasks.some(d => d.status !== DEPENDENCY_STATUS.COMPLETED)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Blocker as Resolved
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View Discussion footer clicked, showDiscussion:', showDiscussion);
                setShowDiscussion(true);
              }}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium"
            >
              View Discussion
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Discussion Modal */}
      {showDiscussion && (
        <>
          {console.log('Rendering TaskCommentsModal, task:', task, 'currentUser:', currentUser)}
          <TaskCommentsModal
            task={task}
            onClose={() => setShowDiscussion(false)}
            currentUser={currentUser}
          />
        </>
      )}

      {/* Create Dependency Modal */}
      {showCreateDependency && (
        <CreateDependencyModal
          parentTask={task}
          blocker={latestBlocker}
          onClose={() => setShowCreateDependency(false)}
          onDependenciesCreated={() => {
            loadTaskDetails(); // Reload to show new dependencies
          }}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default BlockerTaskModal;
