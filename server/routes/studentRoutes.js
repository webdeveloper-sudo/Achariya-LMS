const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const studentController = require("../controllers/studentController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/studentdata/documents");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(xlsx|xls|csv)$/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype =
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel.sheet.macroEnabled.12";

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls, .csv) are allowed!"));
    }
  },
});

// Upload Excel file (Admin-only)
router.post(
  "/upload",
  authenticate,
  requireAdmin,
  upload.single("file"),
  studentController.uploadFile
);

// Save students data (Admin-only) - Bulk
router.post(
  "/save",
  authenticate,
  requireAdmin,
  studentController.saveStudents
);

// Create single student (Admin-only)
router.post(
  "/create",
  authenticate,
  requireAdmin,
  studentController.createStudent
);

// Update student (Admin-only)
router.put("/:id", authenticate, requireAdmin, studentController.updateStudent);

// Delete student (Admin-only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  studentController.deleteStudent
);

// Get all students (no role restriction for now, read-only)
router.get("/", studentController.getStudents);

module.exports = router;
