const mongoose = require("mongoose");

const PowerUpSchema = new mongoose.Schema({
  powerUpId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
  },
  durationText: {
    type: String,
    default: "Permanent",
  },
  durationHours: {
    type: Number,
    default: 0, // 0 means one-time use or until used
  },
  icon: {
    type: String,
    default: "Zap",
  },
  type: {
    type: String,
    enum: ["active", "passive", "theme"],
    default: "active",
  },
  color: {
    type: String,
    default: "blue",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PowerUp", PowerUpSchema);
