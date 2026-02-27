const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  // Participants
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  // Metadata
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["DAILY_STREAK", "ASSESSMENT_DUEL", "MODULE_RACE", "CREDIT_WAR"],
    default: "ASSESSMENT_DUEL",
  },

  // What are they doing? (Optional for generic races)
  targetModel: {
    type: String,
    enum: ["Assessment", "Module"],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetModel",
  },
  targetValue: { type: Number, default: 1 }, // e.g. score 100, or 7 day streak

  // State Machine
  status: {
    type: String,
    enum: [
      "PENDING",
      "ACCEPTED",
      "DECLINED",
      "IN_PROGRESS",
      "COMPLETED",
      "EXPIRED",
    ],
    default: "PENDING",
  },

  // The stakes
  wager: { type: Number, default: 0 },
  reward: { type: Number, default: 20 },

  // Outcomes
  results: {
    initiatorScore: { type: Number, default: 0 },
    initiatorTime: { type: Number, default: 0 },
    initiatorCompletedAt: Date,

    opponentScore: { type: Number, default: 0 },
    opponentTime: { type: Number, default: 0 },
    opponentCompletedAt: Date,
  },

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },

  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
