export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode = 500,
    errorCode = 'INTERNAL_ERROR',
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new AppError(message, 400, 'BAD_REQUEST', errors);
  }

  static conflict(message: string) {
    return new AppError(message, 409, 'RESOURCE_CONFLICT');
  }

  static validationError(message: string, errors?: Record<string, string[]>) {
    return new AppError(message, 422, 'VALIDATION_ERROR', errors);
  }

  static insufficientStock() {
    return new AppError('Insufficient stock for one or more items', 400, 'INSUFFICIENT_STOCK');
  }
}
