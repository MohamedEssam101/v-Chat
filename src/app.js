const express = require("express");
const cors = require("cors");
const userRouter = require("./routers/userRoutes");
const friendRouter = require("./routers/friendRoutes");
const globalErrorHandler = require("./middleware/globalErrorHandler");
const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/friends", friendRouter);

app.use(globalErrorHandler);
module.exports = app;
