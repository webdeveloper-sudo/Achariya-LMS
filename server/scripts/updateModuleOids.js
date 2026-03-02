const fs = require("fs");
const path = require("path");

const moduleMap = {
  "MOD-MATH-08-01": "69a17f660d325de706c4ba4c",
  "MOD-MATH-08-02": "69a17f660d325de706c4ba50",
  "MOD-MATH-08-03": "69a17f660d325de706c4ba54",
  "MOD-SCI-08-01": "69a17f660d325de706c4ba58",
  "MOD-SCI-08-02": "69a17f670d325de706c4ba5c",
  "MOD-SCI-08-03": "69a17f670d325de706c4ba60",
  "MOD-SOC-08-01": "69a17f670d325de706c4ba64",
  "MOD-SOC-08-02": "69a17f670d325de706c4ba68",
  "MOD-SOC-08-03": "69a17f670d325de706c4ba6c",
  "MOD-ENG-08-01": "69a17f670d325de706c4ba70",
  "MOD-ENG-08-02": "69a17f670d325de706c4ba74",
  "MOD-ENG-08-03": "69a17f670d325de706c4ba78",
  "MOD-HIN-08-01": "69a17f670d325de706c4ba7c",
  "MOD-HIN-08-02": "69a17f670d325de706c4ba80",
  "MOD-HIN-08-03": "69a17f680d325de706c4ba84",
  "MOD-CS-08-01": "69a17f680d325de706c4ba88",
  "MOD-CS-08-02": "69a17f680d325de706c4ba8c",
  "MOD-CS-08-03": "69a17f680d325de706c4ba90",
};

const updateCourses = () => {
  const filePath = path.resolve(__dirname, "../seeds/courses-seed.json");
  let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  data.courses.forEach((course) => {
    // Replace strings in modules array with $oid objects if they exist in our map
    course.modules = course.modules.map((modId) => {
      if (moduleMap[modId]) {
        return { $oid: moduleMap[modId] };
      }
      return modId; // Keep as string if not in first 3 (or not in map)
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("✅ Updated courses-seed.json with Module ObjectIds.");
};

const updateAssessments = () => {
  const filePath = path.resolve(__dirname, "../seeds/assessments-seed.json");
  let data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  data.assessments.forEach((assessment) => {
    if (moduleMap[assessment.moduleId]) {
      assessment.moduleId = { $oid: moduleMap[assessment.moduleId] };
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("✅ Updated assessments-seed.json with Module ObjectIds.");
};

updateCourses();
updateAssessments();
