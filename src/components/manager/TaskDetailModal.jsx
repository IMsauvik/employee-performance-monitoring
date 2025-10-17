import { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle, MessageCircle, Edit2, Clock, CheckCircle, Loader } from 'lucide-react';
import { formatDate, formatDateTime, getStatusColor, getStatusText, getPriorityColor, getDaysRemaining, getQualityRatingInfo } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { TASK_STATUS } from '../../utils/taskConstants';
import TaskCommentsModal from '../common/TaskCommentsModal';
import TaskActivityTimeline from '../common/TaskActivityTimeline';
import EditTaskModal from './EditTaskModal';
import TaskReviewPanel from './TaskReviewPanel';
import ConfirmModal from '../common/ConfirmModal';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import toast from 'react-hot-toast';

const TaskDetailModal = ({ task, employees, onClose, onUpdate }) => {
  const { currentUser } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [showMarkCompleteConfirm, setShowMarkCompleteConfirm] = useState(false);
  
  const { 
    feedback: taskFeedback, 
    history: progressHistory,
    loading: progressLoading,
    error: progressError,
    addFeedback: submitFeedback,
    updateProgress,
    refresh: refreshProgress
  } = useTaskProgress(task?.id);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  const handleAddFeedback = async () => {
    if (feedback.trim()) {
      try {
        await submitFeedback(feedback);
        setFeedback('');
        setShowFeedbackSuccess(true);
        toast.success('Feedback added successfully!');
        
        // Hide success animation after 2 seconds
        setTimeout(() => setShowFeedbackSuccess(false), 2000);
        
        // Refresh the progress data to show new feedback immediately
        await refreshProgress();
        
        // Don't call onUpdate with hasNewFeedback - it's not a DB field
        // The refresh above will reload the feedback from the database
      } catch (error) {
        toast.error('Failed to add feedback. Please try again.');
      }
    }
  };

  const confirmMarkComplete = () => {
    onUpdate(task.id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0]
    });
    toast.success('Task marked as completed!');
    onClose();
  };

  // Effect to handle task updates
  useEffect(() => {
    refreshProgress();
  }, [task, refreshProgress]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {progressError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{progressError}</p>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{task.title || task.taskName}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                {getStatusText(task.status)}
              </span>
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
              <p className="font-semibold text-gray-900">{task.vertical || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Project</p>
              <p className="font-semibold text-gray-900">{task.project || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              <p className="font-semibold text-gray-900">{getEmployeeName(task.assignedTo)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">POC</p>
              <p className="font-semibold text-gray-900">{task.poc || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date Assigned</p>
              <p className="font-semibold text-gray-900">{formatDate(task.startDate || task.dateOfAssignment || task.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="font-semibold text-gray-900">
                {formatDate(task.dueDate || task.deadline)}
                <span className="text-sm text-gray-600 ml-2">({getDaysRemaining(task.dueDate || task.deadline)})</span>
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Timeline</p>
              <p className="font-semibold text-gray-900">{task.timeline || 'N/A'}</p>
            </div>
          </div>

          {/* Timeline Extension History */}
          {task.timelineHistory && task.timelineHistory.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="font-semibold text-orange-900">Timeline Extended {task.timelineHistory.length} Time{task.timelineHistory.length > 1 ? 's' : ''}</h3>
              </div>
              <div className="space-y-2">
                {task.timelineHistory.map((ext, index) => (
                  <div key={ext.id} className="bg-white rounded p-3 text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">Extension #{index + 1}</span>
                      <span className="text-orange-600 font-semibold">+{ext.extensionDays} days</span>
                    </div>
                    <div className="text-gray-600 text-xs space-y-1">
                      <div>{new Date(ext.previousDeadline).toLocaleDateString()} → {new Date(ext.newDeadline).toLocaleDateString()}</div>
                      <div className="italic text-gray-700">Reason: "{ext.reason}"</div>
                      <div className="text-gray-500">On {new Date(ext.extendedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{task.description || task.taskDescription || 'No description provided'}</p>
          </div>

          {/* Progress Notes */}
          {task.progressNotes && task.progressNotes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Notes</h3>
              <div className="space-y-3">
                {task.progressNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((note) => (
                  <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-semibold">
                          {note.addedByName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {note.addedByName} • {formatDateTime(note.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Review Panel */}
          {(task.status === TASK_STATUS.SUBMITTED || task.status === TASK_STATUS.UNDER_REVIEW) && (
            <TaskReviewPanel
              task={task}
              currentUser={currentUser}
              onReviewComplete={(updates) => {
                onUpdate(task.id, updates);
                // Close the task detail modal after review is complete
                setTimeout(() => onClose(), 500);
              }}
              onClose={() => {}}
            />
          )}

          {/* Quality Rating Display (if accepted) */}
          {task.qualityRating && (task.status === TASK_STATUS.ACCEPTED || task.status === TASK_STATUS.COMPLETED) && (
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-900 mb-3">✓ Task Accepted</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Quality Rating:</p>
                  <div className="flex items-center gap-1 mt-1">
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
                <div className="text-right">
                  <p className="text-sm text-gray-700">Accepted by</p>
                  <p className="font-semibold text-gray-900">{task.reviewedByName}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(task.acceptedDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Manager Feedback */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Feedback</h3>
            {/* Use taskFeedback from the hook instead of task.managerFeedback from props */}
            {taskFeedback && taskFeedback.length > 0 && (
              <div className="space-y-2 mb-3">
                {taskFeedback.map(fb => (
                  <div key={fb.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-gray-900">{fb.text}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {fb.authorName || 'Manager'} • {new Date(fb.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="3"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                  showFeedbackSuccess ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="Add additional feedback for the employee..."
              />
              {showFeedbackSuccess && (
                <div className="absolute top-2 right-2 animate-scaleIn">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}
            </div>
            <button
              onClick={handleAddFeedback}
              disabled={!feedback.trim()}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Feedback
            </button>
          </div>

          {/* Activity Timeline */}
          {task.activityTimeline && task.activityTimeline.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {progressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <TaskActivityTimeline 
                  activities={[...task.activityTimeline, ...progressHistory]} 
                  feedback={taskFeedback}
                />
              )}
            </div>
          )}

          {/* Actions */}
          {task.status !== 'completed' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
              >
                <Edit2 className="w-5 h-5 mr-2" />
                Edit Task
              </button>
              <button
                onClick={() => setShowCommentsModal(true)}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                View Discussion
              </button>
              <button
                onClick={() => setShowMarkCompleteConfirm(true)}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Mark as Complete
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Comments Modal */}
      <TaskCommentsModal
        task={task}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        onTaskUpdate={onUpdate}
      />

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          employees={employees}
          onClose={() => setShowEditModal(false)}
          onUpdate={(taskId, updates) => {
            onUpdate(taskId, updates);
            setShowEditModal(false);
          }}
        />
      )}

      {/* Mark Complete Confirmation Modal */}
      <ConfirmModal
        isOpen={showMarkCompleteConfirm}
        onClose={() => setShowMarkCompleteConfirm(false)}
        onConfirm={confirmMarkComplete}
        title="Mark Task as Complete"
        message="Are you sure you want to mark this task as completed? This action will close the task."
        confirmText="Mark Complete"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default TaskDetailModal;
