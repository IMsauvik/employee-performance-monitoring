import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/databaseService';
import { eventBus } from '../utils/eventBus';

export const useTaskDiscussion = (taskId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const taskComments = await db.getTaskComments(taskId);
      setComments(taskComments || []);
      setError(null);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addComment = useCallback(async (commentData) => {
    try {
      const newComment = {
        taskId,
        userId: commentData.authorId,
        comment: commentData.text,
        mentions: commentData.mentions || [],
        attachments: [],
        reactions: {},
        isEdited: false,
        createdAt: new Date().toISOString()
      };

      const createdComment = await db.addTaskComment(newComment);
      
      // Notify subscribers about the new comment
      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'add',
        comment: createdComment
      });

      // Handle mentions and notifications
      if (commentData.mentions?.length > 0) {
        for (const userId of commentData.mentions) {
          await db.createNotification({
            userId,
            type: 'mention',
            message: `${commentData.authorName} mentioned you in a comment`,
            link: `/tasks/${taskId}`,
            metadata: {
              taskId,
              commentId: createdComment.id,
              authorName: commentData.authorName
            }
          });
          eventBus.publish(`notification:${userId}`, {
            type: 'mention',
            taskId,
            commentId: createdComment.id
          });
        }
      }

      await loadComments();
      return createdComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }, [taskId, loadComments]);

  const updateComment = useCallback(async (commentId, updates) => {
    try {
      const updatedComment = await db.updateTaskComment(commentId, {
        ...updates,
        isEdited: true,
        editedAt: new Date().toISOString()
      });

      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'update',
        commentId,
        updates: updatedComment
      });

      await loadComments();
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [taskId, loadComments]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await db.deleteTaskComment(commentId);
      eventBus.publish(`taskDiscussion:${taskId}`, {
        type: 'delete',
        commentId
      });
      await loadComments();
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
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        eventBus.publish(`taskDiscussion:${taskId}:typing`, {
          userId: currentUser.id,
          isTyping: false
        });
      }
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
