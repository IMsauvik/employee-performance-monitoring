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

      // Recursive function to flatten all nested feedback
      const flattenFeedback = (data, depth = 0) => {
        if (depth > 20) {
          console.warn('⚠️ Max recursion depth reached, stopping parse');
          return [];
        }

        if (!data) return [];
        
        // If it's a string, try to parse it
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            return flattenFeedback(parsed, depth + 1);
          } catch {
            // Plain string - wrap as feedback item
            return [{
              id: `feedback-legacy-${Date.now()}-${depth}`,
              text: data,
              timestamp: task.updatedAt || new Date().toISOString(),
              authorId: task.assignedBy || 'unknown',
              authorName: 'Manager'
            }];
          }
        }
        
        // If it's an array, process each item
        if (Array.isArray(data)) {
          const results = [];
          for (const item of data) {
            if (!item) continue;
            
            if (typeof item === 'string') {
              // Check if it's a stringified array/object
              try {
                const parsed = JSON.parse(item);
                results.push(...flattenFeedback(parsed, depth + 1));
              } catch {
                // Plain string
                results.push({
                  id: `feedback-legacy-${Date.now()}-${results.length}`,
                  text: item,
                  timestamp: task.updatedAt || new Date().toISOString(),
                  authorId: task.assignedBy || 'unknown',
                  authorName: 'Manager'
                });
              }
            } else if (typeof item === 'object' && item !== null) {
              // Check if it has nested 'text' that's stringified
              if (item.text && typeof item.text === 'string' && item.text.startsWith('[')) {
                try {
                  const parsed = JSON.parse(item.text);
                  results.push(...flattenFeedback(parsed, depth + 1));
                } catch {
                  // Not parseable, use as-is
                  results.push(item);
                }
              } else {
                // Regular feedback object
                results.push(item);
              }
            }
          }
          return results;
        }
        
        // Single object
        if (typeof data === 'object' && data !== null) {
          return [data];
        }
        
        return [];
      };

      // Ensure managerFeedback is always an array
      let feedbackArray = [];
      try {
        console.log('🔍 Raw managerFeedback from DB:', task.managerFeedback);
        feedbackArray = flattenFeedback(task.managerFeedback);
        
        // Sort by timestamp (oldest first)
        feedbackArray.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeA - timeB;
        });
        
        console.log('✅ Flattened feedback count:', feedbackArray.length);
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

      // Get existing feedback as clean array (no nested stringification)
      let existingFeedback = [];
      
      // Recursive function to flatten all nested feedback
      const flattenFeedback = (data, depth = 0) => {
        if (depth > 20) return [];
        if (!data) return [];
        
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            return flattenFeedback(parsed, depth + 1);
          } catch {
            return [{
              id: `feedback-legacy-${Date.now()}-${depth}`,
              text: data,
              timestamp: task.updatedAt || new Date().toISOString(),
              authorId: task.assignedBy || 'unknown',
              authorName: 'Manager'
            }];
          }
        }
        
        if (Array.isArray(data)) {
          const results = [];
          for (const item of data) {
            if (!item) continue;
            
            if (typeof item === 'string') {
              try {
                const parsed = JSON.parse(item);
                results.push(...flattenFeedback(parsed, depth + 1));
              } catch {
                results.push({
                  id: `feedback-legacy-${Date.now()}-${results.length}`,
                  text: item,
                  timestamp: task.updatedAt || new Date().toISOString(),
                  authorId: task.assignedBy || 'unknown',
                  authorName: 'Manager'
                });
              }
            } else if (typeof item === 'object' && item !== null) {
              if (item.text && typeof item.text === 'string' && item.text.startsWith('[')) {
                try {
                  const parsed = JSON.parse(item.text);
                  results.push(...flattenFeedback(parsed, depth + 1));
                } catch {
                  results.push(item);
                }
              } else {
                results.push(item);
              }
            }
          }
          return results;
        }
        
        if (typeof data === 'object' && data !== null) {
          return [data];
        }
        
        return [];
      };

      existingFeedback = flattenFeedback(task.managerFeedback);

      // Create clean feedback array with new item
      const updatedFeedback = [...existingFeedback, newFeedback];
      
      // Update database - Supabase will handle JSONB conversion properly
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
