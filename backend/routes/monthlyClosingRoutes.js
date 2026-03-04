const express = require("express");
const router = express.Router();
const { closeMonth } = require("../controllers/monthlyClosingController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.post(
  "/close",
  verifyToken,
  allowRoles("Owner"),
  closeMonth
);

module.exports = router;