import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { eventBus } from '../utils/eventBus';

export const useTaskComments = (taskId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [error, setError] = useState(null);

  const loadComments = useCallback(() => {
    if (!taskId) {
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      const allComments = storage.getTaskComments(taskId);
      // Filter out any invalid comments
      const validComments = (allComments || []).filter(c => c && c.id && (c.text || c.content));
      setComments(validComments);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error loading comments:', err);
      setComments([]);
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    // Initial load
    loadComments();

    // Set up event subscriptions
    const subscriptions = [
      // Comment updates
      eventBus.subscribe(`taskComments:${taskId}`, () => {
        loadComments();
      }),
      
      // Typing indicators
      eventBus.subscribe(`typing:${taskId}`, ({ typingUsers: users }) => {
        setTypingUsers(users);
      }),
      
      // User presence
      eventBus.subscribe('userPresence', ({ onlineUsers: users }) => {
        setOnlineUsers(new Set(users));
      }),
      
      // Connection status
      eventBus.subscribe('connectionStatus', ({ isOnline }) => {
        if (!isOnline) {
          setError('You are currently offline. Comments will sync when connection is restored.');
        } else {
          setError(null);
          loadComments(); // Reload comments when connection is restored
        }
      }),
      
      // Retry failures
      eventBus.subscribe('retryFailed', ({ event }) => {
        if (event.startsWith(`taskComments:${taskId}`)) {
          setError('Failed to sync some comments. Please try again.');
        }
      })
    ];

    // Poll for updates every 3 seconds as fallback
    const pollInterval = setInterval(() => {
      if (navigator.onLine) {
        loadComments();
      }
    }, 3000);

    // Cleanup
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      clearInterval(pollInterval);
      eventBus.clearTask(taskId);
    };
  }, [taskId, loadComments]);

  const addComment = (commentData) => {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      text: commentData.text,
      authorId: commentData.authorId,
      authorName: commentData.authorName,
      authorRole: commentData.authorRole,
      type: commentData.type || 'comment', // comment, blocker, status_change, mention
      mentions: commentData.mentions || [], // Array of user IDs that are @mentioned
      metadata: commentData.metadata || {}, // For blocker details, status changes, etc.
      createdAt: new Date().toISOString(),
      edited: false,
      editedAt: null
    };

    storage.addTaskComment(newComment);
    loadComments();
    // Notify all subscribers about the new comment
    eventBus.publish(`taskComments:${taskId}`, { type: 'add', comment: newComment });

    // Create notifications for mentioned users
    if (newComment.mentions && newComment.mentions.length > 0) {
      newComment.mentions.forEach(userId => {
        storage.addNotification({
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type: 'mention',
          taskId,
          commentId: newComment.id,
          message: `${commentData.authorName} mentioned you in a task comment`,
          read: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    // Create notification for blocker
    if (newComment.type === 'blocker' && commentData.notifyUserId) {
      storage.addNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: commentData.notifyUserId,
        type: 'blocker',
        taskId,
        commentId: newComment.id,
        message: `${commentData.authorName} reported a blocker on task`,
        read: false,
        createdAt: new Date().toISOString()
      });
    }

    return newComment;
  };

  const updateComment = (commentId, updates) => {
    const updatedComment = {
      ...updates,
      edited: true,
      editedAt: new Date().toISOString()
    };
    storage.updateTaskComment(commentId, updatedComment);
    loadComments();
    eventBus.publish(`taskComments:${taskId}`, { type: 'update', comment: updatedComment });
  };

  const deleteComment = (commentId) => {
    storage.deleteTaskComment(commentId);
    loadComments();
    eventBus.publish(`taskComments:${taskId}`, { type: 'delete', commentId });
  };

  const getCommentById = (commentId) => {
    return comments.find(c => c.id === commentId);
  };

  const refreshComments = () => {
    loadComments();
  };

  // Typing indicator handler
  const setTyping = useCallback((userId, isTyping) => {
    eventBus.setUserTyping(taskId, userId, isTyping);
  }, [taskId]);

  // Read receipt handler
  const markAsRead = useCallback((commentId, userId) => {
    eventBus.markCommentAsRead(commentId, userId);
  }, []);

  // Reaction handler
  const toggleReaction = useCallback((commentId, userId, reaction) => {
    eventBus.toggleReaction(commentId, userId, reaction);
  }, []);

  // Get read status
  const getReadStatus = useCallback((commentId) => {
    return eventBus.getReadReceipts(commentId);
  }, []);

  // Get reactions
  const getReactions = useCallback((commentId) => {
    return eventBus.getReactions(commentId);
  }, []);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return eventBus.isUserOnline(userId);
  }, []);

  return {
    comments,
    loading,
    error,
    typingUsers,
    onlineUsers,
    addComment,
    updateComment,
    deleteComment,
    getCommentById,
    refreshComments,
    setTyping,
    markAsRead,
    toggleReaction,
    getReadStatus,
    getReactions,
    isUserOnline
  };
};

// Hook for user notifications
export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    const allNotifications = storage.getNotifications(userId);
    setNotifications(allNotifications);
    setUnreadCount(allNotifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const markAsRead = (notificationId) => {
    storage.markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        storage.markNotificationAsRead(n.id);
      }
    });
    loadNotifications();
  };

  const deleteNotification = (notificationId) => {
    storage.deleteNotification(notificationId);
    loadNotifications();
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: loadNotifications
  };
};
