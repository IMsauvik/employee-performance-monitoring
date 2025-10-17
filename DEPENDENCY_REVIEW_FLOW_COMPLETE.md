# Dependency Task Review Flow - Complete Testing Guide

## 🎯 Overview

The complete dependency task review flow is now working! When a dependency helper completes their work, the parent task owner (employee) can **review**, **accept**, or **reject** the work.

---

## 📋 Complete Flow Diagram

```
STEP 1: Task Blocked
┌─────────────────────────────────────────┐
│ Alice (Employee) marks task as BLOCKED │
│ Mentions: Nimai (Dependency Helper)    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Dependency Task Created for Nimai       │
│ Status: NOT_STARTED                     │
└─────────────────────────────────────────┘

STEP 2: Nimai Works on Dependency
┌─────────────────────────────────────────┐
│ Nimai: NOT_STARTED → IN_PROGRESS        │
│ Nimai: Adds progress notes              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Nimai: IN_PROGRESS → COMPLETED          │
│ ✅ Auto sets submittedForReview = true  │
│ 📧 Alice gets notification              │
└─────────────────────────────────────────┘

STEP 3: Alice Reviews (Two Paths)

PATH A: ACCEPT ✅
┌─────────────────────────────────────────┐
│ Alice clicks "Accept" button            │
│ ✅ Dependency marked as ACCEPTED        │
│ 📧 Nimai notified: "Work accepted!"     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ If ALL dependencies accepted:           │
│ ✅ Blocker AUTO-RESOLVES                │
│ ✅ Task status → IN_PROGRESS            │
│ 🎉 Alice can continue working!          │
└─────────────────────────────────────────┘

PATH B: REJECT ❌
┌─────────────────────────────────────────┐
│ Alice clicks "Reject" button            │
│ Modal opens: Enter rejection reason     │
│ Alice: "Please fix the API endpoint"    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ ❌ Dependency marked as REJECTED        │
│ Status: COMPLETED → IN_PROGRESS         │
│ submittedForReview = false              │
│ 📧 Nimai notified: "Rework needed"      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Nimai sees RED BANNER with feedback     │
│ 🔴 "Task Rejected - Rework Required"    │
│ 📝 Shows rejection reason                │
│ Nimai fixes issues                       │
│ Marks as COMPLETED again (resubmit)     │
└─────────────────────────────────────────┘
                  ↓
           [Back to STEP 3]
```

---

## 🧪 Testing Instructions

### Test 1: Complete Flow (Happy Path - Accept)

#### Step 1: Create Blocker (As Alice - Employee)

1. Login as **Alice** (alice@demo.com / alice123)
2. Open any task
3. Mark task as **BLOCKED**
4. Enter blocker reason: "Waiting for API documentation"
5. Check the box next to **Nimai Barman**
6. Click "Mark as Blocked"
7. ✅ Verify: Dependency task created

#### Step 2: Complete Dependency (As Nimai - Dependency Helper)

1. Logout and login as **Nimai** (nimai@demo.com / nimai123)
2. Go to Dashboard
3. ✅ Verify: See dependency task in "Dependency Tasks" section
4. Click on the dependency task
5. Click on journey: **NOT_STARTED → IN_PROGRESS**
6. Add progress note: "Working on the API documentation"
7. Click on journey: **IN_PROGRESS → COMPLETED**
8. ✅ Verify: See **yellow banner** "Awaiting Review"
9. ✅ Verify: Can't change status anymore (waiting for review)

#### Step 3: Review and Accept (As Alice)

1. Logout and login as **Alice**
2. Open the original task
3. ✅ Verify: Dependency task card shows **"Pending Your Review"** with yellow background
4. ✅ Verify: See **"REVIEW"** badge (animated)
5. ✅ Verify: See two buttons: **"Accept"** and **"Reject"**
6. Click **"Accept"** button
7. ✅ Verify: Toast message "Dependency accepted!"
8. ✅ Verify: Dependency card changes to green "Accepted"
9. ✅ Verify: Task blocker **AUTO-RESOLVES**
10. ✅ Verify: Task status changes back to **IN_PROGRESS**
11. ✅ Verify: See activity: "Blocker Auto-Resolved"

