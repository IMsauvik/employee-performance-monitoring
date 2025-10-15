import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/databaseService';
import { eventBus } from '../utils/eventBus';

export const useTaskProgress = (taskId) => {
  const [progress, setProgress] = useState({
    feedback: [],
    history: [],
    loading: true,
    error: null
  });

  const loadProgress = useCallback(async () => {
    if (!taskId) {
      setProgress({
        feedback: [],
        history: [],
        loading: false,
        error: 'No task ID provided'
      });
      return;
    }

    try {
      const task = await db.getTaskById(taskId);
      if (!task) {
        setProgress({
          feedback: [],
          history: [],
          loading: false,
          error: null // Don't show error for missing tasks, just empty state
        });
        return;
      }

      // Ensure managerFeedback is always an array
      let feedbackArray = [];
      try {
        if (Array.isArray(task.managerFeedback)) {
          feedbackArray = task.managerFeedback;
        } else if (task.managerFeedback && typeof task.managerFeedback === 'object' && task.managerFeedback !== null) {
          // Single feedback object, convert to array
          feedbackArray = [task.managerFeedback];
        } else if (task.managerFeedback && typeof task.managerFeedback === 'string') {
          // Legacy string format, convert to new format
          feedbackArray = [{
            id: `feedback-legacy-${Date.now()}`,
            text: task.managerFeedback,
            timestamp: task.updatedAt || new Date().toISOString(),
            authorId: task.assignedBy || 'unknown',
            authorName: 'Manager'
          }];
        }
      } catch (feedbackError) {
        console.warn('Error parsing feedback, using empty array:', feedbackError);
        feedbackArray = [];
      }

      // Ensure progressHistory is always an array
      let historyArray = [];
      try {
        if (Array.isArray(task.progressHistory)) {
          historyArray = task.progressHistory;
        }
      } catch (historyError) {
        console.warn('Error parsing history, using empty array:', historyError);
        historyArray = [];
      }

      setProgress({
        feedback: feedbackArray,
        history: historyArray,
        loading: false,
        error: null
      });
    } catch (error) {
      let errorMsg = 'Failed to load task progress';
      console.error('Error loading task progress:', error, 'TaskID:', taskId);
      setProgress({
        feedback: [],
        history: [],
        loading: false,
        error: errorMsg
      });
    }
  }, [taskId]);

  const addFeedback = useCallback(async (feedback) => {
    try {
      const task = await db.getTaskById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Get current user from localStorage (auth context stores it there)
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        throw new Error('User not logged in');
      }

      const newFeedback = {
        id: `feedback-${Date.now()}`,
        text: feedback,
        timestamp: new Date().toISOString(),
        authorId: currentUser.id,
        authorName: currentUser.name
      };

      // Ensure managerFeedback is always an array
      let existingFeedback = [];
      if (Array.isArray(task.managerFeedback)) {
        existingFeedback = task.managerFeedback;
      } else if (task.managerFeedback && typeof task.managerFeedback === 'string') {
        // Legacy format - convert to new format
        existingFeedback = [{
          id: `feedback-legacy-${Date.now()}`,
          text: task.managerFeedback,
          timestamp: task.updatedAt || new Date().toISOString(),
          authorId: task.assignedBy
        }];
      } else if (task.managerFeedback && typeof task.managerFeedback === 'object') {
        existingFeedback = [task.managerFeedback];
      }

      const updatedFeedback = [...existingFeedback, newFeedback];
      await db.updateTask(taskId, { managerFeedback: updatedFeedback });

      // Update local state immediately
      setProgress(prev => ({
        ...prev,
        feedback: updatedFeedback
      }));

      // Notify subscribers
      eventBus.publish(`taskProgress:${taskId}`, {
        type: 'feedback',
        data: newFeedback
      });

      return newFeedback;
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }, [taskId]);

  const updateProgress = useCallback(async (progressUpdate) => {
    try {
      const task = await db.getTaskById(taskId);
      if (task) {
        const newProgress = {
          id: `progress-${Date.now()}`,
          ...progressUpdate,
          timestamp: new Date().toISOString()
        };

        const updatedHistory = [...(task.progressHistory || []), newProgress];
        await db.updateTask(taskId, { progressHistory: updatedHistory });
        
        // Notify subscribers
        eventBus.publish(`taskProgress:${taskId}`, {
          type: 'progress',
          data: newProgress
        });
        
        return newProgress;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }, [taskId]);

  useEffect(() => {
    loadProgress();

    // Subscribe to progress updates
    const unsubscribe = eventBus.subscribe(`taskProgress:${taskId}`, ({ type, data }) => {
      setProgress(prev => {
        if (type === 'feedback') {
          return {
            ...prev,
            feedback: [...prev.feedback, data]
          };
        } else if (type === 'progress') {
          return {
            ...prev,
            history: [...prev.history, data]
          };
        }
        return prev;
      });
    });

    // Poll for updates every 5 seconds
    const pollInterval = setInterval(loadProgress, 5000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [taskId, loadProgress]);

  return {
    ...progress,
    addFeedback,
    updateProgress,
    refresh: loadProgress
  };
};
