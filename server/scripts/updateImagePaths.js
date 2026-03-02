const fs = require("fs");
const path = require("path");

// 1. Update Courses
const coursesPath = path.resolve(__dirname, "../seeds/courses-seed.json");
let coursesData = JSON.parse(fs.readFileSync(coursesPath, "utf8"));

coursesData.courses.forEach((course) => {
  const subject = course.title.toLowerCase().replace(/\s+/g, "_");
  course.thumbnail = `http://localhost:8000/assets/images/courses/${subject}_v8_thumb.jpg`;
});

fs.writeFileSync(coursesPath, JSON.stringify(coursesData, null, 2));
console.log("✅ Updated course thumbnails in seed file.");

// 2. Update Assessments
const assessmentsPath = path.resolve(
  __dirname,
  "../seeds/assessments-seed.json",
);
let assessmentsData = JSON.parse(fs.readFileSync(assessmentsPath, "utf8"));

assessmentsData.assessments.forEach((ass) => {
  // Assessment ID Format: ASS-SUBJECT-08-MOD-NUM (e.g. ASS-MATH-08-1-1)
  const parts = ass.assessmentId.split("-");
  const moduleSeq = parseInt(parts[3]);

  if (moduleSeq <= 3) {
    ass.questions.forEach((q) => {
      if (
        q.questionType === "diagram-mcq" ||
        q.image === "placeholder-image-url"
      ) {
        const imgName =
          `${ass.assessmentId}_Q${q.questionNo}.jpg`.toLowerCase();
        q.image = `http://localhost:8000/assets/images/assessments/${imgName}`;
        q.images = [
          `http://localhost:8000/assets/images/assessments/${imgName}`,
        ];
      }
    });
  }
});

fs.writeFileSync(assessmentsPath, JSON.stringify(assessmentsData, null, 2));
console.log("✅ Updated assessment images in seed file.");
