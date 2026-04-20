const express = require("express");
const router = express.Router();
const { closeToday } = require("../controllers/closingController");
const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.post(
  "/today",
  verifyToken,
  allowRoles("OWNER"),
  closeToday
);

module.exports = router;