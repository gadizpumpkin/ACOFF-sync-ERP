const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/test", verifyToken, (req, res) => {
  res.json({
    message: "Akses berhasil",
    user: req.user
  });
});

module.exports = router;