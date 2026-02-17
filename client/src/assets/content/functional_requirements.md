
# Master Functional Requirement Document: Student Gamification & Social Ecosystem

**Version**: 2.0 (Comprehensive Specification)
**Date**: 2026-02-17
**Author**: Antigravity (Google DeepMind)

---

# Table of Contents

1.  **Introduction & Guiding Principles**
2.  **System Architecture Overview**
    *   2.1 High-Level Diagram
    *   2.2 Component Interaction
3.  **Detailed Database Schema Design**
    *   3.1 Student Profile Extensions
    *   3.2 The `Badge` Catalog
    *   3.3 The `CreditTransaction` Ledger
    *   3.4 Social & Rivalry Models
    *   3.5 Activity Logging
4.  **Feature Specification: The Credit Economy**
    *   4.1 Earning Logic
    *   4.2 Transaction Integrity
    *   4.3 Visualizing History
5.  **Feature Specification: Badge & Achievement Engine**
    *   5.1 Badge Structure
    *   5.2 Triggering Mechanisms
    *   5.3 Storage & Retrieval
6.  **Feature Specification: Social, Rivals & Challenges**
    *   6.1 The Rivalry Graph
    *   6.2 Challenge Lifecycle
    *   6.3 Social Feed Generation
    *   6.4 Leaderboard Algorithms
7.  **Frontend Implementation Guide**
8.  **API Specification (Endpoints)**

---

# 1. Introduction & Guiding Principles

This document serves as the **single source of truth** for implementing the dynamic student panel. It replaces all previous static prototypes with a robust, database-backed system.

**Core Philosophy:**
1.  **"Everything is a Transaction"**: No credit is added without a reason log.
2.  **"Social is Sticky"**: Every action should trigger a social notification or feed item to pull other students back in.
3.  **"Data Integrity"**: Badges and Credits must be audit-proof.

---

# 2. System Architecture Overview

The system moves from a "Client-Side Dummy Data" model to a **Server-Side Event Driven** model.

## 2.1 The Event Loop
1.  **User Action**: Student completes a module.
2.  **API Call**: Client POSTs to `/api/modules/complete`.
3.  **Controller**:
    *   Marks module as done.
    *   **TRIGGERS** `GamificationService.awardCredits()`.
    *   **TRIGGERS** `BadgeService.checkBadges()`.
    *   **TRIGGERS** `ActivityService.logEvent()`.
4.  **Database**: Updates `Student`, `CreditTransaction`, `Badge`, `ActivityLog`.
5.  **Response**: Returns success + "You earned 5 credits!".

---

# 3. Detailed Database Schema Design

This section defines the exact Mongoose schemas required.

## 3.1 Student Profile Extensions (`Student.js`)
We heavily extend the existing `Student` model to house the summary data.

```javascript
// server/schemas/Student.js (Extension)

const studentSchema = new mongoose.Schema({
  // ... existing fields (name, email, etc.)

  // --- GAMIFICATION STATS (Read-Heavy Optimization) ---
  gamification: {
    totalCredits: { type: Number, default: 0, index: -1 }, // Index for Leaderboard
    rank: { type: String, default: "Novice" }, // Rank Name based on credits
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date }, // For streak calculation
    
    // Earned Badges (Array of Objects)
    badges: [{
      badgeId: { type: String, ref: 'Badge' }, // Link to Badge Definition
      name: String, // Cached name
      earnedAt: { type: Date, default: Date.now },
      metadata: Object // e.g. { "quizScore": 100 }
    }]
  },

  // --- SOCIAL GRAPH ---
  social: {
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    rivals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    pendingRequests: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        type: { type: String, enum: ['FRIEND', 'RIVAL'] },
        createdAt: Date
    }]
  }
});
```

## 3.2 The Credit Ledger (`CreditTransaction.js`)
This is the **Audit Trail**. We never just `student.credits += 5`. We create a transaction.

