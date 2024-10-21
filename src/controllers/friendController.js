const app = require("../app");
const User = require("../models/db/user-model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Friend = require("./../models/db/friend-model");

exports.addFriendRequest = catchAsync(async (req, res, next) => {
  try {
    const { receiverEmail } = req.body;
    const senderId = req.user._id;

    //if user A sends to user B and then user B sends to user A ?
    // delete the first request and apply acceptFriendRequest
    //still on progress

    if (!receiverEmail) {
      return next(new AppError("Please provide the receiver email"));
    }
    const receivedUser = await User.findOne({ email: receiverEmail });

    if (!receivedUser) {
      return next(new AppError("there is no User with this email"));
    }
    //check already friend
    if (await this.CheckAlreadyFriend(senderId, receivedUser._id)) {
      return next(new AppError("this user already in your friendList"));
    }

    //check if there already a request sent by the (receiverUser) in the past
    const requestExists = await this.checkPendingRequestsExists(
      senderId,
      receivedUser
    );
    if (requestExists) {
      console.log("the Requests exists", requestExists);
      // here if there a pending requests get the id of the
      //request and set it to the req body and call acceptF.R
      req.body.friendRequestId = requestExists._id;
      return this.acceptFriendRequest(req, res, next);
    }
    const alreadySent = await Friend.findOne({
      pendingRequests: {
        $elemMatch: { sender: senderId, receiver: receivedUser._id },
      },
    });
    if (alreadySent) {
      return next(new AppError("friendRequest already sent"));
    }
    //check if the user is trying to send an FR to himSelf
    if (senderId.equals(receivedUser._id)) {
      return next(new AppError("User Cannot send add to himself"));
    }

    const newFriendRequest = await Friend.create({
      pendingRequests: {
        sender: req.user._id,
        receiver: receivedUser._id,
      },
    });
    res.status(200).json({
      status: "sucess",
      data: {
        newFriendRequest,
      },
    });
  } catch (err) {
    console.error("Error in function addFreindREquest", err);
  }
});

exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  try {
    const { friendRequestId } = req.body;
    const friendRequest = await Friend.findById(friendRequestId);
    console.log(friendRequest);
    //who accepted , receiver (put sender id on his freinds)
    if (!friendRequest) {
      return next(new AppError("There is no freind request with this id"));
    }
    //1)the accepting user must be in the receiver variable
    if (req.user._id.equals(friendRequest.pendingRequests[0].sender)) {
      //user trying to MANUALLY accept what he sent
      return next(new AppError("This User can't accept this friendRequest"));
    }

    const theSenderId = friendRequest.pendingRequests[0].sender;
    const requestSenderUser = await User.findByIdAndUpdate(
      theSenderId,
      {
        $push: { friends: req.user._id },
      },
      { new: true }
    );
    const requestReciverUser = await User.findByIdAndUpdate(
      //getting the user
      req.user._id,
      {
        $push: { friends: theSenderId },
      },
      { new: true }
    );
    //after update delete the FriendrequestID
    console.log(friendRequestId);
    await Friend.findByIdAndDelete(friendRequestId);

    res.status(200).json({
      status: "success",
      data: { requestSenderUser, requestReciverUser },
    });
  } catch (err) {
    console.error(err);
  }
});

exports.getAllPendingRequestsOfUser = catchAsync(async (req, res, next) => {
  try {
    const userPendingRequests = await Friend.find({
      $or: [
        { "pendingRequests.sender": req.user._id },
        { "pendingRequests.receiver": req.user._id },
      ],
    });
    if (!userPendingRequests) {
      return next(new AppError("user doesn't have any friend requests"));
    }
    res.status(200).json({
      status: "sucess",
      data: userPendingRequests,
    });
  } catch (err) {
    console.error("error inside getAllPendingRequestsOfUser", err);
  }
});

//ahmed   //mohamed
exports.checkPendingRequestsExists = async (senderId, secondUser) => {
  try {
    const loggedUserId = senderId;
    console.log(loggedUserId);
    //inside request i have the  email of the user i am trying to send
    const requestExists = await Friend.findOne({
      pendingRequests: {
        $elemMatch: { sender: secondUser, receiver: senderId },
      },
    });
    console.log("inside checkPendingRequestsExists : ", requestExists);
    return requestExists;
  } catch (err) {
    return console.error("error in checkPendingRequestsExists", err);
  }
};

exports.CheckAlreadyFriend = async (senderId, receivedUserId) => {
  const userHasfriend = await User.findOne({
    _id: senderId,
    friends: { $elemMatch: { _id: receivedUserId } },
  });
  // or use
  // const userHasfriend = await User.findOne({
  //   _id: senderId,
  //   friends: { $in: [receivedUserId] }
  // });
  console.log(userHasfriend);
  return userHasfriend;
};

exports.deleteFriend = catchAsync(async (req, res, next) => {
  const doc = await Friend.findByIdAndDelete(req.params.id);
  if (!doc) {
    return next(new AppError("No document found with this id", 404));
  }
  res.status(204).json({
    status: "sucess",
    data: null,
  });
});

//decline friendRequest
exporsts.declinePendingRequest = catchAsync(async (req, res, next) => {
  //check if exists and  the decliner must be in the receiver
  //decline by pendingRequestID
  const theRequest = Friend.findOne({
    _id: req.body.pendingRequestId,
  });
  if (!theRequest) {
    return next(new AppError("This request doesn't exists"));
  }
  await Friend.findByIdAndDelete(theRequest._id);
  res.status(200).json({
    status: "success",
  });
});
