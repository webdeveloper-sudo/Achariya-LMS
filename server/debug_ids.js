const { mongoose } = require("./db");
const Module = require("./models/Module");
const Course = require("./models/Course");

const run = async () => {
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }

  try {
    console.log("Connected. Fetching Courses...");
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses.`);

    const courseMap = {};

    courses.forEach((c) => {
      const parts = c.courseId.split("-");
      const suffix = parts[2] || "XXX";
      console.log(
        `Course: ${c.title} | ID: ${c.courseId} | Suffix: ${suffix} | _id: ${c._id}`,
      );

      if (courseMap[suffix]) {
        console.error(`⚠️  WARNING: Suffix '${suffix}' COLLISION between:`);
        console.error(
          `   1. ${courseMap[suffix].courseId} (${courseMap[suffix].title})`,
        );
        console.error(`   2. ${c.courseId} (${c.title})`);
      }
      courseMap[suffix] = c;
    });

    console.log("\nFetching Modules...");
    const modules = await Module.find({});
    console.log(`Found ${modules.length} modules.`);

    modules.forEach((m) => {
      console.log(
        `Module: ${m.title} | ID: ${m.moduleId} | Course _id: ${m.courseId}`,
      );
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
};

run();
