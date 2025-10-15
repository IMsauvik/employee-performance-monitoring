import { useState } from 'react';
import { X, Upload, File, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateId, calculateTimeline } from '../../utils/helpers';
import { TASK_STATUS, ACTIVITY_TYPE } from '../../utils/taskConstants';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';
import SuccessModal from '../common/SuccessModal';

const AssignTaskModal = ({ employees, onClose, onAssign }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    vertical: '',
    project: '',
    taskName: '',
    taskDescription: '',
    assignedTo: '',
    poc: currentUser?.name || '',
    deadline: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [assignedEmployeeName, setAssignedEmployeeName] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      // Convert file to base64 for storage
      data: null // We'll read this asynchronously
    }));

    // Read files as base64
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newFiles[index].data = event.target.result;
        if (index === files.length - 1) {
          // All files read, update state
          setAttachedFiles(prev => [...prev, ...newFiles]);
          toast.success(`${files.length} file(s) attached`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vertical.trim()) newErrors.vertical = 'Vertical is required';
    if (!formData.project.trim()) newErrors.project = 'Project name is required';
    if (!formData.taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!formData.taskDescription.trim()) newErrors.taskDescription = 'Task description is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please select an employee';
    if (!formData.poc.trim()) newErrors.poc = 'POC is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';

    // Check if deadline is in the future
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeline = calculateTimeline(today, formData.deadline);

    // Initialize activity timeline
    const initialActivity = {
      id: generateId(),
      type: ACTIVITY_TYPE.ASSIGNMENT,
      title: 'Task Assigned',
      description: `Task assigned to ${employees.find(e => e.id === formData.assignedTo)?.name || 'employee'} by ${currentUser.name}`,
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: now.toISOString(),
      metadata: {
        assignedTo: formData.assignedTo,
        priority: formData.priority
      }
    };

    const newTask = {
      id: generateId(),
      ...formData,
      assignedBy: currentUser.id,
      assignedByName: currentUser.name,
      dateOfAssignment: today,
      assignedDate: today,
      assignmentDateTime: now.toISOString(),
      dueDate: formData.deadline,
      timeline,
      timelineHistory: [],
      status: TASK_STATUS.NOT_STARTED,
      progressNotes: [],
      attachments: attachedFiles,
      completedDate: null,
      managerFeedback: [], // Initialize as empty array, not null
      progressHistory: [], // Add progress history
      // New fields for enhanced analytics
      submittedForReviewAt: null,
      reviewedAt: null,
      reviewedBy: null,
      reviewedByName: null,
      qualityRating: null,
      acceptedDate: null,
      reworkCount: 0,
      reworkHistory: [],
      activityTimeline: [initialActivity],
      blockerHistory: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    const employeeName = employees.find(e => e.id === formData.assignedTo)?.name || 'employee';
    setAssignedEmployeeName(employeeName);

    // Create notification for the assigned employee
    storage.addNotification({
      id: generateId(),
      userId: formData.assignedTo,
      type: 'task_assigned',
      taskId: newTask.id,
      message: `New task assigned: "${formData.taskName}"`,
      read: false,
      createdAt: now.toISOString(),
      metadata: {
        taskName: formData.taskName,
        assignedBy: currentUser.name,
        priority: formData.priority,
        deadline: formData.deadline
      }
    });

    onAssign(newTask);
    toast.success(`Task assigned to ${employeeName} successfully!`);
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Assign New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
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

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
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

          {/* Attach Files */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files <span className="text-gray-500">(Optional)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">Click to upload files</span>
                <span className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, etc.</span>
              </label>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fadeIn"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              Assign Task
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Task Assigned Successfully!"
        message={`Task "${formData.taskName}" has been assigned to ${assignedEmployeeName}`}
        autoClose={true}
        autoCloseDelay={2500}
      />
    </div>
  );
};

export default AssignTaskModal;
