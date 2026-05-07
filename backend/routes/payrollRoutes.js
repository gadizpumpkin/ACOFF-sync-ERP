const express = require("express");

const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");

const { allowRoles } = require("../middleware/roleMiddleware");

const {
  generatePayroll,
  getPendingPayroll,
  approvePayroll,
  rejectPayroll
} = require("../controllers/payrollController");

// ==========================
// GENERATE
// ==========================
router.post(
  "/generate",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  generatePayroll
);

// ==========================
// GET PAYROLL
// ==========================
router.get(
  "/pending",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  getPendingPayroll
);

// ==========================
// APPROVE
// ==========================
router.put(
  "/approve/:id",
  verifyToken,
  allowRoles("OWNER"),
  approvePayroll
);

// ==========================
// REJECT
// ==========================
router.put(
  "/reject/:id",
  verifyToken,
  allowRoles("OWNER"),
  rejectPayroll
);

module.exports = router;