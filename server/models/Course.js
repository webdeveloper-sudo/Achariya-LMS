const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    thumbnail: {
      type: String, // URL or file path
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    gradesEligible: [
      {
        type: String, // e.g., "Grade 9", "Grade 10"
        trim: true,
      },
    ],
    eligibleSchools: [
      {
        type: String, // Storing School Names/IDs directly as String since School model is not available
        trim: true,
      },
    ],
    assignedTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher", // Matches schemas/Teacher.js ? Prompt says "Teacher/User model".
      },
    ],
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    postedOn: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update lastUpdatedOn
courseSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("Course", courseSchema);
