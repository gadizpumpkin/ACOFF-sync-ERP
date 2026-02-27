const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { laporanOmzet } = require("../controllers/laporanController");

router.get("/omzet", verifyToken, laporanOmzet);

module.exports = router;