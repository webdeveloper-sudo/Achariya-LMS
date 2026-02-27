const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Who did it?
  actorName: String, // Cached name (e.g. "Rahul")

  actorRole: {
    type: String,
    enum: ["student", "teacher", "principal"],
    default: "student",
  },

  verb: {
    type: String,
    enum: ["EARNED", "COMPLETED", "CHALLENGED", "WON", "RANKED", "POSTED"],
  },
  object: String, // "Perfect Score Badge", "Math Module"

  targetId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, // Optional (e.g. "Challenged [Target]")
  targetName: String,

  visibility: {
    type: String,
    enum: ["PUBLIC", "CLASS", "PRIVATE"],
    default: "PUBLIC",
  },
  schoolId: { type: mongoose.Schema.Types.Mixed }, // Supports both ObjectId and numeric IDs

  // Social Interactions
  interactions: {
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "interactions.likeModel",
      },
    ], // Array of User IDs who liked
    likeModel: { type: String, enum: ["Student", "Teacher", "Principal"] },
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        userRole: { type: String, enum: ["student", "teacher", "principal"] },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  createdAt: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
