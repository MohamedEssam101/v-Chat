const mongoose = require("mongoose");
const User = require("./user-model");

const friendSchema = new mongoose.Schema(
  {
    pendingRequests: [
      {
        sender: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        receiver: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

const friend = mongoose.model("friend", friendSchema);

module.exports = friend;