```javascript
// server/models/CreditTransaction.js

const CreditTransactionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  
  // Amount (Positive = Earn, Negative = Spend)
  amount: { type: Number, required: true },
  
  // Type of Transaction (for filtering/analytics)
  type: { 
    type: String, 
    required: true, 
    enum: [
      'MODULE_COMPLETION', 
      'QUIZ_PASS', 
      'QUIZ_PERFECT', 
      'DAILY_STREAK', 
      'BADGE_BONUS', 
      'CHALLENGE_WIN', 
      'CHALLENGE_PARTICIPATION',
      'STORE_PURCHASE' // Future proofing
    ] 
  },
  
  // The User-Facing Message (Requested specific format)
  message: { type: String, required: true }, // e.g. "Completed Module: React Basics"
  
  // Technical Reference 
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // ID of the Module/Quiz/Challenge
  referenceModel: { type: String }, // 'Module', 'Assessment', 'Challenge'

  timestamp: { type: Date, default: Date.now, index: true }
});
```

## 3.3 The Badge Catalog (`Badge.js`)
Stores the *definitions* of badges, not the student's specific earned instances.

```javascript
// server/models/Badge.js

const BadgeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // e.g. 'SPEED_DEMON'
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // URL or Emoji
  
  // Criteria (JSON Logic for Automatic Awarding)
  criteria: {
    type: { type: String, enum: ['COUNT', 'SCORE', 'STREAK', 'TIME'] },
    threshold: Number,
    target: String // e.g. 'QUIZ_PERFECT'
  },
  
  // Reward for earning this badge
  creditReward: { type: Number, default: 50 },
  
  category: { type: String, enum: ['LEARNING', 'SOCIAL', 'MASTERY'] }
});
```

## 3.4 Challenges (`Challenge.js`)
Tracks the lifecycle of a 1v1 challenge.

```javascript
// server/models/Challenge.js

const ChallengeSchema = new mongoose.Schema({
  // Participants
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  
  // What are they doing?
  targetModel: { type: String, enum: ['Assessment', 'Module'], default: 'Assessment' },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'targetModel' },
  targetName: String, // Cached name for display
  
  // State Machine
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED'], 
    default: 'PENDING' 
  },
  
  // The stakes
  wager: { type: Number, default: 0 }, // If we allow betting credits
  reward: { type: Number, default: 20 }, // System reward
  
  // Outcomes
  results: {
    initiatorScore: Number,
    initiatorTime: Number, // Seconds
    initiatorCompletedAt: Date,
    
    opponentScore: Number,
    opponentTime: Number,
    opponentCompletedAt: Date
  },
  
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Null if tie/incomplete
  
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // Auto-cancel if not accepted 
});
```

---

# 4. Feature Specification: The Credit Economy

## 4.1 "Double-Entry" Earning Logic
We must ensure that `Student.gamification.totalCredits` always matches the sum of `CreditTransaction`.

### Workflow: `awardCredits(studentId, amount, reason, type, refId)`
1.  **Input**:
    *   `studentId`: "12345"
    *   `amount`: 5
    *   `reason`: "Completed module: Intro to React"
    *   `type`: "MODULE_COMPLETION"
    *   `refId`: "module_987"
2.  **Step 1: Create Transaction Record**
    *   Insert into `CreditTransaction`.
    *   If insert fails, **ABORT**.
3.  **Step 2: Update Student Profile**
    *   `Student.findOneAndUpdate({_id: studentId}, { $inc: { 'gamification.totalCredits': 5 } })`.
4.  **Step 3: Notification**
    *   Send real-time toast to frontend: "Earned 5 Credits!".

## 4.2 Handling "Streaks"
This logic is complex and must be handled on **Login** or **First Activity of the Day**.

**Algorithm:**
1.  User does activity (Login).
2.  Check `student.gamification.lastActivityDate`.
3.  Calculate `daysDiff` between `ReferenceDate(Now)` and `ReferenceDate(lastActivityDate)`.
    *   **If diff == 0 (Same day)**: Do nothing.
    *   **If diff == 1 (Yesterday)**:
        *   `currentStreak` += 1.
        *   `awardCredits(10 * currentStreak)` (Progressive Multiplier).
    *   **If diff > 1 (Missed a day)**:
        *   `currentStreak` = 1 (Reset).
        *   `awardCredits(10)`.
4.  Update `lastActivityDate` = Now.
5.  Check for **Badge Triggers** (e.g. "7 Day Streak").

---

