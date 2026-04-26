const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  createPembelian,
  updateStatusPembelian
} = require("../controllers/pembelianController");

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
  allowRoles("MANAGER", "OWNER"),
  updateStatusPembelian
);

module.exports = router;