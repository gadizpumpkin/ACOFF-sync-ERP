const express = require("express");
const router = express.Router();

const pembelianController = require("../controllers/pembelianController");
const { verifyToken } = require("../middleware/authMiddleware");

// ==========================
// GET ALL PEMBELIAN
// ==========================
router.get(
  "/",
  verifyToken,
  pembelianController.getAllPembelian
);

// ==========================
// CREATE PEMBELIAN
// ==========================
router.post(
  "/",
  verifyToken,
  pembelianController.createPembelian
);

// ==========================
// UPDATE STATUS PEMBELIAN
// ==========================
router.put(
  "/:id/status",
  verifyToken,
  pembelianController.updateStatusPembelian
);

module.exports = router;
