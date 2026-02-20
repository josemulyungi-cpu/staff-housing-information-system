const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  getEmployers,
  createEmployer,
  authorizeEmployer,
} = require("../controllers/employerController");

// Public: list employers (for registration dropdown)
router.get("/", getEmployers);

// Admin only
router.post("/", authMiddleware, roleMiddleware("admin"), createEmployer);
router.put("/:id/authorize", authMiddleware, roleMiddleware("admin"), authorizeEmployer);

module.exports = router;
