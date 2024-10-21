const { log } = require("./logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.error = message;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.operational = true;
    Error.captureStackTrace(this, this.constructor);
    log.error(message, "server");
  }
}

module.exports = AppError;
