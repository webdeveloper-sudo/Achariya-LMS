const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Module = require("../models/Module");

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/";
const DB_NAME = "achariya_students_db";

const transformData = (data) => {
  if (Array.isArray(data)) return data.map(transformData);
  if (data !== null && typeof data === "object") {
    if (data.$oid) return new mongoose.Types.ObjectId(data.$oid);
    if (data.$date) return new Date(data.$date);
    const newObj = {};
    for (const key in data) {
      newObj[key] = transformData(data[key]);
    }
    return newObj;
  }
  return data;
};

const seedModules = async () => {
  try {
    console.log(`Connecting to MongoDB (${DB_NAME})...`);
    await mongoose.connect(MONGO_URI + DB_NAME);
    console.log("✅ Connected.");

    const seedPath = path.join(__dirname, "../seeds/modules-seed.json");
    const rawData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const modules = transformData(rawData.modules);

    console.log(
      `Starting seeding of modules (filtering for first 3 per course)...`,
    );

    let seededCount = 0;
    for (const moduleData of modules) {
      // Only seed the first three modules (sequenceOrder 1, 2, 3)
      if (moduleData.sequenceOrder > 3) continue;

      // Remove any existing module with this moduleId to ensure fresh ObjectId generation
      await Module.deleteOne({ moduleId: moduleData.moduleId });

      await Module.create(moduleData);
      console.log(
        `✅ Seeded Module: ${moduleData.moduleId} (Seq: ${moduleData.sequenceOrder})`,
      );
      seededCount++;
    }

    console.log(`🎯 Module seeding complete. Total seeded: ${seededCount}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedModules();