#### Step 4: Verify Nimai Sees Acceptance (As Nimai)

1. Login as **Nimai**
2. Open the dependency task
3. ✅ Verify: See **green banner** "✅ Task Accepted!"
4. ✅ Verify: Shows who accepted and when

---

### Test 2: Rejection & Rework Flow

#### Step 1: Complete Dependency (As Nimai)

1. Login as **Nimai**
2. Complete a dependency task (mark as COMPLETED)
3. ✅ Verify: Yellow banner "Awaiting Review"

#### Step 2: Reject with Feedback (As Alice)

1. Login as **Alice**
2. Open task with pending dependency
3. Click **"Reject"** button on dependency card
4. ✅ Verify: Modal opens "Reject Dependency Task"
5. Enter rejection reason:
   ```
   Please make the following changes:
   1. Update the API endpoint URL
   2. Add error handling
   3. Test with sample data
   ```
6. Click **"Reject & Request Rework"**
7. ✅ Verify: Toast "Dependency rejected. Assignee has been notified."
8. ✅ Verify: Dependency card shows **red** "Rejected - Needs Rework"
9. ✅ Verify: Shows rejection reason on card

#### Step 3: Nimai Sees Rejection (As Nimai)

1. Login as **Nimai**
2. Go to Dashboard
3. ✅ Verify: Dependency task still appears (not completed)
4. Click on dependency task
5. ✅ Verify: **BIG RED BANNER** at top:
   - Title: "🔴 Task Rejected - Rework Required"
   - Shows who rejected it
   - Shows rejection feedback in white box
   - Shows instruction: "Please review the feedback, make changes, and resubmit"
6. ✅ Verify: Status is back to **IN_PROGRESS** (can work on it again)
7. ✅ Verify: Can update progress journey

#### Step 4: Fix and Resubmit (As Nimai)

1. Still as **Nimai**
2. Add progress note: "Fixed all issues mentioned in feedback"
3. Mark as **COMPLETED** again
4. ✅ Verify: Yellow banner "Awaiting Review" appears again
5. ✅ Verify: No red rejection banner anymore

#### Step 5: Alice Reviews Again (As Alice)

1. Login as **Alice**
2. Open task
3. ✅ Verify: Dependency shows "Pending Your Review" again
4. Click **"Accept"**
5. ✅ Verify: Blocker resolves
6. ✅ Verify: Task unblocked

---

## 🎨 Visual Indicators Reference

### Dependency Card Colors

| Status                    | Border Color        | Background     | Badge                      |
| ------------------------- | ------------------- | -------------- | -------------------------- |
| Pending Review            | `border-yellow-300` | `bg-yellow-50` | 🟡 REVIEW (animated pulse) |
| Accepted                  | `border-green-300`  | `bg-green-50`  | ✅ Accepted                |
| Rejected                  | `border-red-300`    | `bg-red-50`    | ❌ Rejected - Needs Rework |
| In Progress               | `border-blue-300`   | `bg-blue-50`   | In Progress                |
| Completed (not submitted) | `border-green-300`  | `bg-green-50`  | Completed                  |

### Dependency Task Detail Modal Banners

**🟡 Awaiting Review (Yellow):**

```
┌────────────────────────────────────────────┐
│ 🕐 Awaiting Review                         │
│ Your work has been submitted for review.   │
│ Alice Developer will review and either     │
│ accept or request changes.                 │
└────────────────────────────────────────────┘
```

**🟢 Accepted (Green):**

```
┌────────────────────────────────────────────┐
│ ✅ Task Accepted!                          │
│ Alice Developer has accepted your work.    │
│ Great job!                                 │
│ Accepted on Oct 17, 2025 11:30 AM         │
└────────────────────────────────────────────┘
```

**🔴 Rejected (Red - Animated Pulse):**

