const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true }, // e.g. 'SPEED_DEMON'
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }, // URL or Emoji

  // Criteria (JSON Logic for Automatic Awarding)
  criteria: {
    type: {
      type: String,
      enum: ["COUNT", "SCORE", "STREAK", "TIME", "TIME_WINDOW"],
    },
    threshold: Number,

    target: String, // e.g. 'QUIZ_PERFECT'
  },

  // Reward for earning this badge
  creditReward: { type: Number, default: 50 },

  category: { type: String, enum: ["LEARNING", "SOCIAL", "MASTERY"] },

  // Track students who earned this badge
  availedBy: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      earnedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Badge", BadgeSchema);
