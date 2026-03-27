import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from '../src/config/env';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';
import { requestLogger } from '@middleware/logger.middleware';
import v1Routes from '@api/v1/routes';

const app: Express = express();

// Security and utility middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Essential for serving images to a different origin
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Files
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));
// Explicitly serve uploads folder with cross-origin headers if needed (redundant but safe)
app.use('/uploads', express.static(path.join(publicPath, 'uploads'), {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Logging
app.use(requestLogger);

// API Routes
app.use('/api/v1', v1Routes);

// 404 and Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
