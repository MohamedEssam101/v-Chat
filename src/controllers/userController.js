const catchAsync = require("../utils/catchAsync");
const User = require("../models/db/user-model");
const AppError = require("../utils/appError");
const friend = require("../models/db/friend-model");

exports.getUserFriends = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const friendList = await User.findById(userId).select("friends").populate({
      path: "friends",
      select: "name",
    });
    console.log(friendList);
    // if (friendList.friends.length === 0) {
    //   return next(new AppError("this user doesn't have any friends"));
    // }

    res.status(200).json({
      status: "success",
      data: {
        friendList,
      },
    });
  } catch (err) {
    console.error("error inside getUserFriends", err);
  }
});

exports.deleteUserFriend = catchAsync(async (req, res, next) => {
  try {
    //logged in user
    const userId = req.user._id;
    //query over the friendId if its there
    let friendExists = await User.findOne({
      _id: userId,
      friends: { $elemMatch: { _id: req.params.id } },
    });
    if (!friendExists) {
      return next(new AppError("this friend doesn't exists"));
    }
    const friendRemove = await User.updateOne(
      {
        _id: userId,
      },
      { $pull: { friends: req.params.id } }
    );

    res.status(200).json({
      status: "success",
      message: "removed successfuly",
    });
  } catch (err) {
    console.error("Error inside deleteUserFriend", err);
  }
});
