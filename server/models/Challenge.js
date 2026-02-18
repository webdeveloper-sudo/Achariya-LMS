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

  // What are they doing?
  targetModel: {
    type: String,
    enum: ["Assessment", "Module"],
    default: "Assessment",
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetModel",
  },
  targetName: String, // Cached name for display

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
  wager: { type: Number, default: 0 }, // If we allow betting credits
  reward: { type: Number, default: 20 }, // System reward

  // Outcomes
  results: {
    initiatorScore: Number,
    initiatorTime: Number, // Seconds
    initiatorCompletedAt: Date,

    opponentScore: Number,
    opponentTime: Number,
    opponentCompletedAt: Date,
  },

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Null if tie/incomplete

  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Auto-cancel if not accepted
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
