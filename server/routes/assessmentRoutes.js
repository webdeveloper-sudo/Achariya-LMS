const express = require("express");
const router = express.Router({ mergeParams: true });
const assessmentController = require("../controllers/assessmentController");
const { authenticate } = require("../middleware/authMiddleware");
const { checkAdmin } = require("../middleware/adminMiddleware");

router.use(authenticate);
router.use(checkAdmin);

// Mounted at /api/admin/modules/:moduleId/assessments
router
  .route("/")
  .get(assessmentController.getAssessmentsByModule)
  .post(assessmentController.createAssessment);

// Mounted at /api/admin/assessments (if valid?)
// Prompt lists: /api/admin/assessments/:assessmentId
// So I will likely need to mount this router at /api/admin/assessments as well.

router
  .route("/:assessmentId")
  .get(assessmentController.getAssessmentById)
  .put(assessmentController.updateAssessment)
  .delete(assessmentController.deleteAssessment);

module.exports = router;
