require('dotenv').config();
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;
const WinstonCloudWatch = require('winston-cloudwatch');

const logFilePath = '../log/log.log';

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// {
//     emerg: 0,
//     alert: 1,
//     crit: 2,
//     error: 3,
//     warning: 4,
//     notice: 5,
//     info: 6,
//     debug: 7
//   }

// create logger , this will watch as
const logger = new createLogger({
    level: 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), logFormat, errors({ stack: true })),
    transports: [new transports.Console(), new transports.File({ filename: logFilePath, level: 'error' })],
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
