const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");
const { authenticate } = require("../middleware/authMiddleware");

// Protect all routes
const protect = authenticate;

// Rivals Discovery
router.get("/rivals", protect, socialController.getPotentialRivals);

// Challenges
router.get("/challenges", protect, socialController.getMyChallenges);
router.post("/challenge", protect, socialController.createChallenge);
router.post(
  "/challenge/:challengeId/accept",
  protect,
  socialController.acceptChallenge,
);

// Feed
router.get("/feed", protect, socialController.getFeed);
router.post(
  "/activity/:activityId/like",
  protect,
  socialController.likeActivity,
);
router.post(
  "/activity/:activityId/comment",
  protect,
  socialController.commentOnActivity,
);
router.post("/share-achievement", protect, socialController.shareAchievement);

module.exports = router;
