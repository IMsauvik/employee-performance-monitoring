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
export // Helper function to convert database snake_case to camelCase
const dbToTask = (dbTask) => {
  if (!dbTask) return null;
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    assignedTo: dbTask.assigned_to,
    assignedBy: dbTask.assigned_by,
    project: dbTask.project,
    vertical: dbTask.vertical,
    priority: dbTask.priority,
    status: dbTask.status,
    startDate: dbTask.start_date,
    dueDate: dbTask.due_date,
    deadline: dbTask.due_date, // Alias for compatibility
    completedDate: dbTask.completed_date,
    estimatedHours: dbTask.estimated_hours,
    actualHours: dbTask.actual_hours,
    tags: dbTask.tags || [],
    attachments: dbTask.attachments || [],
    createdAt: dbTask.created_at,
    updatedAt: dbTask.updated_at,
    poc: dbTask.poc,

    // Manager feedback and progress fields
    managerFeedback: dbTask.manager_feedback,
    feedbackHistory: dbTask.feedback_history || [],
    progressPercentage: dbTask.progress_percentage || 0,
    progressNotes: dbTask.progress_notes || [],

    // Review workflow fields
    reworkHistory: dbTask.rework_history || [],
    reworkCount: dbTask.rework_count || 0,
    qualityRating: dbTask.quality_rating,
    reviewedAt: dbTask.reviewed_at,
    reviewedBy: dbTask.reviewed_by,
    reviewedByName: dbTask.reviewed_by_name,
    acceptedDate: dbTask.accepted_date,
    submittedForReviewAt: dbTask.submitted_for_review_at,
    underReviewAt: dbTask.under_review_at,

    // Activity and timeline fields
    activityTimeline: dbTask.activity_timeline || [],
    blockerHistory: dbTask.blocker_history || [],
    dependencyTasks: dbTask.dependency_tasks || [],

    // Additional fields
    comments: dbTask.comments || [],
    reactions: dbTask.reactions || {},
    isBlocked: dbTask.is_blocked || false,
    blockedReason: dbTask.blocked_reason
  };
};

// Helper function to convert comment from database
const dbToComment = (dbComment) => {
  if (!dbComment) return null;
  return {
    id: dbComment.id,
    taskId: dbComment.task_id,
    userId: dbComment.user_id,
    comment: dbComment.comment,
    parentCommentId: dbComment.parent_comment_id,
    mentions: dbComment.mentions || [],
    attachments: dbComment.attachments || [],
    reactions: dbComment.reactions || {},
    isEdited: dbComment.is_edited || false,
    editedAt: dbComment.edited_at,
    createdAt: dbComment.created_at
  };
};

// Helper function to convert goal from database
const dbToGoal = (dbGoal) => {
  if (!dbGoal) return null;
  return {
    id: dbGoal.id,
    userId: dbGoal.user_id,
    title: dbGoal.title,
    description: dbGoal.description,
    category: dbGoal.category,
    targetValue: dbGoal.target_value,
    currentValue: dbGoal.current_value,
    unit: dbGoal.unit,
    startDate: dbGoal.start_date,
    endDate: dbGoal.end_date,
    status: dbGoal.status,
    priority: dbGoal.priority,
    createdBy: dbGoal.created_by,
    createdAt: dbGoal.created_at,
    updatedAt: dbGoal.updated_at
  };
};

// Helper function to convert notification from database
const dbToNotification = (dbNotif) => {
  if (!dbNotif) return null;
  return {
    id: dbNotif.id,
    userId: dbNotif.user_id,
    title: dbNotif.title,
    message: dbNotif.message,
    type: dbNotif.type,
    link: dbNotif.link,
    read: dbNotif.is_read || false,
    isRead: dbNotif.is_read || false, // Alias
    metadata: dbNotif.metadata || {},
    createdAt: dbNotif.created_at,
    readAt: dbNotif.read_at
  };
};

// Converter for dependency tasks from database snake_case to app camelCase
const dbToDependency = (dbDep) => {
  if (!dbDep) return null;
  return {
    id: dbDep.id,
    taskId: dbDep.task_id,
    dependsOnTaskId: dbDep.depends_on_task_id,
    dependencyType: dbDep.dependency_type,
    createdAt: dbDep.created_at
  };
};

