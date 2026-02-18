const { mongoose } = require("./db"); // Handles connection automatically

// Models
const Student = require("./schemas/Student");
const Course = require("./models/Course");
const Module = require("./models/Module");
const Assessment = require("./models/Assessment");

// Wait for connection to be ready
const run = async () => {
  // Give it a moment to connect (db.js connects immediately but async)
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }

  try {
    console.log("Connected to DB via db.js");

    // Find a student with enrolled courses
    const student = await Student.findOne({
      "enrolledCourses.0": { $exists: true },
    });

    if (!student) {
      console.log("No student found with enrolled courses.");
      return;
    }

    console.log(`Student: ${student.name} (${student.admissionNo})`);

    // Check all enrolled courses
    for (const enrolledCourse of student.enrolledCourses) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Course Title: ${enrolledCourse.title}`);
      console.log(`Course ID (String): ${enrolledCourse.courseId}`); // EnrollSchema defines courseId as ObjectId!
      // Wait, schema says: courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
      // So enrolledCourse.courseId is an ObjectId.

      console.log(`Reported Course Progress: ${enrolledCourse.progress}%`);
      console.log(
        `Completed Modules (Strings):`,
        enrolledCourse.completedModules,
      );

      // Fetch Course Doc
      const courseDoc = await Course.findById(enrolledCourse.courseId);
      if (!courseDoc) {
        console.log("  [!] Course doc not found in DB!");
        continue;
      }
      console.log(`Total Modules in Course Doc: ${courseDoc.modules.length}`);

      // Check Modules
      for (const moduleId of courseDoc.modules) {
        const mod = await Module.findById(moduleId);
        if (!mod) {
          console.log(`  [!] Module doc not found for ID: ${moduleId}`);
          continue;
        }

        console.log(`\n  Module: ${mod.title}`);
        console.log(`    _id (ObjectId): ${mod._id}`);
        console.log(`    moduleId (String): ${mod.moduleId}`);
        console.log(`    Total Assessments: ${mod.assessments.length}`);

        // Check Assessment Progress for this module
        const modAssessmentIds = mod.assessments.map((id) => id.toString());
        let completedCount = 0;

        for (const assessId of modAssessmentIds) {
          const assessDoc = await Assessment.findById(assessId);
          const progress = enrolledCourse.assessmentProgress.find(
            (p) => p.assessmentId.toString() === assessId,
          );

          const isCompleted = progress ? progress.isCompleted : false;
          const attempts = progress ? progress.attempts : 0;
          const high = progress ? progress.highestScore : 0;

          if (isCompleted) completedCount++;

          console.log(
            `    - Assessment: "${assessDoc ? assessDoc.title : "Unknown"}" (ID: ${assessId})`,
          );
          console.log(
            `      Status: ${isCompleted ? "COMPLETED" : "In Progress"}`,
          );
          console.log(`      Attempts: ${attempts}, High Score: ${high}`);
        }

        const calcProgressNormalized =
          modAssessmentIds.length > 0
            ? (completedCount / modAssessmentIds.length) * 100
            : 0;
        console.log(
          `    > Calculated Module Progress: ${calcProgressNormalized.toFixed(2)}% (${completedCount}/${modAssessmentIds.length})`,
        );

        // detailed verification
        if (
          completedCount === modAssessmentIds.length &&
          modAssessmentIds.length > 0
        ) {
          console.log(`    > EXPECTATION: Module should be marked complete.`);
          const isMarkedComplete = enrolledCourse.completedModules.includes(
            mod.moduleId,
          );
          console.log(
            `    > ACTUAL: Marked Complete in 'completedModules'? ${isMarkedComplete}`,
          );
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    // mongoose.connection.close(); // db.js might keep it open, but we want to exit script
    process.exit(0);
  }
};

run();
