const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Badge = require("../models/Badge");

dotenv.config();

const badges = [
  {
    name: "First Step",
    description: "Complete your first assessment.",
    icon: "🎯",
    criteria: { type: "ASSESSMENT_COUNT", threshold: 1 },
    creditReward: 5,
    category: "ACADEMIC",
  },
  {
    name: "On Fire",
    description: "Maintain a 3-day login streak.",
    icon: "🔥",
    criteria: { type: "STREAK_DAYS", threshold: 3 },
    creditReward: 20,
    category: "ENGAGEMENT",
  },
  {
    name: "Quiz Master",
    description: "Score 100% on a quiz.",
    icon: "🏆",
    criteria: { type: "PERFECT_SCORE", threshold: 1 },
    creditReward: 50,
    category: "ACADEMIC",
  },
  {
    name: "Dedicated Learner",
    description: "Complete 5 Modules.",
    icon: "📚",
    criteria: { type: "MODULE_COUNT", threshold: 5 },
    creditReward: 100,
    category: "ACADEMIC",
  },
  {
    name: "Pixel Pioneer",
    description: "Log in for 7 consecutive days.",
    icon: "🚀",
    criteria: { type: "STREAK_DAYS", threshold: 7 },
    creditReward: 100,
    category: "ENGAGEMENT",
  },
];

const seedBadges = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/achariya_portal",
    ); // Fallback if env not set
    console.log("Connected to MongoDB for Seeding Badges...");

    for (const badge of badges) {
      const exists = await Badge.findOne({ name: badge.name });
      if (!exists) {
        await Badge.create(badge);
        console.log(`Created Badge: ${badge.name}`);
      } else {
        console.log(`Badge exists: ${badge.name}`);
      }
    }

    console.log("Badge Seeding Complete.");
    process.exit();
  } catch (error) {
    console.error("Error seeding badges:", error);
    process.exit(1);
  }
};

seedBadges();
