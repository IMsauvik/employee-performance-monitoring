import { useState, useEffect } from 'react';
import { db } from '../services/databaseService';

export const useGoals = (userId = null, role = null) => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (userId && role) {
      loadGoals();
    }
  }, [userId, role]);

  const loadGoals = async () => {
    try {
      const allGoals = await db.getGoals(userId, role);
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const newGoal = await db.createGoal(goalData);
      await loadGoals();
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      await db.updateGoal(goalId, updates);
      await loadGoals();
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await db.deleteGoal(goalId);
      await loadGoals();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  const addCheckIn = async (goalId, checkInData) => {
    try {
      await db.addGoalCheckIn(goalId, checkInData);
      await loadGoals();
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
