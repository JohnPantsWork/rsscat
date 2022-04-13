require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;
const WinstonCloudWatch = require('winston-cloudwatch');

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// create logger , this will watch as
const logger = new createLogger({
  level: 'warn',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    logFormat,
    errors({ stack: true })
  ),
  transports: [new transports.Console(), new transports.File({ filename: './log.log' })],
});

// cloudwatch setting
const cloudwatchConfig = {
  logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
  logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
  awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
  awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
  awsRegion: process.env.CLOUDWATCH_REGION,
  messageFormatter: ({ level, message }) => `[${level}] : ${message}}`,
};

logger.add(new WinstonCloudWatch(cloudwatchConfig));

console.log = function () {
  return logger.info.apply(logger, arguments);
};

console.error = function () {
  return logger.error.apply(logger, arguments);
};

console.info = function () {
  return logger.warn.apply(logger, arguments);
};

module.exports = logger;
