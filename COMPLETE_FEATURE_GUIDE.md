# Employee Performance Monitoring System - Complete Feature Guide

## 🎯 System Overview

A comprehensive employee performance monitoring application with task management, dependency workflows, blocker mentions, and real-time collaboration features.

## 🚀 Quick Start

### Starting the Application

1. **Start Frontend Server:**

   ```bash
   cd employee-performance-app
   npm run dev
   ```

   Access at: `http://localhost:5174`

2. **Start Backend Server (Email notifications):**
   ```bash
   cd employee-performance-app/server
   npm run dev
   ```
   Running on: `http://localhost:3001`

### Demo Accounts

| Role         | Email            | Password    | Dashboard           |
| ------------ | ---------------- | ----------- | ------------------- |
| **Admin**    | admin@demo.com   | admin123    | /admin/dashboard    |
| **Manager**  | manager@demo.com | manager123  | /manager/dashboard  |
| **Employee** | alice@demo.com   | employee123 | /employee/dashboard |

## ✨ Key Features

### 1. **Blocker Mention System** ⭐ NEW

Employees can mention team members in blocker comments with RED highlights.

#### How to Use:

1. Open any task
2. Click "Comments" or "Discussion"
3. Type a comment with blocker keywords: `blocker`, `blocked`, `blocking`
4. Mention users with `@username`
5. Example: `This task is blocked by @John Smith - need API access`

#### Visual Indicators:

- **In Chat:** RED badges with 🔴 emoji and pulse animation
- **In Timeline:** RED highlighted mentions with ring effects
- **Notifications:** Special blocker notification type

### 2. **Dependency Workflow**

Create and manage dependency tasks within main tasks.

#### Creating Dependencies:

1. Open a task (as employee or manager)
2. Scroll to "Dependencies" section
3. Click "Add Dependency"
4. Fill in dependency details
5. Assign to a team member

#### Dependency States:

- **Not Started** (Gray)
- **In Progress** (Blue)
- **Completed - Pending Review** (Yellow, pulsing)
- **Accepted** (Green)
- **Rejected** (Red)

#### Review Workflow:

1. Assignee completes dependency → Submits for review
2. Parent task owner gets notification
3. Owner can **Accept** or **Reject** with feedback
4. If rejected, assignee must rework

### 3. **Task Status Journey**

Enhanced status flow with manager review process.

#### Employee Journey:

1. **Not Started** → Start task
2. **In Progress** → Work on task
3. **Blocked** → Report blockers (with mentions)
4. **Submitted** → Submit for manager review
5. Wait for manager action

#### Manager Actions:

1. **Under Review** → Review submitted work
2. **Accept** → Approve and complete
3. **Rework Required** → Send back with feedback
4. **Completed** → Final closure

### 4. **Real-Time Collaboration**

#### Chat Features:

- **@Mentions** - Mention any team member
- **Typing Indicators** - See who's typing
- **Online Status** - Green dots for online users
- **Reactions** - Like, Love, Star emojis
- **Read Receipts** - Track who read messages

#### Notification System:

- **In-App Notifications** - Bell icon with badge count
- **Email Notifications** - Via backend server
- **Click-to-View** - Notifications link to tasks

### 5. **Activity Timeline**

Complete audit trail of all task activities.

#### Timeline Events:

- Status changes
- Comments and mentions
- Blockers added/resolved
- Feedback from managers
- Dependency updates
- Progress notes

#### Timeline Features:

- **Color Coding** - Each event type has unique color
- **Icons** - Visual indicators for event types
- **Metadata** - Additional context (quality ratings, etc.)
- **Blocker Highlights** - RED mentions for urgent items

## 🎨 Color System

### Status Colors

- **Gray:** Not Started
- **Blue:** In Progress
- **Orange/Red:** Blocked
- **Purple:** Submitted for Review
- **Indigo:** Under Review
- **Red:** Rework Required
- **Green:** Accepted/Completed

### Mention Colors

- **Regular Mentions:** Blue/Indigo background
- **Blocker Mentions:** RED with white text + pulse

### Priority Colors

- **Low:** Green
- **Medium:** Yellow
- **High:** Red

## 📊 Analytics & Reporting

### Employee Analytics

- Task completion rate
- Average completion time
- Performance trends
- Quality ratings

### Manager Analytics

- Team performance overview
- Task distribution
- Blocker analysis
- Completion statistics

### Admin Analytics

- Organization-wide metrics
- Department comparisons
- User performance
- Export capabilities

## 🔧 Advanced Features

### Export Functions

- **PDF Reports** - Task lists, performance reports
- **CSV Export** - User data, task data
- **Excel Export** - Full data export

### Search & Filter

