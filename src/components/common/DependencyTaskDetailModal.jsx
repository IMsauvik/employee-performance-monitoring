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
      const task = await db.getFullDependencyTask(dependencyTaskId);
      if (task) {
        setDepTask(task);
        // Fix: Use parentTaskId instead of taskId
        const parent = await db.getTaskById(task.parentTaskId);
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
        try {
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
        } catch (error) {
          console.warn('Failed to send notification:', error);
        }

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

    await db.updateFullDependencyTask(depTask.id, updates);

    // Notify assignedBy user (person who assigned this dependency)
    if (depTask.assignedBy) {
      try {
        await db.createNotification({
          userId: depTask.assignedBy,
          taskId: depTask.parentTaskId || depTask.id,
          message: `Dependency task "${depTask.title}" is now ${newStatus.replace('_', ' ')}`,
          type: 'dependency_status_change',
          metadata: {
            dependencyId: depTask.id,
            newStatus
          }
        });
      } catch (error) {
        console.warn('Failed to send notification:', error);
      }
    }

    // Also notify parent task assignee if different from assignedBy
    if (parentTask && parentTask.id && parentTask.assignedTo && parentTask.assignedTo !== depTask.assignedBy) {
      try {
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
      } catch (error) {
        console.warn('Failed to send notification:', error);
      }
    }

    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    await loadTaskDetails();
  };

  const autoResolveBlocker = async () => {
    try {
      const now = new Date().toISOString();

      // Update blocker status in parent task
      const tasks = await db.getTasks();
      const parentTaskData = tasks.find(t => t.id === depTask.parentTaskId);

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

        await db.updateTask(depTask.parentTaskId, {
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

    if (!parentTask || !parentTask.id) {
      toast.error('Parent task not found');
      return;
    }

    const now = new Date().toISOString();
    const note = {
      id: `note-${Date.now()}`,
      note: progressNote,
      addedBy: currentUser.id,
      addedByName: currentUser.name,
      timestamp: now,
      source: 'dependency' // Mark that this came from a dependency task assignee
    };

    const activity = {
      id: `activity-${Date.now()}`,
      type: 'PROGRESS_NOTE',
      title: 'Progress Note Added (Dependency Helper)',
      description: `${currentUser.name} (helping with blocker): ${progressNote}`,
      timestamp: now,
      userName: currentUser.name,
      userId: currentUser.id
    };

    // Add note to PARENT task so everyone sees it
    await db.updateTask(parentTask.id, {
      progressNotes: [...(parentTask.progressNotes || []), note],
      activityTimeline: [...(parentTask.activityTimeline || []), activity]
    });

    // Also update dependency task activity timeline
    const depActivity = {
      id: `activity-${Date.now()}-dep`,
      type: 'PROGRESS_NOTE',
      title: 'Progress Note Added',
      description: progressNote,
      timestamp: now,
      userName: currentUser.name,
      userId: currentUser.id
    };

    await db.updateFullDependencyTask(depTask.id, {
      activityTimeline: [...(depTask.activityTimeline || []), depActivity]
    });

    toast.success('Progress note added to parent task conversation');
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

          {/* Rejection Notice */}
          {depTask.rejectedBy && depTask.rejectionReason && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-lg mb-2">Task Rejected - Rework Required</h4>
                  <p className="text-sm text-red-800 mb-3">
                    <strong>{depTask.rejectedByName || 'Task owner'}</strong> reviewed your work and has requested changes.
                  </p>
                  <div className="bg-white border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-900 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-800">&ldquo;{depTask.rejectionReason}&rdquo;</p>
                  </div>
                  <p className="text-xs text-red-700 mt-3">
                    📌 Please review the feedback, make the necessary changes, and resubmit when ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submission for Review Status */}
          {depTask.status === DEPENDENCY_STATUS.COMPLETED && depTask.submittedForReview && !depTask.acceptedBy && !depTask.rejectedBy && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-yellow-900 text-lg mb-1">Awaiting Review</h4>
                  <p className="text-sm text-yellow-800">
                    Your work has been submitted for review. {parentTaskAssignee?.name || 'The task owner'} will review and either accept or request changes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Acceptance Status */}
          {depTask.acceptedBy && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 text-lg mb-1">✅ Task Accepted!</h4>
                  <p className="text-sm text-green-800">
                    <strong>{depTask.acceptedByName || 'The task owner'}</strong> has accepted your work. Great job!
                  </p>
                  {depTask.acceptedAt && (
                    <p className="text-xs text-green-700 mt-2">
                      Accepted on {formatDateTime(depTask.acceptedAt)}
                    </p>
                  )}
                </div>
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

          {/* Work Updates & Feedback - Shared with Parent Task */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-purple-600" />
                Work Updates & Feedback
              </h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                Shared Conversation
              </span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💬 This conversation is shared between the task owner, manager, and all dependency helpers. Everyone can see all messages.
              </p>
            </div>

            {/* Add New Progress Note */}
            {canEdit && (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Your Progress Update
                </label>
                <div className="relative">
                  <textarea
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                    placeholder="Share your progress, challenges, or updates on resolving this blocker..."
                  />
                </div>
                <button
                  onClick={handleAddProgressNote}
                  disabled={!progressNote.trim()}
                  className="mt-3 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Post Update
                </button>
              </div>
            )}

            {/* Unified Timeline - Show Parent Task's Progress Notes & Manager Feedback */}
            {(() => {
              if (!parentTask) return null;

              // Combine all updates into a unified timeline
              const allUpdates = [];

              // Add progress notes from parent task
              if (parentTask.progressNotes && parentTask.progressNotes.length > 0) {
                parentTask.progressNotes.forEach(note => {
                  allUpdates.push({
                    id: note.id,
                    type: note.source === 'dependency' ? 'dependency_progress' : 'progress',
                    text: note.note,
                    authorName: note.addedByName || 'Employee',
                    authorId: note.addedBy,
                    timestamp: note.timestamp
                  });
                });
              }

              // Add manager feedback from parent task
              if (parentTask.managerFeedback) {
                let feedbackArray = [];
                
                if (typeof parentTask.managerFeedback === 'string') {
                  try {
                    const parsed = JSON.parse(parentTask.managerFeedback);
                    feedbackArray = Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    feedbackArray = [{ 
                      id: 'legacy', 
                      text: parentTask.managerFeedback, 
                      timestamp: new Date().toISOString(), 
                      authorName: 'Manager' 
                    }];
                  }
                } else if (Array.isArray(parentTask.managerFeedback)) {
                  feedbackArray = parentTask.managerFeedback;
                } else if (typeof parentTask.managerFeedback === 'object') {
                  feedbackArray = [parentTask.managerFeedback];
                }

                feedbackArray.forEach((fb, idx) => {
                  allUpdates.push({
                    id: fb.id || `feedback-${idx}`,
                    type: 'feedback',
                    text: fb.text || fb,
                    authorName: fb.authorName || 'Manager',
                    authorId: fb.authorId,
                    timestamp: fb.timestamp || new Date().toISOString()
                  });
                });
              }

              // Sort by timestamp (newest first)
              allUpdates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

              return allUpdates.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gray-300"></div>
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Timeline ({allUpdates.length} Updates)
                    </span>
                    <div className="h-px flex-1 bg-gray-300"></div>
                  </div>

                  {allUpdates.map((update) => (
                    <div 
                      key={update.id} 
                      className={`rounded-lg p-4 border-l-4 shadow-sm hover:shadow-md transition animate-fadeIn ${
                        update.type === 'feedback'
                          ? 'bg-green-50 border-green-500'
                          : update.type === 'dependency_progress'
                          ? 'bg-purple-50 border-purple-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          update.type === 'feedback'
                            ? 'bg-green-500'
                            : update.type === 'dependency_progress'
                            ? 'bg-purple-500'
                            : 'bg-blue-500'
                        }`}>
                          <span className="text-white text-sm font-bold">
                            {update.authorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {update.authorName}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                update.type === 'feedback'
                                  ? 'bg-green-200 text-green-800'
                                  : update.type === 'dependency_progress'
                                  ? 'bg-purple-200 text-purple-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {update.type === 'feedback' 
                                  ? '💬 Manager Feedback' 
                                  : update.type === 'dependency_progress'
                                  ? '🔗 Dependency Helper'
                                  : '📝 Progress Update'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDateTime(update.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {update.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">No updates yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Be the first to share an update on resolving this blocker!
                  </p>
                </div>
              );
            })()}
          </div>

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
