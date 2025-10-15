import { Clock, MessageCircle, CheckCircle, XCircle, AlertCircle, Edit, User, Calendar, Ban } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';
import { ACTIVITY_TYPE } from '../../utils/taskConstants';
import { storage } from '../../utils/storage';

const TaskActivityTimeline = ({ activities = [], feedback = [] }) => {
  // Combine activities and feedback into a single timeline
  const timelineItems = [
    ...activities,
    ...feedback.map(f => ({
      type: 'feedback',
      timestamp: f.timestamp,
      data: f
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const getActivityIcon = (type) => {
    switch (type) {
      case ACTIVITY_TYPE.STATUS_CHANGE:
        return <CheckCircle className="w-4 h-4" />;
      case ACTIVITY_TYPE.COMMENT:
      case ACTIVITY_TYPE.PROGRESS_NOTE:
        return <MessageCircle className="w-4 h-4" />;
      case ACTIVITY_TYPE.REVIEW_COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case ACTIVITY_TYPE.REWORK_REQUESTED:
        return <XCircle className="w-4 h-4" />;
      case ACTIVITY_TYPE.BLOCKER_ADDED:
        return <Ban className="w-4 h-4" />;
      case ACTIVITY_TYPE.BLOCKER_RESOLVED:
        return <CheckCircle className="w-4 h-4" />;
      case ACTIVITY_TYPE.DEADLINE_CHANGE:
        return <Calendar className="w-4 h-4" />;
      case ACTIVITY_TYPE.ASSIGNMENT:
        return <User className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case ACTIVITY_TYPE.REVIEW_COMPLETED:
      case ACTIVITY_TYPE.BLOCKER_RESOLVED:
        return 'bg-green-100 text-green-600 border-green-200';
      case ACTIVITY_TYPE.REWORK_REQUESTED:
        return 'bg-red-100 text-red-600 border-red-200';
      case ACTIVITY_TYPE.BLOCKER_ADDED:
        return 'bg-orange-100 text-orange-600 border-orange-200 animate-pulse';
      case ACTIVITY_TYPE.STATUS_CHANGE:
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case ACTIVITY_TYPE.COMMENT:
      case ACTIVITY_TYPE.PROGRESS_NOTE:
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const isBlockerActivity = (activity) => {
    return activity.type === ACTIVITY_TYPE.BLOCKER_ADDED ||
           activity.title?.toLowerCase().includes('blocked') ||
           activity.description?.toLowerCase().includes('blocker');
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity, index) => (
        <div key={activity.id || index} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getActivityColor(
                activity.type
              )}`}
            >
              {getActivityIcon(activity.type)}
            </div>
            {index < sortedActivities.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 my-1"></div>
            )}
          </div>

          {/* Activity content */}
          <div className="flex-1 pb-6">
            <div className={`rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
              isBlockerActivity(activity)
                ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 ring-2 ring-orange-200'
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {activity.title}
                      {isBlockerActivity(activity) && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-600 text-white flex items-center gap-1 animate-pulse">
                          <Ban className="w-3 h-3" />
                          BLOCKER
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.userName} • {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
                {activity.badge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${activity.badge.color}`}
                  >
                    {activity.badge.text}
                  </span>
                )}
              </div>

              {activity.description && (
                <p className="text-sm text-gray-700 mt-2">{activity.description}</p>
              )}

              {activity.metadata && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  isBlockerActivity(activity) ? 'bg-orange-50' : 'bg-gray-50'
                }`}>
                  {activity.metadata.previousStatus && activity.metadata.newStatus && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">{activity.metadata.previousStatus}</span>
                      <span>→</span>
                      <span className="font-medium">{activity.metadata.newStatus}</span>
                    </div>
                  )}
                  {activity.metadata.qualityRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Quality Rating:</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < activity.metadata.qualityRating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          ({activity.metadata.qualityRating}/5)
                        </span>
                      </div>
                    </div>
                  )}
                  {activity.metadata.reason && (
                    <div className="mt-2 italic text-gray-600">
                      &ldquo;{activity.metadata.reason}&rdquo;
                    </div>
                  )}
                  {isBlockerActivity(activity) && activity.metadata.mentions && activity.metadata.mentions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-orange-200">
                      <p className="text-xs font-semibold text-orange-700 mb-1">Mentioned:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.metadata.mentions.map((userId) => {
                          const mentionedUser = storage.getUserById?.(userId);
                          return mentionedUser ? (
                            <span key={userId} className="px-2 py-1 text-xs bg-red-600 text-white rounded-full font-bold shadow-lg ring-2 ring-red-300 animate-pulse">
                              🔴 @{mentionedUser.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskActivityTimeline;
