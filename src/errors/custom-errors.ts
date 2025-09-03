/**
 * Custom error classes for better error handling
 */

/**
 * Base error class with status code support
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request") {
    super(message, 400);
  }
}

/**
 * Scraping Error (500)
 */
export class ScrapingError extends AppError {
  constructor(message: string = "Scraping failed") {
    super(message, 500);
  }
}
