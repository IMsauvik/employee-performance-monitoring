export const REACTIONS = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  celebrate: { emoji: '🎉', label: 'Celebrate' },
  support: { emoji: '🙌', label: 'Support' },
  insightful: { emoji: '💡', label: 'Insightful' },
  curious: { emoji: '🤔', label: 'Curious' }
};

export const formatReactionCount = (count) => {
  if (count === 0) return '';
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

export const getReactionTooltip = (users, currentUserId) => {
  if (users.length === 0) return '';
  
  const otherUsers = users.filter(id => id !== currentUserId);
  if (users.includes(currentUserId)) {
    if (otherUsers.length === 0) return 'You';
    if (otherUsers.length === 1) return 'You and 1 other';
    return `You and ${otherUsers.length} others`;
  }
  
  return `${users.length} ${users.length === 1 ? 'person' : 'people'}`;
};

export const GroupedReactions = ({ reactions, currentUserId, onToggle, size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-6 px-1.5 text-xs',
    medium: 'h-8 px-2 text-sm',
    large: 'h-10 px-3 text-base'
  };

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(reactions).map(([type, users]) => {
        if (!users || users.length === 0) return null;
        
        const isActive = users.includes(currentUserId);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`
              inline-flex items-center gap-1 rounded-full
              ${sizeClasses[size]}
              ${isActive 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
              transition-colors duration-200
            `}
            title={getReactionTooltip(users, currentUserId)}
          >
            <span>{REACTIONS[type].emoji}</span>
            <span>{formatReactionCount(users.length)}</span>
          </button>
        );
      })}
    </div>
  );
};

export const ReactionPicker = ({ onSelect, position = 'bottom' }) => {
  return (
    <div className={`
      absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2
      ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
      right-0
    `}>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(REACTIONS).map(([type, { emoji, label }]) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
            title={label}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};