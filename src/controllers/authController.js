const User = require("../models/db/user-model");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 200, res);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError("Please provide email and password"), 400);
    }
    const loggedInUser = await User.findOne({ email }).select("+password");
    if (
      !loggedInUser ||
      !(await loggedInUser.correctPassword(password, loggedInUser.password))
    ) {
      return next(new appError("incorrect email or password"), 401);
    }
    createSendToken(loggedInUser, 200, res);
  } catch (error) {
    console.log(error);
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log("Token inside the cookie", token);
  }
  if (!token) {
    return next(new appError("You are not logged in ! please login", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError("User belongs do this token no longer exists", 401)
    );
  }
  // 4) Check if user changed password after the token was issued

  req.user = currentUser;
  next();
});
