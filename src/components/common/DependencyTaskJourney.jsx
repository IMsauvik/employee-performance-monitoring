import { CheckCircle, Circle, Play, Pause } from 'lucide-react';
import { DEPENDENCY_STATUS } from '../../utils/taskConstants';

const DependencyTaskJourney = ({ currentStatus, onStatusChange, canEdit = true }) => {
  const steps = [
    {
      status: DEPENDENCY_STATUS.NOT_STARTED,
      label: 'Not Started',
      description: 'Ready to begin',
      icon: Circle,
      gradient: 'from-gray-400 to-gray-500',
      activeColor: 'text-gray-600'
    },
    {
      status: DEPENDENCY_STATUS.IN_PROGRESS,
      label: 'In Progress',
      description: 'Working on it',
      icon: Play,
      gradient: 'from-blue-500 to-indigo-600',
      activeColor: 'text-blue-600'
    },
    {
      status: DEPENDENCY_STATUS.COMPLETED,
      label: 'Completed',
      description: 'Task finished',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      activeColor: 'text-green-600'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  
  // Validate currentStepIndex
  if (currentStepIndex === -1) {
    console.warn('Invalid dependency status:', currentStatus);
    return <div className="text-red-600">Invalid task status</div>;
  }

  const isStepActive = (index) => index === currentStepIndex;
  const isStepCompleted = (index) => index < currentStepIndex;
  const isStepClickable = (index) => {
    if (!canEdit) return false;
    // Can move forward or backward one step at a time
    return Math.abs(index - currentStepIndex) <= 1;
  };

  const handleStepClick = (step, index) => {
    if (!isStepClickable(index)) return;
    if (onStatusChange) {
      onStatusChange(step.status);
    }
  };

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute top-10 left-0 right-0 h-1 bg-gray-200 z-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = isStepActive(index);
          const isCompleted = isStepCompleted(index);
          const isClickable = isStepClickable(index);

          return (
            <div key={step.status} className="flex flex-col items-center flex-1 relative z-10">
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(step, index)}
                disabled={!isClickable}
                className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-r ${step.gradient} border-white shadow-2xl scale-110`
                    : isCompleted
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-200 shadow-lg'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                } ${isClickable && !isActive ? 'cursor-pointer hover:scale-105' : ''} ${
                  !isClickable ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                {/* Pulse Animation for Active Step */}
                {isActive && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-75 animate-ping" />
                )}

                {/* Icon */}
                <Icon
                  className={`w-8 h-8 relative z-10 ${
                    isActive || isCompleted ? 'text-white' : 'text-gray-400'
                  }`}
                />

                {/* Step Number Badge */}
                <div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
              </button>

              {/* Step Label */}
              <div className="mt-4 text-center">
                <p
                  className={`text-sm font-bold ${
                    isActive ? step.activeColor : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>

              {/* Status Indicator */}
              {isActive && (
                <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold animate-pulse">
                  Current
                </div>
              )}
              {isCompleted && (
                <div className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ✓ Done
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      {canEdit && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {currentStatus === DEPENDENCY_STATUS.NOT_STARTED && 'Click "In Progress" to start working on this task'}
            {currentStatus === DEPENDENCY_STATUS.IN_PROGRESS && 'Click "Completed" when you finish this task'}
            {currentStatus === DEPENDENCY_STATUS.COMPLETED && 'Great job! This dependency task is complete'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DependencyTaskJourney;
