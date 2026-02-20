const express = require("express");
const router = express.Router();
const { registerEmployee, loginEmployee, loginAdmin } = require("../controllers/authController");

// Employee routes
router.post("/employee/register", registerEmployee);
router.post("/employee/login", loginEmployee);

// Admin routes
router.post("/admin/login", loginAdmin);

module.exports = router;
