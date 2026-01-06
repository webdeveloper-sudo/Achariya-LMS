const mongoose = require("mongoose");
const Course = require("./models/Course");
const Module = require("./models/Module");
require("dotenv").config();

// Connect to MongoDB
const MONGODB_URI =
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/achariya_students_db";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB for verification");
    checkData();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function checkData() {
  try {
    const courses = await Course.find({}).populate("modules");
    console.log(`Found ${courses.length} courses.`);

    for (const course of courses) {
      console.log(`\nCourse: ${course.title} (${course._id})`);
      console.log(`- Modules Count (Field): ${course.modules.length}`);
      console.log(`- Modules Data:`);
      course.modules.forEach((mod, idx) => {
        if (mod) {
          console.log(
            `  ${idx + 1}. [${mod._id}] ${mod.title} (Status: ${mod.status})`
          );
        } else {
          console.log(`  ${idx + 1}. [Missing/Null Reference]`);
        }
      });

      // Also check if modules exist in Module collection but not linked
      const orphanedModules = await Module.find({ courseId: course._id });
      console.log(
        `- Modules found in Module collection with courseId=${course._id}: ${orphanedModules.length}`
      );
      if (orphanedModules.length > course.modules.length) {
        console.log(
          "  WARNING: Found more modules in collection than linked in Course!"
        );
        orphanedModules.forEach((m) =>
          console.log(`   -> [${m._id}] ${m.title}`)
        );
      }
    }
  } catch (error) {
    console.error("Error verifying data:", error);
  } finally {
    mongoose.connection.close();
  }
}
