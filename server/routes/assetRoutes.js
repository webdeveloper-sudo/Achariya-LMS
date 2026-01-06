const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const path = require("path");
const { authenticate } = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/adminMiddleware");

// Models
// Note: Adjusted paths based on project structure observation
const Student = require("../schemas/Student");
const Teacher = require("../schemas/Teacher");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Assessment = require("../models/Assessment"); // Maybe assessments have images?

const UPLOADS_DIR = path.join(__dirname, "../uploads");
const ASSETS_DIR = path.join(UPLOADS_DIR, "assets");

router.use(authenticate);
router.use(checkAdmin);

// Helper to crawl recursively
const getFilesRecursively = async (dir, rootDir = ASSETS_DIR) => {
  let results = [];
  try {
    const list = await fs.readdir(dir);
    for (const file of list) {
      if (file.startsWith(".")) continue; // skip .gitkeep etc
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        results = results.concat(await getFilesRecursively(filePath, rootDir));
      } else {
        const relativePath = path
          .relative(rootDir, filePath)
          .replace(/\\/g, "/");
        results.push({
          relativePath,
          fileName: file,
          size: stat.size,
          mtime: stat.mtime,
          type: path.extname(file).toLowerCase(),
        });
      }
    }
  } catch (err) {
    // ignore
  }
  return results;
};

// GET /api/v1/admin/assets
router.get("/", async (req, res) => {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      return res.json({ success: true, files: [] });
    }

    const allFiles = await getFilesRecursively(ASSETS_DIR);

    // 1. Gather Usage
    const usedFilenames = new Set();
    const addToSet = (val) => {
      if (!val) return;
      // Handle both full URLs and relative paths
      // Val: http://localhost:8000/assets/images/2026/01/173...jpg
      // Val: /assets/images/...
      // Val: 173...jpg (legacy?)
      const parts = val.split(/[/\\]/);
      const name = parts[parts.length - 1];
      if (name && name.length > 0) usedFilenames.add(name);
    };

    // Parallel Fetch
    const [students, teachers, courses, modules, assessments] =
      await Promise.all([
        Student.find({}, "profilePic").lean(),
        Teacher.find({}, "profilePic").lean(),
        Course.find({}, "thumbnail").lean(),
        Module.find({}, "notes slides videoTutorial audioContent").lean(),
        Assessment.find({}, "questions").lean(), // Questions might have images?
      ]);

    students.forEach((s) => addToSet(s.profilePic));
    teachers.forEach((t) => addToSet(t.profilePic));
    courses.forEach((c) => addToSet(c.thumbnail));
    modules.forEach((m) => {
      if (Array.isArray(m.notes))
        m.notes.forEach((n) => addToSet(typeof n === "string" ? n : n.url));
      if (m.slides)
        addToSet(typeof m.slides === "string" ? m.slides : m.slides.url);
      if (m.videoTutorial && m.videoTutorial.url) addToSet(m.videoTutorial.url); // usually youtube but maybe local
      if (m.audioContent) {
        addToSet(m.audioContent.url);
        addToSet(m.audioContent.transcriptUrl);
      }
    });
    // Assessment images?
    assessments.forEach((a) => {
      if (a.questions) {
        a.questions.forEach((q) => {
          if (q.image) addToSet(q.image);
        });
      }
    });

    // 2. Process Files
    const processedFiles = allFiles.map((f) => {
      const topFolder = f.relativePath.split("/")[0];
      return {
        ...f,
        folder: topFolder, // images, documents, audio, slides, temp
        isUsed: usedFilenames.has(f.fileName),
        previewUrl: `/assets/${f.relativePath}`,
      };
    });

    res.json({ success: true, files: processedFiles });
  } catch (error) {
    console.error("Assets Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/admin/assets
router.delete("/", async (req, res) => {
  const { relativePath } = req.body;
  if (!relativePath)
    return res.status(400).json({ success: false, error: "Path required" });

  const targetPath = path.resolve(ASSETS_DIR, relativePath);
  if (!targetPath.startsWith(path.resolve(ASSETS_DIR))) {
    return res.status(403).json({ success: false, error: "Invalid path" });
  }

  try {
    if (fs.existsSync(targetPath)) {
      await fs.unlink(targetPath);
      res.json({ success: true, message: "File deleted successfully" });
    } else {
      res.status(404).json({ success: false, error: "File not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
