const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Assessment = require("../models/Assessment");

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

const seedAssessments = async () => {
  try {
    console.log(`Connecting to MongoDB (${DB_NAME})...`);
    await mongoose.connect(MONGO_URI + DB_NAME);
    console.log("✅ Connected.");

    const seedPath = path.join(__dirname, "../seeds/assessments-seed.json");
    const rawData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const assessments = transformData(rawData.assessments);

    console.log(
      `Starting seeding of assessments (filtering for first 3 modules per course)...`,
    );

    let seededCount = 0;
    for (const assessmentData of assessments) {
      // Extract module sequence number from assessmentId (e.g., ASS-MATH-08-1-1 -> 1)
      const parts = assessmentData.assessmentId.split("-");
      const moduleSeq = parseInt(parts[parts.length - 2]);

      // Only seed assessments for the first three modules
      if (moduleSeq > 3) continue;

      // Remove any existing assessment with this assessmentId to ensure fresh ObjectId generation
      await Assessment.deleteOne({ assessmentId: assessmentData.assessmentId });

      await Assessment.create(assessmentData);
      console.log(
        `✅ Seeded Assessment: ${assessmentData.assessmentId} (Module Seq: ${moduleSeq})`,
      );
      seededCount++;
    }

    console.log(`🎯 Assessment seeding complete. Total seeded: ${seededCount}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedAssessments();
