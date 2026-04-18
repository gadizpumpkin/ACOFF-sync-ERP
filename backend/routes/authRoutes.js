const express = require("express");
const router = express.Router();
const express = require("express");
const authController = require("../controllers/authController");

const { login } = require("../controllers/authController");

router.post("/login", login);
router.post("/register", authController.register);

module.exports = router;




// router.post("/login", authController.login);