const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getAllPembelian } = require("../controllers/pembelianController");
const {
  createPembelian,
  updateStatusPembelian
} = require("../controllers/pembelianController");

// GET ALL status pembelian
router.get(
  "/",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  getAllPembelian
);

// CREATE
router.post(
  "/",
  verifyToken,
  allowRoles("MANAGER"),
  createPembelian
);

// UPDATE STATUS
router.put(
  "/:id/status",
  verifyToken,
  allowRoles("OWNER"),
  updateStatusPembelian
);



module.exports = router;



