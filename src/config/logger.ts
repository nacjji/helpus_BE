import { createLogger, transports, format } from 'winston';

// 로깅 레벨
// error: 0
// warn: 1
// info: 2
// http: 3
// verbose: 4
// debug: 5
// silly: 6

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      dirname: 'logs',
      filename: 'info.log',
    }),
    new transports.File({
      dirname: 'logs',
      filename: 'error.log',
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}] ${
              message instanceof Object ? JSON.stringify(message) : message
            }`
        )
      ),
      level: 'silly',
    })
  );
}

export default logger;