// Converter for full dependency task objects (from dependency_tasks table)
const dbToDependencyTask = (dbDepTask) => {
  if (!dbDepTask) return null;
  return {
    id: dbDepTask.id,
    title: dbDepTask.title,
    description: dbDepTask.description,
    status: dbDepTask.status,
    parentTaskId: dbDepTask.parent_task_id,
    parentTaskName: dbDepTask.parent_task_name,
    blockerId: dbDepTask.blocker_id,
    assignedTo: dbDepTask.assigned_to,
    assignedToName: dbDepTask.assigned_to_name,
    assignedBy: dbDepTask.assigned_by,
    assignedByName: dbDepTask.assigned_by_name,
    dueDate: dbDepTask.due_date,
    completedAt: dbDepTask.completed_at,
    submittedForReview: dbDepTask.submitted_for_review || false,
    acceptedBy: dbDepTask.accepted_by,
    acceptedByName: dbDepTask.accepted_by_name,
    acceptedAt: dbDepTask.accepted_at,
    rejectedBy: dbDepTask.rejected_by,
    rejectedByName: dbDepTask.rejected_by_name,
    rejectedAt: dbDepTask.rejected_at,
    rejectionReason: dbDepTask.rejection_reason,
    progressNotes: dbDepTask.progress_notes || [],
    activityTimeline: dbDepTask.activity_timeline || [],
    createdAt: dbDepTask.created_at,
    updatedAt: dbDepTask.updated_at
  };
};

