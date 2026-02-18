const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Student = require("../schemas/Student");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Assessment = require("../models/Assessment");

async function debug() {
  try {
    // Force usage of 127.0.0.1 to avoid IPv6 issues commonly seen with 'localhost'
    const mongoUri = "mongodb://127.0.0.1:27017/achariya_students_db";
    console.log("🔌 Connecting to DB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected.");

    // Find a student with enrolled courses
    const student = await Student.findOne({
      "enrolledCourses.0": { $exists: true },
    });
    if (!student) {
      console.log("❌ No student with enrolled courses found");
      return;
    }
    console.log(
      `\n👨‍🎓 Student: ${student.studentName} (${student.admissionNo})`,
    );
    console.log(`ID: ${student._id}`);

    // Inspect the first enrolled course
    const enrolledCourse = student.enrolledCourses[0];
    console.log(`\n📚 Enrolled Course ID (Ref): ${enrolledCourse.courseId}`);
    // console.log(`Course Title: ${enrolledCourse.title}`);
    console.log(`Current Progress: ${enrolledCourse.progress}%`);
    console.log(`Completed Modules (DB):`, enrolledCourse.completedModules);

    // Check Data Types of Completed Modules
    if (enrolledCourse.completedModules.length > 0) {
      console.log(
        `Type of first completed module: ${typeof enrolledCourse.completedModules[0]}`,
      );
    }

    // Fetch Course Details
    const course = await Course.findById(enrolledCourse.courseId);
    if (!course) {
      console.log("❌ Course not found in DB");
      return;
    }
    console.log(`\n📘 Course: ${course.title}`);
    console.log(`Course Modules (from Course.modules):`, course.modules);

    // Check Data Types of Course Modules
    if (course.modules.length > 0) {
      console.log(
        `Type of first course module: ${typeof course.modules[0]} (Is ObjectId: ${course.modules[0] instanceof mongoose.Types.ObjectId})`,
      );
    }

    // SIMULATE CALCULATION
    console.log("\n🧮 Simulating Progress Calculation...");

    const totalModules = course.modules.length;
    const completedModulesList = enrolledCourse.completedModules;

    let completedModulesCount = 0;
    if (completedModulesList && completedModulesList.length > 0) {
      // Log the comparison
      course.modules.forEach((mId) => {
        const mIdStr = mId.toString();
        const isCompleted = completedModulesList.includes(mIdStr);
        console.log(
          `   - Checking Module ${mIdStr}: ${isCompleted ? "COMPLETED" : "Pending"}`,
        );
        if (isCompleted) completedModulesCount++;
      });
    }

    const calculatedProgress =
      totalModules > 0
        ? Math.round((completedModulesCount / totalModules) * 100)
        : 0;

    console.log(`\n📊 Results:`);
    console.log(`   Total Modules: ${totalModules}`);
    console.log(`   Completed Count (Calc): ${completedModulesCount}`);
    console.log(`   Calculated Progress: ${calculatedProgress}%`);
    console.log(`   Stored Progress: ${enrolledCourse.progress}%`);

    if (calculatedProgress !== enrolledCourse.progress) {
      console.log("⚠️ MISMATCH DETECTED!");
      // Update it effectively
      enrolledCourse.progress = calculatedProgress;
      await student.save();
      console.log("✨ Updated student progress via script.");
    } else {
      console.log("✅ Values Match");
    }

    // Check Assessments Progress for context
    console.log(`\n📝 Assessment Progress for this course:`);
    enrolledCourse.assessmentProgress.forEach((ap) => {
      console.log(
        `   - Assessment ${ap.assessmentId}: attempts=${ap.attempts}, completed=${ap.isCompleted}, highestScore=${ap.highestScore}`,
      );
    });
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected.");
  }
}

debug();
