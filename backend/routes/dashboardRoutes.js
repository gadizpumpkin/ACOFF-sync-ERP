const express = require("express");
const router = express.Router();
const { getOwnerSummary } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getLowStock } = require("../controllers/dashboardController");

router.get(
  "/owner-summary",
  verifyToken,
  allowRoles("Owner"),
  getOwnerSummary
);
router.get(
  "/low-stock",
  verifyToken,
  allowRoles("Owner", "Manajer"),
  getLowStockAlert
);
router.get(
  "/low-stock",
  verifyToken,
  allowRoles("Owner"),
  getLowStock
);
module.exports = router;