const databaseService = {
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
      // Hard delete - actually remove the user from database
      const { error } = await supabase
        .from('users')
        .delete()
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
      // Convert snake_case to camelCase
      return (data || []).map(dbToTask);
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
      // Convert snake_case to camelCase
      return dbToTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  },

  async createTask(taskData) {
    try {
      console.log('🔵 Creating task with data:', taskData);
      
      // Map camelCase to snake_case for database
      // Don't send id - let database generate UUID
      const dbData = {
        title: taskData.title,
        description: taskData.description,
        assigned_to: taskData.assignedTo,
        assigned_by: taskData.assignedBy,
        project: taskData.project,
        vertical: taskData.vertical,
        priority: taskData.priority,
        status: taskData.status || 'pending',
        start_date: taskData.startDate,
        due_date: taskData.dueDate,
        completed_date: taskData.completedDate,
        estimated_hours: taskData.estimatedHours,
        actual_hours: taskData.actualHours,
        tags: taskData.tags || [],
        attachments: taskData.attachments || [],
        created_at: taskData.createdAt || new Date().toISOString(),
        updated_at: taskData.updatedAt || new Date().toISOString()
      };

      console.log('🔵 Mapped DB data:', dbData);

      const { data, error } = await supabase
        .from('tasks')
        .insert([dbData])
        .select()
        .single();
      
      console.log('🔵 Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`Task creation failed: ${error.message}`);
      }
      
      if (!data) {
        console.error('❌ No data returned from Supabase');
        throw new Error('Task creation failed - no task ID returned. This may be due to database permissions (RLS). Check console for details.');
      }
      
      // Convert snake_case back to camelCase
      const result = dbToTask(data);
      console.log('✅ Task created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }
  },

  async updateTask(id, updates) {
    try {
      console.log('🔵 Updating task:', id, 'with updates:', updates);
      
      // Map camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.assignedBy !== undefined) dbUpdates.assigned_by = updates.assignedBy;
      if (updates.project !== undefined) dbUpdates.project = updates.project;
      if (updates.vertical !== undefined) dbUpdates.vertical = updates.vertical;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completedDate !== undefined) dbUpdates.completed_date = updates.completedDate;
      if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
      if (updates.actualHours !== undefined) dbUpdates.actual_hours = updates.actualHours;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
      if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
      if (updates.poc !== undefined) dbUpdates.poc = updates.poc;

      // Manager feedback and progress fields
      if (updates.managerFeedback !== undefined) dbUpdates.manager_feedback = updates.managerFeedback;
      if (updates.feedbackHistory !== undefined) dbUpdates.feedback_history = updates.feedbackHistory;
      if (updates.progressPercentage !== undefined) dbUpdates.progress_percentage = updates.progressPercentage;
      if (updates.progressNotes !== undefined) dbUpdates.progress_notes = updates.progressNotes;

      // Review workflow fields
      if (updates.reworkHistory !== undefined) dbUpdates.rework_history = updates.reworkHistory;
      if (updates.reworkCount !== undefined) dbUpdates.rework_count = updates.reworkCount;
      if (updates.qualityRating !== undefined) dbUpdates.quality_rating = updates.qualityRating;
      if (updates.reviewedAt !== undefined) dbUpdates.reviewed_at = updates.reviewedAt;
      if (updates.reviewedBy !== undefined) dbUpdates.reviewed_by = updates.reviewedBy;
      if (updates.reviewedByName !== undefined) dbUpdates.reviewed_by_name = updates.reviewedByName;
      if (updates.acceptedDate !== undefined) dbUpdates.accepted_date = updates.acceptedDate;
      if (updates.submittedForReviewAt !== undefined) dbUpdates.submitted_for_review_at = updates.submittedForReviewAt;
      if (updates.underReviewAt !== undefined) dbUpdates.under_review_at = updates.underReviewAt;

      // Activity and timeline fields
      if (updates.activityTimeline !== undefined) dbUpdates.activity_timeline = updates.activityTimeline;
      if (updates.blockerHistory !== undefined) dbUpdates.blocker_history = updates.blockerHistory;
      if (updates.dependencyTasks !== undefined) dbUpdates.dependency_tasks = updates.dependencyTasks;

      // Additional fields
      if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
      if (updates.reactions !== undefined) dbUpdates.reactions = updates.reactions;
      if (updates.isBlocked !== undefined) dbUpdates.is_blocked = updates.isBlocked;
      if (updates.blockedReason !== undefined) dbUpdates.blocked_reason = updates.blockedReason;

      // UI-only fields (don't send to database)
      // hasNewFeedback is a UI flag, not a database column - ignore it

      console.log('🔵 Mapped DB updates:', dbUpdates);
      
      // If no fields to update, skip the database call
      if (Object.keys(dbUpdates).length === 0) {
        console.log('⚠️ No database fields to update, skipping');
        // Still fetch and return the current task data
        const { data: currentTask } = await supabase
          .from('tasks')
          .select()
          .eq('id', id)
          .single();
        return dbToTask(currentTask);
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select();
      
      console.log('🔵 Update response:', { data, error });
      
      if (error) {
        console.error('❌ Update error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error('❌ No task found with ID:', id);
        throw new Error(`Task with ID ${id} not found or update failed`);
      }
      
      // Convert snake_case back to camelCase
      const result = dbToTask(data[0]);
      console.log('✅ Task updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error updating task:', error);
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
      // Convert snake_case to camelCase
      return (data || []).map(dbToGoal);
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  async createGoal(goalData) {
    try {
      // Map camelCase to snake_case for database
      // Don't send id - let database generate UUID
      const dbData = {
        user_id: goalData.userId,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        target_value: goalData.targetValue,
        current_value: goalData.currentValue,
        unit: goalData.unit,
        start_date: goalData.startDate,
        end_date: goalData.endDate,
        status: goalData.status,
        priority: goalData.priority,
        created_by: goalData.createdBy,
        created_at: goalData.createdAt,
        updated_at: goalData.updatedAt
      };

      const { data, error } = await supabase
        .from('goals')
        .insert([dbData])
        .select()
        .single();
      
      if (error) throw error;
      // Convert snake_case back to camelCase
      return dbToGoal(data);
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  async updateGoal(id, updates) {
    try {
      // Map camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.targetValue !== undefined) dbUpdates.target_value = updates.targetValue;
      if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.createdBy !== undefined) dbUpdates.created_by = updates.createdBy;
      if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;

      const { data, error } = await supabase
        .from('goals')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      // Convert snake_case back to camelCase
      return dbToGoal(data);
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
      // Convert snake_case to camelCase
      return (data || []).map(dbToNotification);
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
      // Map camelCase to snake_case for database
      // Don't send id - let database generate UUID
      const dbData = {
        user_id: notificationData.userId,
        title: notificationData.title || notificationData.message?.substring(0, 100),
        message: notificationData.message,
        type: notificationData.type || 'info',
        link: notificationData.link,
        is_read: notificationData.read || false,
        metadata: notificationData.metadata || {},
        created_at: notificationData.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([dbData])
        .select()
        .single();
      
      if (error) throw error;
      // Convert snake_case back to camelCase
      return dbToNotification(data);
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
      // Convert snake_case to camelCase
      return (data || []).map(dbToComment);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async addTaskComment(commentData) {
    try {
      // Validate comment text is not empty
      if (!commentData.comment || commentData.comment.trim() === '') {
        throw new Error('Comment text is required and cannot be empty');
      }

      // Map camelCase to snake_case for database
      // Don't send id - let database generate UUID
      const dbData = {
        task_id: commentData.taskId,
        user_id: commentData.userId,
        comment: commentData.comment.trim(), // Ensure trimmed
        parent_comment_id: commentData.parentCommentId,
        mentions: commentData.mentions || [],
        attachments: commentData.attachments || [],
        reactions: commentData.reactions || {},
        is_edited: commentData.isEdited || false,
        edited_at: commentData.editedAt,
        created_at: commentData.createdAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('task_comments')
        .insert([dbData])
        .select()
        .single();
      
      if (error) throw error;
      // Convert snake_case back to camelCase
      return dbToComment(data);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async updateTaskComment(commentId, updates) {
    try {
      // Map camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.comment !== undefined) dbUpdates.comment = updates.comment;
      if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId;
      if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
      if (updates.parentCommentId !== undefined) dbUpdates.parent_comment_id = updates.parentCommentId;
      if (updates.mentions !== undefined) dbUpdates.mentions = updates.mentions;
      if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
      if (updates.reactions !== undefined) dbUpdates.reactions = updates.reactions;
      if (updates.isEdited !== undefined) dbUpdates.is_edited = updates.isEdited;
      if (updates.editedAt !== undefined) dbUpdates.edited_at = updates.editedAt;

      const { data, error } = await supabase
        .from('task_comments')
        .update(dbUpdates)
        .eq('id', commentId)
        .select()
        .single();
      
      if (error) throw error;
      // Convert snake_case back to camelCase
      return dbToComment(data);
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
      return dbToDependency(data);
    } catch (error) {
      console.error('Error fetching dependency task:', error);
      return null;
    }
  },

  async createDependencyTask(dependencyData) {
    try {
      // Map camelCase to snake_case for database
      // Don't send id - let database generate UUID
      const dbData = {
        task_id: dependencyData.taskId,
        depends_on_task_id: dependencyData.dependsOnTaskId,
        dependency_type: dependencyData.dependencyType || 'finish_to_start',
        created_at: dependencyData.createdAt
      };

      const { data, error } = await supabase
        .from('task_dependencies')
        .insert([dbData])
        .select()
        .single();
      
      if (error) throw error;
      return dbToDependency(data);
    } catch (error) {
      console.error('Error creating dependency task:', error);
      throw error;
    }
  },

  async updateDependencyTask(dependencyId, updates) {
    try {
      // Map camelCase to snake_case for database
      const dbUpdates = {};
      if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId;
      if (updates.dependsOnTaskId !== undefined) dbUpdates.depends_on_task_id = updates.dependsOnTaskId;
      if (updates.dependencyType !== undefined) dbUpdates.dependency_type = updates.dependencyType;

      const { data, error} = await supabase
        .from('task_dependencies')
        .update(dbUpdates)
        .eq('id', dependencyId)
        .select()
        .single();
      
      if (error) throw error;
      return dbToDependency(data);
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
      return (data || []).map(dbToDependency);
    } catch (error) {
      console.error('Error fetching dependencies for task:', error);
      return [];
    }
  },

  async getDependencyTasksByAssignee(assigneeId) {
    try {
      // Get all tasks assigned to this user
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_to', assigneeId);
      
      if (tasksError) throw tasksError;
      
      if (!tasks || tasks.length === 0) return [];
      
      const taskIds = tasks.map(t => t.id);
      
      // Get all dependencies for these tasks
      const { data, error } = await supabase
        .from('task_dependencies')
        .select('*')
        .in('task_id', taskIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbToDependency);
    } catch (error) {
      console.error('Error fetching dependency tasks by assignee:', error);
      return [];
    }
  },

  // ==================== DEPENDENCY TASKS (Full Task Objects) ====================
  
  async createFullDependencyTask(dependencyTaskData) {
    try {
      console.log('🔵 Creating full dependency task:', dependencyTaskData);
      
      const dbData = {
        title: dependencyTaskData.title,
        description: dependencyTaskData.description,
        status: dependencyTaskData.status || 'not_started',
        parent_task_id: dependencyTaskData.parentTaskId,
        parent_task_name: dependencyTaskData.parentTaskName,
        blocker_id: dependencyTaskData.blockerId,
        assigned_to: dependencyTaskData.assignedTo,
        assigned_to_name: dependencyTaskData.assignedToName,
        assigned_by: dependencyTaskData.assignedBy,
        assigned_by_name: dependencyTaskData.assignedByName,
        due_date: dependencyTaskData.dueDate,
        progress_notes: dependencyTaskData.progressNotes || [],
        activity_timeline: dependencyTaskData.activityTimeline || [],
        created_at: dependencyTaskData.createdAt || new Date().toISOString(),
        updated_at: dependencyTaskData.updatedAt || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('dependency_tasks')
        .insert([dbData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating dependency task:', error);
        throw error;
      }
      
      console.log('✅ Dependency task created:', data);
      return dbToDependencyTask(data);
    } catch (error) {
      console.error('Error creating full dependency task:', error);
      throw error;
    }
  },

  async getFullDependencyTask(dependencyTaskId) {
    try {
      const { data, error } = await supabase
        .from('dependency_tasks')
        .select('*')
        .eq('id', dependencyTaskId)
        .single();
      
      if (error) throw error;
      return dbToDependencyTask(data);
    } catch (error) {
      console.error('Error fetching full dependency task:', error);
      return null;
    }
  },

  async updateFullDependencyTask(dependencyTaskId, updates) {
    try {
      console.log('🔵 Updating dependency task:', dependencyTaskId, 'with:', updates);
      
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.submittedForReview !== undefined) dbUpdates.submitted_for_review = updates.submittedForReview;
      if (updates.acceptedBy !== undefined) dbUpdates.accepted_by = updates.acceptedBy;
      if (updates.acceptedByName !== undefined) dbUpdates.accepted_by_name = updates.acceptedByName;
      if (updates.acceptedAt !== undefined) dbUpdates.accepted_at = updates.acceptedAt;
      if (updates.rejectedBy !== undefined) dbUpdates.rejected_by = updates.rejectedBy;
      if (updates.rejectedByName !== undefined) dbUpdates.rejected_by_name = updates.rejectedByName;
      if (updates.rejectedAt !== undefined) dbUpdates.rejected_at = updates.rejectedAt;
      if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;
      if (updates.progressNotes !== undefined) dbUpdates.progress_notes = updates.progressNotes;
      if (updates.activityTimeline !== undefined) dbUpdates.activity_timeline = updates.activityTimeline;

      const { data, error } = await supabase
        .from('dependency_tasks')
        .update(dbUpdates)
        .eq('id', dependencyTaskId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating dependency task:', error);
        throw error;
      }
      
      console.log('✅ Dependency task updated:', data);
      return dbToDependencyTask(data);
    } catch (error) {
      console.error('Error updating full dependency task:', error);
      throw error;
    }
  },

  async deleteFullDependencyTask(dependencyTaskId) {
    try {
      const { error } = await supabase
        .from('dependency_tasks')
        .delete()
        .eq('id', dependencyTaskId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting full dependency task:', error);
      return false;
    }
  },

  async getDependencyTasksByParent(parentTaskId) {
    try {
      const { data, error } = await supabase
        .from('dependency_tasks')
        .select('*')
        .eq('parent_task_id', parentTaskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbToDependencyTask);
    } catch (error) {
      console.error('Error fetching dependency tasks by parent:', error);
      return [];
    }
  },

  async getFullDependencyTasksByAssignee(assigneeId) {
    try {
      console.log('🔵 Querying dependency_tasks for assignee:', assigneeId);
      const { data, error } = await supabase
        .from('dependency_tasks')
        .select('*')
        .eq('assigned_to', assigneeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }
      
      console.log('✅ Raw data from database:', data);
      console.log('📊 Found', data?.length || 0, 'dependency tasks');
      
      const converted = (data || []).map(dbToDependencyTask);
      console.log('✅ Converted dependency tasks:', converted);
      return converted;
    } catch (error) {
      console.error('❌ Error fetching full dependency tasks by assignee:', error);
      return [];
    }
  },

  async getDependencyTasksByBlocker(blockerId) {
    try {
      const { data, error } = await supabase
        .from('dependency_tasks')
        .select('*')
        .eq('blocker_id', blockerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(dbToDependencyTask);
    } catch (error) {
      console.error('Error fetching dependency tasks by blocker:', error);
      return [];
    }
  },

  // Get dependency tasks that need review by the user
  // (user is the owner of the parent task and dependency is completed/pending review)
  async getDependencyTasksForReview(userId) {
    try {
      console.log('🔵 Loading dependency tasks for review by user:', userId);
      
      // First, get all tasks owned by this user
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_to', userId);
      
      if (tasksError) throw tasksError;
      
      if (!userTasks || userTasks.length === 0) {
        console.log('📋 User has no tasks, so no dependencies to review');
        return [];
      }
      
      const taskIds = userTasks.map(t => t.id);
      console.log('📋 User owns', taskIds.length, 'tasks');
      
      // Get all dependency tasks for these parent tasks
      const { data: dependencies, error: depsError } = await supabase
        .from('dependency_tasks')
        .select('*')
        .in('parent_task_id', taskIds)
        .order('created_at', { ascending: false });
      
      if (depsError) throw depsError;
      
      console.log('✅ Found', dependencies?.length || 0, 'dependency tasks for review');
      console.log('📊 Raw dependency data:', dependencies);
      
      const converted = (dependencies || []).map(dbToDependencyTask);
      console.log('✅ Converted dependency tasks:', converted);
      return converted;
    } catch (error) {
      console.error('❌ Error fetching dependency tasks for review:', error);
      return [];
    }
  },
};

export const db = databaseService;
export default databaseService;
