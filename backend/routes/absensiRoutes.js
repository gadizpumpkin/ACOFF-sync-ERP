const express = require("express");
const router = express.Router();
const controller = require("../controllers/absensiController");

router.get("/:username", controller.getAbsensiByUser);
router.post("/masuk", controller.absenMasuk);
router.put("/keluar", controller.absenKeluar);

module.exports = router;