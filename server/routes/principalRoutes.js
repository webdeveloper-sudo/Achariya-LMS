const express = require("express");
const principalController = require("../controllers/principalController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// --- Admin Management Router (Protected) ---
const adminRouter = express.Router();

// Create Principal
adminRouter.post(
  "/create",
  authenticate,
  requireAdmin,
  principalController.createPrincipal,
);

// Get All Principals
adminRouter.get(
  "/all",
  authenticate,
  requireAdmin,
  principalController.getAllPrincipals,
);

// Update Principal
adminRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  principalController.updatePrincipal,
);

// Delete Principal
adminRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  principalController.deletePrincipal,
);

// --- Auth Router (Public) ---
const authRouter = express.Router();

// Send OTP  →  POST /api/v1/principals/auth/send-otp
authRouter.post("/send-otp", principalController.sendLoginOtp);

// Verify OTP  →  POST /api/v1/principals/auth/verify-otp
authRouter.post("/verify-otp", principalController.verifyLoginOtp);

// Login with Password  →  POST /api/v1/principals/auth/login-password
authRouter.post("/login-password", principalController.loginWithPassword);

// Activate Account (set password after OTP)  →  POST /api/v1/principals/auth/activate
authRouter.post("/activate", principalController.activatePrincipal);

// Reset Password
authRouter.post("/reset-password", principalController.resetPassword);

// Dashboard  →  GET /api/v1/principals/auth/dashboard
authRouter.get(
  "/dashboard",
  authenticate,
  principalController.getPrincipalDashboard,
);

// School-scoped data routes (all JWT protected)
authRouter.get(
  "/students",
  authenticate,
  principalController.getSchoolStudents,
);
authRouter.get(
  "/teachers",
  authenticate,
  principalController.getSchoolTeachers,
);
authRouter.get("/courses", authenticate, principalController.getSchoolCourses);
authRouter.get(
  "/courses/:courseId",
  authenticate,
  principalController.getSchoolCourseDetail,
);
authRouter.get(
  "/students/:studentId",
  authenticate,
  principalController.getSchoolStudentById,
);

module.exports = { adminRouter, authRouter };
