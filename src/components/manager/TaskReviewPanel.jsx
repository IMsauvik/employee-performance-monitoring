import { useState } from 'react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { TASK_STATUS, QUALITY_RATING, ACTIVITY_TYPE } from '../../utils/taskConstants';
import { generateId } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TaskReviewPanel = ({ task, currentUser, onReviewComplete, onClose }) => {
  const [reviewDecision, setReviewDecision] = useState(''); // 'accept' or 'reject'
  const [qualityRating, setQualityRating] = useState(0);
  const [reviewComments, setReviewComments] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const canReview = task.status === TASK_STATUS.SUBMITTED || task.status === TASK_STATUS.UNDER_REVIEW;

  const handleStartReview = () => {
    // Mark task as under review
    const updates = {
      status: TASK_STATUS.UNDER_REVIEW,
      underReviewAt: new Date().toISOString(),
      reviewedBy: currentUser.id,
      reviewedByName: currentUser.name
    };

    // Add activity
    const activity = {
      id: generateId(),
      type: ACTIVITY_TYPE.STATUS_CHANGE,
      title: 'Review Started',
      description: `${currentUser.name} started reviewing this task`,
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      metadata: {
        previousStatus: task.status,
        newStatus: TASK_STATUS.UNDER_REVIEW
      }
    };

    updates.activityTimeline = [...(task.activityTimeline || []), activity];
    onReviewComplete(updates);
    toast.success('Review started');
  };

  const handleSubmitReview = () => {
    if (reviewDecision === 'accept' && qualityRating === 0) {
      toast.error('Please provide a quality rating');
      return;
    }

    if (reviewDecision === 'reject' && !reviewComments.trim()) {
      toast.error('Please provide feedback for rework');
      return;
    }

    const now = new Date().toISOString();
    const isAccepted = reviewDecision === 'accept';

    const updates = {
      status: isAccepted ? TASK_STATUS.ACCEPTED : TASK_STATUS.REWORK_REQUIRED,
      reviewedAt: now,
      reviewedBy: currentUser.id,
      reviewedByName: currentUser.name
    };

    if (isAccepted) {
      updates.qualityRating = qualityRating;
      updates.acceptedDate = now.split('T')[0];
      updates.completedDate = now.split('T')[0];
    } else {
      // Increment rework count
      updates.reworkCount = (task.reworkCount || 0) + 1;

      // Add to rework history
      const reworkHistory = task.reworkHistory || [];
      reworkHistory.push({
        id: generateId(),
        rejectedAt: now,
        rejectedBy: currentUser.id,
        rejectedByName: currentUser.name,
        reason: reviewComments,
        reworkNumber: updates.reworkCount
      });
      updates.reworkHistory = reworkHistory;
    }

    // Add review activity
    const activity = {
      id: generateId(),
      type: isAccepted ? ACTIVITY_TYPE.REVIEW_COMPLETED : ACTIVITY_TYPE.REWORK_REQUESTED,
      title: isAccepted ? 'Task Accepted' : 'Rework Required',
      description: reviewComments || (isAccepted ? `Task accepted with quality rating: ${qualityRating}/5` : 'Task sent back for rework'),
      userName: currentUser.name,
      userId: currentUser.id,
      timestamp: now,
      metadata: {
        previousStatus: task.status,
        newStatus: updates.status,
        ...(isAccepted && { qualityRating }),
        ...(reviewComments && { reason: reviewComments })
      },
      badge: isAccepted
        ? { text: 'Accepted', color: 'bg-green-100 text-green-700' }
        : { text: 'Rejected', color: 'bg-red-100 text-red-700' }
    };

    updates.activityTimeline = [...(task.activityTimeline || []), activity];

    onReviewComplete(updates);
    toast.success(isAccepted ? 'Task accepted!' : 'Task sent for rework');
    onClose();
  };

  if (!canReview && task.status !== TASK_STATUS.UNDER_REVIEW) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <p className="text-gray-600 text-center">
          This task is not ready for review yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <CheckCircle className="w-6 h-6 mr-2 text-indigo-600" />
        Manager Review
      </h3>

      {task.status === TASK_STATUS.SUBMITTED && (
        <div className="mb-6">
          <button
            onClick={handleStartReview}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
          >
            Start Review
          </button>
        </div>
      )}

      {task.status === TASK_STATUS.UNDER_REVIEW && (
        <div className="space-y-6">
          {/* Review Decision */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Review Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReviewDecision('accept')}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-semibold transition ${
                  reviewDecision === 'accept'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Accept
              </button>
              <button
                onClick={() => setReviewDecision('reject')}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg font-semibold transition ${
                  reviewDecision === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                }`}
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>

          {/* Quality Rating (only for accept) */}
          {reviewDecision === 'accept' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quality Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-white p-4 rounded-lg border-2 border-gray-300">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setQualityRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredStar || qualityRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {qualityRating > 0 ? (
                    <>
                      {qualityRating}/5 - {Object.values(QUALITY_RATING).find(r => r.value === qualityRating)?.label}
                    </>
                  ) : (
                    'Select rating'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Review Comments */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {reviewDecision === 'accept' ? 'Comments (Optional)' : 'Feedback for Rework'}
              {reviewDecision === 'reject' && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder={
                reviewDecision === 'accept'
                  ? 'Add any additional comments...'
                  : 'Explain what needs to be improved...'
              }
            />
          </div>

          {/* Rework History (if exists) */}
          {task.reworkHistory && task.reworkHistory.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-900 mb-2">
                ⚠️ This task has been sent for rework {task.reworkHistory.length} time(s)
              </p>
              <div className="text-xs text-orange-700">
                Last rework: {task.reworkHistory[task.reworkHistory.length - 1]?.reason}
              </div>
            </div>
          )}

          {/* Submit Review */}
          <div className="flex gap-3 pt-4 border-t-2 border-indigo-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={!reviewDecision}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReviewPanel;
