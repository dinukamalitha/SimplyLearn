const express = require("express");
const router = express.Router();
const {
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  upload,
} = require("./submissionController");
const { protect, restrictTo } = require("../../middleware/authMiddleware");

router.post("/", protect, upload.single("file"), submitAssignment);
router.get(
  "/assignment/:assignmentId",
  protect,
  restrictTo("Tutor", "Student"),
  getSubmissions,
);
router.get(
  "/my/:assignmentId",
  restrictTo("Student", "Tutor"),
  protect,
  getMySubmission,
);
router.put(
  "/:id/grade",
  protect,
  restrictTo("Tutor", "Admin"),
  gradeSubmission,
);

module.exports = router;
