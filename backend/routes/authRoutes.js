const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { createTransaksi } = require("../controllers/transaksiController");

router.post("/login", verifyToken, createTransaksi);

module.exports = router;