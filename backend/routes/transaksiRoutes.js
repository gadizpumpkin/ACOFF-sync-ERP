const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createTransaksi } = require("../controllers/transaksiController");

router.post("/", auth, createTransaksi);

module.exports = router;
