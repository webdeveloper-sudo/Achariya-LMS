const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Course = require("../models/Course");

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

const seedCourses = async () => {
  try {
    console.log(`Connecting to MongoDB (${DB_NAME})...`);
    await mongoose.connect(MONGO_URI + DB_NAME);
    console.log("✅ Connected.");

    const seedPath = path.join(__dirname, "../seeds/courses-seed.json");
    const rawData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
    const courses = transformData(rawData.courses);

    console.log(`Starting seeding of ${courses.length} courses...`);

    for (const courseData of courses) {
      // Remove any existing course with this courseId to ensure fresh ObjectId generation
      await Course.deleteOne({ courseId: courseData.courseId });

      // Create new document with auto-generated ObjectId
      await Course.create(courseData);
      console.log(
        `✅ Seeded Course: ${courseData.courseId} (with new ObjectId)`,
      );
    }

    console.log("🎯 Course seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedCourses();
