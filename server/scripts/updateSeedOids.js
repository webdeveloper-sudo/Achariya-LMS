const fs = require("fs");
const path = require("path");

const courseMap = {
  "CRS-2026-MATH-08": "69a17cc08496670f60840a8d",
  "CRS-2026-SCI-08": "69a17cc18496670f60840a90",
  "CRS-2026-SOC-08": "69a17cc18496670f60840a93",
  "CRS-2026-ENG-08": "69a17cc18496670f60840a96",
  "CRS-2026-HIN-08": "69a17cc18496670f60840a99",
  "CRS-2026-CS-08": "69a17cc18496670f60840a9c",
};

const updateFile = (fileName) => {
  const filePath = path.resolve(__dirname, "../seeds", fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  for (const [courseId, oid] of Object.entries(courseMap)) {
    // Replace the string ID with the $oid object
    const regex = new RegExp(`"courseId":\\s*"${courseId}"`, "g");
    content = content.replace(regex, `"courseId": { "$oid": "${oid}" }`);
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${fileName} with new Course ObjectIds.`);
};

updateFile("modules-seed.json");
updateFile("assessments-seed.json");
