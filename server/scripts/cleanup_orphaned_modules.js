const { mongoose } = require("../db");
const Module = require("../models/Module");
const Course = require("../models/Course");

const run = async () => {
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }

  try {
    console.log("Connected. Checking for orphaned modules...");

    const modules = await Module.find({});
    const courses = await Course.find({});
    const courseIds = new Set(courses.map((c) => c._id.toString()));

    let deletedCount = 0;

    for (const mod of modules) {
      if (!courseIds.has(mod.courseId.toString())) {
        console.log(
          `🗑️  Deleting ORPHANED Module: ${mod.moduleId} (${mod.title}) - Course ID ${mod.courseId} not found.`,
        );
        await Module.deleteOne({ _id: mod._id });
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      console.log("✅ No orphaned modules found.");
    } else {
      console.log(`✅ Deleted ${deletedCount} orphaned modules.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
