const mongoose = require("mongoose");

const CreditTransactionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true,
  },

  // Amount (Positive = Earn, Negative = Spend)
  amount: { type: Number, required: true },

  // Type of Transaction (for filtering/analytics)
  type: {
    type: String,
    required: true,
    enum: [
      "MODULE_COMPLETION",
      "COURSE_COMPLETION",
      "QUIZ_PASS",
      "QUIZ_PERFECT",
      "DAILY_STREAK",
      "BADGE_BONUS",
      "CHALLENGE",
      "CHALLENGE_WIN",
      "CHALLENGE_PARTICIPATION",
      "STORE_PURCHASE",
    ],
  },

  // The User-Facing Message (Requested specific format)
  message: { type: String, required: true }, // e.g. "Completed Module: React Basics"

  // Technical Reference
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // ID of the Module/Quiz/Challenge
  referenceModel: { type: String }, // 'Module', 'Assessment', 'Challenge'

  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("CreditTransaction", CreditTransactionSchema);
