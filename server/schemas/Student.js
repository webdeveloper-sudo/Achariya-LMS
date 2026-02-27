const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true, // Assuming uniqueness is desired for mandatory emails
    },
    avatar: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      select: false, // Do not return password by default
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Suspended"],
      default: "Pending",
    },
    credits: [
      {
        amount: { type: Number, required: true },
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    totalCredits: {
      // Helper to store total sum for easier querying
      type: Number,
      default: 0,
    },
    school_id: {
      type: Number,
      default: 1,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    completion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    quiz_avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    badges: {
      type: [String], // Array of badge titles
      default: [],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    onboardedAt: {
      type: Date,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    onboardedAt: {
      type: Date,
    },
    enrolledCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        completedModules: [
          {
            moduleId: { type: String }, // Module ObjectId as string
            completedAt: { type: Date, default: Date.now },
          },
        ],
        currentModule: {
          type: String, // Module ID
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        assessmentProgress: [
          {
            assessmentId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Assessment",
            },
            moduleId: {
              type: String, // Storing Module ID
            },
            attempts: {
              type: Number,
              default: 0,
            },
            highestScore: {
              type: Number,
              default: 0,
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
            history: [
              {
                score: { type: Number },
                date: { type: Date, default: Date.now },
              },
            ],
          },
        ],
      },
    ],
    // --- GAMIFICATION STATS ---
    gamification: {
      totalCredits: { type: Number, default: 0, index: -1 }, // Index for Leaderboard
      rank: { type: String, default: "Novice" }, // Rank Name based on credits
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActivityDate: { type: Date }, // For streak calculation

      // Earned Badges (Array of Objects)
      badges: [
        {
          badgeId: { type: String, ref: "Badge" }, // Link to Badge Definition
          name: String, // Cached name
          earnedAt: { type: Date, default: Date.now },
          metadata: Object, // e.g. { "quizScore": 100 }
        },
      ],
      // Owned Power-ups
      ownedPowerUps: [
        {
          powerUpId: { type: String, ref: "PowerUp" },
          purchasedAt: { type: Date, default: Date.now },
          isActive: { type: Boolean, default: true },
          expiresAt: { type: Date },
          metadata: Object,
        },
      ],
      // Marketplace purchases (Themes, Avatars, etc.)
      purchasedMarketplaceItems: [
        {
          itemId: String,
          itemType: String,
          purchasedAt: { type: Date, default: Date.now },
          metadata: Object,
        },
      ],
    },

    // --- SOCIAL GRAPH ---
    social: {
      friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
      rivals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
      pendingRequests: [
        {
          from: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
          type: { type: String, enum: ["FRIEND", "RIVAL"] },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Legacy support (to be migrated or kept for backup)
    lastLoginAt: {
      type: Date,
    },
    lastLoginDate: {
      type: String,
    },
    streakFreezeUsed: {
      type: Boolean,
      default: false,
    },
    serialNo: {
      type: String,
      trim: true,
    },

    // --- PROGRESS LOG (timestamped activity for challenge evaluation) ---
    progressLog: [
      {
        action: {
          type: String,
          enum: [
            "complete_module",
            "complete_assessment",
            "complete_course",
            "login",
            "purchase_powerup",
            "daily_checkin",
          ],
        },
        refId: { type: String }, // moduleId / assessmentId / courseId
        refTitle: { type: String }, // cached name
        score: { type: Number, default: 0 }, // percentage, for assessments
        durationMinutes: { type: Number, default: 0 }, // time taken
        completedAt: { type: Date, default: Date.now },
      },
    ],

    // --- CLAIMED CHALLENGES (to prevent double-claiming per period) ---
    claimedChallenges: [
      {
        challengeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SystemChallenge",
        },
        claimedAt: { type: Date, default: Date.now },
        periodStart: { type: Date }, // start of the daily/weekly window
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
// admissionNo is already unique via the schema definition, so no extra index needed here.
studentSchema.index({ school_id: 1 });
studentSchema.index({ school: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model("Student", studentSchema);
