import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';

export const requireRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(AppError.unauthorized());

    const userRoles = req.user.roles;
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return next(AppError.forbidden('Insufficient permissions'));
    }
    next();
  };
};

export const requireAdmin = requireRoles('admin', 'super_admin');
export const requireSuperAdmin = requireRoles('super_admin');
