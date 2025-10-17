import { useState, useEffect } from 'react';
import { X, MessageCircle, AlertTriangle, Send, Clock, CheckCircle, Upload, File, Trash2, Download, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, getStatusColor, getStatusText, getPriorityColor, getDaysRemaining, getQualityRatingInfo } from '../../utils/helpers';
import { generateId } from '../../utils/helpers';
import { TASK_STATUS, STATUS_FLOW, ACTIVITY_TYPE, DEPENDENCY_STATUS } from '../../utils/taskConstants';
import { db } from '../../services/databaseService';
import NotificationService from '../../services/notificationService';
import TaskCommentsModal from '../common/TaskCommentsModal';
import TaskActivityTimeline from '../common/TaskActivityTimeline';
import TaskStatusJourney from '../common/TaskStatusJourney';
import ConfirmModal from '../common/ConfirmModal';
import DependencyStatusCards from '../common/DependencyStatusCards';
import DependencyTaskDetailModal from '../common/DependencyTaskDetailModal';
import toast from 'react-hot-toast';

const EmployeeTaskDetailModal = ({ task, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(task.status);
  const [progressNote, setProgressNote] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showProgressSuccess, setShowProgressSuccess] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState(task.attachments || []);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockerComment, setBlockerComment] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [dependencyTasks, setDependencyTasks] = useState([]);
  const [selectedDependencyId, setSelectedDependencyId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dependencyToReject, setDependencyToReject] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Load dependency tasks from blocker history
    const loadDependencyTasks = async () => {
      const depIds = [];
      if (task.blockerHistory) {
        task.blockerHistory.forEach(blocker => {
          if (blocker.dependencyTasks) {
            depIds.push(...blocker.dependencyTasks);
          }
        });
      }
      
      // Load full dependency task objects from database
      if (depIds.length > 0) {
        try {
          const fullDeps = await Promise.all(
            depIds.map(depId => db.getFullDependencyTask(depId))
          );
          setDependencyTasks(fullDeps.filter(dep => dep !== null));
        } catch (error) {
          console.error('Error loading dependency tasks:', error);
          setDependencyTasks([]);
        }
      } else {
        setDependencyTasks([]);
      }
    };
    
    loadDependencyTasks();

    // Load users for the mention functionality
    const loadUsers = async () => {
      try {
        const allUsers = await db.getUsers();
        setUsers(allUsers || []);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, [task]);

  const handleStatusChange = (newStatus) => {
    // Prevent duplicate status updates and timeline entries
    if (newStatus === status) {
      // If already selected, do nothing
      return;
    }

    // If changing to BLOCKED status, show the blocker modal
    if (newStatus === TASK_STATUS.BLOCKED) {
      setShowBlockedModal(true);
      return;
    }

    setStatus(newStatus);

    // Immediately update the task status
    const now = new Date().toISOString();
    const updates = { status: newStatus, updatedAt: now };

    // Add activity for status change
    const activity = {
      id: generateId(),
      type: ACTIVITY_TYPE.STATUS_CHANGE,
      title: 'Status Updated',
      description: `Status changed from ${getStatusText(task.status)} to ${getStatusText(newStatus)}`,
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: now,
      metadata: {
        previousStatus: task.status,
        newStatus: newStatus
      }
    };
    updates.activityTimeline = [...(task.activityTimeline || []), activity];

    onUpdate(task.id, updates);
    toast.success(`Status updated to ${getStatusText(newStatus)}`);
  };

  const handleAddProgressNote = () => {
    if (progressNote.trim()) {
      const newNote = {
        id: generateId(),
        note: progressNote,
        addedBy: currentUser.id,
        addedByName: currentUser.name,
        timestamp: new Date().toISOString()
      };

      const updatedNotes = [...(task.progressNotes || []), newNote];
      onUpdate(task.id, { progressNotes: updatedNotes });
      setProgressNote('');
      setShowProgressSuccess(true);
      toast.success('Progress note added!');

      // Hide success animation after 2 seconds
      setTimeout(() => setShowProgressSuccess(false), 2000);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
      uploadedById: currentUser.id,
      data: null
    }));

    // Read files as base64
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newFiles[index].data = event.target.result;
        if (index === files.length - 1) {
          const updatedFiles = [...attachedFiles, ...newFiles];
          setAttachedFiles(updatedFiles);
          onUpdate(task.id, { attachments: updatedFiles });
          toast.success(`${files.length} file(s) attached`);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveFile = (fileId) => {
    const updatedFiles = attachedFiles.filter(f => f.id !== fileId);
    setAttachedFiles(updatedFiles);
    onUpdate(task.id, { attachments: updatedFiles });
    toast.success('File removed');
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const confirmSubmitForReview = async () => {
    const now = new Date().toISOString();
    const updates = {
      status: TASK_STATUS.SUBMITTED,
      submittedForReviewAt: now
    };

    // Add activity
    const activity = {
      id: generateId(),
      type: ACTIVITY_TYPE.REVIEW_SUBMITTED,
      title: 'Submitted for Review',
      description: `${currentUser.name} submitted this task for manager review`,
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: now,
      metadata: {
        previousStatus: task.status,
        newStatus: TASK_STATUS.SUBMITTED
      }
    };

    updates.activityTimeline = [...(task.activityTimeline || []), activity];

    // Create notification for the manager who assigned the task
    if (task.assignedBy) {
      try {
        await db.createNotification({
          userId: task.assignedBy,
          title: `Task Submitted for Review`,
          message: `Task submitted for review: "${task.title}"`,
          type: 'task_submitted',
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            submittedBy: currentUser.name,
            submittedById: currentUser.id
          }
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    onUpdate(task.id, updates);
    toast.success('Task submitted for review!');
    onClose();
  };

  const handleBlockedSubmit = async () => {
    if (!blockerComment.trim()) {
      toast.error('Please provide a reason for blocking this task');
      return;
    }

    // Mentions are optional - user can create blocker without mentioning anyone
    // Manager will be notified automatically

    const now = new Date().toISOString();
    setStatus(TASK_STATUS.BLOCKED);

    // Create blocker entry
    const blockerEntry = {
      id: generateId(),
      reason: blockerComment,
      blockedBy: currentUser.id,
      blockedByName: currentUser.name,
      blockedAt: now,
      mentions: mentionedUsers,
      resolved: false
    };

    // Add comment to task discussion
    try {
      await db.addTaskComment({
        taskId: task.id,
        userId: currentUser.id,
        comment: blockerComment,
        mentions: mentionedUsers,
        createdAt: now
      });
    } catch (error) {
      console.error('Error adding task comment:', error);
    }

    // Add activity for status change
    const activity = {
      id: generateId(),
      type: ACTIVITY_TYPE.STATUS_CHANGE,
      title: 'Task Blocked',
      description: `${currentUser.name} marked this task as blocked: "${blockerComment}"`,
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: now,
      metadata: {
        previousStatus: task.status,
        newStatus: TASK_STATUS.BLOCKED,
        reason: blockerComment,
        mentions: mentionedUsers
      }
    };

    const updates = {
      status: TASK_STATUS.BLOCKED,
      updatedAt: now,
      blockerHistory: [...(task.blockerHistory || []), blockerEntry],
      activityTimeline: [...(task.activityTimeline || []), activity]
    };

    // Send notifications to mentioned users
    for (const userId of mentionedUsers) {
      try {
        await db.createNotification({
          userId,
          title: `Mentioned in Blocked Task`,
          message: `${currentUser.name} mentioned you in a blocked task: "${task.title}"`,
          type: 'task_mention',
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            mentionedBy: currentUser.name,
            comment: blockerComment
          }
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // Always notify the manager
    if (task.assignedBy && !mentionedUsers.includes(task.assignedBy)) {
      try {
        await db.createNotification({
          userId: task.assignedBy,
          title: `Task Blocked`,
          message: `Task blocked: "${task.title}"`,
          type: 'task_blocked',
          link: `/tasks/${task.id}`,
          metadata: {
            taskId: task.id,
            taskTitle: task.title,
            blockedBy: currentUser.name,
            reason: blockerComment
          }
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }

    // Create dependency tasks for each mentioned user automatically
    const createdDependencies = [];

    if (mentionedUsers.length > 0) {
      console.log('🔵 Creating dependency tasks for', mentionedUsers.length, 'mentioned users');

      for (const [index, userId] of mentionedUsers.entries()) {
        try {
          const mentionedUser = users.find(u => u.id === userId);
          if (!mentionedUser) {
            console.error('❌ User not found:', userId);
            continue;
          }

          // Calculate due date (7 days from now)
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 7);
          const dueDateStr = dueDate.toISOString().split('T')[0];

          const dependencyTaskData = {
            parentTaskId: task.id,
            parentTaskName: task.title,
            blockerId: blockerEntry.id,
            title: `Help resolve blocker: ${blockerComment.substring(0, 50)}${blockerComment.length > 50 ? '...' : ''}`,
            description: blockerComment,
            assignedTo: userId,
            assignedToName: mentionedUser.name,
            assignedBy: currentUser.id,
            assignedByName: currentUser.name,
            status: DEPENDENCY_STATUS.NOT_STARTED,
            dueDate: dueDateStr,
            createdAt: now,
            updatedAt: now,
            progressNotes: [],
            activityTimeline: [{
              id: `activity-${Date.now()}-${index}`,
              type: 'ASSIGNMENT',
              title: 'Dependency Task Created',
              description: `Created by ${currentUser.name} to resolve blocker in "${task.title}"`,
              timestamp: now,
              userName: currentUser.name,
              userId: currentUser.id
            }]
          };

          console.log('🔵 Creating dependency task:', dependencyTaskData);
          const createdTask = await db.createFullDependencyTask(dependencyTaskData);

          if (createdTask && createdTask.id) {
            console.log('✅ Dependency task created with ID:', createdTask.id);
            createdDependencies.push(createdTask.id);
          } else {
            console.error('❌ Failed to create dependency task - no ID returned');
          }
        } catch (error) {
          console.error('❌ Error creating dependency task for user:', userId, error);
        }
      }

      console.log('✅ Created', createdDependencies.length, 'dependency tasks');
    }

    // Add dependency task IDs to blocker entry
    blockerEntry.dependencyTasks = createdDependencies;

    // Update parent task updates with blocker entry that includes dependency IDs
    updates.blockerHistory = [...(task.blockerHistory || []), blockerEntry];

    onUpdate(task.id, updates);

    // Send email notifications to mentioned users
    const emailPromises = [];
    if (mentionedUsers.length > 0) {
      for (const userId of mentionedUsers) {
        const user = users.find(u => u.id === userId);
        if (user && user.email) {
          emailPromises.push(
            NotificationService.sendCommentNotification([user.email], {
              taskName: task.title,
              taskDescription: task.description || 'No description',
              taskUrl: `${window.location.origin}/employee/dashboard`,
              commentText: blockerComment,
              authorName: currentUser.name,
              isBlocker: true,
              mentions: mentionedUsers
            })
          );
        }
      }
    }

    // Send email to manager
    if (task.assignedBy && !mentionedUsers.includes(task.assignedBy)) {
      const manager = users.find(u => u.id === task.assignedBy);
      if (manager && manager.email) {
        emailPromises.push(
          NotificationService.sendTaskUpdate(manager.email, {
            taskName: task.title,
            taskId: task.id,
            status: 'blocked',
            blockedBy: currentUser.name,
            blockerReason: blockerComment,
            priority: task.priority,
            deadline: task.deadline
          })
        );
      }
    }

    // Send all emails
    if (emailPromises.length > 0) {
      Promise.all(emailPromises).then(() => {
        toast.success(`Task marked as blocked. ${emailPromises.length} email notification(s) sent.`);
      }).catch((error) => {
        console.error('Error sending emails:', error);
        toast.success('Task marked as blocked. (Email notifications may have failed)');
      });
    } else {
      toast.success('Task marked as blocked. Notifications sent.');
    }

    setShowBlockedModal(false);
    setBlockerComment('');
    setMentionedUsers([]);
  };

  const handleAcceptDependency = async (dependencyId) => {
    try {
      const now = new Date().toISOString();
      const dep = await db.getFullDependencyTask(dependencyId);

      if (!dep) return;

      // Update dependency
      await db.updateFullDependencyTask(dependencyId, {
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

      // Add to parent task timeline
      const parentActivity = {
        id: `activity-${Date.now()}`,
        type: 'DEPENDENCY_ACCEPTED',
        title: 'Dependency Task Accepted',
        description: `${currentUser.name} accepted dependency: "${dep.title}"`,
        timestamp: now,
        userName: currentUser.name,
        userId: currentUser.id,
        metadata: {
          dependencyId,
          dependencyTitle: dep.title
        }
      };

      await db.updateTask(task.id, {
        activityTimeline: [...(task.activityTimeline || []), parentActivity]
      });

      // Notify dependency assignee
      try {
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: dep.assignedTo,
          taskId: dependencyId,
          message: `${currentUser.name} accepted your dependency task: "${dep.title}"`,
          type: 'dependency_accepted',
          read: false,
          createdAt: now
        });
      } catch (error) {
        console.warn('Failed to send notification:', error);
      }

      // Check if all dependencies are accepted
      checkAndResolveBlocker();

      toast.success('Dependency accepted!');
      onUpdate(task.id, {}); // Trigger refresh
    } catch (error) {
      console.error('Error accepting dependency:', error);
      toast.error('Failed to accept dependency');
    }
  };

  const handleRejectDependency = (dependencyId) => {
    setDependencyToReject(dependencyId);
    setShowRejectionModal(true);
  };

  const confirmRejectDependency = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const now = new Date().toISOString();
      const dep = await db.getFullDependencyTask(dependencyToReject);

      if (!dep) return;

      // Update dependency - send back for rework
      await db.updateFullDependencyTask(dependencyToReject, {
        rejectedBy: currentUser.id,
        rejectedByName: currentUser.name,
        rejectedAt: now,
        rejectionReason,
        status: DEPENDENCY_STATUS.IN_PROGRESS, // Send back to in progress
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

      // Add to parent task timeline
      const parentActivity = {
        id: `activity-${Date.now()}`,
        type: 'DEPENDENCY_REJECTED',
        title: 'Dependency Task Rejected',
        description: `${currentUser.name} rejected dependency: "${dep.title}" - Needs rework`,
        timestamp: now,
        userName: currentUser.name,
        userId: currentUser.id,
        metadata: {
          dependencyId: dependencyToReject,
          dependencyTitle: dep.title,
          reason: rejectionReason
        }
      };

      await db.updateTask(task.id, {
        activityTimeline: [...(task.activityTimeline || []), parentActivity]
      });

      // Notify dependency assignee
      try {
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: dep.assignedTo,
          taskId: dependencyToReject,
          message: `${currentUser.name} rejected your dependency task and requested rework: "${dep.title}"`,
          type: 'dependency_rejected',
          read: false,
          createdAt: now
        });
      } catch (error) {
        console.warn('Failed to send notification:', error);
      }

      toast.success('Dependency rejected. Assignee has been notified.');
      setShowRejectionModal(false);
      setRejectionReason('');
      setDependencyToReject(null);
      onUpdate(task.id, {}); // Trigger refresh
    } catch (error) {
      console.error('Error rejecting dependency:', error);
      toast.error('Failed to reject dependency');
    }
  };

  const checkAndResolveBlocker = async () => {
    const deps = [];
    if (task.blockerHistory) {
      task.blockerHistory.forEach(blocker => {
        if (blocker.dependencyTasks && !blocker.resolved) {
          deps.push(...blocker.dependencyTasks);
        }
      });
    }

    // Check if all dependencies are accepted
    const allAcceptedPromises = deps.map(async (depId) => {
      const dep = await db.getFullDependencyTask(depId);
      return dep && dep.acceptedBy;
    });
    
    const allAcceptedResults = await Promise.all(allAcceptedPromises);
    const allAccepted = allAcceptedResults.every(result => result);

    if (allAccepted && deps.length > 0) {
      const now = new Date().toISOString();

      // Update blocker status
      const updatedBlockerHistory = task.blockerHistory.map(blocker => {
        if (blocker.dependencyTasks && !blocker.resolved) {
          return {
            ...blocker,
            resolved: true,
            resolvedBy: currentUser.id,
            resolvedByName: currentUser.name,
            resolvedAt: now,
            autoResolved: true
          };
        }
        return blocker;
      });

      // Change task status back to IN_PROGRESS
      await db.updateTask(task.id, {
        status: TASK_STATUS.IN_PROGRESS,
        blockerHistory: updatedBlockerHistory,
        activityTimeline: [...(task.activityTimeline || []), {
          id: `activity-${Date.now()}`,
          type: 'BLOCKER_RESOLVED',
          title: 'Blocker Auto-Resolved',
          description: 'All dependency tasks completed and accepted. You can now continue working.',
          timestamp: now,
          userName: 'System',
          userId: 'system'
        }]
      });

      toast.success('🎉 All dependencies accepted! Blocker resolved. You can continue working.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority} priority
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition ml-4"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Task Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Vertical</p>
              <p className="font-semibold text-gray-900">{task.vertical}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Project</p>
              <p className="font-semibold text-gray-900">{task.project}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">POC</p>
              <p className="font-semibold text-gray-900">{task.poc}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="font-semibold text-gray-900">
                {formatDate(task.deadline)}
                <span className="text-sm text-gray-600 ml-2">({getDaysRemaining(task.deadline)})</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Description</h3>
            <p className="text-gray-700 leading-relaxed">{task.description}</p>
          </div>

          {/* Rework Required Alert */}
          {task.status === TASK_STATUS.REWORK_REQUIRED && task.reworkHistory && task.reworkHistory.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 animate-pulse">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-2">⚠️ Rework Required</h3>
                  <p className="text-sm text-red-800 mb-3">
                    Your manager has reviewed this task and sent it back for improvements.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Manager Feedback:</p>
                    <p className="text-sm text-gray-700 italic">
                      &ldquo;{task.reworkHistory[task.reworkHistory.length - 1].reason}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Rejected by {task.reworkHistory[task.reworkHistory.length - 1].rejectedByName} •
                      {formatDateTime(task.reworkHistory[task.reworkHistory.length - 1].rejectedAt)}
                    </p>
                  </div>
                  {task.reworkCount > 1 && (
                    <p className="text-xs text-red-700 mt-2">
                      This task has been sent for rework {task.reworkCount} times.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quality Rating (if accepted) */}
          {task.qualityRating && (task.status === TASK_STATUS.ACCEPTED || task.status === TASK_STATUS.COMPLETED) && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-1">✓ Task Accepted</h3>
                  <p className="text-sm text-green-700">Your work has been approved by the manager</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Quality Rating</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-2xl ${i < task.qualityRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {getQualityRatingInfo(task.qualityRating).label}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Task Status Journey */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <TaskStatusJourney
              currentStatus={status}
              onStatusChange={handleStatusChange}
              userRole="employee"
            />
          </div>

          {/* Work Updates & Feedback - Unified Section */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              Work Updates & Feedback
            </h3>

            {/* Add New Progress Note */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Your Progress Update
              </label>
              <div className="relative">
                <textarea
                  value={progressNote}
                  onChange={(e) => setProgressNote(e.target.value)}
                  rows="3"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none ${
                    showProgressSuccess ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  placeholder="Share your progress, challenges, accomplishments, or any updates on this task..."
                />
                {showProgressSuccess && (
                  <div className="absolute top-2 right-2 animate-scaleIn">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
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

            {/* Unified Timeline - Chronologically sorted Progress Notes & Manager Feedback */}
            {(() => {
              // Combine all updates into a unified timeline
              const allUpdates = [];

              // Add progress notes
              if (task.progressNotes && task.progressNotes.length > 0) {
                task.progressNotes.forEach(note => {
                  allUpdates.push({
                    id: note.id,
                    type: 'progress',
                    text: note.note,
                    authorName: note.addedByName || 'Employee',
                    authorId: note.addedBy,
                    timestamp: note.timestamp
                  });
                });
              }

              // Add manager feedback
              if (task.managerFeedback) {
                let feedbackArray = [];
                
                if (typeof task.managerFeedback === 'string') {
                  try {
                    const parsed = JSON.parse(task.managerFeedback);
                    feedbackArray = Array.isArray(parsed) ? parsed : [parsed];
                  } catch {
                    feedbackArray = [{ 
                      id: 'legacy', 
                      text: task.managerFeedback, 
                      timestamp: new Date().toISOString(), 
                      authorName: 'Manager' 
                    }];
                  }
                } else if (Array.isArray(task.managerFeedback)) {
                  feedbackArray = task.managerFeedback;
                } else if (typeof task.managerFeedback === 'object') {
                  feedbackArray = [task.managerFeedback];
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
                        update.type === 'progress' 
                          ? 'bg-blue-50 border-blue-500' 
                          : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          update.type === 'progress' 
                            ? 'bg-blue-500' 
                            : 'bg-green-500'
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
                                update.type === 'progress'
                                  ? 'bg-blue-200 text-blue-800'
                                  : 'bg-green-200 text-green-800'
                              }`}>
                                {update.type === 'progress' ? '📝 Progress Update' : '💬 Manager Feedback'}
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
                    Add your first progress note to start the conversation!
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Attachments Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>

            {/* Upload New Files (only if task is not completed/accepted) */}
            {task.status !== TASK_STATUS.COMPLETED && task.status !== TASK_STATUS.ACCEPTED && (
              <div className="mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition">
                  <input
                    type="file"
                    id="employee-file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="employee-file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">Click to attach files</span>
                    <span className="text-xs text-gray-500">Add documents, images, or any relevant files</span>
                  </label>
                </div>
              </div>
            )}

            {/* Attached Files List */}
            {attachedFiles.length > 0 ? (
              <div className="space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition animate-fadeIn"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Uploaded by {file.uploadedBy}</span>
                          <span>•</span>
                          <span>{formatDateTime(file.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition"
                        title="Download file"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                      </button>
                      {file.uploadedById === currentUser.id && task.status !== TASK_STATUS.COMPLETED && task.status !== TASK_STATUS.ACCEPTED && (
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No attachments yet</p>
              </div>
            )}
          </div>

          {/* Dependency Tasks Status (if task is blocked) */}
          {dependencyTasks.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <DependencyStatusCards
                dependencies={dependencyTasks}
                onDependencyClick={(depId) => setSelectedDependencyId(depId)}
                onAccept={handleAcceptDependency}
                onReject={handleRejectDependency}
                canReview={true}
              />
            </div>
          )}

          {/* Activity Timeline */}
          {task.activityTimeline && task.activityTimeline.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              <TaskActivityTimeline activities={task.activityTimeline} />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t-2 border-gray-200">
            {/* Submit for Review (only when in progress) */}
            {(status === TASK_STATUS.IN_PROGRESS || task.status === TASK_STATUS.IN_PROGRESS) && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit for Manager Review
              </button>
            )}

            {/* Status under review/submitted notification */}
            {(task.status === TASK_STATUS.SUBMITTED || task.status === TASK_STATUS.UNDER_REVIEW) && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900">
                      {task.status === TASK_STATUS.SUBMITTED ? 'Awaiting Review' : 'Under Review'}
                    </p>
                    <p className="text-sm text-purple-700">
                      {task.status === TASK_STATUS.SUBMITTED
                        ? 'Your task has been submitted and is waiting for manager review'
                        : `${task.reviewedByName || 'Manager'} is currently reviewing your work`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCommentsModal(true)}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Discussion
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Comments Modal */}
      <TaskCommentsModal
        task={task}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        onTaskUpdate={onUpdate}
      />

      {/* Submit Confirmation Modal */}
      <ConfirmModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={confirmSubmitForReview}
        title="Submit for Review"
        message="Are you sure you want to submit this task for manager review? Once submitted, you won't be able to make changes until the manager reviews it."
        confirmText="Submit"
        cancelText="Cancel"
        type="success"
      />

      {/* Blocked Task Modal */}
      {showBlockedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Ban className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mark Task as Blocked</h2>
                  <p className="text-sm text-gray-600">Please provide details about the blocker</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlockedModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Alert */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-orange-900">Important</p>
                    <p className="text-sm text-orange-800 mt-1">
                      When you mark this task as blocked, your manager and mentioned team members will be notified immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Blocker Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  What's blocking you? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={blockerComment}
                  onChange={(e) => setBlockerComment(e.target.value)}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describe the blocker in detail... (e.g., waiting for API access, unclear requirements, dependency on another team, etc.)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Be specific about what's preventing progress and what help you need
                </p>
              </div>

              {/* Mention Users */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Mention Team Members <span className="text-gray-500">(Optional)</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Select people who can help unblock this task. They'll receive instant notifications.
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {users.filter(u => u.id !== currentUser.id).map(user => (
                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mentionedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMentionedUsers([...mentionedUsers, user.id]);
                          } else {
                            setMentionedUsers(mentionedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role} • {user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {mentionedUsers.length > 0 && (
                  <p className="mt-2 text-sm text-green-700 font-medium">
                    {mentionedUsers.length} {mentionedUsers.length === 1 ? 'person' : 'people'} will be notified
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowBlockedModal(false);
                  setBlockerComment('');
                  setMentionedUsers([]);
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockedSubmit}
                disabled={!blockerComment.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Blocked
              </button>
            </div>
          </div>
        </div>
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
                <X className="w-5 h-5 text-gray-600" />
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

      {/* Dependency Task Detail Modal */}
      {selectedDependencyId && (
        <DependencyTaskDetailModal
          dependencyTaskId={selectedDependencyId}
          onClose={() => {
            setSelectedDependencyId(null);
            onUpdate(task.id, {}); // Refresh parent task
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default EmployeeTaskDetailModal;