# 5. Feature Specification: Badge & Achievement Engine

## 5.1 The "Trigger" System
Badges are monitored by a `BadgeEvaluator` service that hooks into system events.

### Event Types & Handlers

#### Event: `ASSESSMENT_COMPLETED`
*   **Listener**: `BadgeEvaluator.onAssessmentComplete(studentId, score, timeTaken)`
*   **Checks**:
    1.  **"Perfect Score" Badge**: Is `score == 100`? -> Award.
    2.  **"Speed Demon" Badge**: Is `timeTaken < 120`? -> Award.
    3.  **"Hat Trick" Badge**: Check last 3 assessments. Are all 100%? -> Award.

#### Event: `STREAK_UPDATED`
*   **Listener**: `BadgeEvaluator.onStreakUpdate(studentId, newStreak)`
*   **Checks**:
    1.  **"Week Warrior" Badge**: Is `newStreak >= 7`? -> Award.
    2.  **"Monthly Master" Badge**: Is `newStreak >= 30`? -> Award.

## 5.2 Storage Format (Requirement Compliance)
The user specifically requested: `{ badge name: ..., description: ..., availed time: ... }`.

**Implementation details**:
We store the **Snapshot** of the badge in the user profile so we don't need to join tables every time we load the profile.

```javascript
// When awarding a badge:
const badgeDef = await Badge.findOne({ id: 'SPEED_DEMON' });

const newBadgeEntry = {
  badgeId: badgeDef.id,
  name: badgeDef.name,           // Snapshot
  description: badgeDef.description, // Snapshot
  icon: badgeDef.icon,           // Snapshot
  earnedAt: new Date(),          // "Availed Time"
  metadata: { 
    triggerEvent: "Quiz 101", 
    value: "1m 30s" 
  }
};

await Student.updateOne(
  { _id: studentId }, 
  { $push: { 'gamification.badges': newBadgeEntry } }
);
```

---

# 6. Feature Specification: Social, Rivals & Challenges

## 6.1 The Rivalry Graph
The user asked: *"How do they connect?"* and *"Who has similarity in choosing courses?"*.

### 6.1.1 Discovery Algorithm ("Find a Rival")
When a student visits the **Rivals** page, the API must return a list of recommended opponents.

**Recommendation Logic (Score Calculation):**
For each candidate student `C` in the same school:
1.  **Base Score**: 0
2.  **Class Match**: If `C.class == User.class`, +50 points.
3.  **Course Overlap**: For each course both are enrolled in, +10 points.
4.  **Skill Match**: Calculate `|User.totalCredits - C.totalCredits|`. If difference < 100, +30 points.
5.  **Activity**: If `C` was active in last 24h, +20 points.

**Ranking**: Return top 5 candidates with highest scores.

### 6.1.2 Sending a Challenge
**Notification Flow**:
1.  **Sender (Student A)**: Clicks "Challenge" on Student B's profile.
    *   Selects "Quiz: Physics Chapter 1".
    *   POST `/api/challenges/create`.
2.  **System**:
    *   Creates `Challenge` (Status: PENDING).
    *   **Notification**: Creates a `Notification` record for Student B.
    *   **ActivityService**: Logs "Student A challenged Student B!".
3.  **Receiver (Student B)**:
    *   Sees red badge on "Rivals" tab.
    *   Opens "Pending Challenges".
    *   Clicks "Accept".
4.  **Outcome**:
    *   Both students get a "Go to Quiz" link.
    *   The quiz allows **one attempt** linked to this challenge.

## 6.2 The Activity Feed ("Social Feed")
The user asked: *"How social is gonna make happen?"*

### 6.2.1 The `ActivityLog` Model
Every social action creates a log.

```javascript
const ActivityLogSchema = new mongoose.Schema({
  actorId: { type: ObjectId, ref: 'Student' }, // Who did it?
  actorName: String, // Cached name (e.g. "Rahul")
  
  verb: { type: String, enum: ['EARNED', 'COMPLETED', 'CHALLENGED', 'WON', 'RANKED'] },
  object: String, // "Perfect Score Badge", "Math Module"
  
  targetId: { type: ObjectId, ref: 'Student' }, // Optional (e.g. "Challenged [Target]")
  targetName: String,
  
  visibility: { type: String, enum: ['PUBLIC', 'CLASS', 'PRIVATE'] },
  schoolId: ObjectId, // To filter feeds by school
  
  // Social Interactions
  interactions: {
    likes: [{ type: ObjectId, ref: 'Student' }], // Array of User IDs who liked
    comments: [{ userId: ObjectId, text: String, date: Date }]
  },
  
  createdAt: { type: Date, default: Date.now }
});
```

