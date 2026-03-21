import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { stream } from '@config/logger';
import { env } from '@config/env';

// Custom morgan format
const format = env.isDev() ? 'dev' : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

export const requestLogger = morgan(format, { stream });

export const apiRequestLogger = (req: Request, _res: Response, next: NextFunction) => {
  // We can add custom logging logic here if needed beyond morgan
  next();
};
