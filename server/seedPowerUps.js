const mongoose = require("mongoose");
const PowerUp = require("./models/PowerUp");

const MONGODB_URI =
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/";
const DB_NAME = "achariya_students_db";

const powerUps = [
  {
    powerUpId: "double",
    name: "Performance Accelerator",
    description: "Double credit acquisition for 24h duration.",
    cost: 50,
    durationText: "24 Hours",
    durationHours: 24,
    icon: "Zap",
    type: "active",
    color: "blue",
  },
  {
    powerUpId: "freeze",
    name: "Streak Protection",
    description: "Preserve your activity streak for 24h.",
    cost: 30,
    durationText: "1 Day",
    durationHours: 24,
    icon: "Shield",
    type: "passive",
    color: "blue",
  },
  {
    powerUpId: "timer",
    name: "Assessment Extension",
    description: "+30s additional time for your next assessment.",
    cost: 40,
    durationText: "1 Quiz",
    durationHours: 0,
    icon: "Hourglass",
    type: "active",
    color: "blue",
  },
  {
    powerUpId: "hints",
    name: "Reference Support",
    description: "Access 2 supplemental hints during assessment.",
    cost: 35,
    durationText: "1 Quiz",
    durationHours: 0,
    icon: "Lightbulb",
    type: "active",
    color: "blue",
  },
  {
    powerUpId: "retry",
    name: "Attempt Recovery",
    description: "Allows a single-use assessment re-initiation.",
    cost: 45,
    durationText: "1 Quiz",
    durationHours: 0,
    icon: "RefreshCw",
    type: "passive",
    color: "blue",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI + DB_NAME);
    console.log("Connected to MongoDB for seeding");

    await PowerUp.deleteMany({});
    console.log("Cleared existing PowerUps");

    await PowerUp.insertMany(powerUps);
    console.log("Successfully seeded PowerUps");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

seed();
