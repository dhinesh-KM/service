const winston = require('winston')

const logger = winston.createLogger({
    level : "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    transports : [ new winston.transports.Console() ]
})

module.exports = logger;