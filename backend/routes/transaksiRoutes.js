const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { checkClosing } = require("../middleware/closingMiddleware");

const {
  createTransaksi,
  getAllTransaksi,
  updateStatus,
  getDailyProfit
} = require("../controllers/transaksiController");

// ==========================
// GET ALL
// ==========================
router.get(
  "/",
  verifyToken,
  getAllTransaksi
);

// ==========================
// CREATE
// ==========================
router.post(
  "/",
  verifyToken,
  allowRoles("OWNER", "MANAGER", "KARYAWAN"),
  checkClosing,
  createTransaksi
);

// ==========================
// UPDATE STATUS
// ==========================
router.put(
  "/:id/status",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  checkClosing,
  updateStatus
);

module.exports = router;