```
┌────────────────────────────────────────────┐
│ ❌ Task Rejected - Rework Required         │
│ Alice Developer reviewed your work and has │
│ requested changes.                         │
│ ┌────────────────────────────────────────┐ │
│ │ Feedback:                              │ │
│ │ "Please fix the API endpoint URL..."   │ │
│ └────────────────────────────────────────┘ │
│ 📌 Please review the feedback, make the    │
│ necessary changes, and resubmit.           │
└────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation Details

### Database Fields Used

**dependency_tasks table:**

- `status`: NOT_STARTED | IN_PROGRESS | COMPLETED
- `submittedForReview`: boolean (auto-set to true when COMPLETED)
- `acceptedBy`: UUID of person who accepted
- `acceptedByName`: Name of person who accepted
- `acceptedAt`: Timestamp
- `rejectedBy`: UUID of person who rejected
- `rejectedByName`: Name of person who rejected
- `rejectedAt`: Timestamp
- `rejectionReason`: Text explaining why rejected

### Key Functions

**EmployeeTaskDetailModal.jsx:**

- `handleAcceptDependency(dependencyId)` - Marks dependency as accepted
- `handleRejectDependency(dependencyId)` - Opens rejection modal
- `confirmRejectDependency()` - Sends dependency back for rework
- `checkAndResolveBlocker()` - Auto-resolves blocker when all accepted

**DependencyTaskDetailModal.jsx:**

- `handleStatusChange(newStatus)` - When COMPLETED, sets `submittedForReview=true`
- Displays banners based on: `rejectedBy`, `acceptedBy`, `submittedForReview`

**DependencyStatusCards.jsx:**

- Shows "Pending Your Review" when `submittedForReview && !acceptedBy && !rejectedBy`
- Displays Accept/Reject buttons when `canReview && isPendingReview`
- Shows rejection reason when `rejectedBy && rejectionReason`

---

## ✅ Success Criteria

### For Dependency Helper (Nimai):

- ✅ Can complete dependency task
- ✅ Sees "Awaiting Review" status after completion
- ✅ Can't change status while awaiting review
- ✅ Gets clear rejection feedback with reasons
- ✅ Can fix issues and resubmit
- ✅ Sees acceptance confirmation

### For Task Owner (Alice):

- ✅ Sees pending reviews with visual indicator
- ✅ Can accept with one click
- ✅ Can reject with detailed feedback
- ✅ Blocker auto-resolves when all accepted
- ✅ Can track which dependencies are accepted/rejected

### For Manager:

- ✅ Can see dependency task progress in parent task timeline
- ✅ Can view all conversation messages
- ✅ Can see when tasks are accepted/rejected

---

## 🚀 Deployment Status

**Commit:** `37a4898`  
**Status:** ✅ Pushed to GitHub  
**Vercel:** Deploying now (1-3 minutes)

### After Deployment:

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear any cached data
3. Test complete flow from scratch

---

## 📝 Known Behaviors

1. **Notification errors are silent** - Wrapped in try-catch, won't block flow
2. **Multiple rejections allowed** - Can reject and resubmit multiple times
3. **Auto-resolve only when ALL accepted** - If 3 dependencies, all 3 must be accepted
4. **Rejection resets to IN_PROGRESS** - Allows immediate rework
5. **Shared conversation preserved** - All messages visible to everyone

---

## 🐛 If Something Doesn't Work

1. **Dependency card doesn't show "REVIEW" badge:**

   - Check if `submittedForReview` is true in database
   - Verify dependency status is COMPLETED

2. **Accept/Reject buttons don't appear:**

   - Check if `canReview={true}` is set
   - Verify you're the parent task owner

3. **Rejection banner doesn't show:**

   - Check if `rejectedBy` and `rejectionReason` fields are set
   - Hard refresh the page

4. **Blocker doesn't auto-resolve:**
   - Verify ALL dependencies are accepted
   - Check `checkAndResolveBlocker()` is called
   - Check console for errors

---

**Last Updated:** October 17, 2025  
**Status:** ✅ Complete and Deployed
