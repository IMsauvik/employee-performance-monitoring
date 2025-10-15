import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { eventBus } from '../utils/eventBus';

export const useTaskDiscussion = (taskId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const loadComments = useCallback(() => {
    try {
      setLoading(true);
      const taskComments = storage.getTaskComments(taskId) || [];
      setComments(taskComments);
      setError(null);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addComment = useCallback((commentData) => {
    try {
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        taskId,
        text: commentData.text,
        authorId: commentData.authorId,
        authorName: commentData.authorName,
        authorRole: commentData.authorRole,
        type: commentData.type || 'comment',
        mentions: commentData.mentions || [],
        metadata: commentData.metadata || {},
        createdAt: new Date().toISOString(),
        edited: false,
        editedAt: null
      };

      storage.addTaskComment(newComment);
      
      // Notify subscribers about the new comment
      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'add',
        comment: newComment
      });

      // Handle mentions and notifications
      if (newComment.mentions?.length > 0) {
        newComment.mentions.forEach(userId => {
          const notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: 'mention',
            taskId,
            commentId: newComment.id,
            message: `${commentData.authorName} mentioned you in a comment`,
            read: false,
            createdAt: new Date().toISOString()
          };
          storage.addNotification(notification);
          eventBus.publish(`notification:${userId}`, notification);
        });
      }

      loadComments();
      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [taskId, loadComments]);

  const updateComment = useCallback((commentId, updates) => {
    try {
      const updatedComment = {
        ...updates,
        edited: true,
        editedAt: new Date().toISOString()
      };

      storage.updateTaskComment(commentId, updatedComment);
      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'update',
        commentId,
        updates: updatedComment
      });

      loadComments();
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [taskId, loadComments]);

  const deleteComment = useCallback((commentId) => {
    try {
      storage.deleteTaskComment(commentId);
      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'delete',
        commentId
      });
      loadComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [taskId, loadComments]);

  const setTyping = useCallback((userId, isTyping) => {
    eventBus.publish(`taskDiscussion:${taskId}:typing`, {
      userId,
      isTyping
    });
  }, [taskId]);

  useEffect(() => {
    loadComments();

    const subscriptions = [
      // Listen for comment updates
      eventBus.subscribe(`taskDiscussion:${taskId}`, ({ type, comment, commentId, updates }) => {
        if (type === 'add') {
          setComments(prev => [...prev, comment]);
        } else if (type === 'update') {
          setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, ...updates } : c
          ));
        } else if (type === 'delete') {
          setComments(prev => prev.filter(c => c.id !== commentId));
        }
      }),

      // Listen for typing indicators
      eventBus.subscribe(`taskDiscussion:${taskId}:typing`, ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!isTyping) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });

        // Auto-clear typing indicator after 5 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== userId));
          }, 5000);
        }
      })
    ];

    // Poll for updates every 10 seconds as fallback
    const pollInterval = setInterval(loadComments, 10000);

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      clearInterval(pollInterval);
      // Clear typing indicators when unmounting
      eventBus.publish(`taskDiscussion:${taskId}:typing`, {
        userId: storage.getCurrentUser().id,
        isTyping: false
      });
    };
  }, [taskId, loadComments]);

  return {
    comments,
    loading,
    error,
    typingUsers,
    addComment,
    updateComment,
    deleteComment,
    setTyping,
    refresh: loadComments
  };
};