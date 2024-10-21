// const path = require("path");
const dotenv = require("dotenv");

// dotenv.config({
//     path:
//         process.env.NODE_ENV === "production"
//             ? path.join(process.cwd(), ".env.production")
//             : path.join(process.cwd(), ".env.local"),
// });
const Winston = require("winston");
//const WinstonLoki = require("winston-loki");
// const lokiTransport = process.env.LOKI_HOST ? new WinstonLoki({
//     host: process.env.LOKI_HOST,
//     labels: { app: process.env.LOKI_APP_NAME },
// }) : null;
/**
 *  level	    Color	    Supported expressions
    critical    purple	    emerg, fatal, alert, crit, critical
    error	    red	        err, eror, error
    warning	    yellow	    warn, warning
    info	    green	    info, information, informational, notice
    debug	    blue	    dbug, debug
    trace	    light blue  trace
    unknown	    grey	    *
 */
const customLevels = {
  levels: {
    debug: 0,
    info: 1,
    warning: 2,
    error: 3,
    critical: 4,
    trace: 5,
  },
  colors: {
    debug: "blue",
    info: "green",
    warning: "yellow",
    error: "red",
    critical: "purple",
    trace: "cyan",
  },
};
Winston.addColors(customLevels.colors);
const logger = Winston.createLogger({
  level: "trace",
  // transports: lokiTransport ? [lokiTransport] : [],
  levels: customLevels.levels,
  format: Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.prettyPrint(),
    Winston.format.simple()
  ),
});
/*
    tasks:
        create
        read
        update
        delete
        other

*/
const _log = (type, message, task, labels) => {
  try {
    logger.log(type, {
      message,
      labels: Object.assign(Object.assign({}, labels), {
        task:
          task ||
          (labels === null || labels === void 0 ? void 0 : labels.task) ||
          "NULL",
      }),
    });
  } catch (e) {}
};
exports.log = Object.keys(customLevels.levels).reduce((acc, level) => {
  acc[level] = (message, task, labels) => _log(level, message, task, labels);
  return acc;
}, {});
// if (process.env.NODE_ENV !== "production") {
logger.add(
  new Winston.transports.Console({
    format: Winston.format.combine(
      Winston.format.colorize(),
      Winston.format.prettyPrint(),
      Winston.format.simple()
    ),
  })
);
// }
