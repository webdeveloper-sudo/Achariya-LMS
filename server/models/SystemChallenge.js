const mongoose = require("mongoose");

/**
 * SystemChallenge — admin-defined challenges shown to students.
 * Criteria drives how progress is evaluated against the student's progressLog.
 */
const SystemChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: "🎯" }, // emoji

    type: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },

    criteria: {
      /**
       * action: what kind of completion counts towards this challenge
       *  - complete_module       → student finished a module
       *  - complete_assessment   → student passed an assessment
       *  - complete_course       → student reached 100% on a course
       *  - login_streak          → student logged in N consecutive days
       */
      action: {
        type: String,
        enum: [
          "complete_module",
          "complete_assessment",
          "complete_course",
          "login_streak",
        ],
        required: true,
      },

      /** How many times the action must be performed */
      count: { type: Number, required: true, min: 1, default: 1 },

      /**
       * Time window (hours) within which actions must occur.
       * daily = 24, weekly = 168. Derived from `type` automatically on save
       * but stored so queries are simple.
       */
      timeWindowHours: { type: Number, default: 24 },

      /** Minimum percentage score required (for complete_assessment criteria) */
      minScore: { type: Number, default: 0, min: 0, max: 100 },

      /** Maximum minutes allowed (for speed challenges — 0 means no limit) */
      maxMinutes: { type: Number, default: 0 },
    },

    reward: { type: Number, required: true, min: 1, default: 10 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Auto-set timeWindowHours from type before save
SystemChallengeSchema.pre("save", function (next) {
  if (this.type === "daily") this.criteria.timeWindowHours = 24;
  else if (this.type === "weekly") this.criteria.timeWindowHours = 168;
  next();
});

module.exports = mongoose.model("SystemChallenge", SystemChallengeSchema);
