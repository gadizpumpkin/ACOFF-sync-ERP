const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { laporanOmzet } = require("../controllers/laporanController");

// Hanya Owner boleh akses laporan
router.get(
  "/omzet",
  verifyToken,
  allowRoles("OWNER"),
  laporanOmzet
);

module.exports = router;