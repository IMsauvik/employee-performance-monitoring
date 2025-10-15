import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { initializeDemoData } from '../data/demoData';
import { logActivity, ActivityTypes } from '../utils/activityLogger';
import db from '../services/databaseService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize demo data
    initializeDemoData();

    // Check for existing session
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Verify credentials against database
      const user = await db.verifyPassword(email, password);

      if (user) {
        // Don't store password_hash in session
        const { password_hash: _, ...userWithoutPassword } = user;
        storage.setCurrentUser(userWithoutPassword);
        setCurrentUser(userWithoutPassword);

        // Log activity
        logActivity(
          ActivityTypes.USER_LOGIN,
          { email: user.email },
          user.id,
          user.name
        );

        return { success: true, user: userWithoutPassword };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    if (currentUser) {
      // Log activity before logout
      logActivity(
        ActivityTypes.USER_LOGOUT,
        { email: currentUser.email },
        currentUser.id,
        currentUser.name
      );
    }

    storage.logout();
    setCurrentUser(null);
  };

  const isAdmin = () => currentUser?.role === 'admin';
  const isManager = () => currentUser?.role === 'manager';
  const isEmployee = () => currentUser?.role === 'employee';

  const value = {
    currentUser,
    login,
    logout,
    isAdmin,
    isManager,
    isEmployee,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
