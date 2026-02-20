const express = require("express");
const router = express.Router();
const { authMiddleware, roleMiddleware } = require("../middleware/authMiddleware");
const {
  getHousing,
  getHousingById,
  createHousing,
  updateHousing,
  deleteHousing,
  getFilterOptions,
} = require("../controllers/housingController");

// Public: browse housing
router.get("/filters/options", authMiddleware, getFilterOptions);
router.get("/", authMiddleware, getHousing);
router.get("/:id", authMiddleware, getHousingById);

// Admin only: manage housing
router.post("/", authMiddleware, roleMiddleware("admin"), createHousing);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateHousing);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteHousing);

module.exports = router;
