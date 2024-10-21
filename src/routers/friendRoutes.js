const express = require("express");
const authController = require("../controllers/authController");
const friendController = require("../controllers/friendController");
const router = express.Router();

router.use(authController.protect);

router.post("/addFriend", friendController.addFriendRequest);
router.post("/acceptFriend", friendController.acceptFriendRequest);

router.get("/friend-requests", friendController.getAllPendingRequestsOfUser);
module.exports = router;
