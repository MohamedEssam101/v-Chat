const express = require("express");
const authController = require("./../controllers/authController");

const userController = require("./../controllers/userController");
const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.use(authController.protect);

router.get("/friends", userController.getUserFriends);
module.exports = router;
