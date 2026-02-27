const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challengeController");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");

// ── Admin routes ───────────────────────────────────────────────────────────
router.get(
  "/admin/challenges",
  authenticate,
  requireAdmin,
  challengeController.adminGetChallenges,
);
router.post(
  "/admin/challenges",
  authenticate,
  requireAdmin,
  challengeController.adminCreateChallenge,
);
router.put(
  "/admin/challenges/:id",
  authenticate,
  requireAdmin,
  challengeController.adminUpdateChallenge,
);
router.delete(
  "/admin/challenges/:id",
  authenticate,
  requireAdmin,
  challengeController.adminDeleteChallenge,
);

// ── Student routes ─────────────────────────────────────────────────────────
router.get(
  "/students/challenges",
  authenticate,
  challengeController.getStudentChallenges,
);
router.post(
  "/students/challenges/:id/claim",
  authenticate,
  challengeController.claimChallengeReward,
);

module.exports = router;
