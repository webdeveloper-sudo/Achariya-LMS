const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const Student = require("../schemas/Student");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://webdeveloper:Achariya%4026@cluster0.drjbrbn.mongodb.net/";
const DB_NAME = "achariya_students_db";

async function reseedAvatars() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI + DB_NAME);
    console.log("✅ Connected to MongoDB for reseed.");

    const students = await Student.find({});
    console.log(`Found ${students.length} students to update.`);

    let updatedCount = 0;

    for (const student of students) {
      const avatarIndex = Math.floor(Math.random() * 10) + 1;
      const paddedIndex = avatarIndex.toString().padStart(2, "0");
      const avatarUrl = `/assets/images/profile-avatars/avatar_${paddedIndex}.png`;

      student.avatar = avatarUrl;
      await student.save();
      updatedCount++;

      if (updatedCount % 50 === 0 || updatedCount === students.length) {
        console.log(
          `Progress: Updated ${updatedCount}/${students.length} students...`,
        );
      }
    }

    console.log(
      `✅ Successfully updated ${updatedCount} students with random avatars.`,
    );
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during reseed:", error);
    process.exit(1);
  }
}

reseedAvatars();
