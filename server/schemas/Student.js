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
            type: String, // Module ID
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
      },
    ],
    lastLoginAt: {
      type: Date,
    },
    lastLoginDate: {
      type: String, // Deprecated in favor of lastLoginAt, kept for backward compatibility
    },
    streakFreezeUsed: {
      type: Boolean,
      default: false,
    },
    serialNo: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// admissionNo is already unique via the schema definition, so no extra index needed here.
studentSchema.index({ school_id: 1 });
studentSchema.index({ school: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model("Student", studentSchema);
