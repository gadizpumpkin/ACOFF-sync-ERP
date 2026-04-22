// backend/routes/absensiRoutes.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/absensiController");

router.get("/:username", controller.getByUser);
router.post("/masuk", controller.masuk);
router.put("/keluar", controller.keluar);

module.exports = router;