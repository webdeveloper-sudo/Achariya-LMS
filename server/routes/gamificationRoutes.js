const express = require("express");
const router = express.Router();
const gamificationController = require("../controllers/gamificationController");
const { authenticate } = require("../middleware/authMiddleware");

// Debug log (remove after fixing)
console.log("Controller loaded:", {
  getLeaderboard: typeof gamificationController.getLeaderboard,
  getWallet: typeof gamificationController.getWallet,
  getBadges: typeof gamificationController.getBadges,
});

// Leaderboard (public?)
router.get("/leaderboard", gamificationController.getLeaderboard);

// Wallet/History (protected)
router.get("/wallet", authenticate, gamificationController.getWallet);

// Badges (protected)
router.get("/badges", authenticate, gamificationController.getBadges);
router.post("/sync-badges", authenticate, gamificationController.syncBadges);

// Power-ups (protected)
router.get("/powerups", authenticate, gamificationController.getPowerUps);
router.post(
  "/purchase-powerup",
  authenticate,
  gamificationController.purchasePowerUp,
);

// Marketplace (protected)
router.get(
  "/marketplace",
  authenticate,
  gamificationController.getMarketplaceItems,
);
router.post(
  "/purchase-item",
  authenticate,
  gamificationController.purchaseMarketplaceItem,
);

module.exports = router;
