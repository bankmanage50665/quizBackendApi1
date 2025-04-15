const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/sendotp", userController.sendOTP)
router.post("/verify", userController.verifyOtp)

module.exports = router;
