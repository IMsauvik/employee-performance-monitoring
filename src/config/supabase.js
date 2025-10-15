import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async getUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Task operations
  async getTasks(userId, role) {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey(id, name, email, avatar_url),
        assigned_by_user:users!tasks_assigned_by_fkey(id, name, email)
      `);

    if (role === 'employee') {
      query = query.eq('assigned_to', userId);
    } else if (role === 'manager') {
      query = query.or(`assigned_by.eq.${userId},assigned_to.eq.${userId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
  },

  // Task comments
  async getTaskComments(taskId) {
    const { data, error } = await supabase
      .from('task_comments')
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async addTaskComment(commentData) {
    const { data, error } = await supabase
      .from('task_comments')
      .insert([commentData])
      .select(`
        *,
        user:users(id, name, email, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Goals operations
  async getGoals(userId, role) {
    let query = supabase
      .from('goals')
      .select(`
        *,
        user:users(id, name, email),
        created_by_user:users!goals_created_by_fkey(id, name, email)
      `);

    if (role === 'employee') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createGoal(goalData) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goalData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateGoal(goalId, updates) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Notifications
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  // Activity logging
  async logActivity(activityData) {
    const { error } = await supabase
      .from('activity_log')
      .insert([activityData]);
    
    if (error) console.error('Error logging activity:', error);
  },

  // File upload to Supabase Storage
  async uploadFile(bucket, filePath, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  },

  // Get file URL
  async getFileUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  },

  // Delete file
  async deleteFile(bucket, filePath) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
  },
};

export default supabase;
