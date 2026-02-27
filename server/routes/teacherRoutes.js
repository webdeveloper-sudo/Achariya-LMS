const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const teacherController = require("../controllers/teacherController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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

// --- ADMIN ROUTES ---
const adminRouter = express.Router();
adminRouter.use(authenticate, requireAdmin);

adminRouter.post(
  "/upload",
  upload.single("file"),
  teacherController.uploadFile,
);
adminRouter.post("/save", teacherController.saveTeachers);
adminRouter.post("/create", teacherController.createTeacher);
adminRouter.get("/", teacherController.getTeachers);
adminRouter.put("/:id", teacherController.updateTeacher);
adminRouter.delete("/:id", teacherController.deleteTeacher);

// --- TEACHER PORTAL ROUTES ---
const portalRouter = express.Router();
portalRouter.use(authenticate);

portalRouter.get("/dashboard", teacherController.getTeacherDashboard);
portalRouter.get("/courses", teacherController.getTeacherCourses);
portalRouter.get("/course/:courseId", teacherController.getTeacherCourseDetail);
portalRouter.get("/students", teacherController.getTeacherStudents);
portalRouter.get(
  "/student/:studentId",
  teacherController.getTeacherStudentDetail,
);
portalRouter.get("/evidence", teacherController.getTeacherEvidence);

// --- PUBLIC AUTH ROUTES ---
const authRouter = express.Router();
authRouter.post("/verify-account", teacherController.verifyTeacherAccount);
authRouter.post("/send-otp", teacherController.sendOtp);
authRouter.post("/verify-otp", teacherController.verifyOtp);
authRouter.post("/complete-activation", teacherController.completeActivation);
authRouter.post("/login", teacherController.login);
authRouter.post("/forgot-password", teacherController.forgotPassword);
authRouter.post("/reset-password", teacherController.resetPassword);

module.exports = { adminRouter, portalRouter, authRouter };
