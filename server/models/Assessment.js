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
      ],
      required: true,
    },
    options: [
      {
        type: String, // Only for multiple-choice
      },
    ],
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: function () {
        return this.questionType !== "essay";
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
  },
  { _id: false }
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
      type: mongoose.Schema.Types.ObjectId,
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
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
