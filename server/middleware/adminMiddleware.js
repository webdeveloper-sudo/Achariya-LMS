const jwt = require("jsonwebtoken");

// Reuse the verify ADMIN role logic specifically
exports.checkAdmin = (req, res, next) => {
  // Assuming req.user is set by authMiddleware
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};