- **Advanced Search** - Multi-field search
- **Status Filters** - Filter by task status
- **Date Range** - Filter by dates
- **Priority Filter** - Filter by priority level

### User Management (Admin)

- Add new users
- Edit user roles
- Delete users
- Manage permissions

## 🐛 Troubleshooting

### Manager/Admin Panel Not Opening

**Possible Causes:**

1. **Wrong credentials** - Use demo accounts above
2. **Browser cache** - Clear localStorage:
   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```
3. **Server not running** - Check both frontend and backend servers

### Mentions Not Working

**Checklist:**

- Type `@` followed by username
- User must exist in system
- Can't mention yourself
- Dropdown should appear automatically

### Notifications Not Appearing

**Checklist:**

- Check bell icon in header
- Verify mentioned user exists
- Check browser console for errors
- Ensure notification permission granted

### Dependency Tasks Not Showing

**Checklist:**

- Dependencies must be created first
- Check task has dependency array
- Verify dependency IDs are valid
- Check localStorage for `dependencyTasks`

## 📁 File Structure

```
employee-performance-app/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── manager/        # Manager dashboard components
│   │   ├── employee/       # Employee dashboard components
│   │   ├── auth/           # Login & authentication
│   │   └── common/         # Shared components
│   │       ├── TaskCommentsModal.jsx          # Chat with mentions
│   │       ├── TaskActivityTimeline.jsx       # Activity feed
│   │       ├── DependencyStatusCards.jsx      # Dependency cards
│   │       ├── DependencyTaskDetailModal.jsx  # Dependency modal
│   │       └── Header.jsx                     # Navigation & notifications
│   ├── hooks/
│   │   ├── useTaskComments.js     # Comment & notification hook
│   │   ├── useTaskDiscussion.js   # Discussion hook
│   │   └── useTaskProgress.js     # Progress tracking
│   ├── utils/
│   │   ├── storage.js             # localStorage wrapper
│   │   ├── taskConstants.js       # Status & constants
│   │   └── helpers.js             # Utility functions
│   └── data/
│       └── demoData.js            # Demo users & tasks
├── server/
│   ├── server.js                  # Express server
│   └── services/
│       └── emailService.js        # Email notifications
└── BLOCKER_MENTION_FEATURE.md    # Mention feature docs
```

## 🔐 Data Persistence

All data is stored in browser localStorage:

- `users` - User accounts
- `tasks` - Main tasks
- `dependencyTasks` - Dependency tasks
- `taskComments` - Comments and discussions
- `notifications` - User notifications
- `currentUser` - Logged in user

### Resetting Data

```javascript
// In browser console:
localStorage.clear();
location.reload();
// Demo data will be reinitialized on next login
```

## 📝 Best Practices

### For Employees

1. **Update progress regularly** - Add progress notes
2. **Report blockers immediately** - Use @mentions
3. **Submit when ready** - Use Submit for Review status
4. **Respond to feedback** - Check notifications daily

### For Managers

1. **Review submissions promptly** - Check pending reviews
2. **Provide detailed feedback** - Use quality ratings
3. **Accept/Reject dependencies** - Review within 24 hours
4. **Monitor blockers** - Respond to @mentions quickly

### For Admins

1. **Monitor system health** - Check analytics regularly
2. **Manage users** - Keep user list updated
3. **Export reports** - Generate weekly/monthly reports
4. **Review performance** - Identify trends and issues

## 🆘 Support & Resources

### Documentation

- `README.md` - Project overview
- `BLOCKER_MENTION_FEATURE.md` - Mention feature guide
- `IMPLEMENTATION_COMPLETE.md` - Technical details
- `PRODUCTION_READY_GUIDE.md` - Deployment guide

### Getting Help

1. Check browser console for errors
2. Review documentation files
3. Verify demo data is loaded
4. Clear cache and retry

## 🎉 Feature Highlights

✅ **Completed Features:**

- ✨ Blocker mention system with RED highlights
- 📊 Dependency workflow with review process
- 💬 Real-time chat with @mentions
- 🔔 Notification system (in-app + email)
- 📈 Activity timeline with full audit trail
- 🎯 Task status journey with manager review
- 👥 User management (Admin)
- 📊 Analytics dashboards (All roles)
- 🔍 Advanced search & filtering
- 📄 Export functionality (PDF, CSV, Excel)

🚧 **Future Enhancements:**

- 📎 File attachments in comments
- 🎙️ Voice notes for urgent blockers
- 📧 Advanced email templates
- 🔗 Slack/Teams integration
- 📊 Enhanced analytics with charts
- 🤖 AI-powered insights

---

**Version:** 2.0.0  
**Last Updated:** October 15, 2025  
**Status:** ✅ Production Ready
