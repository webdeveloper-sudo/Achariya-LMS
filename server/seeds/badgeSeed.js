/**
 * Seed 10 badges for the Achariya LMS.
 * Run with: node server/seeds/badgeSeed.js
 */
const mongoose = require("mongoose");
const Badge = require("../models/Badge");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/achariya_students_db";

const badges = [
  {
    id: "SPEED_MASTER",
    name: "Speed Master",
    description: "Score 100% on any quiz in under 60 seconds.",
    icon: "⚡",
    category: "LEARNING",
    creditReward: 50,
    criteria: { type: "TIME", threshold: 60, target: "QUIZ_PERFECT" },
  },
  {
    id: "HIGH_PERFORMER",
    name: "High Performer",
    description: "Achieve 95% or higher on 5 different quizzes.",
    icon: "🌟",
    category: "LEARNING",
    creditReward: 100,
    criteria: { type: "SCORE", threshold: 95, target: "COUNT_5" },
  },
  {
    id: "CONSISTENT",
    name: "Consistent Learner",
    description: "Maintain a 7-day learning streak.",
    icon: "🔥",
    category: "MASTERY",
    creditReward: 75,
    criteria: { type: "STREAK", threshold: 7 },
  },
  {
    id: "EXCELLENCE",
    name: "Excellence Award",
    description: "Maintain 90%+ average across all enrolled courses.",
    icon: "🏅",
    category: "MASTERY",
    creditReward: 200,
    criteria: { type: "SCORE", threshold: 90, target: "ALL_COURSES" },
  },
  {
    id: "MENTOR",
    name: "Mentor Badge",
    description: "Assist 10+ peers with helpful responses in the social feed.",
    icon: "🤝",
    category: "SOCIAL",
    creditReward: 150,
    criteria: { type: "COUNT", threshold: 10, target: "PEER_HELP" },
  },
  {
    id: "COURSE_CRUSHER",
    name: "Course Crusher",
    description: "Complete your first full course with 100% progress.",
    icon: "🏆",
    category: "LEARNING",
    creditReward: 250,
    criteria: { type: "COUNT", threshold: 1, target: "COURSE_COMPLETE" },
  },
  {
    id: "NIGHT_OWL",
    name: "Night Owl",
    description: "Complete an assessment between 10 PM and 2 AM.",
    icon: "🦉",
    category: "LEARNING",
    creditReward: 30,
    criteria: { type: "TIME_WINDOW", target: "NIGHT" },
  },
  {
    id: "EARLY_BIRD",
    name: "Early Bird",
    description: "Complete an assessment before 8 AM.",
    icon: "🌅",
    category: "LEARNING",
    creditReward: 30,
    criteria: { type: "TIME_WINDOW", target: "MORNING" },
  },
  {
    id: "QUIZ_WHIZ",
    name: "Quiz Whiz",
    description: "Achieve a perfect 100% score on 10 different quizzes.",
    icon: "📚",
    category: "LEARNING",
    creditReward: 200,
    criteria: { type: "SCORE", threshold: 100, target: "COUNT_10" },
  },
  {
    id: "RIVAL_DOMINATOR",
    name: "Rival Dominator",
    description: "Win 5 head-to-head score challenges against your rivals.",
    icon: "⚔️",
    category: "SOCIAL",
    creditReward: 120,
    criteria: { type: "COUNT", threshold: 5, target: "RIVAL_WIN" },
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing badges to avoid duplicates if re-running
    await Badge.deleteMany({});
    console.log("🗑️  Cleared existing badges.");

    await Badge.insertMany(badges);
    console.log(`✅ Seeded ${badges.length} badges successfully.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
