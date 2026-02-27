const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize MongoDB connection and seed admin user
require("./db");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
// Increase body size limits to handle large student uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/assets", express.static(path.join(__dirname, "uploads/assets")));
app.use(
  "/assets/temp",
  express.static(path.join(__dirname, "uploads/assets/temp")),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection is handled in ./db

// Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/admin/students", require("./routes/studentRoutes"));
app.use("/api/v1/students", require("./routes/studentRoutes")); // Student App Routes

// Public course routes (previously inline, now in studentRoutes)
app.use("/api/v1", require("./routes/studentRoutes")); // For /courses routes

// Teacher Routes
const teacherRoutes = require("./routes/teacherRoutes");
app.use("/api/v1/admin/teachers", teacherRoutes.adminRouter);
app.use("/api/v1/teacher/auth", teacherRoutes.authRouter);
app.use("/api/v1/teacher", teacherRoutes.portalRouter);

// LMS Admin Routes
// LMS Admin Routes
app.use("/api/v1/admin/courses", require("./routes/courseRoutes"));
app.use("/api/v1/admin/modules", require("./routes/moduleRoutes"));
app.use("/api/v1/admin/assessments", require("./routes/assessmentRoutes"));
app.use("/api/v1/admin/upload", require("./routes/uploadRoutes"));
app.use("/api/v1/admin/assets", require("./routes/assetRoutes"));
app.use("/api/v1/gamification", require("./routes/gamificationRoutes"));
app.use("/api/v1/social", require("./routes/socialRoutes"));
app.use("/api/v1", require("./routes/challengeRoutes")); // challenges (admin + student)

// Principal Routes
const principalRoutes = require("./routes/principalRoutes");
app.use("/api/v1/admin/principals", principalRoutes.adminRouter);
app.use("/api/v1/principals/auth", principalRoutes.authRouter);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error Handling Middleware
app.use(require("./middleware/errorMiddleware"));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
