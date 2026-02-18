const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Who did it?
  actorName: String, // Cached name (e.g. "Rahul")

  verb: {
    type: String,
    enum: ["EARNED", "COMPLETED", "CHALLENGED", "WON", "RANKED"],
  },
  object: String, // "Perfect Score Badge", "Math Module"

  targetId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Optional (e.g. "Challenged [Target]")
  targetName: String,

  visibility: { type: String, enum: ["PUBLIC", "CLASS", "PRIVATE"] },
  schoolId: mongoose.Schema.Types.ObjectId, // To filter feeds by school

  // Social Interactions
  interactions: {
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Array of User IDs who liked
    comments: [], // Simplified for now, can extend later
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
