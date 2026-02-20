const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const { getDashboardStats } = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, roleMiddleware("admin"), getDashboardStats);

module.exports = router;
