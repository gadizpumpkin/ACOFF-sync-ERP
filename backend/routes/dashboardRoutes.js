const express = require("express");
const router = express.Router();
const { getOwnerSummary } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getLowStock } = require("../controllers/dashboardController");
const { getMonthlyPnl } = require("../controllers/dashboardController");
const {getLowStockAlert } = require("../controllers/dashboardController");
const { getPnlByDate } = require("../controllers/dashboardController");
//const {}

router.get(
  "/owner-summary",
  verifyToken,
  allowRoles("OWNER"),
  getOwnerSummary
);
router.get(
  "/low-stock",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  getLowStockAlert
);
router.get(
  "/low-stock",
  verifyToken,
  allowRoles("OWNER"),
  getLowStock
);
router.get(
  "/pnl",
  verifyToken,
  allowRoles("OWNER"),
  getPnlByDate
);
router.get(
  "/pnl-monthly",
  verifyToken,
  allowRoles("OWNER"),
  getMonthlyPnl
);
module.exports = router;