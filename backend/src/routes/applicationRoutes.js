const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  applyForHousing,
  getApplications,
  approveApplication,
  rejectApplication,
} = require("../controllers/applicationController");

// Staff: apply for housing
router.post("/", authMiddleware, roleMiddleware("staff"), applyForHousing);

// Both: view applications (admin sees all, staff sees own)
router.get("/", authMiddleware, getApplications);

// Admin only: approve/reject
router.put("/:id/approve", authMiddleware, roleMiddleware("admin"), approveApplication);
router.put("/:id/reject", authMiddleware, roleMiddleware("admin"), rejectApplication);

module.exports = router;
