const express = require("express");

const router = express.Router();

const {
  createTransaksi,
  getAllTransaksi,
  updateStatus,
  getDailyProfit
} = require("../controllers/transaksiController");

const { verifyToken } = require("../middleware/authMiddleware");

// ==========================
// CREATE TRANSAKSI
// ==========================
router.post(
  "/",
  verifyToken,
  createTransaksi
);

// ==========================
// GET HISTORY
// ==========================
router.get(
  "/",
  verifyToken,
  getAllTransaksi
);

// ==========================
// UPDATE STATUS
// ==========================
router.put(
  "/:id/status",
  verifyToken,
  updateStatus
);

// ==========================
// GET PROFIT
// ==========================
router.get(
  "/profit",
  verifyToken,
  getDailyProfit
);

module.exports = router;