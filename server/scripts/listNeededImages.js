const fs = require("fs");
const path = require("path");

const assessmentsPath = path.resolve(
  __dirname,
  "../seeds/assessments-seed.json",
);
const assessmentsData = JSON.parse(fs.readFileSync(assessmentsPath, "utf8"));

const requiredImages = [];

assessmentsData.assessments.forEach((ass) => {
  const parts = ass.assessmentId.split("-");
  const moduleSeq = parseInt(parts[3]);

  if (moduleSeq <= 3) {
    ass.questions.forEach((q) => {
      if (
        q.questionType === "diagram-mcq" ||
        q.image?.includes("assets/images/assessments")
      ) {
        requiredImages.push({
          id: ass.assessmentId,
          title: ass.title,
          qNo: q.questionNo,
          text: q.questionText,
          fileName: `${ass.assessmentId}_Q${q.questionNo}.jpg`.toLowerCase(),
        });
      }
    });
  }
});

console.log("--- ASSESSMENT IMAGES NEEDED ---");
requiredImages.forEach((img) => {
  console.log(
    `File: ${img.fileName} | Topic: ${img.title} | Question: ${img.text}`,
  );
});
