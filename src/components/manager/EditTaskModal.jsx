import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { calculateTimeline, formatDateTime } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

const EditTaskModal = ({ task, employees, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    vertical: task.vertical || '',
    project: task.project || '',
    taskName: task.taskName || '',
    taskDescription: task.taskDescription || '',
    assignedTo: task.assignedTo || '',
    poc: task.poc || '',
    deadline: task.deadline || '',
    priority: task.priority || 'medium',
    status: task.status || 'not_started'
  });

  const [extensionReason, setExtensionReason] = useState('');
  const [showExtensionInput, setShowExtensionInput] = useState(false);
  const [errors, setErrors] = useState({});

  const originalDeadline = task.deadline;
  const isDeadlineExtended = formData.deadline !== originalDeadline;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Show extension reason input if deadline changed
    if (name === 'deadline' && value !== originalDeadline) {
      setShowExtensionInput(true);
    } else if (name === 'deadline' && value === originalDeadline) {
      setShowExtensionInput(false);
      setExtensionReason('');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vertical?.trim()) newErrors.vertical = 'Vertical is required';
    if (!formData.project?.trim()) newErrors.project = 'Project name is required';
    if (!formData.taskName?.trim()) newErrors.taskName = 'Task name is required';
    if (!formData.taskDescription?.trim()) newErrors.taskDescription = 'Task description is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please select an employee';
    if (!formData.poc?.trim()) newErrors.poc = 'POC is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';

    // If deadline is extended, reason is required
    if (isDeadlineExtended && !extensionReason?.trim()) {
      newErrors.extensionReason = 'Extension reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const today = new Date().toISOString().split('T')[0];
    const timeline = calculateTimeline(task.dateOfAssignment, formData.deadline);

    // Build update object
    const updates = {
      ...formData,
      timeline,
      updatedAt: new Date().toISOString()
    };

    // If deadline was extended, add to timeline history
    if (isDeadlineExtended) {
      const timelineHistory = task.timelineHistory || [];
      timelineHistory.push({
        id: `ext-${Date.now()}`,
        previousDeadline: originalDeadline,
        newDeadline: formData.deadline,
        extensionDays: Math.ceil((new Date(formData.deadline) - new Date(originalDeadline)) / (1000 * 60 * 60 * 24)),
        reason: extensionReason,
        extendedBy: 'Manager', // You can get this from currentUser
        extendedAt: new Date().toISOString()
      });
      updates.timelineHistory = timelineHistory;
    }

    onUpdate(task.id, updates);
    toast.success('Task updated successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Assignment Info */}
        <div className="px-6 pt-4 pb-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Assigned: {formatDateTime(task.createdAt)}</span>
            </div>
            {task.timelineHistory && task.timelineHistory.length > 0 && (
              <span className="text-orange-600 font-medium">
                Extended {task.timelineHistory.length} time{task.timelineHistory.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vertical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vertical <span className="text-red-500">*</span>
            </label>
            <select
              name="vertical"
              value={formData.vertical}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.vertical ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Vertical</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Mobile">Mobile</option>
              <option value="B2B">B2B</option>
              <option value="SaaS">SaaS</option>
              <option value="Other">Other</option>
            </select>
            {errors.vertical && <p className="mt-1 text-sm text-red-500">{errors.vertical}</p>}
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.project ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {errors.project && <p className="mt-1 text-sm text-red-500">{errors.project}</p>}
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.taskName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task name"
            />
            {errors.taskName && <p className="mt-1 text-sm text-red-500">{errors.taskName}</p>}
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="taskDescription"
              value={formData.taskDescription}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.taskDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter detailed task description"
            />
            {errors.taskDescription && <p className="mt-1 text-sm text-red-500">{errors.taskDescription}</p>}
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.assignedTo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            {errors.assignedTo && <p className="mt-1 text-sm text-red-500">{errors.assignedTo}</p>}
          </div>

          {/* POC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              POC (Point of Contact) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="poc"
              value={formData.poc}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.poc ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter POC name"
            />
            {errors.poc && <p className="mt-1 text-sm text-red-500">{errors.poc}</p>}
          </div>

          {/* Deadline with Extension */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Original:</span>
              <span className="font-medium">{new Date(originalDeadline).toLocaleDateString()}</span>
            </div>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.deadline ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}

            {/* Extension Reason */}
            {showExtensionInput && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-900">Timeline Extension</span>
                </div>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Reason for extending the deadline (required)..."
                  rows="2"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.extensionReason ? 'border-red-500' : 'border-orange-300'
                  }`}
                />
                {errors.extensionReason && <p className="mt-1 text-sm text-red-500">{errors.extensionReason}</p>}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={formData.priority === 'high'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">High</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="medium"
                  checked={formData.priority === 'medium'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Medium</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={formData.priority === 'low'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">Low</span>
              </label>
            </div>
          </div>

          {/* Timeline History */}
          {task.timelineHistory && task.timelineHistory.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline Extension History</h4>
              <div className="space-y-2">
                {task.timelineHistory.map((ext, index) => (
                  <div key={ext.id} className="text-sm p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">Extension #{index + 1}</span>
                      <span className="text-orange-600 font-medium">+{ext.extensionDays} days</span>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>{new Date(ext.previousDeadline).toLocaleDateString()} → {new Date(ext.newDeadline).toLocaleDateString()}</div>
                      <div className="italic">"{ext.reason}"</div>
                      <div className="text-gray-500">Extended on {new Date(ext.extendedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
            >
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
