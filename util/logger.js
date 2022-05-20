// npm
const WinstonCloudWatch = require('winston-cloudwatch');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors } = format;

// const
const LOG_LEVEL = 0;
const logFilePath = '../log/log.log';
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// higher the level, the message contains more information.
const logLevel = {
    0: 'emerg',
    1: 'alert',
    2: 'crit',
    3: 'error',
    4: 'warning',
    5: 'notice',
    6: 'info',
    7: 'debug',
};

const logger = new createLogger({
    level: logLevel[LOG_LEVEL],
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        logFormat,
        errors({ stack: true })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: logFilePath, level: 'error' }),
    ],
});

// cloudwatch setting, with a legal IAM user.
const cloudwatchConfig = {
    logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
    logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
    awsAccessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
    awsSecretKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
    awsRegion: process.env.CLOUDWATCH_REGION,
    messageFormatter: ({ level, message }) => `[${level}] : ${message}}`,
};

logger.add(new WinstonCloudWatch(cloudwatchConfig));

// replace original log.
console.log = function () {
    return logger.info.apply(logger, arguments);
};

// replace original error.
console.error = function () {
    return logger.error.apply(logger, arguments);
};

// replace original info.
console.info = function () {
    return logger.warn.apply(logger, arguments);
};

module.exports = logger;