### 6.2.2 Generating the Feed
**Query**:
"Get latest 50 logs where `schoolId == mySchool` AND `visibility == PUBLIC` OR `actorId IN [myFriends]`."

**Display Logic**:
*   **Icon mapping**:
    *   `EARNED` -> 🏆
    *   `WON` -> ⚔️
    *   `RANKED` -> 📈
*   **Time**: "2m ago", "1h ago".

---

# 7. Leaderboard System

## 7.1 Ranking Algorithm
The user asked: *"List all the students by listing in the total credits order."*

### 7.1.1 Implementation Details
We support three views (tabs).

**1. All-Time (Global)**
*   **Source**: `Student.gamification.totalCredits`.
*   **Query**: `Student.find({ schoolId: user.schoolId }).sort({ 'gamification.totalCredits': -1 }).limit(100)`.
*   **Efficiency**: Create index on `gamification.totalCredits`.

**2. Monthly / Weekly**
*   **Source**: `CreditTransaction`.
*   **Aggregation Pipeline**:
    ```javascript
    [
      { $match: { 
          schoolId: user.schoolId,
          timestamp: { $gte: startOfWeek } 
      }},
      { $group: {
          _id: "$studentId",
          weeklyScore: { $sum: "$amount" }
      }},
      { $sort: { weeklyScore: -1 } },
      { $limit: 100 },
      { $lookup: { from: "students", ... } } // Join to get names
    ]
    ```

## 7.2 "Class vs Class" Rivalry
We can aggregate average scores per class to show which class is "Winning".
*   Group by `class` -> Average `totalCredits`.

---

# 8. Frontend Integration Guide

This section is for the Frontend Developer (React/Vite).

## 8.1 State Management
*   **Do not rely on localStorage** for credits. Always fetch `/api/student/profile` on mount.
*   **Optimistic UI**: When a user clicks "Like" on a feed item:
    1.  Immediately toggle the heart icon red.
    2.  Increment the counter locally.
    3.  Send API request in background.
    4.  If API fails, revert the icon.

## 8.2 Component: `BadgePopup.tsx`
*   **Trigger**: Listen for WebSocket event or API response containing `newBadges: []`.
*   **Animation**: Use Lottie file (confetti).
*   **Display**: Show Badge Icon, Name, and "Earned +50 Credits".

## 8.3 Component: `CreditCounter.tsx`
*   Located in Navbar.
*   Animates numbers rolling up (e.g. 100 -> 101 -> 102...).

---

# 9. API Specification (Core Endpoints)

## 9.1 Gamification API
*   `GET /api/gamification/leaderboard?type=weekly`
    *   Returns: `[{ rank, studentId, name, score, avatar }]`
*   `GET /api/gamification/badges`
    *   Returns: List of all *available* badges and their unlock criteria.
*   `GET /api/gamification/my-stats`
    *   Returns: detailed breakdown of user credits history.

## 9.2 Social API
*   `GET /api/social/feed`
    *   Returns: Paginated activity logs.
*   `POST /api/social/challenge`
    *   Body: `{ opponentId, activityId, message }`
*   `POST /api/social/like/{activityId}`
    *   Toggle like status.

---

# 10. Migration Strategy
1.  **Phase 1 (DB)**: Deploy Schema changes. Run script to Initialize `gamification` object for all existing students (`totalCredits: 0`).
2.  **Phase 2 (Triggers)**: Deploy Backend Logic. Students start earning credits for *new* actions.
3.  **Phase 3 (Backfill)**: (Optional) Run script to scan past "Module Completions" and retroactively award credits so users don't start at zero.
4.  **Phase 4 (UI)**: Deploy Client updates to show the live data.

---

**End of Master Functional Requirement Document.**
