const express = require("express");

const router = express.Router();

const {
  applyToInternship,
  getStudentApplications,
  getApplicationStatusHistory,
  updateApplicationStatus,
  getAllApplications,
  getApplicationsByInternship,
} = require("../controllers/applicationController");

const {
  verifyToken,
  checkRole,
} = require("../middleware/authMiddleware");

// =====================================================
// APPLY TO INTERNSHIP
// STUDENT ONLY
// =====================================================

router.post(
  "/apply",
  verifyToken,
  checkRole(["student"]),
  applyToInternship
);

// =====================================================
// MY APPLICATIONS
// STUDENT ONLY
// =====================================================

router.get(
  "/my-applications",
  verifyToken,
  checkRole(["student"]),
  getStudentApplications
);

// =====================================================
// COMPATIBILITY ROUTE
// =====================================================

router.get(
  "/student",
  verifyToken,
  checkRole(["student"]),
  getStudentApplications
);

// =====================================================
// APPLICATION STATUS HISTORY
// STUDENT ONLY
// =====================================================

router.get(
  "/:id/history",
  verifyToken,
  checkRole(["student"]),
  getApplicationStatusHistory
);

// =====================================================
// UPDATE APPLICATION STATUS
// EMPLOYER / ADMIN
// =====================================================

router.put(
  "/:id/status",
  verifyToken,
  checkRole(["employer", "admin"]),
  updateApplicationStatus
);

// =====================================================
// APPLICATIONS BY INTERNSHIP
// EMPLOYER / ADMIN
// =====================================================

router.get(
  "/internship/:internshipId",
  verifyToken,
  checkRole(["employer", "admin"]),
  getApplicationsByInternship
);

// =====================================================
// ALL APPLICATIONS
// ADMIN / EMPLOYER / STUDENT
// =====================================================

router.get(
  "/",
  verifyToken,
  checkRole(["student", "employer", "admin"]),
  getAllApplications
);

module.exports = router;