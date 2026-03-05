const express = require("express");
const router = express.Router();
const { exportMonthlyPnlPDF } = require("../controllers/reportExportController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.get(
  "/export-pnl",
  verifyToken,
  allowRoles("Owner"),
  exportMonthlyPnlPDF
);

module.exports = router;