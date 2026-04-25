const express = require("express");
const router = express.Router();

const {
  getAllBahan,
  createBahan,
  updateBahan,
  deleteBahan,
  getLedger
} = require("../controllers/inventoryController");

// ==========================
// CRUD BAHAN
// ==========================
router.get("/", getAllBahan);
router.post("/", createBahan);
router.put("/:id", updateBahan);
router.delete("/:id", deleteBahan);

// ==========================
// LEDGER
// ==========================
router.get("/ledger/:bahan_id", getLedger);

module.exports = router;