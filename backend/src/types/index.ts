import { Request } from 'express';
import { JwtAccessPayload } from '@utils/jwt';

// Extend Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtAccessPayload;
    }
  }
}

// Error codes enum
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  COUPON_INVALID = 'COUPON_INVALID',
  COUPON_EXPIRED = 'COUPON_EXPIRED',
}

export type AuthenticatedRequest = Request & { user: JwtAccessPayload };

export interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: 'ASC' | 'DESC';
    [key: string]: string | undefined;
  };
}
