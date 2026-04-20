const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const controller = require("../controllers/supplierController");

// routes
router.get("/", verifyToken, controller.getAll);
router.post("/", verifyToken, allowRoles("MANAGER"), controller.create);
router.put("/:id", verifyToken, allowRoles("MANAGER"), controller.update);
router.delete("/:id", verifyToken, allowRoles("MANAGER"), controller.remove);

module.exports = router;