const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const xlsx = require("xlsx");
const { authenticate } = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/adminMiddleware");
const Student = require("../schemas/Student");
const Teacher = require("../schemas/Teacher");

router.use(authenticate);
router.use(checkAdmin);

// Base Directories
const UPLOADS_DIR = path.join(__dirname, "../uploads");
const ASSETS_DIR = path.join(UPLOADS_DIR, "assets");
const TEMP_DIR = path.join(ASSETS_DIR, "temp");

// Ensure dirs existence
["images", "slides", "documents", "audio"].forEach((type) => {
  fs.ensureDirSync(path.join(TEMP_DIR, type));
});

// Configure Multer for Assets (Temp Storage)
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type;
    if (!["images", "slides", "documents", "audio"].includes(type)) {
      return cb(new Error("Invalid asset type"));
    }
    const dir = path.join(TEMP_DIR, type);
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname
      .replace(/[^a-z0-9.]/gi, "_")
      .toLowerCase();
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const uploadAsset = multer({
  storage: tempStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Configure Multer for Bulk Import (Memory Storage)
const memoryStorage = multer.memoryStorage();
const uploadBulk = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// --- Asset Routes ---

router.post("/cleanup-temp/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const dir = path.join(TEMP_DIR, type);
    await fs.emptyDir(dir);
    res.json({ success: true });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/asset/:type", uploadAsset.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, error: "No file uploaded" });

  res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    previewUrl: `/assets/temp/${req.params.type}/${req.file.filename}`,
  });
});

router.post("/save/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const tempTypeDir = path.join(TEMP_DIR, type);

    if (!fs.existsSync(tempTypeDir)) {
      return res
        .status(400)
        .json({ success: false, error: "No temp files found" });
    }

    const files = await fs.readdir(tempTypeDir);
    if (files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No pending file to save" });
    }

    const filename = files[0]; // Take the first file found
    const tempPath = path.join(tempTypeDir, filename);

    // Get Date Path YYYY/MM
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    const targetDir = path.join(ASSETS_DIR, type, String(year), String(month));
    await fs.ensureDir(targetDir);

    const targetPath = path.join(targetDir, filename);
    await fs.move(tempPath, targetPath, { overwrite: true });

    // Dynamic Base URL
    const protocol = req.protocol;
    const host = req.get("host");
    const dynamicBaseUrl = `${protocol}://${host}`;
    const finalUrl = `${dynamicBaseUrl}/assets/${type}/${year}/${month}/${filename}`;

    res.json({
      success: true,
      url: finalUrl,
      filename,
      type,
    });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post(
  "/course-thumbnail",
  uploadAsset.single("thumbnail"),
  async (req, res) => {
    // This is a legacy-like endpoint wrapper if needed, or we can unify.
    // Ideally frontend should use the generic asset upload.
    // But for now, let's just use the generic logic inline or redirect?
    // Let's implement a direct handler if the frontend specifically calls this.
    // Wait, the frontend calls /admin/upload/course-thumbnail.
    // We can simulate the 3-step process or just do a direct save here for simplicity if the hook isn't used.
    // BUT the user just updated the frontend to use the hook.
    // So this endpoint might be redundant if we fully switched.
    // However, to be safe, let's keep a functional endpoint.
    // Actually, `uploadAsset` above uses `req.params.type`.
    // We need a specific configured multer/handler here if we want to support the old single-step upload.

    // Changing strategy: The frontend now uses `useAssetUpload` which calls `/asset/images` and `/save/images`.
    // It does NOT call `/course-thumbnail` anymore in the updated code.
    // So we can omit this or keep it as a stub.
    // I'll keep a basic stub just in case.
    res
      .status(400)
      .json({ success: false, error: "Use generic asset upload endpoints" });
  }
);

// --- Bulk Routes ---

const normalizeKey = (key) =>
  key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s._-]+/g, "");
const toSafeString = (val) =>
  val === undefined || val === null ? "" : String(val).trim();

router.post("/students/bulk", uploadBulk.single("file"), async (req, res) => {
  try {
    let jsonData = [];
    const school = req.body.school;

    if (req.body.data) {
      jsonData =
        typeof req.body.data === "string"
          ? JSON.parse(req.body.data)
          : req.body.data;
    } else if (req.file) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval: "" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "No file or data provided" });
    }

    if (!school) {
      return res
        .status(400)
        .json({ success: false, error: "School is required" });
    }

    let saved = 0,
      updated = 0;
    const errors = [];

    // Processing Logic...
    for (const row of jsonData) {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
      );
      const getVal = (keys) => {
        for (const k of keys) if (normalizedRow[k]) return normalizedRow[k];
        return "";
      };

      const admissionNo = toSafeString(getVal(["admno", "admissionno"]));
      const studentName = toSafeString(getVal(["studentname", "name"]));

      if (!admissionNo || !studentName) continue;

      try {
        let student = await Student.findOne({ admissionNo });
        const data = {
          admissionNo,
          studentName,
          name: studentName,
          class: toSafeString(getVal(["class", "grade"])),
          section: toSafeString(getVal(["section", "sec"])),
          mobileNo: toSafeString(getVal(["mobileno", "mobile"])),
          school,
          serialNo: toSafeString(getVal(["sno", "serialno"])),
          status: "Active",
        };

        if (student) {
          Object.assign(student, data);
          await student.save();
          updated++;
        } else {
          await Student.create(data);
          saved++;
        }
      } catch (err) {
        errors.push({ admissionNo, error: err.message });
      }
    }

    res.json({
      success: true,
      saved,
      updated,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/teachers/bulk", uploadBulk.single("file"), async (req, res) => {
  try {
    let jsonData = [];

    if (req.body.data) {
      jsonData =
        typeof req.body.data === "string"
          ? JSON.parse(req.body.data)
          : req.body.data;
    } else if (req.file) {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval: "" });
    } else {
      return res
        .status(400)
        .json({ success: false, error: "No file or data provided" });
    }

    let saved = 0,
      updated = 0;
    const errors = [];

    for (const row of jsonData) {
      const normalizedRow = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
      );
      const getVal = (keys) => {
        for (const k of keys) if (normalizedRow[k]) return normalizedRow[k];
        return "";
      };

      const userId = toSafeString(getVal(["userid", "id"]));
      const userName = toSafeString(getVal(["username", "name"]));

      if (!userId || !userName) continue;

      try {
        let teacher = await Teacher.findOne({ userId });
        const data = {
          userId,
          userName,
          name: userName,
          joiningDate: toSafeString(getVal(["joiningdate", "doj"])),
          branch: toSafeString(getVal(["branch", "school"])),
          designation: toSafeString(getVal(["designation", "role"])),
          subjects: toSafeString(getVal(["subjects"]))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          qualifications: toSafeString(getVal(["qualifications"])),
          experience: toSafeString(getVal(["experience"])),
          email: toSafeString(getVal(["email"])),
          mobileNo: toSafeString(getVal(["mobile", "contact"])),
        };

        if (teacher) {
          Object.assign(teacher, data);
          await teacher.save();
          updated++;
        } else {
          await Teacher.create(data);
          saved++;
        }
      } catch (err) {
        errors.push({ userId, error: err.message });
      }
    }

    res.json({
      success: true,
      saved,
      updated,
      errors: errors.length ? errors : undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
