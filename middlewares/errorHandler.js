const { logEvents } = require("./logEvents");
const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}`,
    "errorLog.log"
  );
  console.error(err.stack);
  res.status(500).send(err.message || "Internal Server Error");
};

module.exports = errorHandler;
