const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { generatePayroll, approvePayroll } = require("../controllers/payrollController");

router.post(
  "/generate",
  verifyToken,
  allowRoles("OWNER","MANAGER"),
  generatePayroll
);

router.put(
  "/approve/:id",
  verifyToken,
  allowRoles("OWNER"),
  approvePayroll
);

module.exports = router;