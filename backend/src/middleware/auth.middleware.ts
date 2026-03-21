import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@utils/jwt';
import { AppError } from '@utils/AppError';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw AppError.unauthorized('No token provided');

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(AppError.unauthorized('Invalid or expired token'));
  }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) req.user = verifyAccessToken(token);
    }
  } catch {
    // Optional – don't fail
  }
  next();
};
