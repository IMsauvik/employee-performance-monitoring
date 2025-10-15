import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Calendar, FileText, AlertCircle } from 'lucide-react';
import { storage } from '../../utils/storage';
import { DEPENDENCY_STATUS } from '../../utils/taskConstants';
import toast from 'react-hot-toast';

const CreateDependencyModal = ({ parentTask, blocker, onClose, onDependenciesCreated, currentUser }) => {
  const [dependencies, setDependencies] = useState([{
    id: `temp-${Date.now()}`,
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  }]);

  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    // Get all users except the parent task assignee (they're already blocked)
    const allUsers = storage.getUsers();
    const filtered = allUsers.filter(u =>
      u.id !== parentTask.assignedTo &&
      u.role !== 'admin' &&
      u.isActive !== false
    );
    setAvailableUsers(filtered);

    // Pre-populate with mentioned users if available
    if (blocker && blocker.mentions && blocker.mentions.length > 0) {
      const mentionedDependencies = blocker.mentions.map((userId, index) => {
        const user = storage.getUserById(userId);
        return {
          id: `temp-${Date.now()}-${index}`,
          title: `Help resolve: ${blocker.reason.substring(0, 50)}...`,
          description: blocker.reason,
          assignedTo: userId,
          dueDate: parentTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      });
      setDependencies(mentionedDependencies);
    }
  }, [parentTask, blocker]);

  const addDependency = () => {
    setDependencies([
      ...dependencies,
      {
        id: `temp-${Date.now()}`,
        title: '',
        description: '',
        assignedTo: '',
        dueDate: ''
      }
    ]);
  };

  const removeDependency = (id) => {
    if (dependencies.length === 1) {
      toast.error('At least one dependency task is required');
      return;
    }
    setDependencies(dependencies.filter(d => d.id !== id));
  };

  const updateDependency = (id, field, value) => {
    setDependencies(dependencies.map(d =>
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const validateDependencies = () => {
    for (const dep of dependencies) {
      if (!dep.title.trim()) {
        toast.error('All dependency tasks must have a title');
        return false;
      }
      if (!dep.assignedTo) {
        toast.error('All dependency tasks must be assigned to someone');
        return false;
      }
      if (!dep.dueDate) {
        toast.error('All dependency tasks must have a due date');
        return false;
      }
    }
    return true;
  };

  const handleCreate = () => {
    if (!validateDependencies()) return;

    try {
      const now = new Date().toISOString();
      const createdDependencies = [];

      dependencies.forEach((dep, index) => {
        // CRITICAL: Validate assigned user exists and has required fields
        const assignedUser = storage.getUserById(dep.assignedTo);
        if (!assignedUser || !assignedUser.name || !assignedUser.email) {
          console.error('Invalid assigned user:', dep.assignedTo, assignedUser);
          toast.error(`Cannot assign to invalid user. Please refresh and try again.`);
          return;
        }

        // CRITICAL: Validate currentUser has required fields
        if (!currentUser || !currentUser.name || !currentUser.id) {
          console.error('Invalid current user:', currentUser);
          toast.error('User session is invalid. Please logout and login again.');
          return;
        }

        // CRITICAL: Validate parent task has required fields
        if (!parentTask || !parentTask.taskName || !parentTask.id) {
          console.error('Invalid parent task:', parentTask);
          toast.error('Parent task data is corrupted. Please refresh the page.');
          return;
        }

        const dependencyTask = {
          id: `dep-${Date.now()}-${index}`,
          parentTaskId: parentTask.id,
          parentTaskName: parentTask.taskName || 'Unknown Task',
          blockerId: blocker?.id || null,
          title: (dep.title || '').trim(),
          description: (dep.description || blocker?.reason || '').trim(),
          assignedTo: dep.assignedTo,
          assignedToName: assignedUser.name, // Store name for safety
          assignedBy: currentUser.id,
          assignedByName: currentUser.name || 'Unknown',
          status: DEPENDENCY_STATUS.NOT_STARTED,
          dueDate: dep.dueDate,
          createdAt: now,
          updatedAt: now,
          progressNotes: [],
          activityTimeline: [{
            id: `activity-${Date.now()}-${index}`,
            type: 'ASSIGNMENT',
            title: 'Dependency Task Created',
            description: `Created by ${currentUser.name || 'Unknown'} to resolve blocker in "${parentTask.taskName || 'Unknown Task'}"`,
            timestamp: now,
            userName: currentUser.name || 'Unknown',
            userId: currentUser.id
          }]
        };

        storage.addDependencyTask(dependencyTask);
        createdDependencies.push(dependencyTask);

        // Notify assigned user
        storage.addNotification({
          id: `notif-${Date.now()}-${index}`,
          userId: dep.assignedTo,
          taskId: dependencyTask.id,
          message: `You've been assigned a dependency task: "${dep.title}" for blocked task "${parentTask.taskName}"`,
          type: 'dependency_assigned',
          read: false,
          createdAt: now
        });
      });

      // Update parent task's blocker with dependency task IDs
      if (blocker) {
        const tasks = storage.getTasks();
        const parentTaskData = tasks.find(t => t.id === parentTask.id);
        if (parentTaskData && parentTaskData.blockerHistory) {
          const updatedBlockerHistory = parentTaskData.blockerHistory.map(b => {
            if (b.id === blocker.id) {
              return {
                ...b,
                dependencyTasks: createdDependencies.map(d => d.id),
                dependencyCreatedAt: now,
                dependencyCreatedBy: currentUser.id
              };
            }
            return b;
          });

          storage.updateTask(parentTask.id, {
            blockerHistory: updatedBlockerHistory,
            activityTimeline: [
              ...(parentTaskData.activityTimeline || []),
              {
                id: `activity-${Date.now()}`,
                type: 'BLOCKER_ADDED',
                title: 'Dependency Tasks Created',
                description: `${createdDependencies.length} dependency task(s) created to resolve blocker`,
                timestamp: now,
                userName: currentUser.name,
                userId: currentUser.id,
                metadata: {
                  dependencyCount: createdDependencies.length
                }
              }
            ]
          });
        }
      }

      toast.success(`${createdDependencies.length} dependency task(s) created successfully`);
      onDependenciesCreated(createdDependencies);
      onClose();
    } catch (error) {
      console.error('Error creating dependency tasks:', error);
      toast.error('Failed to create dependency tasks');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[120] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Dependency Tasks</h2>
              <p className="text-sm text-gray-600">Break down the blocker into actionable tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Parent Task Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">For Blocked Task:</h3>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{parentTask.taskName}</span>
            {blocker && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                Blocker: {blocker.reason.substring(0, 50)}...
              </span>
            )}
          </div>
        </div>

        {/* Dependencies List */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {dependencies.map((dep, index) => (
            <div key={dep.id} className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Dependency Task #{index + 1}
                </h4>
                {dependencies.length > 1 && (
                  <button
                    onClick={() => removeDependency(dep.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove dependency"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={dep.title}
                    onChange={(e) => updateDependency(dep.id, 'title', e.target.value)}
                    placeholder="e.g., Fix API authentication issue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={dep.description}
                    onChange={(e) => updateDependency(dep.id, 'description', e.target.value)}
                    placeholder="Provide details about what needs to be done..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Assign To & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assign To *
                    </label>
                    <select
                      value={dep.assignedTo}
                      onChange={(e) => updateDependency(dep.id, 'assignedTo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select user...</option>
                      {availableUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dep.dueDate}
                      onChange={(e) => updateDependency(dep.id, 'dueDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          <button
            onClick={addDependency}
            className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Another Dependency Task
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How Dependency Tasks Work:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Assigned users will receive notifications and see tasks in their dashboard</li>
                <li>They can track progress and mark tasks as complete</li>
                <li>When all dependencies are completed, the blocker will be automatically resolved</li>
                <li>The original task will resume from where it was stopped</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create {dependencies.length} Dependency Task{dependencies.length > 1 ? 's' : ''}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDependencyModal;
