const express = require("express");
const router = express.Router();
const { getLedger } = require("../controllers/inventoryController");

router.get("/ledger/:bahan_id", getLedger);

module.exports = router;