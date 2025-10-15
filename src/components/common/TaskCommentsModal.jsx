import { useState, useRef, useEffect } from 'react';
import {
  X, Send, AlertTriangle, AtSign, User,
  Wifi, WifiOff, Smile, Loader, Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTaskComments } from '../../hooks/useTaskComments';
import { db } from '../../services/databaseService';
import { storage } from '../../utils/storage';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { GroupedReactions, ReactionPicker } from './Reactions';
import { TypingIndicator, ReadReceipts } from './TypingIndicator';

const TaskCommentsModal = ({ task, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { 
    comments, 
    loading,
    error,
    typingUsers,
    onlineUsers,
    addComment,
    deleteComment,
    toggleReaction,
    getReactions,
    getReadStatus,
    setTyping,
    markAsRead
  } = useTaskComments(task?.id);

  const [commentText, setCommentText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const textareaRef = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Network status tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      if (isOpen) {
        const users = await db.getUsers();
        setAllUsers(users || []);
      }
    };
    loadUsers();
  }, [isOpen]);

  // Handle text change with typing indicator and mention detection
  const handleTextChange = (e) => {
    const text = e.target.value;
    const position = e.target.selectionStart;

    setCommentText(text);
    setCursorPosition(position);
    setTyping(currentUser.id, text.length > 0);

    // Check for @ mention
    const textBeforeCursor = text.substring(0, position);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch('');
    }
  };

  // Insert mention
  const insertMention = (user) => {
    const textBeforeCursor = commentText.substring(0, cursorPosition);
    const textAfterCursor = commentText.substring(cursorPosition);

    // Remove the @ and partial search text
    const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
    const newText = `${beforeMention}@${user.name} ${textAfterCursor}`;

    setCommentText(newText);
    setShowMentionDropdown(false);
    setMentionSearch('');

    // Add user to mentioned list if not already there
    if (!mentionedUsers.includes(user.id)) {
      setMentionedUsers([...mentionedUsers, user.id]);
    }

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = beforeMention.length + user.name.length + 2;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Filter users for mention dropdown
  const filteredUsers = allUsers.filter(user =>
    user.id !== currentUser.id &&
    (user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
     (user.username && user.username.toLowerCase().includes(mentionSearch.toLowerCase())))
  ).slice(0, 5);

  // Send comment
  const handleSendComment = async () => {
    if (!commentText.trim() || !isOnline) return;

    // Check if comment mentions a blocker
    const isBlockerComment = commentText.toLowerCase().includes('blocker') || 
                            commentText.toLowerCase().includes('blocked') ||
                            commentText.toLowerCase().includes('blocking');

    const newComment = addComment({
      text: commentText.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      mentions: mentionedUsers,
      type: isBlockerComment ? 'blocker' : 'comment'
    });

    if (newComment) {
      // Add activity to task timeline if it's a blocker mention
      if (isBlockerComment && mentionedUsers.length > 0) {
        const taskToUpdate = await db.getTaskById(task.id);
        if (taskToUpdate) {
          const now = new Date().toISOString();
          const activity = {
            id: `activity-${Date.now()}`,
            type: 'BLOCKER_ADDED',
            title: 'Blocker Mentioned',
            description: commentText.trim(),
            timestamp: now,
            userName: currentUser.name,
            userId: currentUser.id,
            metadata: {
              mentions: mentionedUsers,
              isBlocker: true
            }
          };

          const updatedTimeline = [...(taskToUpdate.activityTimeline || []), activity];
          await db.updateTask(task.id, { activityTimeline: updatedTimeline });
        }
      }

      // Send notifications to mentioned users
      if (mentionedUsers.length > 0) {
        const now = new Date().toISOString();
        for (const userId of mentionedUsers) {
          await db.createNotification({
            userId: userId,
            type: isBlockerComment ? 'blocker_mention' : 'task_mention',
            taskId: task.id,
            message: isBlockerComment 
              ? `${currentUser.name} mentioned you in a BLOCKER on "${task.taskName}"`
              : `${currentUser.name} mentioned you in a comment on "${task.taskName}"`,
            read: false,
            createdAt: now,
            metadata: {
              taskName: task.taskName,
              mentionedBy: currentUser.name,
              comment: commentText.trim(),
              isBlocker: isBlockerComment
            }
          });
        }
        toast.success(isBlockerComment 
          ? `Blocker reported and ${mentionedUsers.length} ${mentionedUsers.length === 1 ? 'person' : 'people'} notified`
          : `Comment added and ${mentionedUsers.length} ${mentionedUsers.length === 1 ? 'person' : 'people'} notified`
        );
      } else {
        toast.success('Comment added successfully');
      }

      setCommentText('');
      setMentionedUsers([]);
      setTyping(currentUser.id, false);
    }
  };

  // Delete comment
  const handleDeleteComment = (commentId) => {
    if (!isOnline) {
      toast.error('You are offline. Please try again when connected.');
      return;
    }

    deleteComment(commentId);
    toast.success('Comment deleted successfully');
  };

  if (!isOpen || !task) return null;

  // Safety check for task properties
  if (!task.id) {
    console.error('Invalid task object:', task);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Task Comments
              </h3>
              {/* Online Status */}
              {isOnline ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Wifi className="w-4 h-4" />
                  <span>Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && (
            <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <>
              <TypingIndicator 
                users={typingUsers.map(id => allUsers.find(u => u.id === id)?.name || 'Someone')}
                currentUserId={currentUser.id}
              />
              
              {comments.filter(comment => comment && comment.id).map(comment => {
                const isBlocker = comment.type === 'blocker';
                const author = allUsers.find(u => u.id === comment.authorId);
                const avatarColor = author?.role === 'manager' ? 'bg-purple-500' : author?.role === 'admin' ? 'bg-red-500' : 'bg-indigo-500';
                const getInitials = (name) => {
                  if (!name) return '?';
                  const parts = name.split(' ');
                  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2);
                };

                return (
                <div
                  key={comment.id}
                  className={`mb-4 last:mb-0 p-4 rounded-lg transition-all hover:shadow-md ${
                    isBlocker
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 ring-2 ring-orange-200 ring-opacity-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => markAsRead(comment.id, currentUser.id)}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {getInitials(comment.authorName)}
                        </div>
                        {onlineUsers.has(comment.authorId) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                        )}
                        {isBlocker && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center ring-2 ring-white">
                            <Ban className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">
                            {comment.authorName}
                          </span>
                          {author?.role && (
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              author.role === 'manager' ? 'bg-purple-100 text-purple-700' :
                              author.role === 'admin' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {author.role}
                            </span>
                          )}
                          {isBlocker && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-600 text-white flex items-center gap-1 animate-pulse">
                              <Ban className="w-3 h-3" />
                              BLOCKER
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {comment.edited && (
                            <span className="text-xs text-gray-400">
                              (edited)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Reaction Picker */}
                          <div className="relative">
                            <button
                              onClick={() => setShowReactionPicker(
                                showReactionPicker === comment.id ? null : comment.id
                              )}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                              <Smile className="w-4 h-4" />
                            </button>
                            {showReactionPicker === comment.id && (
                              <ReactionPicker
                                onSelect={(reaction) => {
                                  toggleReaction(comment.id, currentUser.id, reaction);
                                  setShowReactionPicker(null);
                                }}
                              />
                            )}
                          </div>

                          {/* Delete Button */}
                          {(currentUser.id === comment.authorId || currentUser.role === 'manager') && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment Text */}
                      <p className="mt-1 text-gray-700">
                        {((comment.text || comment.content || '') + '').split(/(@\w+)/).map((part, index) => {
                          if (part && part.startsWith('@')) {
                            return (
                              <span
                                key={index}
                                className={isBlocker 
                                  ? "bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-md"
                                  : "bg-indigo-100 text-indigo-700 px-1 rounded font-medium"
                                }
                              >
                                {part}
                              </span>
                            );
                          }
                          return <span key={index}>{part}</span>;
                        })}
                      </p>

                      {/* Show Mentioned Users */}
                      {comment.mentions && comment.mentions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {comment.mentions.map(userId => {
                            const user = allUsers.find(u => u.id === userId);
                            return user ? (
                              <div
                                key={userId}
                                className={isBlocker
                                  ? "inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold shadow-lg ring-2 ring-red-300 animate-pulse"
                                  : "inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs"
                                }
                              >
                                {isBlocker && <span>🔴</span>}
                                <AtSign className="w-3 h-3" />
                                <span>{user.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Reactions */}
                      <div className="mt-2">
                        <GroupedReactions
                          reactions={getReactions(comment.id)}
                          currentUserId={currentUser.id}
                          onToggle={(reaction) => toggleReaction(comment.id, currentUser.id, reaction)}
                          size="small"
                        />
                      </div>

                      {/* Read Receipts */}
                      <div className="mt-2">
                        <ReadReceipts
                          readers={getReadStatus(comment.id)}
                          currentUserId={currentUser.id}
                          timestamp={comment.lastReadAt}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={handleTextChange}
                onKeyDown={(e) => {
                  if (showMentionDropdown) {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      return;
                    }
                    if (e.key === 'Escape') {
                      setShowMentionDropdown(false);
                      return;
                    }
                  }
                  if (e.key === 'Enter' && !e.shiftKey && !showMentionDropdown) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder={
                  isOnline
                    ? "Write a comment... Type @ to mention someone (Press Enter to send)"
                    : "You are offline. Comments will sync when connected."
                }
                className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                  isOnline
                    ? 'border-gray-300 focus:ring-indigo-500'
                    : 'border-red-300 focus:ring-red-500 bg-red-50'
                }`}
                rows={3}
                disabled={!isOnline}
              />

              {/* Mention Dropdown */}
              {showMentionDropdown && filteredUsers.length > 0 && (
                <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 px-2 py-1 flex items-center gap-1">
                      <AtSign className="w-3 h-3" />
                      <span>Mention someone</span>
                    </div>
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => insertMention(user)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-indigo-50 flex items-center gap-2 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.role} • {user.email}</p>
                        </div>
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100">
                          <AtSign className="w-4 h-4 text-indigo-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentioned Users Pills */}
              {mentionedUsers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentionedUsers.map(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    return user ? (
                      <div
                        key={userId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                      >
                        <AtSign className="w-3 h-3" />
                        <span>{user.name}</span>
                        <button
                          onClick={() => setMentionedUsers(mentionedUsers.filter(id => id !== userId))}
                          className="ml-1 hover:text-indigo-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim() || !isOnline}
              className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-lg ${
                !commentText.trim() || !isOnline
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCommentsModal;