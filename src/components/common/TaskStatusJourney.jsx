import { CheckCircle, Circle, Clock, PlayCircle, Ban, Rocket, Zap, Send, Eye, Star } from 'lucide-react';
import { TASK_STATUS, STATUS_INFO } from '../../utils/taskConstants';

const TaskStatusJourney = ({ currentStatus, onStatusChange, userRole = 'employee' }) => {
  // Simple 3-stage journey for employees
  // Submission and review handled separately via buttons
  const employeeJourneySteps = [
    {
      status: TASK_STATUS.NOT_STARTED,
      label: 'Not Started',
      description: 'Ready to begin your task',
      icon: Rocket,
      color: 'text-gray-400',
      activeColor: 'text-indigo-600',
      bgColor: 'bg-gray-50',
      activeBgColor: 'bg-indigo-50',
      borderColor: 'border-gray-300',
      activeBorderColor: 'border-indigo-500',
      gradient: 'from-gray-400 to-gray-500',
      clickable: true
    },
    {
      status: TASK_STATUS.IN_PROGRESS,
      label: 'In Progress',
      description: 'Working on it',
      icon: Zap,
      color: 'text-blue-400',
      activeColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      activeBgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      activeBorderColor: 'border-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
      clickable: true
    },
    {
      status: TASK_STATUS.BLOCKED,
      label: 'Blocked',
      description: 'Needs attention',
      icon: Ban,
      color: 'text-orange-400',
      activeColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      activeBgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      activeBorderColor: 'border-orange-600',
      gradient: 'from-orange-500 to-red-500',
      clickable: true
    }
  ];

  const getCurrentStepIndex = () => {
    // Map all statuses to the 3-stage journey
    // Review statuses (submitted, under_review, accepted, completed) show as "In Progress"
    // since they're handled separately via buttons and status displays
    if (currentStatus === TASK_STATUS.REWORK_REQUIRED ||
        currentStatus === TASK_STATUS.SUBMITTED ||
        currentStatus === TASK_STATUS.UNDER_REVIEW ||
        currentStatus === TASK_STATUS.ACCEPTED ||
        currentStatus === TASK_STATUS.COMPLETED) {
      return employeeJourneySteps.findIndex(step => step.status === TASK_STATUS.IN_PROGRESS);
    }
    return employeeJourneySteps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  // Special handling for review/completion statuses
  const isReworkRequired = currentStatus === TASK_STATUS.REWORK_REQUIRED;
  const isSubmitted = currentStatus === TASK_STATUS.SUBMITTED;
  const isUnderReview = currentStatus === TASK_STATUS.UNDER_REVIEW;
  const isAccepted = currentStatus === TASK_STATUS.ACCEPTED;
  const isCompleted = currentStatus === TASK_STATUS.COMPLETED;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Task Journey</h3>
        {currentStepIndex >= 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Step {currentStepIndex + 1} of {employeeJourneySteps.length}</span>
          </div>
        )}
      </div>

      {/* Journey Bar */}
      <div className="relative mb-8">
        {/* Progress Line */}
        <div className="absolute top-10 left-0 right-0 h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-in-out shadow-lg"
            style={{
              width: currentStepIndex >= 0
                ? `${(currentStepIndex / (employeeJourneySteps.length - 1)) * 100}%`
                : '0%'
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {employeeJourneySteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.status === currentStatus;
            const isPast = index < currentStepIndex;
            const isClickable = step.clickable !== false; // Use step's clickable property

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStatusChange(step.status)}
                  disabled={!isClickable}
                  className={`
                    relative z-10 w-20 h-20 rounded-full border-4 flex items-center justify-center
                    transition-all duration-300 transform
                    ${isActive
                      ? `${step.activeBgColor} ${step.activeBorderColor} shadow-2xl ring-4 ring-opacity-40 ring-${step.activeColor.split('-')[1]}-400 scale-110`
                      : isPast
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 shadow-lg hover:scale-105'
                      : `${step.bgColor} ${step.borderColor} shadow-md hover:scale-105`
                    }
                    ${isClickable ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed opacity-60'}
                  `}
                >
                  {isPast && !isActive ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Icon className={`w-10 h-10 ${isActive ? step.activeColor : step.color} transition-all duration-300`} />
                  )}

                  {/* Pulse animation for active step */}
                  {isActive && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-75 animate-ping"></span>
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-4 text-center">
                  <p className={`
                    text-base font-bold transition-colors mb-1
                    ${isActive ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-gray-500'}
                  `}>
                    {step.label}
                  </p>
                  <p className={`text-xs transition-colors
                    ${isActive ? 'text-gray-700 font-medium' : 'text-gray-500'}
                  `}>
                    {step.description}
                  </p>
                  {isActive && (
                    <div className="mt-2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                      CURRENT STAGE
                    </div>
                  )}
                  {isPast && !isActive && (
                    <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Info Card */}
      <div className={`mt-8 p-6 rounded-xl border-2 shadow-lg ${
        isReworkRequired
          ? 'bg-gradient-to-br bg-red-50 border-red-300'
          : currentStepIndex >= 0
          ? `bg-gradient-to-br ${employeeJourneySteps[currentStepIndex].activeBgColor} ${employeeJourneySteps[currentStepIndex].activeBorderColor}`
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isReworkRequired
              ? 'bg-gradient-to-br from-red-500 to-orange-500'
              : currentStepIndex >= 0 ? `bg-gradient-to-br ${employeeJourneySteps[currentStepIndex].gradient}` : 'bg-gray-400'
          } shadow-lg`}>
            {isReworkRequired ? (
              <Ban className="w-7 h-7 text-white" />
            ) : currentStepIndex >= 0 ? (() => {
              const Icon = employeeJourneySteps[currentStepIndex].icon;
              return <Icon className="w-7 h-7 text-white" />;
            })() : null}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900 mb-1">
              {STATUS_INFO[currentStatus]?.label || 'Unknown Status'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {STATUS_INFO[currentStatus]?.description || 'No description available'}
            </p>
            {currentStatus === TASK_STATUS.NOT_STARTED && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium">
                  💡 Tip: Click on "In Progress" to start working on this task!
                </p>
              </div>
            )}
            {isReworkRequired && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Manager requested changes. Please review feedback above and resubmit.
                </p>
              </div>
            )}
            {isSubmitted && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 font-medium">
                  ⏳ Task submitted for review. Waiting for manager feedback.
                </p>
              </div>
            )}
            {isUnderReview && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-800 font-medium">
                  👀 Manager is currently reviewing your work. Please wait for feedback.
                </p>
              </div>
            )}
            {isAccepted && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Work approved! Task will be marked as completed by manager.
                </p>
              </div>
            )}
            {isCompleted && (
              <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  🎉 Task completed! Great job!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
        <Circle className="w-4 h-4" />
        <p>Click on available stages to update your task status</p>
      </div>
    </div>
  );
};

export default TaskStatusJourney;
