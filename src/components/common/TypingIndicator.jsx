import { useEffect, useState } from 'react';

export const TypingIndicator = ({ users, currentUserId }) => {
  const [dots, setDots] = useState('');
  
  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Filter out current user and get display text
  const typingUsers = users.filter(id => id !== currentUserId);
  if (typingUsers.length === 0) return null;

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing`;
  } else {
    text = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <div className="flex items-center text-sm text-gray-500 italic">
      <div className="flex gap-1 items-center">
        <span>{text}</span>
        <span className="w-8">{dots}</span>
      </div>
    </div>
  );
};

export const ReadReceipts = ({ readers, currentUserId, timestamp }) => {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex -space-x-1">
        {readers
          .filter(id => id !== currentUserId)
          .map(userId => (
            <div
              key={userId}
              className="w-4 h-4 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
          ))}
      </div>
      {readers.length > 0 && (
        <span>
          Read {timestamp ? `· ${timestamp}` : ''}
        </span>
      )}
    </div>
  );
};