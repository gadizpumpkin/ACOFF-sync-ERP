const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { checkClosing } = require("../middleware/closingMiddleware");

const { 
  createTransaksi, 
  updateStatus 
} = require("../controllers/transaksiController");

// TEST
router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Akses berhasil",
    user: req.user
  });
});

//SATU ROUTE POST
router.post(
  "/",
  verifyToken,
  allowRoles("OWNER", "MANAGER", "KARYAWAN"),
  checkClosing,
  createTransaksi
);

module.exports = router;