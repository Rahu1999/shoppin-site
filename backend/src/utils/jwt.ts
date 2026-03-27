import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtAccessPayload {
  sub: string;        // userId
  email: string;
  roles: string[];
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
}

export const signAccessToken = (payload: Omit<JwtAccessPayload, 'type'>): string =>
  jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload;
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  if (payload.type !== 'refresh') throw new Error('Invalid token type');
  return payload;
};
