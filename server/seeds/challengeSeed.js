/**
 * Seed initial challenges from the static student challenges UI.
 * Run with: node server/seeds/challengeSeed.js
 */
const mongoose = require("mongoose");
const path = require("path");
const SystemChallenge = require("../models/SystemChallenge");

const MONGODB_URI =
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/achariya_students_db";

const challenges = [
  // ── DAILY ─────────────────────────────────────────────────────────────────
  {
    title: "Morning Learner",
    description: "Complete an assessment before 12 PM today",
    icon: "☀️",
    type: "daily",
    criteria: { action: "complete_assessment", count: 1, minScore: 0 },
    reward: 10,
  },
  {
    title: "Triple Threat",
    description: "Complete 3 modules today",
    icon: "🎯",
    type: "daily",
    criteria: { action: "complete_module", count: 3 },
    reward: 15,
  },
  {
    title: "Perfect Practice",
    description: "Score 100% on any assessment today",
    icon: "💯",
    type: "daily",
    criteria: { action: "complete_assessment", count: 1, minScore: 100 },
    reward: 20,
  },
  {
    title: "Speed Demon",
    description: "Complete a module in under 5 minutes",
    icon: "⚡",
    type: "daily",
    criteria: { action: "complete_module", count: 1, maxMinutes: 5 },
    reward: 15,
  },

  // ── WEEKLY ────────────────────────────────────────────────────────────────
  {
    title: "Course Conqueror",
    description: "Complete an entire course this week",
    icon: "👑",
    type: "weekly",
    criteria: { action: "complete_course", count: 1 },
    reward: 100,
  },
  {
    title: "Quiz Master",
    description: "Pass 10 assessments this week",
    icon: "🎓",
    type: "weekly",
    criteria: { action: "complete_assessment", count: 10 },
    reward: 75,
  },
  {
    title: "Streak Keeper",
    description: "Maintain a 7-day login streak",
    icon: "🔥",
    type: "weekly",
    criteria: { action: "login_streak", count: 7 },
    reward: 50,
  },
  {
    title: "Top Scorer",
    description: "Get 90%+ on 5 different assessments this week",
    icon: "⭐",
    type: "weekly",
    criteria: { action: "complete_assessment", count: 5, minScore: 90 },
    reward: 80,
  },
  {
    title: "Module Marathon",
    description: "Complete 10 modules this week",
    icon: "🏃",
    type: "weekly",
    criteria: { action: "complete_module", count: 10 },
    reward: 60,
  },
  {
    title: "Knowledge Explorer",
    description: "Complete modules from 3 different courses this week",
    icon: "🗺️",
    type: "weekly",
    criteria: { action: "complete_module", count: 3 },
    reward: 45,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const existing = await SystemChallenge.countDocuments();
  if (existing > 0) {
    console.log(
      `⚠️  ${existing} challenges already exist. Skipping seed to avoid duplicates.`,
    );
    console.log("   To re-seed, run: SystemChallenge.deleteMany({}) first.");
    process.exit(0);
  }

  await SystemChallenge.insertMany(challenges);
  console.log(`✅ Seeded ${challenges.length} challenges successfully.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
