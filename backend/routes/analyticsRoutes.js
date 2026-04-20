const express = require("express");
const router = express.Router();

const { getMenuPerformance } = require("../controllers/analyticsController");

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/menu-performance",
  verifyToken,
  allowRoles("OWNER","MANAGER"),
  getMenuPerformance
);

module.exports = router;