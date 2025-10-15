import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { isTaskOverdue } from '../utils/helpers';

export const useTasks = (userId = null, role = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = () => {
    let allTasks = storage.getTasks();

    // Update overdue status
    allTasks = allTasks.map(task => {
      if (task.status !== 'completed' && isTaskOverdue(task.deadline, task.status)) {
        return { ...task, status: 'overdue' };
      }
      return task;
    });

    // Filter by user if userId is provided
    if (userId && role === 'employee') {
      allTasks = allTasks.filter(task => task.assignedTo === userId);
    }

    setTasks(allTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [userId, role]);

  const addTask = (task) => {
    storage.addTask(task);
    loadTasks();
  };

  const updateTask = (taskId, updates) => {
    storage.updateTask(taskId, updates);
    loadTasks();
  };

  const deleteTask = (taskId) => {
    storage.deleteTask(taskId);
    loadTasks();
  };

  const getTaskById = (taskId) => {
    return tasks.find(t => t.id === taskId);
  };

  const refreshTasks = () => {
    loadTasks();
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
