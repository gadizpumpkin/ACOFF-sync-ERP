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

module.exports = router;