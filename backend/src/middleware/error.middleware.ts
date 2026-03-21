import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { logError } from '@config/logger';
import { env } from '@config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  logError(err, { method: req.method, url: req.url, ip: req.ip });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // TypeORM duplicate entry
  if ((err as NodeJS.ErrnoException).code === 'ER_DUP_ENTRY') {
    res.status(409).json({
      success: false,
      message: 'A resource with this data already exists',
      errorCode: 'DUPLICATE_ENTRY',
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token', errorCode: 'TOKEN_INVALID' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired', errorCode: 'TOKEN_EXPIRED' });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    message: env.isProd() ? 'Internal server error' : err.message,
    errorCode: 'INTERNAL_ERROR',
    ...(env.isDev() && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    errorCode: 'NOT_FOUND',
  });
};
