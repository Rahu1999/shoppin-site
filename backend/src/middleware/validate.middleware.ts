import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '@utils/AppError';

type Target = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, target: Target = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors = result.error.issues.reduce(
        (acc, issue) => {
          const key = issue.path.join('.');
          if (!acc[key]) acc[key] = [];
          acc[key].push(issue.message);
          return acc;
        },
        {} as Record<string, string[]>
      );
      return next(AppError.validationError('Validation failed', errors));
    }
    req[target] = result.data;
    next();
  };
