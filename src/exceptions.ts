/**
 * Sec4Dev API exception hierarchy.
 */

export interface Sec4DevErrorBody {
  message: string;
  statusCode: number;
  responseBody?: unknown;
}

export class Sec4DevError extends Error {
  readonly message: string;
  readonly statusCode: number;
  readonly responseBody?: unknown;

  constructor(
    message: string,
    statusCode: number = 0,
    responseBody?: unknown
  ) {
    super(message);
    this.name = "Sec4DevError";
    this.message = message;
    this.statusCode = statusCode;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, Sec4DevError.prototype);
  }
}

export class AuthenticationError extends Sec4DevError {
  constructor(message: string, statusCode: number = 401, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class PaymentRequiredError extends Sec4DevError {
  constructor(message: string, statusCode: number = 402, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "PaymentRequiredError";
    Object.setPrototypeOf(this, PaymentRequiredError.prototype);
  }
}

export class ForbiddenError extends Sec4DevError {
  constructor(message: string, statusCode: number = 403, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends Sec4DevError {
  constructor(message: string, statusCode: number = 404, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ValidationError extends Sec4DevError {
  constructor(message: string, statusCode: number = 422, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends Sec4DevError {
  readonly retryAfter: number;
  readonly limit: number;
  readonly remaining: number;

  constructor(
    message: string,
    statusCode: number = 429,
    responseBody?: unknown,
    retryAfter: number = 0,
    limit: number = 0,
    remaining: number = 0
  ) {
    super(message, statusCode, responseBody);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ServerError extends Sec4DevError {
  constructor(message: string, statusCode: number = 500, responseBody?: unknown) {
    super(message, statusCode, responseBody);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
