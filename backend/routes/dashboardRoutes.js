const express = require("express");
const router = express.Router();
const { getOwnerSummary } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

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
module.exports = router;