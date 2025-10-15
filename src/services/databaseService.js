import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

// Browser-compatible bcrypt
const bcryptCompare = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Bcrypt compare error:', error);
    return false;
  }
};

const bcryptHash = async (password, rounds = 10) => {
  try {
    return await bcrypt.hash(password, rounds);
  } catch (error) {
    console.error('Bcrypt hash error:', error);
    throw error;
  }
};

// Database service to replace localStorage
export const db = {
  // ==================== USERS ====================
  
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  async createUser(userData) {
    try {
      // Hash the password
      const hashedPassword = await bcryptHash(userData.password);
      
      const newUser = {
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: userData.role || 'employee',
        department: userData.department,
        position: userData.position || '',
        phone: userData.phone || '',
        address: userData.address || '',
        is_active: true
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async updateUser(id, updates) {
    try {
      // If password is being updated, hash it
      if (updates.password) {
        updates.password_hash = await bcryptHash(updates.password);
        delete updates.password;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async verifyPassword(email, password) {
    try {
      console.log('Verifying password for:', email);
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        console.log('User not found:', email);
        return null;
      }

      console.log('User found, comparing password...');
      const isValid = await bcryptCompare(password, user.password_hash);
      console.log('Password valid:', isValid);
      
      if (!isValid) return null;

      return user;
    } catch (error) {
      console.error('Error verifying password:', error);
      return null;
    }
  },

  async updateUser(id, updates) {
    try {
      // If password is being updated, hash it
      if (updates.password) {
        updates.password_hash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      // Soft delete - set is_active to false
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async verifyPassword(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) return null;

      return user;
    } catch (error) {
      console.error('Error verifying password:', error);
      return null;
    }
  },

  // ==================== TASKS ====================
  
  async getTasks(userId, role) {
    try {
      let query = supabase
        .from('tasks')
        .select('*');

      if (role === 'employee') {
        query = query.eq('assigned_to', userId);
      } else if (role === 'manager') {
        query = query.or(`assigned_by.eq.${userId},assigned_to.eq.${userId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  async getTaskById(id) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },

  async createTask(taskData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(id, updates) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(id) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // ==================== GOALS ====================
  
  async getGoals(userId, role) {
    try {
      let query = supabase
        .from('goals')
        .select('*');

      if (role === 'employee') {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  async createGoal(goalData) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([goalData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async updateGoal(id, updates) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(id) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // ==================== NOTIFICATIONS ====================
  
  async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markNotificationAsRead(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async deleteNotification(id) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // ==================== TASK COMMENTS ====================
  
  async getTaskComments(taskId) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async addTaskComment(commentData) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([commentData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async updateTaskComment(commentId, updates) {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .update(updates)
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  async deleteTaskComment(commentId) {
    try {
      const { error } = await supabase
        .from('task_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },

  // ==================== TASK DEPENDENCIES ====================
  
  async getDependencyTask(dependencyId) {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('id', dependencyId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dependency task:', error);
      return null;
    }
  },

  async createDependencyTask(dependencyData) {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert([dependencyData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating dependency task:', error);
      throw error;
    }
  },

  async updateDependencyTask(dependencyId, updates) {
    try {
      const { data, error} = await supabase
        .from('task_dependencies')
        .update(updates)
        .eq('id', dependencyId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating dependency task:', error);
      throw error;
    }
  },

  async deleteDependencyTask(dependencyId) {
    try {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting dependency task:', error);
      return false;
    }
  },

  async getDependenciesForTask(taskId) {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching dependencies for task:', error);
      return [];
    }
  },
};

export default db;
