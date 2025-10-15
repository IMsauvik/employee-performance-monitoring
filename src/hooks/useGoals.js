import { useState, useEffect } from 'react';
import { initializeGoalsData } from '../data/goalsData';

export const useGoals = (userId = null, role = null) => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    try {
      if (!localStorage.getItem('goals')) {
        initializeGoalsData();
      }
      if (userId && role) {
        loadGoals();
      }
    } catch (error) {
      console.error('Error in useGoals effect:', error);
      setGoals([]);
    }
  }, [userId, role]);

  const loadGoals = () => {
    try {
      const storedGoals = localStorage.getItem('goals');
      const allGoals = storedGoals ? JSON.parse(storedGoals) : [];

      let filteredGoals = allGoals;

      // Filter based on user role and ID
      if (userId && role === 'employee') {
        filteredGoals = allGoals.filter(
          goal => goal.assignedTo.includes(userId) || goal.owner === userId
        );
      } else if (userId && role === 'manager') {
        // Managers should see all team and company goals, plus their own
        filteredGoals = allGoals.filter(
          goal =>
            goal.owner === userId ||
            goal.assignedTo.includes(userId) ||
            goal.level === 'team' ||
            goal.level === 'company' ||
            (goal.owner && goal.owner.toString().startsWith('emp-')) // Show goals owned by employees
        );
      }
      // Admin sees all goals

      setGoals(filteredGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    }
  };

  const addGoal = (goalData) => {
    try {
      const storedGoals = localStorage.getItem('goals');
      const allGoals = storedGoals ? JSON.parse(storedGoals) : [];

      const newGoal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        createdAt: new Date().toISOString(),
        checkIns: [],
        progress: 0
      };

      allGoals.push(newGoal);
      localStorage.setItem('goals', JSON.stringify(allGoals));
      loadGoals();
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  };

  const updateGoal = (goalId, updates) => {
    try {
      const storedGoals = localStorage.getItem('goals');
      const allGoals = storedGoals ? JSON.parse(storedGoals) : [];

      const updatedGoals = allGoals.map(goal =>
        goal.id === goalId
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      );

      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      loadGoals();
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  };

  const deleteGoal = (goalId) => {
    try {
      const storedGoals = localStorage.getItem('goals');
      const allGoals = storedGoals ? JSON.parse(storedGoals) : [];

      const filteredGoals = allGoals.filter(goal => goal.id !== goalId);

      localStorage.setItem('goals', JSON.stringify(filteredGoals));
      loadGoals();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  const addCheckIn = (goalId, checkInData) => {
    try {
      const storedGoals = localStorage.getItem('goals');
      const allGoals = storedGoals ? JSON.parse(storedGoals) : [];

      const updatedGoals = allGoals.map(goal => {
        if (goal.id === goalId) {
          const newCheckIn = {
            ...checkInData,
            id: `checkin-${Date.now()}`,
            date: new Date().toISOString()
          };

          return {
            ...goal,
            checkIns: [...(goal.checkIns || []), newCheckIn],
            progress: checkInData.progress,
            updatedAt: new Date().toISOString()
          };
        }
        return goal;
      });

      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      loadGoals();
      return true;
    } catch (error) {
      console.error('Error adding check-in:', error);
      return false;
    }
  };

  const getGoalById = (goalId) => {
    return goals.find(goal => goal.id === goalId);
  };

  const getChildGoals = (parentId) => {
    return goals.filter(goal => goal.parentGoal === parentId);
  };

  const getObjectives = () => {
    return goals.filter(goal => goal.type === 'objective');
  };

  const getKeyResults = (objectiveId) => {
    return goals.filter(goal => goal.parentGoal === objectiveId && goal.type === 'key_result');
  };

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addCheckIn,
    getGoalById,
    getChildGoals,
    getObjectives,
    getKeyResults,
    refreshGoals: loadGoals
  };
};
