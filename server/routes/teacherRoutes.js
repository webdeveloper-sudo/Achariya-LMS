const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const teacherController = require("../controllers/teacherController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// Configure multer for file uploads (Reuse logic if possible, but distinct here for safety)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // You might want a different folder or same
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "teacher-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(xlsx|xls|csv)$/;
    if (!file.originalname.match(allowedTypes)) {
      return cb(new Error("Only Excel files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Routes
router.post(
  "/upload",
  authenticate,
  requireAdmin,
  upload.single("file"),
  teacherController.uploadFile
);
router.post(
  "/save",
  authenticate,
  requireAdmin,
  teacherController.saveTeachers
);
router.post(
  "/create",
  authenticate,
  requireAdmin,
  teacherController.createTeacher
);
router.get("/", teacherController.getTeachers); // Open read for now, or restrict
router.put("/:id", authenticate, requireAdmin, teacherController.updateTeacher);
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  teacherController.deleteTeacher
);

module.exports = router;
