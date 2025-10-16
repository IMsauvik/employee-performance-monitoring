// MIGRATION INSTRUCTIONS FOR handleBlockedSubmit function
// Replace the entire function starting from line 220 with this updated version:

const handleBlockedSubmit = async () => {
  if (!blockerComment.trim()) {
    toast.error('Please provide a reason for blocking this task');
    return;
  }

  if (mentionedUsers.length === 0) {
    toast.error('Please mention at least one person to help resolve this blocker');
    return;
  }

  const now = new Date().toISOString();
  setStatus(TASK_STATUS.BLOCKED);

  // Create blocker entry
  const blockerEntry = {
    id: generateId(),
    reason: blockerComment,
    blockedBy: currentUser.id,
    blockedByName: currentUser.name,
    blockedAt: now,
    mentions: mentionedUsers,
    resolved: false
  };

  // Add comment to task discussion
  try {
    await db.addTaskComment({
      taskId: task.id,
      userId: currentUser.id,
      comment: blockerComment,
      mentions: mentionedUsers,
      createdAt: now
    });
  } catch (error) {
    console.error('Error adding task comment:', error);
  }

  // Add activity for status change
  const activity = {
    id: generateId(),
    type: ACTIVITY_TYPE.STATUS_CHANGE,
    title: 'Task Blocked',
    description: `${currentUser.name} marked this task as blocked: "${blockerComment}"`,
    userName: currentUser.name,
    userId: currentUser.id,
    timestamp: now,
    metadata: {
      previousStatus: task.status,
      newStatus: TASK_STATUS.BLOCKED,
      reason: blockerComment,
      mentions: mentionedUsers
    }
  };

  const updates = {
    status: TASK_STATUS.BLOCKED,
    updatedAt: now,
    blockerHistory: [...(task.blockerHistory || []), blockerEntry],
    activityTimeline: [...(task.activityTimeline || []), activity]
  };

  // Send notifications to mentioned users
  for (const userId of mentionedUsers) {
    try {
      await db.createNotification({
        userId,
        title: `Mentioned in Blocked Task`,
        message: `${currentUser.name} mentioned you in a blocked task: "${task.title}"`,
        type: 'task_mention',
        link: `/tasks/${task.id}`,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          mentionedBy: currentUser.name,
          comment: blockerComment
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Always notify the manager
  if (task.assignedBy && !mentionedUsers.includes(task.assignedBy)) {
    try {
      await db.createNotification({
        userId: task.assignedBy,
        title: `Task Blocked`,
        message: `Task blocked: "${task.title}"`,
        type: 'task_blocked',
        link: `/tasks/${task.id}`,
        metadata: {
          taskId: task.id,
          taskTitle: task.title,
          blockedBy: currentUser.name,
          reason: blockerComment
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Create dependency tasks for each mentioned user
  const createdDependencies = [];
  for (let index = 0; index < mentionedUsers.length; index++) {
    const userId = mentionedUsers[index];
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        const dependencyTask = await db.createDependencyTask({
          taskId: task.id,
          dependsOnTaskId: `dep-${Date.now()}-${index}`,
          dependencyType: 'blocker',
          createdAt: now
        });

        if (dependencyTask) {
          createdDependencies.push(dependencyTask.id);
        }
      } catch (error) {
        console.error('Error creating dependency task:', error);
      }
    }
  }

  // Add dependency task IDs to blocker entry
  blockerEntry.dependencyTasks = createdDependencies;

  // Update parent task updates with blocker entry that includes dependency IDs
  updates.blockerHistory = [...(task.blockerHistory || []), blockerEntry];

  onUpdate(task.id, updates);

  // Send email notifications to mentioned users
  const emailPromises = [];
  if (mentionedUsers.length > 0) {
    for (const userId of mentionedUsers) {
      const user = users.find(u => u.id === userId);
      if (user && user.email) {
        emailPromises.push(
          NotificationService.sendCommentNotification([user.email], {
            taskName: task.title,
            taskDescription: task.description || 'No description',
            taskUrl: `${window.location.origin}/employee/dashboard`,
            commentText: blockerComment,
            authorName: currentUser.name,
            isBlocker: true,
            mentions: mentionedUsers
          })
        );
      }
    }
  }

  // Send email to manager
  if (task.assignedBy && !mentionedUsers.includes(task.assignedBy)) {
    const manager = users.find(u => u.id === task.assignedBy);
    if (manager && manager.email) {
      emailPromises.push(
        NotificationService.sendTaskUpdate(manager.email, {
          taskName: task.title,
          taskId: task.id,
          status: 'blocked',
          blockedBy: currentUser.name,
          blockerReason: blockerComment,
          priority: task.priority,
          deadline: task.deadline
        })
      );
    }
  }

  // Send all emails
  if (emailPromises.length > 0) {
    Promise.all(emailPromises).then(() => {
      toast.success(`Task marked as blocked. ${emailPromises.length} email notification(s) sent.`);
    }).catch((error) => {
      console.error('Error sending emails:', error);
      toast.success('Task marked as blocked. (Email notifications may have failed)');
    });
  } else {
    toast.success('Task marked as blocked. Notifications sent.');
  }

  setShowBlockedModal(false);
  setBlockerComment('');
  setMentionedUsers([]);
};

// Also update the users list in the modal from:
// {storage.getUsers().filter(...)}
// to:
// {users.filter(...)}
