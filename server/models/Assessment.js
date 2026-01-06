const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ["multiple-choice", "true-false", "short-answer", "essay"],
      required: true,
    },
    options: [
      {
        type: String,
      },
    ],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed, // String or Array of Strings
      required: function () {
        // Essay type might strictly not need a "correct answer" stored if it's manual grading,
        // but the prompt says correctAnswer is String or Array.
        // I'll make it required unless it's an essay, but strict validation in controller is better.
        return this.questionType !== "essay";
      },
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    explanation: {
      type: String,
    },
  },
  { _id: false }
); // sub-document, no separate _id by default unless needed

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
      maxlength: 500,
    },
    assessmentType: {
      type: String,
      enum: ["quiz", "assignment", "exam", "practice"],
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number, // in minutes
    },
    questions: [questionSchema],
    attemptsAllowed: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    postedOn: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assessment", assessmentSchema);
