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

module.exports = { adminRouter, authRouter };
