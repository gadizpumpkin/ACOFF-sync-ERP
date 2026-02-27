const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

const { 
  createTransaksi, 
  updateStatus 
} = require("../controllers/transaksiController");

// Test route
router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Akses berhasil",
    user: req.user
  });
});

// CREATE TRANSAKSI
router.post("/", verifyToken, createTransaksi);

// UPDATE STATUS (Paid → Canceled)
router.put("/:id/status", verifyToken, updateStatus);

module.exports = router;