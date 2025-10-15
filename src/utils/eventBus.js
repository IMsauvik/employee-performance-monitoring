class EventBus {
  constructor() {
    this.subscribers = {};
    this.typingUsers = new Map(); // Map of taskId -> Set of typing users
    this.onlineUsers = new Set(); // Set of online user IDs
    this.retryQueue = new Map(); // Queue for failed operations
    this.readReceipts = new Map(); // Map of commentId -> Set of users who read
    this.reactions = new Map(); // Map of commentId -> Map of reaction -> Set of users
    
    // Setup online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleConnectionChange(true));
      window.addEventListener('offline', () => this.handleConnectionChange(false));
    }
  }

  // Core pub/sub functionality
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  publish(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event subscriber for ${event}:`, error);
          this.queueForRetry(event, data);
        }
      });
    }
  }

  // Typing indicators
  setUserTyping(taskId, userId, isTyping) {
    if (!this.typingUsers.has(taskId)) {
      this.typingUsers.set(taskId, new Set());
    }
    
    const typingSet = this.typingUsers.get(taskId);
    if (isTyping) {
      typingSet.add(userId);
    } else {
      typingSet.delete(userId);
    }

    this.publish(`typing:${taskId}`, {
      taskId,
      typingUsers: Array.from(typingSet)
    });

    // Auto-clear typing indicator after 5 seconds of no updates
    if (isTyping) {
      setTimeout(() => {
        this.setUserTyping(taskId, userId, false);
      }, 5000);
    }
  }

  // Read receipts
  markCommentAsRead(commentId, userId) {
    if (!this.readReceipts.has(commentId)) {
      this.readReceipts.set(commentId, new Set());
    }
    
    const readers = this.readReceipts.get(commentId);
    if (!readers.has(userId)) {
      readers.add(userId);
      this.publish(`read:${commentId}`, {
        commentId,
        readers: Array.from(readers)
      });
    }
  }

  // Comment reactions
  toggleReaction(commentId, userId, reaction) {
    if (!this.reactions.has(commentId)) {
      this.reactions.set(commentId, new Map());
    }
    
    const commentReactions = this.reactions.get(commentId);
    if (!commentReactions.has(reaction)) {
      commentReactions.set(reaction, new Set());
    }
    
    const userSet = commentReactions.get(reaction);
    const hasReacted = userSet.has(userId);
    
    if (hasReacted) {
      userSet.delete(userId);
    } else {
      userSet.add(userId);
    }

    this.publish(`reaction:${commentId}`, {
      commentId,
      reaction,
      users: Array.from(userSet),
      added: !hasReacted
    });
  }

  // Online/Offline handling
  handleConnectionChange(isOnline) {
    this.publish('connectionStatus', { isOnline });
    
    if (isOnline) {
      this.retryFailedOperations();
    }
  }

  // Error handling and retry mechanism
  queueForRetry(event, data) {
    const retryKey = `${event}:${Date.now()}`;
    this.retryQueue.set(retryKey, { event, data, attempts: 0 });
  }

  async retryFailedOperations() {
    for (const [key, operation] of this.retryQueue.entries()) {
      if (operation.attempts < 3) { // Max 3 retry attempts
        try {
          operation.attempts++;
          await this.publish(operation.event, operation.data);
          this.retryQueue.delete(key);
        } catch (error) {
          console.error(`Retry attempt ${operation.attempts} failed for ${operation.event}:`, error);
          if (operation.attempts >= 3) {
            this.retryQueue.delete(key);
            this.publish('retryFailed', {
              event: operation.event,
              data: operation.data,
              error
            });
          }
        }
      }
    }
  }

  // User presence tracking
  setUserOnline(userId, isOnline) {
    if (isOnline) {
      this.onlineUsers.add(userId);
    } else {
      this.onlineUsers.delete(userId);
    }
    
    this.publish('userPresence', {
      userId,
      isOnline,
      onlineUsers: Array.from(this.onlineUsers)
    });
  }

  // Utility methods
  getTypingUsers(taskId) {
    return Array.from(this.typingUsers.get(taskId) || []);
  }

  getReadReceipts(commentId) {
    return Array.from(this.readReceipts.get(commentId) || []);
  }

  getReactions(commentId) {
    const reactions = this.reactions.get(commentId);
    if (!reactions) return {};
    
    const result = {};
    for (const [reaction, users] of reactions.entries()) {
      result[reaction] = Array.from(users);
    }
    return result;
  }

  isUserOnline(userId) {
    return this.onlineUsers.has(userId);
  }

  clearTask(taskId) {
    this.typingUsers.delete(taskId);
    // Clean up any other task-specific data
  }
}

export const eventBus = new EventBus();