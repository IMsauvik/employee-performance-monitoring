import { CheckCircle, XCircle, Clock, User, AlertCircle } from 'lucide-react';
import { storage } from '../../utils/storage';
import { DEPENDENCY_STATUS } from '../../utils/taskConstants';

const DependencyStatusCards = ({ dependencies, onDependencyClick, onAccept, onReject, canReview = false }) => {
  if (!dependencies || dependencies.length === 0) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case DEPENDENCY_STATUS.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case DEPENDENCY_STATUS.IN_PROGRESS:
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (dep) => {
    if (dep.rejectedBy) return 'border-red-300 bg-red-50';
    if (dep.acceptedBy) return 'border-green-300 bg-green-50';
    if (dep.status === DEPENDENCY_STATUS.COMPLETED && dep.submittedForReview) {
      return 'border-yellow-300 bg-yellow-50';
    }
    if (dep.status === DEPENDENCY_STATUS.COMPLETED) return 'border-green-300 bg-green-50';
    if (dep.status === DEPENDENCY_STATUS.IN_PROGRESS) return 'border-blue-300 bg-blue-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getStatusText = (dep) => {
    if (dep.rejectedBy) return 'Rejected - Needs Rework';
    if (dep.acceptedBy) return 'Accepted';
    if (dep.status === DEPENDENCY_STATUS.COMPLETED && dep.submittedForReview) {
      return 'Pending Your Review';
    }
    if (dep.status === DEPENDENCY_STATUS.COMPLETED) return 'Completed';
    if (dep.status === DEPENDENCY_STATUS.IN_PROGRESS) return 'In Progress';
    return 'Not Started';
  };

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-gray-900 text-sm">Dependency Tasks:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dependencies.map(depId => {
          const dep = storage.getDependencyTask(depId);
          if (!dep) return null;

          const assignedUser = storage.getUserById(dep.assignedTo);
          const isPendingReview = dep.status === DEPENDENCY_STATUS.COMPLETED && dep.submittedForReview && !dep.acceptedBy && !dep.rejectedBy;

          return (
            <div
              key={dep.id}
              className={`border-2 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all ${getStatusColor(dep)}`}
              onClick={() => onDependencyClick && onDependencyClick(dep.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(dep.rejectedBy ? 'rejected' : dep.status)}
                  <span className="text-xs font-bold text-gray-700">
                    {getStatusText(dep)}
                  </span>
                </div>
                {isPendingReview && (
                  <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded-full animate-pulse">
                    REVIEW
                  </span>
                )}
              </div>

              <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                {dep.title}
              </h5>

              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <User className="w-3 h-3" />
                <span>{assignedUser?.name || 'Unknown'}</span>
              </div>

              {/* Accept/Reject Buttons */}
              {canReview && isPendingReview && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept(dep.id);
                    }}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(dep.id);
                    }}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              )}

              {/* Rejection Info */}
              {dep.rejectedBy && dep.rejectionReason && (
                <div className="mt-2 pt-2 border-t border-red-300">
                  <p className="text-xs text-red-800 font-semibold">Rejection Reason:</p>
                  <p className="text-xs text-red-700 italic mt-1">&ldquo;{dep.rejectionReason}&rdquo;</p>
                </div>
              )}

              {/* Acceptance Info */}
              {dep.acceptedBy && (
                <div className="mt-2 pt-2 border-t border-green-300">
                  <p className="text-xs text-green-700 font-semibold">
                    ✓ Accepted by {storage.getUserById(dep.acceptedBy)?.name}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DependencyStatusCards;
