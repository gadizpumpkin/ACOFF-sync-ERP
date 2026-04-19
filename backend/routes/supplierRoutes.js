const express = require("express");
const router = express.Router();
const controller = require("../controllers/supplierController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, controller.getAll);
router.post("/", auth, role("MANAGER"), controller.create);
router.put("/:id", auth, role("MANAGER"), controller.update);
router.delete("/:id", auth, role("MANAGER"), controller.remove);

module.exports = router;