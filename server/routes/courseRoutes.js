const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authenticate } = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/adminMiddleware");

// All routes are protected and require admin
router.use(authenticate);
router.use(checkAdmin);

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);

router.post("/create", courseController.createCourse);

router
  .route("/:courseId")
  .get(courseController.getCourseById)
  .put(courseController.updateCourse)
  .delete(courseController.deleteCourse);

router.patch("/:courseId/status", courseController.updateCourseStatus);

// Nested routes for modules?
// The prompt defines module routes as /api/admin/courses/:courseId/modules
// I can mount the module router here or handle it in main index.
// Usually cleaner to keep separate, but here I will forward to moduleRoutes if needed or just define them in moduleRoutes.js
// The server.js mount point will dictate the prefix.
// If server.js mounts courseRoutes at /api/admin/courses, then /:courseId works.
// For /api/admin/courses/:courseId/modules, I can redirect:
router.use("/:courseId/modules", require("./moduleRoutes"));

module.exports = router;
