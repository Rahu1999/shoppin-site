import { DataSource } from 'typeorm';
import { join } from 'path';
import { env } from './env';
import * as Entities from '../entities';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.isDev(),
  logging: env.isDev() ? ['query', 'error'] : ['error'],
  entities: Object.values(Entities).filter(item => typeof item === 'function'),
  migrations: [join(__dirname, '..', 'database', 'migrations', '**', '*.entity.{ts,js}')],
  subscribers: [],
  extra: {
    connectionLimit: 10,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
