const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { laporanOmzet } = require("../controllers/laporanController");

// MANAGER & OWNER boleh akses
router.get(
  "/omzet",
  verifyToken,
  allowRoles("MANAGER", "OWNER"),
  laporanOmzet
);

module.exports = router;