import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
  'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '5000', 10),

  // Database
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT ?? '3306', 10),
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_NAME: process.env.DB_NAME!,

  // Redis
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? undefined,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',

  // Email
  SMTP_HOST: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? '587', 10),
  SMTP_USER: process.env.SMTP_USER ?? '',
  SMTP_PASS: process.env.SMTP_PASS ?? '',
  SMTP_FROM: process.env.SMTP_FROM ?? 'noreply@example.com',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',

  isDev: () => process.env.NODE_ENV === 'development',
  isProd: () => process.env.NODE_ENV === 'production',
} as const;
