const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { checkClosing } = require("../middleware/closingMiddleware");

const { 
  createTransaksi, 
  updateStatus 
} = require("../controllers/transaksiController");

// ==========================
// TEST ROUTE
// ==========================
router.get(
  "/test",
  verifyToken,
  (req, res) => {
    res.json({
      message: "Akses berhasil",
      user: req.user
    });
  }
);


// ==========================
// CREATE TRANSAKSI
// Manajer & Karyawan boleh
// ==========================
router.post(
  "/",
  verifyToken,
  allowRoles("MANAGER", "OWNER", "KARYAWAN"),
  createTransaksi
);
router.post(
  "/",
  verifyToken,
  allowRoles("OWNER", "KARYAWAN"),
  checkClosing,
  createTransaksi
);
// ==========================
// UPDATE STATUS
// (Paid → Canceled)
// Owner & Manajer boleh
// ==========================
router.put(
  "/:id/status",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  checkClosing,
  updateStatus
);
module.exports = router;