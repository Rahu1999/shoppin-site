import { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Request successful',
  statusCode = 200,
  meta?: PaginationMeta
): Response => {
  const body: ApiSuccessResponse<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response => successResponse(res, data, message, 201);

export const errorResponse = (
  res: Response,
  message: string,
  errorCode: string,
  statusCode = 400,
  errors?: Record<string, string[]>
): Response => {
  const body: ApiErrorResponse = { success: false, message, errorCode };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const buildPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});
