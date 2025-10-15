import { useState, useEffect } from 'react';
import { X, Link, Calendar, User, FileText, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { db } from '../../services/databaseService';
import { formatDateTime } from '../../utils/helpers';
import { DEPENDENCY_STATUS, TASK_STATUS } from '../../utils/taskConstants';
import toast from 'react-hot-toast';
import DependencyTaskJourney from './DependencyTaskJourney';
import TaskCommentsModal from './TaskCommentsModal';

const DependencyTaskDetailModal = ({ dependencyTaskId, onClose, currentUser }) => {
  const [depTask, setDepTask] = useState(null);
  const [parentTask, setParentTask] = useState(null);
  const [progressNote, setProgressNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await db.getUsers();
      setUsers(allUsers);
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (dependencyTaskId) {
      loadTaskDetails();
    }
  }, [dependencyTaskId]);

  const loadTaskDetails = async () => {
    try {
      const task = await db.getDependencyTask(dependencyTaskId);
      if (task) {
        setDepTask(task);
        const parent = await db.getTaskById(task.taskId);
        setParentTask(parent);
      }
    } catch (error) {
      console.error('Error loading dependency task:', error);
      toast.error('Failed to load dependency task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!currentUser || !currentUser.name || !currentUser.id) {
      console.error('Invalid currentUser:', currentUser);
      toast.error('User session expired. Please login again.');
      return;
    }

    if (!depTask || !depTask.id) {
      console.error('Invalid dependency task:', depTask);
      toast.error('Task data is corrupted. Please refresh the page.');
      return;
    }

    const now = new Date().toISOString();

    // Create activity for dependency
    const activity = {
      id: `activity-${Date.now()}`,
      type: 'STATUS_CHANGE',
      title: `Status changed to ${newStatus.replace('_', ' ')}`,
      description: `${currentUser.name || 'Unknown'} updated the status`,
      timestamp: now,
      userName: currentUser.name,
      userId: currentUser.id
    };

    const updates = {
      status: newStatus,
      activityTimeline: [...(depTask.activityTimeline || []), activity]
    };

    // If completed, submit for review by parent task owner
    if (newStatus === DEPENDENCY_STATUS.COMPLETED) {
      updates.completedAt = now;
      updates.completedBy = currentUser.id;
      updates.completedByName = currentUser.name; // Store name for safety
      updates.submittedForReview = true;

      // Notify parent task owner
      if (parentTask && parentTask.id && parentTask.assignedTo) {
        await db.createNotification({
          userId: parentTask.assignedTo,
          taskId: depTask.id,
          message: `${currentUser.name || 'Someone'} completed dependency task: "${depTask.title}"`,
          type: 'dependency_completed',
          metadata: {
            dependencyId: depTask.id,
            dependencyTitle: depTask.title
          }
        });

        // Add activity to parent task timeline
        const parentActivity = {
          id: `activity-${Date.now()}-parent`,
          type: 'DEPENDENCY_COMPLETED',
          title: `Dependency Task Completed`,
          description: `${currentUser.name || 'Someone'} completed dependency: "${depTask.title}"`,
          timestamp: now,
          userName: currentUser.name || 'Unknown',
          userId: currentUser.id,
          metadata: {
            dependencyId: depTask.id,
            dependencyTitle: depTask.title,
            status: 'pending_review'
          }
        };

        const parentTaskData = await db.getTaskById(parentTask.id);
        if (parentTaskData && parentTaskData.id) {
          await db.updateTask(parentTask.id, {
            activityTimeline: [...(parentTaskData.activityTimeline || []), parentActivity]
          });
        }
      }
    }

    await db.updateDependencyTask(depTask.id, updates);

    // Notify assignedBy user (person who assigned this dependency)
    if (depTask.assignedBy) {
      await db.createNotification({
        userId: depTask.assignedBy,
        taskId: depTask.taskId || depTask.id, // Use taskId or fallback to depTask.id
        message: `Dependency task "${depTask.title}" is now ${newStatus.replace('_', ' ')}`,
        type: 'dependency_status_change',
        metadata: {
          dependencyId: depTask.id,
          newStatus
        }
      });
    }

    // Also notify parent task assignee if different from assignedBy
    if (parentTask && parentTask.id && parentTask.assignedTo && parentTask.assignedTo !== depTask.assignedBy) {
      await db.createNotification({
        userId: parentTask.assignedTo,
        taskId: parentTask.id,
        message: `Dependency task "${depTask.title}" is now ${newStatus.replace('_', ' ')}`,
        type: 'dependency_status_change',
        metadata: {
          dependencyId: depTask.id,
          newStatus
        }
      });
    }

    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    await loadTaskDetails();
  };

  const autoResolveBlocker = async () => {
    try {
      const now = new Date().toISOString();

      // Update blocker status in parent task
      const tasks = await db.getTasks();
      const parentTaskData = tasks.find(t => t.id === depTask.taskId);

      if (parentTaskData && parentTaskData.blockerHistory) {
        const updatedBlockerHistory = parentTaskData.blockerHistory.map(b => {
          if (b.id === depTask.blockerId) {
            return {
              ...b,
              resolved: true,
              resolvedBy: currentUser.id,
              resolvedByName: currentUser.name,
              resolvedAt: now,
              autoResolved: true
            };
          }
          return b;
        });

        // Update task status back to IN_PROGRESS
        const activity = {
          id: `activity-${Date.now()}`,
          type: 'BLOCKER_RESOLVED',
          title: 'Blocker Auto-Resolved',
          description: `All dependency tasks completed. Blocker automatically resolved. You can now continue working.`,
          timestamp: now,
          userName: 'System',
          userId: 'system'
        };

        await db.updateTask(depTask.taskId, {
          status: TASK_STATUS.IN_PROGRESS,
          blockerHistory: updatedBlockerHistory,
          activityTimeline: [...(parentTaskData.activityTimeline || []), activity]
        });

        // Notify parent task assignee (validate parentTask exists and has required fields)
        if (parentTask && parentTask.id && parentTask.assignedTo && parentTask.title) {
          await db.createNotification({
            userId: parentTask.assignedTo,
            taskId: parentTask.id,
            message: `Great news! All dependency tasks are completed. The blocker on "${parentTask.title}" has been resolved. You can now continue working.`,
            type: 'blocker_auto_resolved',
            metadata: {
              blockerId: depTask.blockerId
            }
          });

          // Notify manager if exists and different from assignee
          if (parentTask.assignedBy && parentTask.assignedBy !== parentTask.assignedTo) {
            await db.createNotification({
              userId: parentTask.assignedBy,
              taskId: parentTask.id,
              message: `Blocker on task "${parentTask.title}" has been automatically resolved - all dependencies completed.`,
              type: 'blocker_auto_resolved',
              metadata: {
                blockerId: depTask.blockerId
              }
            });
          }
        }

        toast.success('🎉 All dependencies complete! Blocker has been auto-resolved.');
      }
    } catch (error) {
      console.error('Error auto-resolving blocker:', error);
    }
  };

  const handleAddProgressNote = async () => {
    if (!progressNote.trim()) {
      toast.error('Please enter a progress note');
      return;
    }

    const now = new Date().toISOString();
    const note = {
      id: `note-${Date.now()}`,
      text: progressNote,
      authorId: currentUser.id,
      authorName: currentUser.name,
      timestamp: now
    };

    const activity = {
      id: `activity-${Date.now()}`,
      type: 'PROGRESS_NOTE',
      title: 'Progress Note Added',
      description: progressNote,
      timestamp: now,
      userName: currentUser.name,
      userId: currentUser.id
    };

    await db.updateDependencyTask(depTask.id, {
      progressNotes: [...(depTask.progressNotes || []), note],
      activityTimeline: [...(depTask.activityTimeline || []), activity]
    });

    toast.success('Progress note added');
    setProgressNote('');
    await loadTaskDetails();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dependency task...</p>
        </div>
      </div>
    );
  }

  if (!depTask) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
        <div className="bg-white rounded-xl p-8 max-w-md">
          <p className="text-gray-900 font-semibold text-center">Dependency task not found</p>
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

  const assignedUser = depTask.assignedToName 
    ? { name: depTask.assignedToName, id: depTask.assignedTo }
    : users.find(u => u.id === depTask.assignedTo);
  const assignedByUser = depTask.assignedByName
    ? { name: depTask.assignedByName, id: depTask.assignedBy }
    : users.find(u => u.id === depTask.assignedBy);
  const canEdit = depTask.assignedTo === currentUser.id;

  const parentTaskAssignee = parentTask?.assignedTo 
    ? users.find(u => u.id === parentTask.assignedTo) 
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
              <Link className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dependency Task</h2>
              <p className="text-sm text-gray-600">Helping to resolve a blocker</p>
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
          {/* Parent Task Reference */}
          {parentTask && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
              <ArrowLeft className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1">This task helps resolve a blocker in:</p>
                <p className="font-medium text-gray-900">{parentTask.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Assigned to: {parentTaskAssignee?.name || 'Unknown'}
                </p>
              </div>
            </div>
          )}

          {/* Task Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-bold text-xl text-gray-900 mb-3">{depTask.title}</h3>
            {depTask.description && (
              <p className="text-gray-700 mb-4">{depTask.description}</p>
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
                <span className="font-medium text-gray-900">{new Date(depTask.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Created:</span>
                <span className="font-medium text-gray-900">{formatDateTime(depTask.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Journey */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Task Progress Journey
            </h4>
            <DependencyTaskJourney
              currentStatus={depTask.status}
              onStatusChange={handleStatusChange}
              canEdit={canEdit}
            />
          </div>

          {/* Progress Notes */}
          {canEdit && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                Add Progress Note
              </h4>
              <textarea
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Share your progress, challenges, or updates..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={handleAddProgressNote}
                disabled={!progressNote.trim()}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
              >
                Add Note
              </button>
            </div>
          )}

          {/* Previous Progress Notes */}
          {depTask.progressNotes && depTask.progressNotes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Progress History</h4>
              <div className="space-y-3">
                {depTask.progressNotes.map(note => (
                  <div key={note.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{note.authorName}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(note.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          {depTask.activityTimeline && depTask.activityTimeline.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Activity Timeline</h4>
              <div className="space-y-2">
                {depTask.activityTimeline.slice().reverse().map(activity => (
                  <div key={activity.id} className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{activity.title}</span>
                      <span className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</span>
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 mt-1">{activity.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          {parentTask && parentTask.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View Parent Task Discussion clicked');
                setShowDiscussion(true);
              }}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              View Parent Task Discussion
            </button>
          )}
          <button
            onClick={onClose}
            className={`${parentTask && parentTask.id ? '' : 'w-full'} px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium`}
          >
            Close
          </button>
        </div>
      </div>

      {/* Discussion Modal for Parent Task */}
      {showDiscussion && parentTask && parentTask.id && (
        <>
          {console.log('Rendering TaskCommentsModal for parent task:', parentTask, 'currentUser:', currentUser)}
          <TaskCommentsModal
            task={parentTask}
            onClose={() => setShowDiscussion(false)}
            currentUser={currentUser}
          />
        </>
      )}
    </div>
  );
};

export default DependencyTaskDetailModal;
