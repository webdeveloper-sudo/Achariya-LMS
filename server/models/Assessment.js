const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionNo: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: [
        "multiple-choice",
        "true-false",
        "fill-ups",
        "short-answer",
        "essay",
        "match",
        "diagram-mcq",
        "table-mcq",
      ],
      required: true,
    },
    options: [String], // Array of strings for MCQ options
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: function () {
        return this.questionType !== "essay" && this.questionType !== "match";
      },
    },
    mark: {
      type: Number,
      required: true,
      default: 1,
    },
    explanation: {
      type: String,
    },
    hint: {
      type: String, // New field for hints
    },
    // New Fields for Enhanced Question Types
    pairs: [
      {
        left: String,
        right: String,
      },
    ],
    tableRows: [String],
    image: String, // Single image for diagram
    images: [String], // Multiple images if needed
  },
  { _id: false },
);

const assessmentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      unique: true,
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId, // Match Course _id (ObjectId)
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    duration: {
      type: Number,
      required: true, // in seconds
    },
    attempts: {
      type: Number,
      default: 3,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    questions: [questionSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    accessedStudents: [
      {
        studentId: String,
        admissionNo: String,
        attempts: {
          type: Number,
          default: 0,
        },
        lastScore: Number,
        lastAttemptedAt: Date,
      },
    ],
    totalStudentsAttempted: [
      {
        studentId: String,
        timeOfAttempted: { type: Date, default: Date.now },
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: "AdminUser",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Assessment", assessmentSchema);
