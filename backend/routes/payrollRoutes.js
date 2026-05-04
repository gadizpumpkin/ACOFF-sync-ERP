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

// generate payroll
router.post(
  "/generate",
  verifyToken,
  allowRoles("OWNER", "MANAGER"),
  generatePayroll
);

// ambil pending payroll
router.get(
  "/pending",
  verifyToken,
  allowRoles("OWNER"),
  getPendingPayroll
);

// approve
router.put(
  "/approve/:id",
  verifyToken,
  allowRoles("OWNER"),
  approvePayroll
);

// reject
router.put(
  "/reject/:id",
  verifyToken,
  allowRoles("OWNER"),
  rejectPayroll
);

module.exports = router;