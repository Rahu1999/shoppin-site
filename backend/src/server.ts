import app from './app';
import { env } from './config/env';
import { initializeDatabase } from '@config/database';
import { connectRedis } from '@config/redis';
import { logger } from '@config/logger';

const startServer = async () => {
  try {
    // 1. Initialize DB
    await initializeDatabase();

    // 2. Initialize Redis
    await connectRedis();

    // 3. Start Express server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Handle Unhandled Rejections and Exceptions
    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Rejection! Shutting down...', { error: err.message, stack: err.stack });
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
