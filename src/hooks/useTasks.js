import { useState, useEffect } from 'react';
import { db } from '../services/databaseService';
import { isTaskOverdue } from '../utils/helpers';

export const useTasks = (userId = null, role = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      let allTasks = await db.getTasks(userId, role);

      // Update overdue status
      allTasks = allTasks.map(task => {
        if (task.status !== 'completed' && isTaskOverdue(task.deadline, task.status)) {
          return { ...task, status: 'overdue' };
        }
        return task;
      });

      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [userId, role]);

  const addTask = async (task) => {
    try {
      const createdTask = await db.createTask(task);
      await loadTasks();
      return createdTask; // Return the created task with database-generated ID
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      await db.updateTask(taskId, updates);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await db.deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const getTaskById = (taskId) => {
    return tasks.find(t => t.id === taskId);
  };

  const refreshTasks = async () => {
    await loadTasks();
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    refreshTasks
  };
};
