import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 20 * 1024 * 1024, // 20MB
      maxFiles: 10,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

export const logRequest = (method: string, url: string, status: number, ms: number) => {
  logger.info('HTTP Request', { method, url, status, ms });
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error(error.message, { stack: error.stack, ...context });
};

export const logAuth = (event: string, userId?: string, meta?: Record<string, unknown>) => {
  logger.info(`AUTH: ${event}`, { userId, ...meta });
};

export const logOrder = (event: string, orderId: string, meta?: Record<string, unknown>) => {
  logger.info(`ORDER: ${event}`, { orderId, ...meta });
};

export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
