const express = require("express");
// mergeParams: true is needed to access :courseId from parent router if mounted there
const router = express.Router({ mergeParams: true });
const moduleController = require("../controllers/moduleController");
const { authenticate } = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(authenticate);
router.use(checkAdmin);

// If mounted at /api/admin/courses/:courseId/modules
// If mounted at /api/admin/courses/:courseId/modules
router
  .route("/")
  .get(moduleController.getModulesByCourse)
  .post(moduleController.createModule);

// Support for /api/admin/modules/course/:courseId
router
  .route("/course/:courseId")
  .get(moduleController.getModulesByCourse)
  .post(moduleController.createModule);

// Reorder modules
router.put("/reorder", moduleController.reorderModules);

// Routes with :moduleId
router
  .route("/:moduleId")
  .get(moduleController.getModuleById)
  .put(moduleController.updateModule)
  .delete(moduleController.deleteModule);

router.post(
  "/:moduleId/upload-notes",
  upload.single("notes"),
  moduleController.handleFileUpload
);
router.post(
  "/:moduleId/upload-slides",
  upload.single("slides"),
  moduleController.handleFileUpload
);
router.post(
  "/:moduleId/upload-audio",
  upload.single("audio"),
  moduleController.handleFileUpload
);
router.post(
  "/:moduleId/upload-transcript",
  upload.single("transcript"),
  moduleController.handleFileUpload
);
// Video update is via PUT module
// router.put('/:moduleId/video', ...); // Covered by generic updateModule? Prompt says explicit route.
// If explicit route logic differs:
router.put("/:moduleId/video", moduleController.updateModule);

// Nested assessments
router.use("/:moduleId/assessments", require("./assessmentRoutes"));

module.exports = router;
